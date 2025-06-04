import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { ArrowRight, ArrowLeft, Check, Trophy, CheckCircle2, X, AlertCircle, Info, BarChart, FilePieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Job profiles with associated questions and ideal answers
const jobProfiles = [
  {
    id: "software-developer",
    title: "Software Developer",
    description: "Evaluate your fit for software development roles in South Africa",
    industries: "Technology, Finance, E-commerce",
    avgSalary: "R30,000 - R80,000 per month",
    marketDemand: "High",
    saContext: "There is a high demand for qualified software developers in South Africa, particularly in financial technology, e-commerce, and telecommunications sectors. Companies often require developers with knowledge of specific frameworks and South African regulatory requirements like POPIA compliance.",
    keySkills: ["Coding", "Problem-solving", "Debugging", "Collaboration", "Attention to detail"],
    educationReq: "BSc Computer Science (NQF Level 7) or equivalent certification",
    questions: [
      {
        id: "problem-solving",
        question: "How do you approach solving complex programming problems?",
        options: [
          {
            id: "a",
            text: "I prefer to dive in and start coding immediately, fixing issues as I go",
            score: 2
          },
          {
            id: "b",
            text: "I break down problems into smaller components, plan my approach, then start coding",
            score: 5
          },
          {
            id: "c",
            text: "I look for existing solutions online and adapt them to my needs",
            score: 3
          },
          {
            id: "d",
            text: "I ask colleagues for help immediately when facing difficult problems",
            score: 1
          }
        ]
      },
      {
        id: "learning",
        question: "How do you stay updated with new programming languages and technologies?",
        options: [
          {
            id: "a",
            text: "I focus on mastering one language/framework and don't worry about others",
            score: 1
          },
          {
            id: "b",
            text: "I follow tech blogs and news but rarely implement new technologies",
            score: 2
          },
          {
            id: "c",
            text: "I regularly dedicate time to learning new technologies and build sample projects",
            score: 5
          },
          {
            id: "d",
            text: "I only learn new technologies when required for work",
            score: 3
          }
        ]
      },
      {
        id: "teamwork",
        question: "How do you approach code reviews and feedback on your work?",
        options: [
          {
            id: "a",
            text: "I prefer minimal review of my code as it slows down development",
            score: 1
          },
          {
            id: "b",
            text: "I appreciate constructive feedback and use it to improve my code quality",
            score: 5
          },
          {
            id: "c",
            text: "I accept feedback but often disagree with reviewers' suggestions",
            score: 2
          },
          {
            id: "d",
            text: "I'm neutral about code reviews; they're just part of the process",
            score: 3
          }
        ]
      },
      {
        id: "communication",
        question: "How do you communicate technical concepts to non-technical team members?",
        options: [
          {
            id: "a",
            text: "I use simple analogies and visual aids to explain complex concepts",
            score: 5
          },
          {
            id: "b",
            text: "I try to explain but find it frustrating when they don't understand",
            score: 2
          },
          {
            id: "c",
            text: "I prefer to let product managers handle communication with non-technical staff",
            score: 1
          },
          {
            id: "d",
            text: "I simplify technical language but still maintain necessary details",
            score: 4
          }
        ]
      },
      {
        id: "debugging",
        question: "What is your approach to debugging code?",
        options: [
          {
            id: "a",
            text: "I use systematic debugging tools and logging to identify issues",
            score: 5
          },
          {
            id: "b",
            text: "I prefer to rewrite sections of code rather than debug existing code",
            score: 2
          },
          {
            id: "c",
            text: "I generally ask for help from senior developers when debugging",
            score: 1
          },
          {
            id: "d",
            text: "I use trial and error, testing different solutions until one works",
            score: 3
          }
        ]
      }
    ]
  },
  {
    id: "financial-analyst",
    title: "Financial Analyst",
    description: "Evaluate your fit for financial analysis roles in South Africa",
    industries: "Banking, Investment, Corporate Finance, Consulting",
    avgSalary: "R25,000 - R65,000 per month",
    marketDemand: "Medium-High",
    saContext: "Financial analysts in South Africa need strong knowledge of local regulations, markets, and economic conditions. Understanding of JSE-listed companies, SARB policies, and South African tax laws is often required. The financial sector adheres to strict B-BBEE guidelines for hiring and advancement.",
    keySkills: ["Financial Modeling", "Data Analysis", "Report Creation", "Industry Research", "Forecasting"],
    educationReq: "BCom Finance or Accounting (NQF Level 7), often with post-graduate qualifications",
    questions: [
      {
        id: "analysis",
        question: "When analyzing financial data, what is your typical approach?",
        options: [
          {
            id: "a",
            text: "I focus on the big picture and overall trends rather than details",
            score: 3
          },
          {
            id: "b",
            text: "I meticulously examine every data point for accuracy before drawing conclusions",
            score: 5
          },
          {
            id: "c",
            text: "I rely primarily on automated tools and software for analysis",
            score: 2
          },
          {
            id: "d",
            text: "I prefer qualitative analysis over quantitative methods",
            score: 1
          }
        ]
      },
      {
        id: "decision-making",
        question: "How do you approach financial decision-making under uncertainty?",
        options: [
          {
            id: "a",
            text: "I always wait for complete information before making recommendations",
            score: 2
          },
          {
            id: "b",
            text: "I use probability analysis and scenario modeling to account for uncertainty",
            score: 5
          },
          {
            id: "c",
            text: "I rely heavily on past experiences and intuition",
            score: 3
          },
          {
            id: "d",
            text: "I prefer to defer to others when facing uncertain situations",
            score: 1
          }
        ]
      },
      {
        id: "reporting",
        question: "How do you approach creating financial reports for different audiences?",
        options: [
          {
            id: "a",
            text: "I create one detailed report and expect recipients to find relevant information",
            score: 1
          },
          {
            id: "b",
            text: "I tailor reports to the audience's technical knowledge and information needs",
            score: 5
          },
          {
            id: "c",
            text: "I focus mainly on data presentation rather than interpretation or context",
            score: 2
          },
          {
            id: "d",
            text: "I create standardized reports with minimal customization",
            score: 3
          }
        ]
      },
      {
        id: "regulations",
        question: "How do you stay current with changing financial regulations?",
        options: [
          {
            id: "a",
            text: "I rely on my company to inform me of important regulatory changes",
            score: 2
          },
          {
            id: "b",
            text: "I regularly read financial publications and attend industry seminars",
            score: 5
          },
          {
            id: "c",
            text: "I update my knowledge only when working on related projects",
            score: 3
          },
          {
            id: "d",
            text: "I consider regulatory knowledge the responsibility of legal teams",
            score: 1
          }
        ]
      },
      {
        id: "tech-aptitude",
        question: "How comfortable are you with financial technology and modeling tools?",
        options: [
          {
            id: "a",
            text: "I'm proficient with advanced financial modeling in Excel, SQL, and BI tools",
            score: 5
          },
          {
            id: "b",
            text: "I'm comfortable with Excel but have limited experience with other tools",
            score: 3
          },
          {
            id: "c",
            text: "I can use basic functions but prefer templates created by others",
            score: 2
          },
          {
            id: "d",
            text: "I rely on others for technical aspects of financial analysis",
            score: 1
          }
        ]
      }
    ]
  },
  {
    id: "marketing-specialist",
    title: "Marketing Specialist",
    description: "Evaluate your fit for marketing roles in South Africa",
    industries: "Advertising, FMCG, Retail, Digital Marketing",
    avgSalary: "R20,000 - R45,000 per month",
    marketDemand: "Medium",
    saContext: "Marketing in South Africa requires understanding diverse cultural contexts and consumer behaviors across different demographics. Knowledge of local market segments is essential, as is familiarity with South Africa's unique media landscape and platforms like Takealot, Superbalist, and local radio broadcasting.",
    keySkills: ["Campaign Management", "Market Research", "Social Media", "Analytics", "Content Creation"],
    educationReq: "BA/BCom Marketing or related field (NQF Level 7), digital certifications beneficial",
    questions: [
      {
        id: "strategy",
        question: "When developing a marketing strategy, what is your first consideration?",
        options: [
          {
            id: "a",
            text: "Budget and resource constraints",
            score: 3
          },
          {
            id: "b",
            text: "Target audience demographics and behaviors",
            score: 5
          },
          {
            id: "c",
            text: "Competitor strategies in the market",
            score: 4
          },
          {
            id: "d",
            text: "Creative concepts and campaign ideas",
            score: 2
          }
        ]
      },
      {
        id: "analytics",
        question: "How do you approach marketing analytics and performance measurement?",
        options: [
          {
            id: "a",
            text: "I focus primarily on creative execution rather than metrics",
            score: 1
          },
          {
            id: "b",
            text: "I set clear KPIs before campaigns and analyze results against objectives",
            score: 5
          },
          {
            id: "c",
            text: "I look mainly at engagement metrics and social media interactions",
            score: 3
          },
          {
            id: "d",
            text: "I rely on third-party agencies to handle performance analysis",
            score: 2
          }
        ]
      },
      {
        id: "trends",
        question: "How do you stay updated with marketing trends and consumer behavior?",
        options: [
          {
            id: "a",
            text: "I constantly test new platforms and tactics in small experiments",
            score: 5
          },
          {
            id: "b",
            text: "I follow industry publications but am cautious about adopting trends",
            score: 4
          },
          {
            id: "c",
            text: "I implement new trends once they've been proven by larger companies",
            score: 3
          },
          {
            id: "d",
            text: "I prefer tried and tested marketing approaches over new trends",
            score: 1
          }
        ]
      },
      {
        id: "adaptation",
        question: "How do you adapt marketing messages for different cultural contexts?",
        options: [
          {
            id: "a",
            text: "I use the same core message with minor visual adjustments",
            score: 2
          },
          {
            id: "b",
            text: "I conduct research on each market and tailor messages accordingly",
            score: 5
          },
          {
            id: "c",
            text: "I focus on universal messages that work across all demographics",
            score: 1
          },
          {
            id: "d",
            text: "I rely on translations of successful campaigns from other markets",
            score: 3
          }
        ]
      },
      {
        id: "collaboration",
        question: "How do you collaborate with other departments (sales, product, etc.)?",
        options: [
          {
            id: "a",
            text: "I prefer marketing to operate independently to maintain creative control",
            score: 1
          },
          {
            id: "b",
            text: "I establish regular cross-functional meetings to align objectives",
            score: 5
          },
          {
            id: "c",
            text: "I collaborate mainly during campaign planning phases",
            score: 3
          },
          {
            id: "d",
            text: "I wait for other departments to approach marketing with needs",
            score: 2
          }
        ]
      }
    ]
  },
  {
    id: "project-manager",
    title: "Project Manager",
    description: "Evaluate your fit for project management roles in South Africa",
    industries: "Construction, IT, Business Consulting, Manufacturing",
    avgSalary: "R30,000 - R70,000 per month",
    marketDemand: "High",
    saContext: "Project managers in South Africa need to navigate complex stakeholder environments and often work with teams across varied educational and cultural backgrounds. Knowledge of local procurement processes, supplier development, and B-BBEE compliance is important, particularly for government-related projects.",
    keySkills: ["Planning", "Budgeting", "Risk Management", "Team Leadership", "Stakeholder Management"],
    educationReq: "Bachelor's degree (NQF Level 7) with PM certification (PMP, PRINCE2, Agile)",
    questions: [
      {
        id: "planning",
        question: "How do you approach planning a new project?",
        options: [
          {
            id: "a",
            text: "I create detailed plans with fixed milestones before starting execution",
            score: 4
          },
          {
            id: "b",
            text: "I develop flexible frameworks that can adapt to changing requirements",
            score: 5
          },
          {
            id: "c",
            text: "I focus on getting started quickly and adjust plans as we progress",
            score: 3
          },
          {
            id: "d",
            text: "I prefer to follow standardized templates for all projects",
            score: 2
          }
        ]
      },
      {
        id: "risk",
        question: "How do you handle project risks and unexpected challenges?",
        options: [
          {
            id: "a",
            text: "I create comprehensive risk registers and mitigation plans upfront",
            score: 5
          },
          {
            id: "b",
            text: "I deal with issues reactively as they arise during the project",
            score: 2
          },
          {
            id: "c",
            text: "I focus on identifying major risks but accept that some issues can't be predicted",
            score: 4
          },
          {
            id: "d",
            text: "I rely on team members to flag and manage risks in their areas",
            score: 3
          }
        ]
      },
      {
        id: "team",
        question: "How do you approach managing team members with different working styles?",
        options: [
          {
            id: "a",
            text: "I implement standardized processes that everyone must follow",
            score: 2
          },
          {
            id: "b",
            text: "I adapt my management style to individual team members' needs",
            score: 5
          },
          {
            id: "c",
            text: "I focus on results and let team members work in their preferred ways",
            score: 4
          },
          {
            id: "d",
            text: "I group similar working styles together to minimize conflicts",
            score: 3
          }
        ]
      },
      {
        id: "stakeholders",
        question: "How do you manage stakeholder expectations throughout a project?",
        options: [
          {
            id: "a",
            text: "I set expectations at the start and avoid changes to prevent scope creep",
            score: 3
          },
          {
            id: "b",
            text: "I maintain regular communication and provide transparent updates on progress",
            score: 5
          },
          {
            id: "c",
            text: "I focus on delivering results and address expectations if issues arise",
            score: 2
          },
          {
            id: "d",
            text: "I prefer to under-promise and over-deliver to manage expectations",
            score: 4
          }
        ]
      },
      {
        id: "deadlines",
        question: "How do you approach project deadlines and time management?",
        options: [
          {
            id: "a",
            text: "I enforce strict deadlines with consequences for missed targets",
            score: 2
          },
          {
            id: "b",
            text: "I build in buffer time and contingencies throughout the project plan",
            score: 5
          },
          {
            id: "c",
            text: "I focus on critical path tasks and am flexible with other deadlines",
            score: 4
          },
          {
            id: "d",
            text: "I view deadlines as flexible targets that can be adjusted as needed",
            score: 1
          }
        ]
      }
    ]
  },
  {
    id: "sales-representative",
    title: "Sales Representative",
    description: "Evaluate your fit for sales roles in South Africa",
    industries: "Retail, FMCG, Technology, Financial Services",
    avgSalary: "R15,000 - R40,000 base plus commission",
    marketDemand: "Medium-High",
    saContext: "Sales in South Africa often requires relationship-building skills and cultural awareness across diverse communities. Understanding local business protocols, including longer relationship-building periods before closing deals, is essential. Knowledge of both established markets and emerging township economies can be valuable.",
    keySkills: ["Negotiation", "Relationship Building", "Product Knowledge", "Communication", "Resilience"],
    educationReq: "Matric (NQF Level 4) required, diploma or degree beneficial but often less important than track record",
    questions: [
      {
        id: "approach",
        question: "What is your approach to building relationships with potential clients?",
        options: [
          {
            id: "a",
            text: "I focus immediately on presenting product benefits and making the sale",
            score: 2
          },
          {
            id: "b",
            text: "I invest time in understanding client needs before proposing solutions",
            score: 5
          },
          {
            id: "c",
            text: "I rely primarily on promotional offers and incentives to attract clients",
            score: 1
          },
          {
            id: "d",
            text: "I follow a standardized sales script for all potential clients",
            score: 3
          }
        ]
      },
      {
        id: "rejection",
        question: "How do you handle rejection and sales setbacks?",
        options: [
          {
            id: "a",
            text: "I take rejection personally and need time to recover before moving on",
            score: 1
          },
          {
            id: "b",
            text: "I view rejection as valuable feedback and an opportunity to improve",
            score: 5
          },
          {
            id: "c",
            text: "I focus on high-probability prospects to minimize rejection",
            score: 3
          },
          {
            id: "d",
            text: "I maintain a positive attitude but rarely analyze reasons for rejection",
            score: 2
          }
        ]
      },
      {
        id: "targets",
        question: "How do you approach meeting sales targets?",
        options: [
          {
            id: "a",
            text: "I create a strategic plan with daily/weekly activities to reach my goals",
            score: 5
          },
          {
            id: "b",
            text: "I focus intensely when approaching deadline but pace myself otherwise",
            score: 3
          },
          {
            id: "c",
            text: "I work consistently and trust the results will follow",
            score: 4
          },
          {
            id: "d",
            text: "I see targets as aspirational guidelines rather than firm requirements",
            score: 1
          }
        ]
      },
      {
        id: "learning",
        question: "How do you approach learning about new products or services?",
        options: [
          {
            id: "a",
            text: "I learn the minimum required information to make sales pitches",
            score: 1
          },
          {
            id: "b",
            text: "I thoroughly study product details and competitive advantages",
            score: 5
          },
          {
            id: "c",
            text: "I focus on testimonials and use cases rather than technical details",
            score: 3
          },
          {
            id: "d",
            text: "I learn just enough about features and rely on marketing materials",
            score: 2
          }
        ]
      },
      {
        id: "teamwork",
        question: "How do you collaborate with team members and other departments?",
        options: [
          {
            id: "a",
            text: "I prefer to work independently and focus on my individual targets",
            score: 1
          },
          {
            id: "b",
            text: "I actively share successful strategies and support struggling colleagues",
            score: 5
          },
          {
            id: "c",
            text: "I collaborate when necessary but prioritize my own performance",
            score: 3
          },
          {
            id: "d",
            text: "I maintain professional relationships but limit information sharing",
            score: 2
          }
        ]
      }
    ]
  }
];

const JobFitQuizPage = () => {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Get the current job profile
  const getCurrentJob = () => {
    return jobProfiles.find(job => job.id === selectedJob);
  };
  
  // Get current question
  const getCurrentQuestion = () => {
    const job = getCurrentJob();
    if (!job) return null;
    return job.questions[currentQuestion];
  };
  
  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };
  
  // Handle next question
  const handleNextQuestion = () => {
    const job = getCurrentJob();
    if (!job) return;
    
    if (currentQuestion < job.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizComplete(true);
    }
  };
  
  // Handle previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Calculate fit score
  const calculateFitScore = () => {
    const job = getCurrentJob();
    if (!job) return 0;
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    job.questions.forEach(question => {
      const answerId = answers[question.id];
      const selectedOption = question.options.find(option => option.id === answerId);
      
      if (selectedOption) {
        totalScore += selectedOption.score;
      }
      
      // Calculate maximum possible score
      const maxScore = Math.max(...question.options.map(option => option.score));
      maxPossibleScore += maxScore;
    });
    
    // Return percentage of max possible score
    return Math.round((totalScore / maxPossibleScore) * 100);
  };
  
  // Get score interpretation
  const getScoreInterpretation = (score: number) => {
    if (score >= 90) return { rating: "Excellent Fit", description: "You demonstrate exceptional alignment with this role's requirements", color: "bg-green-500" };
    if (score >= 75) return { rating: "Strong Fit", description: "You show strong potential for success in this role", color: "bg-green-400" };
    if (score >= 60) return { rating: "Good Fit", description: "You meet most key requirements for this position", color: "bg-blue-500" };
    if (score >= 45) return { rating: "Moderate Fit", description: "You have some alignment but may need development in key areas", color: "bg-amber-500" };
    return { rating: "Low Fit", description: "This role may not align well with your current preferences and approach", color: "bg-red-500" };
  };
  
  // Reset quiz
  const resetQuiz = () => {
    setSelectedJob(null);
    setCurrentQuestion(0);
    setAnswers({});
    setQuizComplete(false);
    setShowResults(false);
  };
  
  // View different job
  const viewDifferentJob = () => {
    setSelectedJob(null);
    setCurrentQuestion(0);
    setAnswers({});
    setQuizComplete(false);
    setShowResults(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Job Fit Quiz | Hire Mzansi</title>
        <meta name="description" content="Discover which South African job roles best match your skills, preferences, and working style with our detailed job fit assessment." />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">South African Job Fit Quiz</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Discover how well your skills, preferences, and work style align with different career paths in the South African job market
        </p>
      </div>
      
      {!selectedJob ? (
        // Job selection screen
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobProfiles.map(job => (
            <Card 
              key={job.id} 
              className="hover:border-amber-300 transition-colors cursor-pointer"
              onClick={() => setSelectedJob(job.id)}
            >
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Industries:</span>
                    <span>{job.industries}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg. Salary:</span>
                    <span>{job.avgSalary}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Market Demand:</span>
                    <Badge variant="outline" className={
                      job.marketDemand === "High" ? "bg-green-100 text-green-800" : 
                      job.marketDemand === "Medium-High" ? "bg-blue-100 text-blue-800" :
                      job.marketDemand === "Medium" ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {job.marketDemand}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-amber-500 hover:bg-amber-600">
                  Take {job.title} Quiz <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : !quizComplete ? (
        // Quiz questions screen
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <CardTitle>{getCurrentJob()?.title} Quiz</CardTitle>
              <Badge variant="outline">
                Question {currentQuestion + 1} of {getCurrentJob()?.questions.length}
              </Badge>
            </div>
            <Progress 
              value={((currentQuestion + 1) / (getCurrentJob()?.questions.length || 1)) * 100} 
              className="h-2"
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <h3 className="text-xl font-medium">
                {getCurrentQuestion()?.question}
              </h3>
              
              <RadioGroup 
                value={answers[getCurrentQuestion()?.id || ""]}
                onValueChange={(value) => handleAnswerSelect(getCurrentQuestion()?.id || "", value)}
              >
                <div className="space-y-3">
                  {getCurrentQuestion()?.options.map(option => (
                    <div 
                      key={option.id} 
                      className={`flex items-start space-x-2 p-3 rounded-md border ${
                        answers[getCurrentQuestion()?.id || ""] === option.id
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200"
                      }`}
                    >
                      <RadioGroupItem 
                        value={option.id} 
                        id={`option-${option.id}`}
                        className="mt-1"
                      />
                      <Label 
                        htmlFor={`option-${option.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <Button 
              onClick={handleNextQuestion}
              disabled={!answers[getCurrentQuestion()?.id || ""]}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {currentQuestion < (getCurrentJob()?.questions.length || 0) - 1 ? (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Complete Quiz <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : !showResults ? (
        // Quiz completed screen
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle>Quiz Complete!</CardTitle>
            <CardDescription>
              You've completed the {getCurrentJob()?.title} career fit assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
              <Trophy className="h-12 w-12 text-amber-500" />
            </div>
            <p className="text-lg">
              Ready to see how well you align with a {getCurrentJob()?.title} role in South Africa?
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => setShowResults(true)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              View My Results <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ) : (
        // Results screen
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle>{getCurrentJob()?.title} Career Fit</CardTitle>
                  <CardDescription>
                    Your alignment with this career path in South Africa
                  </CardDescription>
                </div>
                <div className="text-center">
                  <div className="inline-flex rounded-full h-28 w-28 border-8 border-amber-100 items-center justify-center">
                    <span className="text-3xl font-bold">{calculateFitScore()}%</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg border bg-neutral-50">
                <h3 className="text-xl font-medium mb-2">
                  {getScoreInterpretation(calculateFitScore()).rating}
                </h3>
                <p className="text-muted-foreground">
                  {getScoreInterpretation(calculateFitScore()).description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {calculateFitScore() >= 90 && (
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span>Exceptional alignment with core role requirements</span>
                      </li>
                    )}
                    {calculateFitScore() >= 75 && (
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span>Strong problem-solving and analytical approach</span>
                      </li>
                    )}
                    {calculateFitScore() >= 60 && (
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span>Good communication and collaboration abilities</span>
                      </li>
                    )}
                    {calculateFitScore() >= 45 && (
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span>Basic understanding of role requirements</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>Interest in the {getCurrentJob()?.title} field</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                    Development Areas
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {calculateFitScore() < 60 && (
                      <li className="flex items-start">
                        <X className="h-4 w-4 text-amber-500 mr-2 mt-0.5 shrink-0" />
                        <span>Core technical skills and knowledge may need significant development</span>
                      </li>
                    )}
                    {calculateFitScore() < 75 && (
                      <li className="flex items-start">
                        <X className="h-4 w-4 text-amber-500 mr-2 mt-0.5 shrink-0" />
                        <span>Problem-solving approach could be more structured</span>
                      </li>
                    )}
                    {calculateFitScore() < 90 && (
                      <li className="flex items-start">
                        <X className="h-4 w-4 text-amber-500 mr-2 mt-0.5 shrink-0" />
                        <span>Could benefit from deeper industry-specific knowledge</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <X className="h-4 w-4 text-amber-500 mr-2 mt-0.5 shrink-0" />
                      <span>Consider further education or certifications in this field</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border bg-blue-50">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Info className="h-5 w-5 text-blue-500 mr-2" />
                  South African Context
                </h3>
                <p className="text-sm">{getCurrentJob()?.saContext}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Career Detail</CardTitle>
              <CardDescription>
                Key information about {getCurrentJob()?.title} roles in South Africa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-amber-500" />
                    Role Overview
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Average Salary:</span>
                      <span className="font-medium">{getCurrentJob()?.avgSalary}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Market Demand:</span>
                      <Badge variant="outline" className={
                        getCurrentJob()?.marketDemand === "High" ? "bg-green-100 text-green-800" : 
                        getCurrentJob()?.marketDemand === "Medium-High" ? "bg-blue-100 text-blue-800" :
                        getCurrentJob()?.marketDemand === "Medium" ? "bg-amber-100 text-amber-800" :
                        "bg-red-100 text-red-800"
                      }>
                        {getCurrentJob()?.marketDemand}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Industries:</span>
                      <span>{getCurrentJob()?.industries}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Education:</span>
                      <span>{getCurrentJob()?.educationReq}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <FilePieChart className="h-5 w-5 mr-2 text-amber-500" />
                    Key Skills Required
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {getCurrentJob()?.keySkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={viewDifferentJob}>
              Try Another Career
            </Button>
            <Button onClick={resetQuiz} className="bg-amber-500 hover:bg-amber-600">
              Retake This Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFitQuizPage;