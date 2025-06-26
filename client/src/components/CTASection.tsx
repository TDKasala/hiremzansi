import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Lock, Zap, Smartphone } from "lucide-react";

export default function CTASection() {
  const benefits = [
    { icon: <Lock className="h-4 w-4 mr-2" />, text: "POPIA Compliant" },
    { icon: <Zap className="h-4 w-4 mr-2" />, text: "Instant Results" },
    { icon: <Smartphone className="h-4 w-4 mr-2" />, text: "Mobile Friendly" }
  ];

  return null;
}
