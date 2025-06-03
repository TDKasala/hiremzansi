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
      buttonLink: "/auth",
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
      buttonLink: "/auth",
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
      buttonLink: "/auth",
      highlighted: true,
    },
  ];

  return null;
}
