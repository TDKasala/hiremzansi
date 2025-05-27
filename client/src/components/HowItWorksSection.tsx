import { useState } from "react";
import { 
  Upload, 
  BarChart, 
  Wand2, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

type AccordionItemProps = {
  title: string;
  content: string;
  isOpen: boolean;
  toggleAccordion: () => void;
  id: string;
};

function AccordionItem({ title, content, isOpen, toggleAccordion, id }: AccordionItemProps) {
  return (
    <div className="cursor-pointer" onClick={toggleAccordion}>
      <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
        <h4 className="font-medium">{title}</h4>
        {isOpen ? (
          <ChevronUp className="text-neutral-500 h-5 w-5" id={`icon-${id}`} />
        ) : (
          <ChevronDown className="text-neutral-500 h-5 w-5" id={`icon-${id}`} />
        )}
      </div>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
        id={id}
      >
        <p className="text-neutral-600 pb-2">{content}</p>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [sectionOpen, setSectionOpen] = useState(false);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const steps = [
    {
      icon: <Upload className="h-8 w-8 text-primary" />,
      title: "1. Upload Your CV",
      description: "Upload your current CV in PDF or DOCX format and let our system analyze it."
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: "2. Get Your ATS Score",
      description: "Receive an instant ATS compatibility score that shows how well your CV performs."
    },
    {
      icon: <Wand2 className="h-8 w-8 text-primary" />,
      title: "3. Optimize Your CV",
      description: "Follow our tailored recommendations to improve your CV and increase your chances of landing interviews."
    }
  ];

  const accordionItems = [
    {
      id: "accordion1",
      title: "70% of South African employers use ATS systems",
      content: "Most medium to large companies in South Africa use Applicant Tracking Systems to filter CVs before a human ever sees them. Without proper optimization, your CV might be rejected automatically."
    },
    {
      id: "accordion2",
      title: "Local hiring requirements matter",
      content: "South African employers look for specific information like B-BBEE status and NQF qualifications. Our system is tailored to local requirements to give you an advantage."
    },
    {
      id: "accordion3",
      title: "Stand out in a competitive market",
      content: "With 32% unemployment in South Africa (~15 million job seekers), competition is fierce. An optimized CV can be the difference between getting an interview or being overlooked."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div 
            className="cursor-pointer flex items-center justify-center gap-3 hover:bg-gray-50 rounded-lg p-4 transition-colors duration-200"
            onClick={() => setSectionOpen(!sectionOpen)}
          >
            <h2 className="text-3xl font-bold text-secondary">How ATSBoost Works</h2>
            {sectionOpen ? (
              <ChevronUp className="h-8 w-8 text-primary animate-bounce" />
            ) : (
              <ChevronDown className="h-8 w-8 text-primary animate-pulse" />
            )}
          </div>
          <p className="text-neutral-600 max-w-2xl mx-auto mt-2">
            Our simple 3-step process helps you optimize your CV for Applicant Tracking Systems 
            used by South African employers.
          </p>
        </div>
        
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            sectionOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in-up">
            {steps.map((step, index) => (
              <div key={index} className="bg-neutral-100 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-neutral-600">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-neutral-100 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold mb-4">
                Why ATS Optimization Matters in South Africa
              </h3>
              
              <div className="space-y-4">
                {accordionItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    content={item.content}
                    isOpen={openAccordion === item.id}
                    toggleAccordion={() => toggleAccordion(item.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
