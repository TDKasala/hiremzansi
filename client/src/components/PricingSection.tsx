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
  // Launch discount - 50% off for first 500 users
  const LAUNCH_DISCOUNT = 0.5;
  const isLaunchDiscountActive = true; // You can add logic here to check user count or time limit
  
  const plans: PricingPlan[] = [
    {
      name: "Free Trial",
      price: "ZAR 0",
      description: "Try our CV analysis service",
      features: [
        { name: "1 Free CV Analysis", included: true },
        { name: "Basic ATS Score", included: true },
        { name: "CV Upload Tool", included: true },
        { name: "Basic Optimization Tips", included: true },
        { name: "Valid for 7 Days", included: true },
        { name: "Detailed Reports", included: false },
      ],
      buttonText: "Start Free Trial",
      buttonLink: "/auth",
      buttonVariant: "outline",
    },
    {
      name: "Essential Pack",
      price: isLaunchDiscountActive ? "ZAR 25" : "ZAR 49",
      description: isLaunchDiscountActive ? "Perfect for active job seekers - 50% OFF!" : "Perfect for active job seekers",
      features: [
        { name: "5 Complete CV Analyses", included: true },
        { name: "Advanced ATS Scoring", included: true },
        { name: "Detailed PDF Reports", included: true },
        { name: "SA-Specific Recommendations", included: true },
        { name: "B-BBEE Optimization", included: true },
        { name: "30-Day Access", included: true },
      ],
      buttonText: "Get Essential Pack",
      buttonLink: "/auth",
      highlighted: true,
    },
    {
      name: "Professional",
      price: isLaunchDiscountActive ? "ZAR 50/month" : "ZAR 99/month",
      description: isLaunchDiscountActive ? "For career professionals & consultants - 50% OFF!" : "For career professionals & consultants",
      features: [
        { name: "15 CV Analyses/Month", included: true },
        { name: "Real-time CV Editor", included: true },
        { name: "Priority Support", included: true },
        { name: "Template Library Access", included: true },
        { name: "Industry Benchmarking", included: true },
        { name: "Export to Multiple Formats", included: true },
      ],
      buttonText: "Go Professional",
      buttonLink: "/auth",
      buttonVariant: "outline",
    },
  ];

  return (
    <section id="pricing" className="min-h-screen flex items-center justify-center py-6 xs:py-8 sm:py-12 lg:py-16 bg-neutral-50">
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-secondary mb-2 xs:mb-3 sm:mb-4 leading-tight px-2 xs:px-4">
            Choose Your Plan
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto px-2 xs:px-4 leading-relaxed">
            Affordable CV optimization plans designed for South African job seekers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg shadow-lg p-4 xs:p-5 sm:p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.highlighted 
                  ? 'border-primary bg-gradient-to-b from-primary/5 to-white relative' 
                  : 'border-neutral-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-2 xs:-top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-3 xs:px-4 py-1 rounded-full text-xs xs:text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-4 xs:mb-5 sm:mb-6">
                <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-secondary mb-1 xs:mb-2 leading-tight">
                  {plan.name}
                </h3>
                <div className="mb-2 xs:mb-3">
                  {isLaunchDiscountActive && plan.name !== "Free Trial" ? (
                    <div className="text-center">
                      <div className="text-xs xs:text-sm text-gray-500 line-through mb-1">
                        {plan.name === "Essential Pack" ? "ZAR 49" :
                         plan.name === "Professional" ? "ZAR 99/month" :
                         plan.name === "Business Annual" ? "ZAR 999/year" : ""}
                      </div>
                      <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center gap-1 xs:gap-2">
                        {plan.price}
                        <span className="bg-red-500 text-white text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full">50% OFF</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-primary">
                      {plan.price}
                    </div>
                  )}
                </div>
                <p className="text-neutral-600 text-xs xs:text-sm leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-1.5 xs:space-y-2 mb-6 xs:mb-7 sm:mb-8 min-h-[140px] xs:min-h-[160px] sm:min-h-[180px]">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start text-xs xs:text-sm">
                    {feature.included ? (
                      <Check className="h-3 w-3 xs:h-4 xs:w-4 text-green-600 mr-1.5 xs:mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-3 w-3 xs:h-4 xs:w-4 text-neutral-400 mr-1.5 xs:mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included
                          ? "text-neutral-700 leading-relaxed"
                          : "text-neutral-400 leading-relaxed"
                      }
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.buttonLink}>
                <Button
                  className="w-full text-xs xs:text-sm py-2 xs:py-2.5 sm:py-3"
                  variant={plan.highlighted ? "default" : (plan.buttonVariant || "outline")}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 xs:mt-10 sm:mt-12">
          <p className="text-neutral-600 text-xs xs:text-sm leading-relaxed px-2 xs:px-4">
            All prices in South African Rand (ZAR). No hidden fees.
          </p>
        </div>
      </div>
    </section>
  );
}
