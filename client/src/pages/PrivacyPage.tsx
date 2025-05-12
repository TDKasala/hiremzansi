import { Helmet } from "react-helmet";

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | ATSBoost - POPIA Compliant</title>
        <meta name="description" content="ATSBoost privacy policy - how we protect your data and comply with POPIA regulations. Learn about our data collection, storage, and processing practices." />
        <meta property="og:title" content="ATSBoost Privacy Policy - POPIA Compliant" />
        <meta property="og:description" content="Learn how ATSBoost protects your data in compliance with South African POPIA regulations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://atsboost.co.za/privacy" />
      </Helmet>
      
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl max-w-2xl mx-auto">
            How we protect your data in accordance with POPIA
          </p>
        </div>
      </div>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose">
            <h2>POPIA Compliance Statement</h2>
            <p>
              ATSBoost is committed to protecting your privacy and ensuring that your personal information is collected and used properly, lawfully, and transparently in compliance with the Protection of Personal Information Act (POPIA) of South Africa.
            </p>
            
            <h3>Last Updated: June 1, 2023</h3>
            
            <h2>Information We Collect</h2>
            <p>
              We collect the following types of information:
            </p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, phone number, and other contact details provided during registration.</li>
              <li><strong>CV Data:</strong> Information contained in your CV or resume, including work experience, education, skills, and other professional details.</li>
              <li><strong>Usage Data:</strong> Information about how you use our website, including browser type, pages visited, and time spent.</li>
              <li><strong>Payment Information:</strong> If you purchase our services, we collect payment details necessary to process transactions.</li>
            </ul>
            
            <h2>How We Use Your Information</h2>
            <p>
              We use the information we collect for the following purposes:
            </p>
            <ul>
              <li>To provide and improve our CV optimization services</li>
              <li>To generate ATS scores and analysis reports</li>
              <li>To send you job alerts and relevant communications</li>
              <li>To process payments and manage your account</li>
              <li>To comply with legal obligations</li>
              <li>To detect and prevent fraud</li>
            </ul>
            
            <h2>Data Storage and Security</h2>
            <p>
              We store your data securely with Supabase, using industry-standard encryption and security measures. Your CV data is encrypted at rest and in transit. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, accidental loss, or destruction.
            </p>
            
            <h2>Data Sharing</h2>
            <p>
              We do not sell your personal information to third parties. We may share your information with:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> Third-party vendors who assist us in providing our services (e.g., payment processors, cloud storage providers).</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulations.</li>
              <li><strong>With Your Consent:</strong> When you explicitly consent to the sharing of your information.</li>
            </ul>
            
            <h2>Your Rights Under POPIA</h2>
            <p>
              Under POPIA, you have the right to:
            </p>
            <ul>
              <li>Access your personal information that we hold</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to the processing of your personal information</li>
              <li>Lodge a complaint with the Information Regulator</li>
            </ul>
            
            <h2>Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. If you cancel your account, we will delete or anonymize your information within 30 days, except where we need to retain certain information for legal or legitimate business purposes.
            </p>
            
            <h2>Cookies and Tracking Technologies</h2>
            <p>
              Our website uses cookies and similar tracking technologies to collect information about your browsing activities. You can manage your cookie preferences through your browser settings.
            </p>
            
            <h2>Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us.
            </p>
            
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the new policy on our website and updating the "Last Updated" date.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              Email: privacy@atsboost.co.za<br />
              Address: Cape Town, South Africa
            </p>
            
            <h2>Information Regulator Contact</h2>
            <p>
              You have the right to lodge a complaint with the Information Regulator of South Africa:
            </p>
            <p>
              Website: <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer">https://www.justice.gov.za/inforeg/</a><br />
              Email: inforeg@justice.gov.za
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
