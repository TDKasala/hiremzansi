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
      name: "Free Trial",
      price: "ZAR 0",
      description: "3 free CV analyses valid for 3 days",
      features: [
        { name: "3 CV Analysis Credits", included: true },
        { name: "Valid for 3 Days", included: true },
        { name: "Basic ATS Score", included: true },
        { name: "CV Upload Tool", included: true },
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
        { name: "Job Matching", included: true },
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
        { name: "Job Matching", included: true },
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-lg p-6 relative ${
                plan.highlighted
                  ? "border-2 border-primary transform scale-105"
                  : "border border-neutral-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-secondary mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-secondary mb-2">
                  {plan.price}
                </div>
                <p className="text-neutral-600 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
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

              <Link href={plan.buttonLink}>
                <Button
                  className="w-full"
                  variant={plan.buttonVariant || "default"}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
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
