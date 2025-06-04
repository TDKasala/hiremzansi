import { Helmet } from "react-helmet";

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Hire Mzansi</title>
        <meta name="description" content="Hire Mzansi terms of service - the rules, guidelines, and agreements for using our South African CV optimization platform." />
        <meta property="og:title" content="Hire Mzansi Terms of Service" />
        <meta property="og:description" content="Read the terms and conditions for using Hire Mzansi's CV optimization platform." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hiremzansi.co.za/terms" />
      </Helmet>
      
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Please read these terms carefully before using our services
          </p>
        </div>
      </div>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose">
            <h2>Terms of Service Agreement</h2>
            <p>
              Last Updated: June 1, 2023
            </p>
            <p>
              These Terms of Service ("Terms") govern your access to and use of the Hire Mzansi website and services ("Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, do not access or use our Services.
            </p>
            
            <h2>1. Account Registration</h2>
            <p>
              To access certain features of our Services, you may need to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            <p>
              You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
            
            <h2>2. Service Description</h2>
            <p>
              Hire Mzansi provides CV/resume optimization services, including ATS (Applicant Tracking System) scoring, analysis, and recommendations. Our Services are designed to help South African job seekers improve their resumes for better ATS compatibility.
            </p>
            <p>
              While we strive to provide accurate and helpful analysis, we cannot guarantee employment outcomes or interview success as a result of using our Services.
            </p>
            
            <h2>3. Subscription and Payment Terms</h2>
            <p>
              Hire Mzansi offers free and paid services. By selecting a paid service, you agree to pay the specified fees. All payments are processed securely through our payment processor.
            </p>
            <p>
              For subscription-based services:
            </p>
            <ul>
              <li>Subscriptions automatically renew until canceled</li>
              <li>You can cancel at any time through your account settings</li>
              <li>No refunds are provided for partial subscription periods</li>
              <li>Prices are in South African Rand (ZAR) and include VAT where applicable</li>
            </ul>
            <p>
              For one-time purchases (e.g., Deep Analysis Report), payment is due at the time of purchase.
            </p>
            
            <h2>4. Free Trial</h2>
            <p>
              We may offer a free trial of our premium services. At the end of the trial period, you will be automatically charged for the subscription unless you cancel before the trial ends.
            </p>
            
            <h2>5. User Content</h2>
            <p>
              When you upload your CV/resume or other content to our Services ("User Content"), you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process this content solely for the purpose of providing and improving our Services.
            </p>
            <p>
              You are solely responsible for your User Content and represent that you have all rights necessary to grant us the license above.
            </p>
            
            <h2>6. Prohibited Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use our Services for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the integrity of our Services</li>
              <li>Upload harmful content, including viruses or malware</li>
              <li>Impersonate any person or entity</li>
              <li>Use automated methods to access or use our Services without permission</li>
              <li>Reverse engineer or attempt to extract the source code of our software</li>
            </ul>
            
            <h2>7. Intellectual Property</h2>
            <p>
              Our Services, including all content, features, and functionality, are owned by Hire Mzansi and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              These Terms do not grant you any right to use our trademarks, logos, domain names, or other brand features.
            </p>
            
            <h2>8. Termination</h2>
            <p>
              We may suspend or terminate your access to our Services at any time for any reason, including if you violate these Terms.
            </p>
            <p>
              You may terminate your account at any time by contacting us or using the account deletion option in your account settings.
            </p>
            
            <h2>9. Disclaimers</h2>
            <p>
              Our Services are provided "as is" without warranties of any kind, either express or implied.
            </p>
            <p>
              We do not guarantee that our Services will be uninterrupted, error-free, or secure, or that any defects will be corrected.
            </p>
            <p>
              We do not guarantee employment outcomes, interview invitations, or job placement as a result of using our Services.
            </p>
            
            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Hire Mzansi shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our Services.
            </p>
            <p>
              In no event shall our total liability exceed the amount you paid for our Services in the six months preceding the event giving rise to the liability.
            </p>
            
            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of South Africa, without regard to its conflict of law principles.
            </p>
            <p>
              Any disputes arising under these Terms shall be resolved exclusively in the courts of South Africa.
            </p>
            
            <h2>12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of material changes by posting the new Terms on our website and updating the "Last Updated" date.
            </p>
            <p>
              Your continued use of our Services after such changes constitutes your acceptance of the new Terms.
            </p>
            
            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              Email: legal@hiremzansi.co.za<br />
              Address: Cape Town, South Africa
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
