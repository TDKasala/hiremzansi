import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Lock, Zap, Smartphone } from "lucide-react";

export default function CTASection() {
  const benefits = [
    { icon: <Lock className="h-4 w-4 mr-2" />, text: "POPIA Compliant" },
    { icon: <Zap className="h-4 w-4 mr-2" />, text: "Instant Results" },
    { icon: <Smartphone className="h-4 w-4 mr-2" />, text: "Mobile Friendly" }
  ];

  return (
    <section className="py-8 sm:py-16 bg-gradient-to-r from-secondary to-neutral-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to Land Your Dream Job?</h2>
          <p className="text-base sm:text-xl text-neutral-200 mb-6 sm:mb-8 px-2">
            Join thousands of South African job seekers who have improved their chances with Hire Mzansi.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a href="#upload-section" onClick={(e) => {
              e.preventDefault();
              const uploadSection = document.getElementById('upload-section');
              if (uploadSection) {
                uploadSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
              <Button size="lg" className="bg-primary text-white hover:bg-opacity-90 w-full sm:w-auto h-12 sm:h-11 text-sm sm:text-base">
                Get Your Free ATS Score
              </Button>
            </a>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="bg-white text-secondary hover:bg-opacity-90 w-full sm:w-auto h-12 sm:h-11 text-sm sm:text-base">
                View Pricing Plans
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 text-neutral-300 flex flex-col sm:flex-row items-center justify-center text-sm">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className={`flex items-center mb-2 sm:mb-0 ${
                  index !== benefits.length - 1 ? "sm:mr-6" : ""
                }`}
              >
                {benefit.icon}
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
