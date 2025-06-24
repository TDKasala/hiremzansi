import { Router } from "express";
import { db } from "../db";
import { paymentTransactions, premiumJobMatches } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { storage } from "../storage";

const router = Router();

/**
 * PayFast webhook handler for payment notifications
 * This is crucial for the R200 business model to work
 */
router.post("/payfast", async (req, res) => {
  try {
    console.log("PayFast webhook received:", req.body);

    const {
      pf_payment_id,
      custom_str1: transactionId,
      payment_status,
      amount_gross,
      item_name,
    } = req.body;

    // Verify payment exists in our database
    const [payment] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.transactionId, transactionId));

    if (!payment) {
      console.error("Payment not found for transaction:", transactionId);
      return res.status(404).json({ error: "Payment not found" });
    }

    // Update payment status
    await db
      .update(paymentTransactions)
      .set({
        status: payment_status === "COMPLETE" ? "completed" : "failed",
        paidAt: payment_status === "COMPLETE" ? new Date() : null,
        metadata: {
          ...payment.metadata,
          pf_payment_id,
          amount_gross,
          item_name,
          webhook_received: new Date().toISOString(),
        }
      })
      .where(eq(paymentTransactions.id, payment.id));

    // If payment successful and it's a recruiter payment, unlock candidate contact
    if (payment_status === "COMPLETE" && payment.paymentType === "recruiter_contact_unlock") {
      try {
        await storage.unlockCandidateContact(
          payment.relatedEntityId!,
          payment.userId
        );
        
        console.log(`Contact unlocked for match ${payment.relatedEntityId}, recruiter ${payment.userId}`);
      } catch (unlockError) {
        console.error("Error unlocking candidate contact:", unlockError);
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("PayFast webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

/**
 * Manual payment confirmation (for testing)
 */
router.post("/manual-confirm/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find payment
    const [payment] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.transactionId, transactionId));

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Update payment as completed
    await db
      .update(paymentTransactions)
      .set({
        status: "completed",
        paidAt: new Date(),
        metadata: {
          ...payment.metadata,
          manual_confirmation: true,
          confirmed_at: new Date().toISOString(),
        }
      })
      .where(eq(paymentTransactions.id, payment.id));

    // If recruiter payment, unlock contact
    if (payment.paymentType === "recruiter_contact_unlock") {
      await storage.unlockCandidateContact(
        payment.relatedEntityId!,
        payment.userId
      );
    }

    res.json({
      success: true,
      message: "Payment confirmed and contact unlocked"
    });

  } catch (error) {
    console.error("Manual confirmation error:", error);
    res.status(500).json({ error: "Confirmation failed" });
  }
});

export default router;