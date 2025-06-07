import { Link } from "wouter";
import { 
  Edit, 
  Search, 
  Bell, 
  FileText,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function FeaturesSection() {
  
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
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-secondary mb-4">Unlock Your Career Potential</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Professional CV optimization tools designed for the South African job market
          </p>
        </div>
        
        {/* Premium Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-primary to-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Real-time Editor Showcase */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">Live ATS Editor</h3>
            <p className="text-primary-100">Watch your CV score improve in real-time as you type</p>
          </div>
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4 text-gray-900">What You Get:</h4>
                <div className="space-y-3">
                  {editorBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="text-green-500 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-900">Live Preview</span>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ATS Score: 92%
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium mb-1">Keywords Matched:</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">Marketing</span>
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">Analytics</span>
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">Leadership</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium mb-1">Suggestions:</div>
                    <div className="text-orange-600 text-xs">+ Add "B-BBEE" compliance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Premium Features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h4 className="font-bold text-lg mb-3 text-gray-900">South African Optimization</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• B-BBEE compliance scoring</li>
              <li>• NQF level verification</li>
              <li>• Local industry keywords</li>
              <li>• SA employment equity awareness</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h4 className="font-bold text-lg mb-3 text-gray-900">Professional Tools</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 20 premium CV templates</li>
              <li>• Cover letter builder</li>
              <li>• Job matching system</li>
              <li>• Interview preparation guides</li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Stand Out?</h3>
            <p className="mb-6 text-primary-100">Join thousands of South African professionals who've improved their job prospects</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing" className="inline-block">
                <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                  View Pricing
                </Button>
              </Link>
              <Link href="/signup" className="inline-block">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-semibold">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}