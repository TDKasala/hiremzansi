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
  
  const plans: PricingPlan[] = [
    {
      name: "Free Trial",
      price: "ZAR 0",
      description: "3 free CV analyses valid for 3 days",
      features: [
        { name: "3 CV Analysis Credits", included: true },
        { name: "Valid for 3 Days", included: true },
        { name: "Basic ATS Score", included: true },
        { name: "CV Upload Tool", included: true },
        { name: "Job Matching (Free)", included: true },
        { name: "Basic Tips", included: true },
        { name: "Detailed Reports", included: false },
      ],
      buttonText: "Start Free Trial",
      buttonLink: "/auth",
      buttonVariant: "outline",
    },
    {
      name: "Deep Analysis",
      price: "ZAR 25",
      description: "One-time comprehensive CV analysis",
      features: [
        { name: "Complete ATS Analysis", included: true },
        { name: "Advanced Keyword Analysis", included: true },
        { name: "Detailed PDF Report", included: true },
        { name: "SA-Specific Recommendations", included: true },
        { name: "B-BBEE Optimization", included: true },
        { name: "Job Matching (Free)", included: true },
        { name: "Lifetime Access to Report", included: true },
      ],
      buttonText: "Purchase Analysis",
      buttonLink: "/auth",
      buttonVariant: "outline",
    },
    {
      name: "Monthly Premium",
      price: "ZAR 100/month",
      description: "50 CV analyses per month",
      features: [
        { name: "50 CV Analysis Credits", included: true },
        { name: "All Deep Analysis Features", included: true },
        { name: "Real-time CV Editor", included: true },
        { name: "Priority Support", included: true },
        { name: "Job Matching (Free)", included: true },
        { name: "Monthly Billing", included: true },
      ],
      buttonText: "Subscribe Monthly",
      buttonLink: "/auth",
      highlighted: true,
    },
    {
      name: "Yearly Premium",
      price: "ZAR 1,080/year",
      description: "50 analyses/month - Save 10%",
      features: [
        { name: "50 CV Analysis Credits/Month", included: true },
        { name: "All Deep Analysis Features", included: true },
        { name: "Real-time CV Editor", included: true },
        { name: "Priority Support", included: true },
        { name: "Job Matching (Free)", included: true },
        { name: "10% Discount (Save ZAR 120)", included: true },
      ],
      buttonText: "Subscribe Yearly",
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
                <div className="text-4xl font-bold text-primary mb-2">
                  {selectedPlan.price}
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
