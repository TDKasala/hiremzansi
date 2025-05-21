import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, Brain, CheckCircle, XCircle, Award, 
  BarChart, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizCategory {
  id: string;
  name: string;
  icon: JSX.Element;
  description: string;
  questions: Question[];
}

export default function SkillQuizSection() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const quizCategories: QuizCategory[] = [
    {
      id: "interview",
      name: "Interview Skills",
      icon: <Brain className="h-5 w-5" />,
      description: "Test your knowledge of common interview techniques and best practices for South African job seekers.",
      questions: [
        {
          id: 1,
          text: "What is the STAR method used for in interviews?",
          options: [
            "Starting The Application Right - ensuring your CV passes ATS systems",
            "Situation, Task, Action, Result - a method for answering behavioral questions",
            "Skills, Talents, Achievements, References - organizing your CV sections",
            "Structured Talking And Responding - a formal interview speech pattern"
          ],
          correctAnswer: 1,
          explanation: "The STAR method (Situation, Task, Action, Result) is a structured way to answer behavioral interview questions by describing a specific situation, the task you needed to accomplish, the action you took, and the results you achieved."
        },
        {
          id: 2,
          text: "In a South African context, how should you address questions about salary expectations?",
          options: [
            "Provide an exact figure based on your previous salary",
            "Refuse to discuss salary until a formal offer is made",
            "Research industry standards and provide a reasonable range",
            "Ask what the interviewer earns to establish fair comparison"
          ],
          correctAnswer: 2,
          explanation: "It's best to research salary ranges for your position, industry, and location in South Africa, and then provide a reasonable range rather than a specific number. This shows you've done your homework while maintaining negotiation flexibility."
        },
        {
          id: 3,
          text: "Which of these is NOT typically part of the South African job interview process?",
          options: [
            "Questions about your B-BBEE status",
            "Competency-based questions about your skills",
            "Polygraph testing for all positions",
            "Discussion of your notice period"
          ],
          correctAnswer: 2,
          explanation: "While polygraph tests might be used for certain security-sensitive positions, they are not a standard part of the South African interview process for most jobs. The other options are common components of interviews in South Africa."
        },
        {
          id: 4,
          text: "When asked about your weaknesses in an interview, what is the best approach?",
          options: [
            "Say you have no weaknesses to project confidence",
            "Mention a real weakness but explain how you're working to improve it",
            "List several weaknesses to appear humble",
            "Describe a strength disguised as a weakness"
          ],
          correctAnswer: 1,
          explanation: "The best approach is to mention a genuine weakness that isn't critical to the job, then explain the steps you're taking to address it. This shows self-awareness and a commitment to professional growth."
        },
        {
          id: 5,
          text: "What does 'culture fit' mean in a South African workplace context?",
          options: [
            "Whether you fit the racial demographic targets of the company",
            "If you can adapt to South African national culture",
            "Your compatibility with the company's values, working style, and environment",
            "Whether you understand South African business etiquette"
          ],
          correctAnswer: 2,
          explanation: "Culture fit refers to how well your personal values, work style, and behaviors align with the company's organizational culture. While understanding South African business etiquette is important, culture fit is more about compatibility with the specific workplace environment."
        }
      ]
    },
    {
      id: "technical",
      name: "Technical Skills",
      icon: <BarChart className="h-5 w-5" />,
      description: "Test your technical knowledge in various fields relevant to the South African job market.",
      questions: [
        {
          id: 1,
          text: "Which of these software skills is most in-demand in South Africa's financial sector?",
          options: [
            "Advanced Excel and financial modeling",
            "WordPress development",
            "Adobe Creative Suite",
            "AutoCAD"
          ],
          correctAnswer: 0,
          explanation: "Advanced Excel and financial modeling skills are highly valued in South Africa's financial sector due to their essential role in data analysis, financial reporting, and forecasting."
        },
        {
          id: 2,
          text: "In the context of South African businesses moving to the cloud, which of these is NOT a major cloud service provider?",
          options: [
            "Microsoft Azure",
            "Amazon Web Services (AWS)",
            "Oracle Cloud",
            "Safaricom Cloud"
          ],
          correctAnswer: 3,
          explanation: "Safaricom Cloud is not a major cloud service provider. Microsoft Azure, Amazon Web Services (AWS), and Oracle Cloud are all established cloud providers operating in South Africa."
        },
        {
          id: 3,
          text: "Which programming language is particularly valued in South Africa's banking sector?",
          options: [
            "Swift",
            "Python",
            "Ruby",
            "Kotlin"
          ],
          correctAnswer: 1,
          explanation: "Python is highly valued in South Africa's banking sector due to its data analysis capabilities, integration with financial systems, and applications in areas like risk modeling and algorithm trading."
        },
        {
          id: 4,
          text: "What does POPIA stand for in the South African business context?",
          options: [
            "Protection of Personal Information Act",
            "Public Office Private Interest Agreement",
            "Protocol for Operational Process Improvement Assessment",
            "Professional Online Presence and Internet Accessibility"
          ],
          correctAnswer: 0,
          explanation: "POPIA stands for the Protection of Personal Information Act, which is South Africa's data protection law that regulates how organizations handle personal information."
        },
        {
          id: 5,
          text: "Which of these skills is most relevant for South Africa's growing renewable energy sector?",
          options: [
            "Coal mining engineering",
            "Oil rig maintenance",
            "Solar photovoltaic system design",
            "Natural gas extraction techniques"
          ],
          correctAnswer: 2,
          explanation: "Solar photovoltaic system design is highly relevant for South Africa's growing renewable energy sector. With abundant sunshine and a national focus on reducing dependency on coal, solar energy expertise is increasingly in demand."
        }
      ]
    },
    {
      id: "workplace",
      name: "South African Workplace",
      icon: <Award className="h-5 w-5" />,
      description: "Questions about South African workplace regulations, norms, and professional expectations.",
      questions: [
        {
          id: 1,
          text: "What does B-BBEE stand for in South African business?",
          options: [
            "Better Business Bureau for Economic Empowerment",
            "Black-Based Business and Employment Equity",
            "Broad-Based Black Economic Empowerment",
            "Business Bureau for Black Employee Empowerment"
          ],
          correctAnswer: 2,
          explanation: "B-BBEE stands for Broad-Based Black Economic Empowerment, which is a South African government policy designed to advance economic transformation and enhance the economic participation of Black people in the South African economy."
        },
        {
          id: 2,
          text: "Which South African public holiday commemorates the establishment of the Union of South Africa?",
          options: [
            "Freedom Day",
            "Heritage Day",
            "Workers' Day",
            "None of the above"
          ],
          correctAnswer: 0,
          explanation: "Freedom Day (April 27) commemorates the first democratic elections held in South Africa in 1994, not the establishment of the Union of South Africa. The Union of South Africa was established on May 31, 1910, which was formerly commemorated as Republic Day, but is no longer a public holiday."
        },
        {
          id: 3,
          text: "What is the standard notice period for resignation in most South African professional jobs?",
          options: [
            "One week",
            "Two weeks",
            "One month",
            "Three months"
          ],
          correctAnswer: 2,
          explanation: "The standard notice period for most professional positions in South Africa is one month. However, this can vary based on the terms of employment contracts and seniority of positions."
        },
        {
          id: 4,
          text: "Which of these is a South African-specific professional qualification framework?",
          options: [
            "SAQA (South African Qualifications Authority)",
            "SABS (South African Bureau of Standards)",
            "SARS (South African Revenue Service)",
            "SARB (South African Reserve Bank)"
          ],
          correctAnswer: 0,
          explanation: "SAQA (South African Qualifications Authority) is responsible for overseeing the development and implementation of the National Qualifications Framework (NQF), which standardizes qualifications in South Africa."
        },
        {
          id: 5,
          text: "In South African workplace communication, what does 'now-now' typically mean?",
          options: [
            "Immediately",
            "In a short while, but not immediately",
            "Tomorrow morning",
            "At the end of the workday"
          ],
          correctAnswer: 1,
          explanation: "In South African English, 'now-now' typically means 'in a short while' or 'soon, but not immediately.' It's an informal time reference that suggests something will happen relatively soon but not right away."
        }
      ]
    }
  ];

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) {
      toast({
        title: "Please select an answer",
        description: "You need to choose an option before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsAnswerSubmitted(true);

    const currentCategory = quizCategories.find(category => category.id === selectedCategory);
    if (!currentCategory) return;

    const currentQuestion = currentCategory.questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    const currentCategory = quizCategories.find(category => category.id === selectedCategory);
    if (!currentCategory) return;

    if (currentQuestionIndex < currentCategory.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const getCurrentQuestion = (): Question | null => {
    const currentCategory = quizCategories.find(category => category.id === selectedCategory);
    if (!currentCategory) return null;
    return currentCategory.questions[currentQuestionIndex];
  };

  const getScorePercentage = () => {
    const currentCategory = quizCategories.find(category => category.id === selectedCategory);
    if (!currentCategory) return 0;
    return (score / currentCategory.questions.length) * 100;
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return "Excellent! You're well-prepared for the South African job market!";
    if (percentage >= 60) return "Good job! You have a solid understanding but could improve in some areas.";
    if (percentage >= 40) return "Not bad, but you should review some key concepts to strengthen your knowledge.";
    return "You might need more preparation. Consider focusing on these areas before your next interview.";
  };

  return (
    <section id="skills-quiz" className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-secondary mb-3">Test Your Skills</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Practice with our interactive quizzes to prepare for job interviews and assess your knowledge 
            of key skills and concepts relevant to the South African job market.
          </p>
        </div>

        {!selectedCategory ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {quizCategories.map((category) => (
              <Card 
                key={category.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow border-t-4 border-primary"
              >
                <CardHeader className="bg-gradient-to-r from-amber-50 to-white pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {category.icon}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryExpansion(category.id)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedCategories.includes(category.id) ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className={`text-sm text-gray-600 mb-4 ${expandedCategories.includes(category.id) ? '' : 'line-clamp-2'}`}>
                    {category.description}
                  </p>
                  {expandedCategories.includes(category.id) && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-medium">Quiz includes:</p>
                      <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                        <li>{category.questions.length} questions</li>
                        <li>Explanations for all answers</li>
                        <li>South African context focus</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-center pt-3">
                  <Button 
                    onClick={() => handleCategorySelect(category.id)}
                    className="w-full bg-primary hover:bg-amber-500 text-white"
                  >
                    Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-lg border-t-4 border-primary">
              {quizCompleted ? (
                // Quiz Results
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-6"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-primary mb-4">
                      <Award className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-secondary mb-2">Quiz Completed!</h3>
                    <p className="text-gray-600">
                      You scored {score} out of {quizCategories.find(c => c.id === selectedCategory)?.questions.length}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Score</span>
                      <span>{Math.round(getScorePercentage())}%</span>
                    </div>
                    <Progress value={getScorePercentage()} className="h-3" />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-700 font-medium">{getScoreMessage()}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={resetQuiz}
                      className="flex-1 bg-primary hover:bg-amber-500 text-white"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Try Another Quiz
                    </Button>
                  </div>
                </motion.div>
              ) : (
                // Quiz Questions
                <div>
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b">
                    <div className="flex justify-between items-center mb-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetQuiz}
                        className="hover:bg-amber-100"
                      >
                        Back to Categories
                      </Button>
                      <span className="text-sm font-medium">
                        Question {currentQuestionIndex + 1} of {quizCategories.find(c => c.id === selectedCategory)?.questions.length}
                      </span>
                    </div>
                    <div className="mb-2">
                      <Progress 
                        value={(currentQuestionIndex + 1) / (quizCategories.find(c => c.id === selectedCategory)?.questions.length || 1) * 100} 
                        className="h-2"
                      />
                    </div>
                    <CardTitle className="text-lg">
                      {quizCategories.find(c => c.id === selectedCategory)?.name}: Question {currentQuestionIndex + 1}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <h3 className="text-xl font-medium text-gray-900">
                          {getCurrentQuestion()?.text}
                        </h3>
                        
                        <RadioGroup 
                          value={selectedAnswer?.toString() || ""}
                          className="space-y-3"
                        >
                          {getCurrentQuestion()?.options.map((option, index) => (
                            <div 
                              key={index} 
                              className={`relative border rounded-lg p-4 cursor-pointer transition-all
                                ${selectedAnswer === index ? 'border-primary' : 'border-gray-200'} 
                                ${isAnswerSubmitted ? 
                                  index === getCurrentQuestion()?.correctAnswer 
                                    ? 'bg-green-50 border-green-500' 
                                    : selectedAnswer === index && index !== getCurrentQuestion()?.correctAnswer 
                                      ? 'bg-red-50 border-red-500' 
                                      : 'opacity-60'
                                  : 'hover:border-primary hover:bg-amber-50'
                                }
                              `}
                              onClick={() => handleAnswerSelect(index)}
                            >
                              <div className="flex items-start">
                                <RadioGroupItem 
                                  value={index.toString()} 
                                  id={`option-${index}`} 
                                  className="mt-1"
                                  disabled={isAnswerSubmitted}
                                />
                                <Label 
                                  htmlFor={`option-${index}`} 
                                  className="ml-3 cursor-pointer flex-1"
                                >
                                  {option}
                                </Label>
                                {isAnswerSubmitted && (
                                  index === getCurrentQuestion()?.correctAnswer ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
                                  ) : selectedAnswer === index ? (
                                    <XCircle className="h-5 w-5 text-red-500 ml-2 flex-shrink-0" />
                                  ) : null
                                )}
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                        
                        {isAnswerSubmitted && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                          >
                            <h4 className="font-medium mb-1">Explanation:</h4>
                            <p className="text-gray-700 text-sm">
                              {getCurrentQuestion()?.explanation}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                  
                  <CardFooter className="bg-gray-50 border-t p-4">
                    {isAnswerSubmitted ? (
                      <Button 
                        className="w-full bg-primary hover:bg-amber-500 text-white"
                        onClick={handleNextQuestion}
                      >
                        {currentQuestionIndex < (quizCategories.find(c => c.id === selectedCategory)?.questions.length || 1) - 1 
                          ? "Next Question" 
                          : "See Results"
                        }
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-primary hover:bg-amber-500 text-white"
                        onClick={handleAnswerSubmit}
                        disabled={selectedAnswer === null}
                      >
                        Submit Answer
                      </Button>
                    )}
                  </CardFooter>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}