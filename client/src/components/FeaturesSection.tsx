import { useState } from "react";
import { Link } from "wouter";
import { 
  Edit, 
  Search, 
  Bell, 
  FileText,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function FeaturesSection() {
  const [sectionOpen, setSectionOpen] = useState(false);
  
  const features: Feature[] = [
    {
      icon: <Edit className="text-xl text-primary" />,
      title: "Real-time CV Editor",
      description: "Edit your CV with real-time feedback on ATS compatibility. Our editor suggests improvements as you type, highlighting keywords and formatting issues."
    },
    {
      icon: <Search className="text-xl text-primary" />,
      title: "Keyword Optimization",
      description: "Get industry-specific keyword suggestions based on actual South African job listings. Tailor your CV for each application to maximize your chances."
    },
    {
      icon: <Bell className="text-xl text-primary" />,
      title: "Job Alert Integration",
      description: "Receive personalized job alerts via SMS based on your CV skills and experience. Never miss an opportunity that matches your profile."
    },
    {
      icon: <FileText className="text-xl text-primary" />,
      title: "Multiple CV Versions",
      description: "Create and store multiple versions of your CV tailored for different job types or industries. Apply with the perfect CV every time."
    }
  ];
  
  const editorBenefits = [
    "Highlights keywords that match job descriptions",
    "Suggests improvements for ATS compatibility",
    "South African context-aware (B-BBEE, NQF)"
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div 
            className="cursor-pointer flex items-center justify-center gap-3 hover:bg-gray-50 rounded-lg p-4 transition-colors duration-200"
            onClick={() => setSectionOpen(!sectionOpen)}
          >
            <h2 className="text-3xl font-bold text-secondary">Premium Features</h2>
            {sectionOpen ? (
              <ChevronUp className="h-8 w-8 text-primary animate-bounce" />
            ) : (
              <ChevronDown className="h-8 w-8 text-primary animate-pulse" />
            )}
          </div>
          <p className="text-neutral-600 max-w-2xl mx-auto mt-2">
            Explore our advanced tools designed specifically for the South African job market.
          </p>
        </div>
        
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            sectionOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-fade-in-up">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-start hover:shadow-lg p-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex-shrink-0 bg-primary bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-4 hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-neutral-100 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="md:flex">
                <div className="md:w-1/2 p-8">
                  <h3 className="text-2xl font-bold text-secondary mb-4">Real-time CV Editor Demo</h3>
                  <p className="text-neutral-600 mb-4">
                    Our premium editor analyzes your CV as you type, providing instant feedback and suggestions.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {editorBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="text-success mt-1 mr-2 h-5 w-5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className="bg-primary text-white hover:bg-opacity-90 transform hover:scale-105 transition-transform duration-200">
                      Try Premium Editor
                    </Button>
                  </Link>
                </div>
                <div className="md:w-1/2 bg-white p-6">
                  <div className="border rounded-lg p-4 h-full">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">CV Editor</h4>
                      <div className="text-sm bg-primary bg-opacity-10 text-primary px-2 py-1 rounded">
                        ATS Score: 82/100
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="font-semibold mb-1">Professional Summary</div>
                      <div className="border rounded p-2 text-sm bg-neutral-50">
                        <span className="bg-green-100">Experienced marketing professional</span> with 5+ years in <span className="bg-green-100">digital marketing</span> and <span className="bg-green-100">campaign management</span>. Proven track record of increasing engagement and <span className="bg-yellow-100">ROI</span> through strategic <span className="bg-green-100">social media</span> initiatives.
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="font-semibold mb-1">Skills</div>
                      <div className="border rounded p-2 text-sm bg-neutral-50">
                        <span className="bg-green-100">Social Media Marketing</span>, <span className="bg-green-100">Content Creation</span>, <span className="bg-green-100">Analytics</span>, <span className="bg-yellow-100">SEO</span>, <span className="bg-green-100">Campaign Management</span>, <span className="bg-green-100">Adobe Creative Suite</span>
                      </div>
                    </div>
                    <div className="text-sm text-neutral-600 mt-2">
                      <div className="flex items-center mb-1">
                        <span className="w-3 h-3 inline-block bg-green-100 mr-2"></span>
                        <span>Matched keywords</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 inline-block bg-yellow-100 mr-2"></span>
                        <span>Suggested additions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}