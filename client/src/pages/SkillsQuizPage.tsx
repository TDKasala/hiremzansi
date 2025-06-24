import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, CardContent, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Code,
  Briefcase,
  Users,
  Calculator,
  Globe,
  Lightbulb
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  questions: QuizQuestion[];
}

const SkillsQuizPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const quizCategories: QuizCategory[] = [
    {
      id: 'technical',
      name: 'Technical Skills',
      description: 'Test your programming, software development, and technical problem-solving abilities with questions relevant to the South African tech industry.',
      icon: <Code className="h-6 w-6 text-blue-600" />,
      questions: [
        {
          id: 1,
          text: 'Which programming language is most commonly used for web development in South African startups?',
          options: ['Java', 'JavaScript', 'Python', 'C#'],
          correctAnswer: 1,
          explanation: 'JavaScript is widely used in South African web development due to its versatility and the growing startup ecosystem.'
        },
        {
          id: 2,
          text: 'What is the most important factor when optimizing database queries for South African e-commerce platforms?',
          options: ['Memory usage', 'Network latency', 'CPU utilization', 'Disk I/O'],
          correctAnswer: 1,
          explanation: 'Network latency is crucial in South Africa due to infrastructure challenges and the need to serve customers across different regions efficiently.'
        },
        {
          id: 3,
          text: 'Which cloud provider is most commonly adopted by South African enterprises?',
          options: ['AWS', 'Microsoft Azure', 'Google Cloud', 'IBM Cloud'],
          correctAnswer: 1,
          explanation: 'Microsoft Azure has strong adoption in South Africa due to existing enterprise relationships and local data center presence.'
        }
      ]
    },
    {
      id: 'business',
      name: 'Business Acumen',
      description: 'Evaluate your understanding of business principles, strategy, and market dynamics within the South African economic context.',
      icon: <Briefcase className="h-6 w-6 text-green-600" />,
      questions: [
        {
          id: 1,
          text: 'What is the primary benefit of B-BBEE compliance for South African businesses?',
          options: ['Tax reduction', 'Government contracts access', 'Employee satisfaction', 'International recognition'],
          correctAnswer: 1,
          explanation: 'B-BBEE compliance is essential for accessing government contracts and tenders in South Africa, making it a crucial business consideration.'
        },
        {
          id: 2,
          text: 'Which sector contributes most to South Africa\'s GDP?',
          options: ['Mining', 'Manufacturing', 'Services', 'Agriculture'],
          correctAnswer: 2,
          explanation: 'The services sector is the largest contributor to South Africa\'s GDP, including finance, telecommunications, and business services.'
        },
        {
          id: 3,
          text: 'What is the most effective way to enter the South African market for international companies?',
          options: ['Direct investment', 'Joint ventures with local partners', 'Franchising', 'Online sales only'],
          correctAnswer: 1,
          explanation: 'Joint ventures with local partners provide crucial market knowledge, regulatory compliance support, and established networks.'
        }
      ]
    },
    {
      id: 'communication',
      name: 'Communication Skills',
      description: 'Test your verbal, written, and interpersonal communication abilities in professional South African workplace contexts.',
      icon: <Users className="h-6 w-6 text-purple-600" />,
      questions: [
        {
          id: 1,
          text: 'In a multicultural South African workplace, what is the most important communication principle?',
          options: ['Speaking louder', 'Using simple English only', 'Cultural sensitivity and inclusivity', 'Avoiding local languages'],
          correctAnswer: 2,
          explanation: 'Cultural sensitivity and inclusivity are crucial in South Africa\'s diverse workplace environment with 11 official languages and varied cultural backgrounds.'
        },
        {
          id: 2,
          text: 'When presenting to senior management in a South African corporation, what approach is most effective?',
          options: ['Very detailed technical explanations', 'High-level summary with supporting data', 'Informal conversational style', 'Pure visual presentations'],
          correctAnswer: 1,
          explanation: 'South African business culture appreciates concise, well-structured presentations with clear data to support key points.'
        },
        {
          id: 3,
          text: 'How should feedback be delivered in South African professional settings?',
          options: ['Direct and blunt', 'Constructive and respectful', 'Written only', 'Through intermediaries'],
          correctAnswer: 1,
          explanation: 'Constructive and respectful feedback aligns with South African workplace values of ubuntu (humanity) while maintaining professionalism.'
        }
      ]
    },
    {
      id: 'analytical',
      name: 'Analytical Thinking',
      description: 'Assess your problem-solving, data analysis, and logical reasoning skills relevant to South African business challenges.',
      icon: <Calculator className="h-6 w-6 text-orange-600" />,
      questions: [
        {
          id: 1,
          text: 'A South African company sees 20% growth in Cape Town but 10% decline in Johannesburg. What should be the first analytical step?',
          options: ['Focus marketing on Cape Town', 'Close Johannesburg operations', 'Analyze regional differences and causes', 'Hire more staff in Cape Town'],
          correctAnswer: 2,
          explanation: 'Proper analysis requires understanding the root causes of regional performance differences before making strategic decisions.'
        },
        {
          id: 2,
          text: 'When analyzing market data for a South African retail chain, which metric is most important for expansion decisions?',
          options: ['Total revenue', 'Customer acquisition cost vs lifetime value', 'Number of transactions', 'Average transaction size'],
          correctAnswer: 1,
          explanation: 'Customer acquisition cost vs lifetime value provides the most comprehensive view of sustainable growth potential in new markets.'
        },
        {
          id: 3,
          text: 'A manufacturing company in South Africa needs to optimize supply chain costs. What analytical approach is most effective?',
          options: ['Focus only on lowest-cost suppliers', 'Analyze total cost of ownership including risks', 'Choose local suppliers only', 'Automate everything'],
          correctAnswer: 1,
          explanation: 'Total cost of ownership analysis includes quality, reliability, and risk factors, crucial for South African supply chain management.'
        }
      ]
    },
    {
      id: 'digital',
      name: 'Digital Literacy',
      description: 'Evaluate your understanding of digital tools, online platforms, and technology trends relevant to the South African market.',
      icon: <Globe className="h-6 w-6 text-indigo-600" />,
      questions: [
        {
          id: 1,
          text: 'Which digital payment method is most widely adopted in South Africa?',
          options: ['Credit cards', 'Mobile money (like MTN MoMo)', 'Bank transfers', 'Cash on delivery'],
          correctAnswer: 1,
          explanation: 'Mobile money solutions have gained significant traction in South Africa, especially for reaching unbanked populations.'
        },
        {
          id: 2,
          text: 'What is the most effective digital marketing channel for reaching South African consumers?',
          options: ['Facebook ads', 'Google search ads', 'WhatsApp Business', 'Email marketing'],
          correctAnswer: 2,
          explanation: 'WhatsApp Business is extremely popular in South Africa for customer communication and marketing due to high mobile penetration.'
        },
        {
          id: 3,
          text: 'When implementing digital transformation in a South African company, what should be the priority?',
          options: ['Latest technology adoption', 'Employee digital skills training', 'Complete system replacement', 'Outsourcing to global vendors'],
          correctAnswer: 1,
          explanation: 'Employee digital skills training ensures successful adoption and maximizes ROI on digital transformation investments.'
        }
      ]
    },
    {
      id: 'leadership',
      name: 'Leadership & Management',
      description: 'Test your leadership abilities, team management skills, and understanding of South African workplace dynamics.',
      icon: <Lightbulb className="h-6 w-6 text-yellow-600" />,
      questions: [
        {
          id: 1,
          text: 'What leadership style is most effective in diverse South African teams?',
          options: ['Authoritative top-down', 'Collaborative and inclusive', 'Hands-off delegation', 'Micromanagement'],
          correctAnswer: 1,
          explanation: 'Collaborative and inclusive leadership respects South Africa\'s diverse workforce and leverages different perspectives for better outcomes.'
        },
        {
          id: 2,
          text: 'How should a manager handle conflict between team members from different cultural backgrounds?',
          options: ['Ignore and let them resolve it', 'Impose a standard solution', 'Facilitate open dialogue with cultural awareness', 'Separate the team members'],
          correctAnswer: 2,
          explanation: 'Facilitating open dialogue while being culturally aware helps resolve conflicts constructively and builds stronger team relationships.'
        },
        {
          id: 3,
          text: 'What is the most important factor for employee retention in South African companies?',
          options: ['Highest salary possible', 'Career development opportunities', 'Flexible working conditions', 'Company car'],
          correctAnswer: 1,
          explanation: 'Career development opportunities are highly valued by South African professionals seeking growth and skills advancement.'
        }
      ]
    }
  ];

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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
    if (selectedAnswer !== null) {
      setIsAnswerSubmitted(true);
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion && selectedAnswer === currentQuestion.correctAnswer) {
        setScore(prev => prev + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    const category = quizCategories.find(c => c.id === selectedCategory);
    if (!category) return;

    if (currentQuestionIndex < category.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const getCurrentQuestion = () => {
    const category = quizCategories.find(c => c.id === selectedCategory);
    return category?.questions[currentQuestionIndex];
  };

  const getScorePercentage = () => {
    const category = quizCategories.find(c => c.id === selectedCategory);
    if (!category) return 0;
    return (score / category.questions.length) * 100;
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) {
      return "Excellent! You have strong knowledge in this area and are well-prepared for interviews.";
    } else if (percentage >= 60) {
      return "Good job! You have solid understanding with some room for improvement.";
    } else if (percentage >= 40) {
      return "Fair performance. Consider reviewing the topics and practicing more.";
    }
    return "You might need more preparation. Consider focusing on these areas before your next interview.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-secondary mb-4">Skills Assessment Quiz</h1>
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
    </div>
  );
};

export default SkillsQuizPage;