import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowRight, Search, Facebook, Instagram, 
  Linkedin, Newspaper, Users, MessageCircle, PenSquare,
  ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormData {
  source: string;
  otherSource?: string;
  additionalFeedback?: string;
}

export default function ReferralSourceSection() {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    source: "",
    otherSource: "",
    additionalFeedback: ""
  });
  
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const referralSources = [
    { id: "google", label: "Google Search", icon: <Search className="h-4 w-4" /> },
    { id: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
    { id: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
    { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
    { id: "friend", label: "Friend Referral", icon: <Users className="h-4 w-4" /> },
    { id: "newspaper", label: "Newspaper", icon: <Newspaper className="h-4 w-4" /> },
    { id: "blog", label: "Blog Article", icon: <PenSquare className="h-4 w-4" /> },
    { id: "other", label: "Other (Please specify)", icon: <MessageCircle className="h-4 w-4" /> },
  ];

  const handleSourceChange = (value: string) => {
    setFormData({ ...formData, source: value });
    setShowOther(value === "other");
  };

  const handleOtherSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, otherSource: e.target.value });
  };

  const handleAdditionalFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, additionalFeedback: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.source) {
      toast({
        title: "Please select a source",
        description: "Let us know how you found ATSBoost",
        variant: "destructive",
      });
      return;
    }

    if (formData.source === "other" && !formData.otherSource) {
      toast({
        title: "Please specify your source",
        description: "Tell us where you heard about us",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would send the data to your backend
      // await apiRequest("POST", "/api/referral-source", formData);
      
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowForm(false);
      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve our service.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-amber-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary mb-3">
              We'd Love to Know How You Found Us
            </h2>
            <p className="text-gray-600 mb-6">
              Your feedback helps us understand how to better reach South African job seekers like you.
            </p>
            
            <Button
              onClick={toggleExpansion}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white flex items-center mx-auto"
            >
              {isExpanded ? "Hide Feedback Form" : "Share Your Feedback"}
              {isExpanded ? 
                <ChevronUp className="ml-2 h-4 w-4" /> : 
                <ChevronDown className="ml-2 h-4 w-4" />
              }
            </Button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="overflow-hidden"
              >
                {showForm ? (
                  <Card className="p-6 shadow-lg border-t-4 border-primary">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Where did you hear about ATSBoost?</h3>
                        
                        <RadioGroup 
                          value={formData.source} 
                          onValueChange={handleSourceChange}
                          className="grid grid-cols-1 md:grid-cols-2 gap-3"
                        >
                          {referralSources.map((source) => (
                            <div key={source.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={source.id} id={source.id} className="text-primary" />
                              <Label 
                                htmlFor={source.id} 
                                className="flex items-center cursor-pointer py-2 px-3 rounded-md hover:bg-amber-50 transition-colors w-full"
                              >
                                <span className="mr-2 text-primary">{source.icon}</span>
                                {source.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        
                        {showOther && (
                          <div className="mt-3 pl-7">
                            <Label htmlFor="otherSource" className="text-sm text-gray-600 mb-1 block">
                              Please specify where you heard about us
                            </Label>
                            <Input
                              id="otherSource"
                              placeholder="E.g., Career fair, University event, etc."
                              value={formData.otherSource}
                              onChange={handleOtherSourceChange}
                              className="border-gray-300"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalFeedback" className="text-base font-medium">
                          Any additional feedback about your experience so far?
                        </Label>
                        <Textarea
                          id="additionalFeedback"
                          placeholder="Share your thoughts with us..."
                          value={formData.additionalFeedback}
                          onChange={handleAdditionalFeedbackChange}
                          className="h-24 border-gray-300"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-amber-500 text-white" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            Submit Feedback
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </Card>
                ) : (
                  <Card className="p-8 text-center bg-gradient-to-r from-white to-amber-50 shadow-lg border border-primary/20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-secondary mb-2">Thank You For Your Feedback!</h3>
                    <p className="text-gray-600 mb-4">
                      Your insights help us improve our platform for all South African job seekers.
                    </p>
                    <Button 
                      onClick={() => setShowForm(true)} 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      Submit Another Response
                    </Button>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}