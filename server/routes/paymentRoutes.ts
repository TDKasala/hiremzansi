import { Router } from "express";
import { paymentService } from "../services/paymentService";
import { notificationService } from "../services/notificationService";
import { db } from "../db";
import { premiumJobMatches, users, cvs } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

/**
 * Create payment for job seeker
 * POST /api/payment/job-seeker
 */
router.post("/job-seeker", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { cvId, matchId } = req.body;
    
    if (!cvId) {
      return res.status(400).json({ error: "CV ID is required" });
    }

    // Verify CV belongs to user
    const [cv] = await db
      .select()
      .from(cvs)
      .where(and(eq(cvs.id, cvId), eq(cvs.userId, req.user.id)));

    if (!cv) {
      return res.status(404).json({ error: "CV not found or access denied" });
    }

    const { payment, paymentUrl } = await paymentService.createJobSeekerPayment(
      req.user.id,
      cvId,
      matchId
    );

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        transactionId: payment.transactionId,
        expiresAt: payment.expiresAt,
      },
      paymentUrl,
      message: "Payment created successfully. Redirecting to payment gateway...",
    });
  } catch (error) {
    console.error("Job seeker payment creation error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

/**
 * Create payment for recruiter
 * POST /api/payment/recruiter
 */
router.post("/recruiter", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { matchId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({ error: "Match ID is required" });
    }

    // Verify match exists and job seeker has paid
    const [match] = await db
      .select()
      .from(premiumJobMatches)
      .where(eq(premiumJobMatches.id, matchId));

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (!match.jobSeekerPaid) {
      return res.status(400).json({ error: "Job seeker must pay first before recruiter can access profile" });
    }

    if (match.recruiterPaid) {
      return res.status(400).json({ error: "You have already paid for access to this candidate" });
    }

    const { payment, paymentUrl } = await paymentService.createRecruiterPayment(
      req.user.id,
      matchId,
      match.jobSeekerId
    );

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        transactionId: payment.transactionId,
        expiresAt: payment.expiresAt,
      },
      paymentUrl,
      message: "Payment created successfully. Redirecting to payment gateway...",
    });
  } catch (error) {
    console.error("Recruiter payment creation error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

/**
 * Payment notification webhook from PayFast
 * POST /api/payment/notify
 */
router.post("/notify", async (req, res) => {
  try {
    const { pf_payment_id, custom_str1: transactionId, payment_status } = req.body;

    if (payment_status === "COMPLETE") {
      await paymentService.processPaymentSuccess(transactionId, pf_payment_id, req.body);
    } else {
      await paymentService.processPaymentFailure(transactionId, `Payment status: ${payment_status}`);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Payment notification error:", error);
    res.status(500).send("Error processing notification");
  }
});

/**
 * Payment success page
 * GET /api/payment/success
 */
router.get("/success", async (req, res) => {
  try {
    const { id: paymentId } = req.query;
    
    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    const payment = await paymentService.getPaymentByTransactionId(paymentId as string);
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // For development, auto-complete the payment
    if (process.env.NODE_ENV === "development" && payment.status === "pending") {
      await paymentService.processPaymentSuccess(payment.transactionId, `dev_${Date.now()}`, {
        simulatedPayment: true,
        completedAt: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        transactionId: payment.transactionId,
      },
      message: payment.status === "completed" 
        ? "Payment completed successfully!" 
        : "Payment is being processed...",
    });
  } catch (error) {
    console.error("Payment success handling error:", error);
    res.status(500).json({ error: "Failed to process payment success" });
  }
});

/**
 * Payment cancellation
 * GET /api/payment/cancel
 */
router.get("/cancel", async (req, res) => {
  try {
    const { id: paymentId } = req.query;
    
    if (paymentId) {
      await paymentService.processPaymentFailure(paymentId as string, "Payment cancelled by user");
    }

    res.json({
      success: false,
      message: "Payment was cancelled. You can try again anytime.",
    });
  } catch (error) {
    console.error("Payment cancellation error:", error);
    res.status(500).json({ error: "Failed to process payment cancellation" });
  }
});

/**
 * Get user payment history
 * GET /api/payment/history
 */
router.get("/history", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { limit = 10, offset = 0 } = req.query;
    
    const payments = await paymentService.getUserPaymentHistory(
      req.user.id,
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentType: payment.paymentType,
        status: payment.status,
        description: payment.description,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
      })),
    });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
});

/**
 * Payment simulator for development
 * GET /api/payment/simulator
 */
router.get("/simulator", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: "Not found" });
  }

  const { custom_str1: transactionId, amount, item_name } = req.query;

  res.send(`
    <html>
      <head>
        <title>ATSBoost Payment Simulator</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .payment-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: #f9f9f9; }
          .btn { padding: 10px 20px; margin: 10px; border: none; border-radius: 4px; cursor: pointer; }
          .btn-success { background: #28a745; color: white; }
          .btn-danger { background: #dc3545; color: white; }
          .amount { font-size: 24px; font-weight: bold; color: #333; }
        </style>
      </head>
      <body>
        <div class="payment-card">
          <h2>🚀 ATSBoost Payment Gateway</h2>
          <p><strong>Service:</strong> ${item_name}</p>
          <p class="amount">Amount: R${amount}</p>
          <p><strong>Transaction:</strong> ${transactionId}</p>
          
          <div style="margin-top: 30px;">
            <button class="btn btn-success" onclick="processPayment(true)">
              ✅ Complete Payment
            </button>
            <button class="btn btn-danger" onclick="processPayment(false)">
              ❌ Cancel Payment
            </button>
          </div>
        </div>

        <script>
          function processPayment(success) {
            if (success) {
              // Simulate successful payment notification
              fetch('/api/payment/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  pf_payment_id: 'sim_' + Date.now(),
                  custom_str1: '${transactionId}',
                  payment_status: 'COMPLETE',
                  amount_gross: '${amount}',
                  simulator: true
                })
              }).then(() => {
                window.location.href = '/payment/success?id=${transactionId}';
              });
            } else {
              window.location.href = '/payment/cancel?id=${transactionId}';
            }
          }
        </script>
      </body>
    </html>
  `);
});

export default router;