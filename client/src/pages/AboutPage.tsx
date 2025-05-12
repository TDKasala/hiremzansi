import { Helmet } from "react-helmet";
import { Users, BarChart2, LineChart, Target } from "lucide-react";
import CTASection from "@/components/CTASection";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Thandi Nkosi",
      title: "Founder & CEO",
      bio: "With 10+ years of HR experience at major South African corporations, Thandi founded ATSBoost to address the growing CV optimization needs in the local job market.",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    },
    {
      name: "Daniel Mbeki",
      title: "CTO",
      bio: "Daniel leads our technical team, bringing expertise in AI and natural language processing to build our ATS analysis algorithms specifically for the South African context.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    },
    {
      name: "Sarah van der Merwe",
      title: "Head of Career Services",
      bio: "A certified career coach with expertise in the South African job market, Sarah ensures our CV recommendations are aligned with local employment standards and practices.",
      image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us | ATSBoost - South African Resume Optimization</title>
        <meta name="description" content="Learn about ATSBoost - the team behind South Africa's leading CV optimization platform helping job seekers beat ATS systems and land more interviews." />
        <meta property="og:title" content="About ATSBoost - Our Mission and Team" />
        <meta property="og:description" content="Learn about the team behind South Africa's CV optimization platform helping job seekers land more interviews." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://atsboost.co.za/about" />
      </Helmet>
      
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">About ATSBoost</h1>
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
                ATSBoost was founded in 2023 with a clear mission: to help South African job seekers overcome 
                the ATS barrier that prevents many qualified candidates from landing interviews.
              </p>
              <p className="text-neutral-700 mb-4">
                In a country with 32% unemployment affecting nearly 15 million job seekers, we recognized that 
                the widespread use of Applicant Tracking Systems by employers was creating an additional hurdle. 
                Many talented individuals were being filtered out before a human ever saw their CV.
              </p>
              <p className="text-neutral-700">
                Our team combines expertise in HR, technology, and the unique requirements of the South African 
                job market to build a platform that delivers real results for job seekers across the country.
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
              <h2 className="text-2xl font-bold text-secondary mb-6">Our Team</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="text-center">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-40 h-40 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-primary mb-2">{member.title}</p>
                    <p className="text-neutral-600 text-sm">{member.bio}</p>
                  </div>
                ))}
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
