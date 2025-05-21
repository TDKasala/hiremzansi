import { Link } from "wouter";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type PlanFeature = {
  name: string;
  included: boolean;
};

type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  buttonLink: string;
  highlighted?: boolean;
  buttonVariant?: "default" | "outline" | "secondary";
};

export default function PricingSection() {
  const plans: PricingPlan[] = [
    {
      name: "Free",
      price: "ZAR 0",
      description: "Basic ATS compatibility check",
      features: [
        { name: "Free ATS Score", included: true },
        { name: "Basic ATS Tips", included: true },
        { name: "CV Upload Tool", included: true },
        { name: "WhatsApp Notifications", included: false },
        { name: "Detailed Analysis", included: false },
        { name: "Premium Optimization", included: false },
      ],
      buttonText: "Get Started",
      buttonLink: "/signup",
      buttonVariant: "outline",
    },
    {
      name: "Deep Analysis",
      price: "ZAR 30",
      description: "One-time comprehensive report",
      features: [
        { name: "Free ATS Score", included: true },
        { name: "Advanced Keyword Analysis", included: true },
        { name: "Detailed PDF Report", included: true },
        { name: "WhatsApp Notifications", included: true },
        { name: "SA-Specific Recommendations", included: true },
        { name: "Ongoing Optimization", included: false },
      ],
      buttonText: "Purchase Analysis",
      buttonLink: "/signup",
      buttonVariant: "outline",
    },
    {
      name: "Premium",
      price: "ZAR 100",
      description: "Complete optimization suite",
      features: [
        { name: "All Deep Analysis Features", included: true },
        { name: "Real-time CV Editor", included: true },
        { name: "WhatsApp Job Alerts", included: true },
        { name: "Multiple CV Versions", included: true },
        { name: "Regional Job Matching", included: true },
        { name: "Priority Support", included: true },
      ],
      buttonText: "Subscribe",
      buttonLink: "/signup",
      highlighted: true,
    },
  ];

  return (
    <section id="pricing-section" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">
            Affordable Plans for Every Job Seeker
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs and budget. Start with our free tier and upgrade as needed.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                plan.highlighted ? "border-2 border-primary relative" : ""
              }`}
            >
              {plan.highlighted && (
                <div className="bg-primary text-white text-center py-1 text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4">
                  {plan.price}
                  {plan.name === "Premium" && (
                    <span className="text-sm font-normal text-neutral-500">/month</span>
                  )}
                </div>
                <p className="text-neutral-600 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className={`flex items-center ${feature.included ? "" : "text-neutral-400"}`}>
                      {feature.included ? (
                        <Check className="text-primary mr-2 h-4 w-4" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href={plan.buttonLink}>
                  <Button 
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-primary text-white hover:bg-opacity-90 font-semibold"
                        : plan.buttonVariant === "outline" 
                        ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                        : "bg-secondary text-white hover:bg-opacity-90"
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-xl font-semibold mb-4">Coming Soon: Employer Solutions</h3>
          <p className="text-neutral-600 mb-4">
            Are you an employer looking to streamline your hiring process and find the best South African talent?
          </p>
          <Link href="/contact">
            <Button className="bg-secondary text-white hover:bg-opacity-90">
              Contact for Early Access
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
