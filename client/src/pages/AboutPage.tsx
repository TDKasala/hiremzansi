import { Helmet } from "react-helmet";
import { Users, BarChart2, LineChart, Target } from "lucide-react";
import CTASection from "@/components/CTASection";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Denis Kasala",
      title: "Founder & Developer",
      bio: "Passionate about addressing South Africa's unemployment crisis, Denis founded Hire Mzansi to empower job seekers with technology that overcomes ATS barriers in the hiring process. His expertise in AI and software development drives our platform's innovative features tailored for the South African job market.",
      image: "https://images.unsplash.com/photo-1531891570158-e71b35a485bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us | Hire Mzansi - South African Resume Optimization</title>
        <meta name="description" content="Learn about Hire Mzansi - the team behind South Africa's leading CV optimization platform helping job seekers beat ATS systems and land more interviews." />
        <meta property="og:title" content="About Hire Mzansi - Our Mission and Team" />
        <meta property="og:description" content="Learn about the team behind South Africa's CV optimization platform helping job seekers land more interviews." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hiremzansi.co.za/about" />
      </Helmet>
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About Hire Mzansi</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Our mission is to empower South African job seekers with the tools they need to succeed
          </p>
        </div>
      </div>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-secondary mb-6">Our Story</h2>
              <p className="text-neutral-700 mb-4">
                Hire Mzansi was founded in 2023 by Denis Kasala with a clear mission: to help South African job seekers overcome 
                the ATS barrier that prevents many qualified candidates from landing interviews.
              </p>
              <p className="text-neutral-700 mb-4">
                In a country with 32% unemployment affecting nearly 15 million job seekers, Denis recognized that 
                the widespread use of Applicant Tracking Systems by employers was creating an additional hurdle. 
                Many talented individuals were being filtered out before a human ever saw their CV.
              </p>
              <p className="text-neutral-700">
                Combining expertise in software development, AI technology, and the unique requirements of the South African 
                job market, Denis built Hire Mzansi to deliver real results for job seekers across the country, with a particular 
                focus on local context factors like B-BBEE status and NQF levels that other global CV tools overlook.
              </p>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-secondary mb-6">Our Mission</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-neutral-100 p-6 rounded-lg text-center">
                  <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Empower Job Seekers</h3>
                  <p className="text-neutral-600">
                    Give South African job seekers the tools and knowledge to navigate the modern hiring process.
                  </p>
                </div>
                
                <div className="bg-neutral-100 p-6 rounded-lg text-center">
                  <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Reduce Unemployment</h3>
                  <p className="text-neutral-600">
                    Contribute to reducing South Africa's 32% unemployment rate by improving job search outcomes.
                  </p>
                </div>
                
                <div className="bg-neutral-100 p-6 rounded-lg text-center">
                  <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Local Context</h3>
                  <p className="text-neutral-600">
                    Provide solutions tailored to South African hiring practices, including B-BBEE and NQF considerations.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-secondary mb-6 text-center">Our Team</h2>
              <div className="max-w-3xl mx-auto bg-neutral-50 p-8 rounded-lg border border-neutral-200 shadow-sm">
                <div className="text-center">
                  <h3 className="font-bold text-2xl mb-2">Denis Kasala</h3>
                  <p className="text-primary font-semibold mb-4">Founder & Lead Developer</p>
                  <div className="text-neutral-700 space-y-4">
                    <p>
                      Denis founded Hire Mzansi in 2023 after witnessing South Africa's growing unemployment crisis and the technical barriers job seekers face in the modern hiring process.
                    </p>
                    <p>
                      With over 5 years of experience in software development and AI technologies, Denis combines technical expertise with a deep understanding of South Africa's unique job market challenges.
                    </p>
                    <p>Prior to Hire Mzansi, Denis worked as an AWS solutions architect developing enterprise applications. His insights into employer ATS systems sparked the idea for a platform specifically designed to help South Africans navigate these digital gatekeepers.</p>
                    <p>
                      Denis holds a BSc in Computer Science from University of Cape Town and is an active advocate for technology education initiatives across South Africa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-secondary mb-6">Our Impact</h2>
              <div className="bg-neutral-100 p-6 rounded-lg">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">70%</div>
                    <p className="text-neutral-600">Increase in interview rates for our users</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
                    <p className="text-neutral-600">South African CVs optimized</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">85%</div>
                    <p className="text-neutral-600">Of users report improved job prospects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
