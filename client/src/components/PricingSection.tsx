import { Link } from "wouter";
import { Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

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
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  
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
    {
      name: "Business Annual",
      price: isLaunchDiscountActive ? "ZAR 500/year" : "ZAR 999/year",
      description: isLaunchDiscountActive ? "Best value - Save 65% with launch discount!" : "Best value - Save 15%",
      features: [
        { name: "20 CV Analyses/Month", included: true },
        { name: "All Professional Features", included: true },
        { name: "Bulk Analysis Tools", included: true },
        { name: "API Access", included: true },
        { name: "15% Annual Savings", included: true },
        { name: "Dedicated Account Manager", included: true },
      ],
      buttonText: "Choose Annual",
      buttonLink: "/auth",
      buttonVariant: "secondary",
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Affordable CV optimization plans designed for South African job seekers
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-left">
                  {selectedPlan ? selectedPlan.name : "Select a pricing plan"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[400px]">
                {plans.map((plan, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setSelectedPlan(plan)}
                    className="flex flex-col items-start p-4 cursor-pointer hover:bg-neutral-50"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-secondary">{plan.name}</span>
                      <span className="font-bold text-primary">{plan.price}</span>
                      {plan.highlighted && (
                        <span className="bg-primary text-white px-2 py-1 rounded text-xs ml-2">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-neutral-600">{plan.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedPlan && (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-neutral-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-secondary mb-2">
                  {selectedPlan.name}
                </h3>
                <div className="mb-2">
                  {isLaunchDiscountActive && selectedPlan.name !== "Free Trial" ? (
                    <div className="text-center">
                      <div className="text-lg text-gray-500 line-through mb-1">
                        {selectedPlan.name === "Essential Pack" ? "ZAR 49" :
                         selectedPlan.name === "Professional" ? "ZAR 99/month" :
                         selectedPlan.name === "Business Annual" ? "ZAR 999/year" : ""}
                      </div>
                      <div className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
                        {selectedPlan.price}
                        <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">50% OFF</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-primary">
                      {selectedPlan.price}
                    </div>
                  )}
                </div>
                <p className="text-neutral-600">{selectedPlan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {selectedPlan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-neutral-400 mr-3 flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included
                          ? "text-neutral-700"
                          : "text-neutral-400"
                      }
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={selectedPlan.buttonLink}>
                <Button
                  className="w-full"
                  variant={selectedPlan.buttonVariant || "default"}
                >
                  {selectedPlan.buttonText}
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <p className="text-neutral-600 text-sm">
            All prices in South African Rand (ZAR). No hidden fees.
          </p>
        </div>
      </div>
    </section>
  );
}
