import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function HeroSection() {
  return (
    <section id="home" className="bg-gradient-to-r from-secondary to-neutral-900 text-white py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Beat ATS & Land Your Dream Job!
            </h1>
            <p className="text-lg md:text-xl mb-6 text-neutral-200">
              Get your CV past Applicant Tracking Systems used by 70% of South African employers. 
              Optimize your resume to stand out from other applicants.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="#upload">
                <Button size="lg" className="bg-primary text-white hover:bg-opacity-90 transition-colors w-full sm:w-auto text-base md:text-lg">
                  Get Your Free ATS Score
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="bg-white text-secondary hover:bg-opacity-90 transition-colors w-full sm:w-auto text-base md:text-lg">
                  View Premium Features
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-neutral-300 flex items-center text-sm">
              <Shield className="h-4 w-4 mr-2" />
              <span>POPIA Compliant. Your data is secure with us.</span>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://pixabay.com/get/ge2c3875635e2c646ebe66e596c7b34ef98d4d7f657ef684aa32b3a5662d0105c6a08e63387bf48343ce91e5830473c62027320995fdfa59a4f8a9b53c6cd1cae_1280.jpg" 
              alt="Professional analyzing resume" 
              className="rounded-lg shadow-xl max-w-full" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
