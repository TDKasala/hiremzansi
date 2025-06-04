import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import SuccessStoriesSection from "@/components/SuccessStoriesSection";
import SkillQuizSection from "@/components/SkillQuizSection";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function DropdownFeaturesSection() {
  const [activeTab, setActiveTab] = useState<string>("success");
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const variants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        height: {
          duration: 0.4
        },
        opacity: {
          duration: 0.3,
          delay: 0.1
        }
      }
    }
  };

  return (
    <section className="py-8 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-secondary mb-3">
            Discover More About Hire Mzansi
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Explore success stories from actual job seekers and test your interview knowledge with our skill quizzes.
          </p>
          
          <Button
            onClick={toggleExpansion}
            variant="outline"
            className="mt-4 border-primary text-primary hover:bg-primary hover:text-white flex items-center"
          >
            {isExpanded ? "Hide Features" : "Show Features"}
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
              <Tabs 
                defaultValue="success" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex justify-center mb-8">
                  <TabsList className="bg-amber-100/60">
                    <TabsTrigger 
                      value="success"
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Success Stories
                    </TabsTrigger>
                    <TabsTrigger 
                      value="quiz"
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Skill Quizzes
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="success" className="mt-0">
                  <SuccessStoriesSection />
                </TabsContent>
                
                <TabsContent value="quiz" className="mt-0">
                  <SkillQuizSection />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}