import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useRoute, useLocation } from "wouter";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Loader2,
  ArrowLeft,
  Book,
  Timer,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types for interview data
interface InterviewQuestion {
  id: string;
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedTopics?: string[];
  timeLimit?: number;
  followUpQuestions?: string[];
}

interface InterviewEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  missingTopics?: string[];
  keyPoints?: {
    addressed: string[];
    missed: string[];
  };
  overallFeedback: string;
}

interface InterviewSession {
  id: string;
  jobTitle?: string;
  jobDescription?: string;
  questions: InterviewQuestion[];
  userAnswers: Record<string, string>;
  evaluations: Record<string, InterviewEvaluation>;
  overallScore?: number;
  overallFeedback?: string;
  createdAt: string;
  completedAt?: string;
}

export default function InterviewSimulator() {
  const { toast } = useToast();
  const [match, params] = useRoute("/interview/practice");
  const [_, setLocation] = useLocation();
  
  // Local states
  const [jobDescription, setJobDescription] = useState("");
  const [cvContent, setCvContent] = useState("");
  const [interviewType, setInterviewType] = useState("general");
  const [difficultyLevel, setDifficultyLevel] = useState("mixed");
  const [questionCount, setQuestionCount] = useState("5");
  
  // Session management
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  
  // Timer state
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // Get job details if jobId is in query params
  const jobId = new URLSearchParams(window.location.search).get('jobId');
  
  const jobQuery = useQuery({
    queryKey: ['/api/job-details', jobId],
    queryFn: () => 
      fetch(`/api/job-details/${jobId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch job details');
          return res.json();
        }),
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
  
  useEffect(() => {
    // When job is loaded, update job description
    if (jobQuery.data) {
      const job = jobQuery.data;
      const description = `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Industry: ${job.industry}
Job Type: ${job.jobType}
Experience Level: ${job.experienceLevel}
Description: ${job.description}
Requirements: ${job.requirements.join(', ')}
Skills: ${job.skills.join(', ')}
      `;
      setJobDescription(description);
    }
  }, [jobQuery.data]);
  
  // Get CV content
  const cvQuery = useQuery({
    queryKey: ['/api/latest-cv'],
    queryFn: () => 
      fetch(`/api/latest-cv`)
        .then(res => {
          if (!res.ok) {
            if (res.status === 404) {
              return { error: "No CV found" };
            }
            throw new Error('Failed to fetch CV');
          }
          return res.json();
        }),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  useEffect(() => {
    if (cvQuery.data && !cvQuery.data.error) {
      setCvContent(cvQuery.data.content);
    }
  }, [cvQuery.data]);
  
  // Create interview session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: {
      jobDescription: string;
      cvContent: string;
      jobTitle?: string;
      type?: string;
      questionCount?: number;
      difficulty?: string;
    }) => {
      const response = await apiRequest("POST", "/api/interview/create-session", data);
      return response.json();
    },
    onSuccess: (data: InterviewSession) => {
      setSession(data);
      setCurrentQuestionIndex(0);
      setCurrentAnswer("");
      setIsAnswering(true);
      queryClient.invalidateQueries({ queryKey: ['/api/interview'] });
      
      toast({
        title: "Interview Session Created",
        description: `Created a ${data.questions.length} question interview. Let's begin!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create interview session: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Answer question mutation
  const answerQuestionMutation = useMutation({
    mutationFn: async (data: {
      session: InterviewSession;
      questionId: string;
      answer: string;
    }) => {
      const response = await apiRequest("POST", "/api/interview/answer-question", data);
      return response.json();
    },
    onSuccess: (data: InterviewSession) => {
      setSession(data);
      // Move to next question or finish
      if (currentQuestionIndex < data.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer("");
      } else {
        // Complete the session if this was the last question
        completeSessionMutation.mutate({ session: data });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/interview'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit answer: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async (data: { session: InterviewSession }) => {
      const response = await apiRequest("POST", "/api/interview/complete-session", data);
      return response.json();
    },
    onSuccess: (data: InterviewSession) => {
      setSession(data);
      setIsAnswering(false);
      setIsReviewing(true);
      queryClient.invalidateQueries({ queryKey: ['/api/interview'] });
      
      toast({
        title: "Interview Completed",
        description: "Your interview session has been evaluated. Review your feedback.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to complete interview: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Handle session creation
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description: "Please enter a job description to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!cvContent.trim()) {
      toast({
        title: "Missing CV Content",
        description: "Please upload your CV to continue.",
        variant: "destructive"
      });
      return;
    }
    
    // Create new session
    createSessionMutation.mutate({
      jobDescription,
      cvContent,
      jobTitle: jobQuery.data?.title,
      type: interviewType,
      questionCount: parseInt(questionCount),
      difficulty: difficultyLevel
    });
  };
  
  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!session) return;
    
    if (!currentAnswer.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    // Stop timer if running
    if (timerRunning) {
      setTimerRunning(false);
    }
    
    // Get current question
    const question = session.questions[currentQuestionIndex];
    
    // Submit the answer
    answerQuestionMutation.mutate({
      session,
      questionId: question.id,
      answer: currentAnswer
    });
  };
  
  // Handle timer
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (timerRunning && timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timer === 0) {
      setTimerRunning(false);
      toast({
        title: "Time's Up!",
        description: "Your time for this question has ended. Please submit your answer."
      });
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, timerRunning, toast]);
  
  // Start timer for current question
  const startTimer = () => {
    if (!session) return;
    
    const question = session.questions[currentQuestionIndex];
    const timeLimit = question.timeLimit || 120; // Default 2 min
    
    setTimer(timeLimit);
    setTimerRunning(true);
  };
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get the current progress percentage
  const getProgressPercentage = () => {
    if (!session) return 0;
    
    const answeredCount = Object.keys(session.userAnswers).length;
    return (answeredCount / session.questions.length) * 100;
  };
  
  // Get badge color for evaluation score
  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-blue-100 text-blue-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  
  const currentQuestion = session?.questions[currentQuestionIndex];
  const currentEvaluation = currentQuestion && session?.evaluations[currentQuestion.id];
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-center">AI Interview Simulator</h1>
      
      {/* Setup Phase */}
      {!session && !isAnswering && !isReviewing && (
        <Card>
          <CardHeader>
            <CardTitle>Prepare for Your Interview</CardTitle>
            <CardDescription>
              Our AI will generate realistic interview questions based on your CV and the job description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSession} className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Job Description</h3>
                {jobQuery.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading job details...</span>
                  </div>
                ) : jobQuery.data ? (
                  <div className="p-4 bg-muted rounded-md">
                    <p className="font-medium">{jobQuery.data.title} at {jobQuery.data.company}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {jobQuery.data.description.substring(0, 150)}...
                    </p>
                  </div>
                ) : (
                  <Textarea 
                    placeholder="Enter the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[150px]"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Your CV</h3>
                {cvQuery.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading your CV...</span>
                  </div>
                ) : cvQuery.data && !cvQuery.data.error ? (
                  <div className="p-4 bg-muted rounded-md">
                    <p className="font-medium">CV Loaded Successfully</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {cvContent.substring(0, 150)}...
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                      <p className="text-yellow-700 font-medium">No CV Found</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Please upload your CV first to use the interview simulator.
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/upload">
                        Upload Your CV
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="interviewType" className="font-medium">Interview Type</label>
                  <Select value={interviewType} onValueChange={setInterviewType}>
                    <SelectTrigger id="interviewType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="behavioral">Behavioral (STAR)</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="situational">Situational</SelectItem>
                      <SelectItem value="cultural">Cultural Fit</SelectItem>
                      <SelectItem value="competency">Competency-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="difficultyLevel" className="font-medium">Difficulty Level</label>
                  <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                    <SelectTrigger id="difficultyLevel">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="mixed">Mixed Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="questionCount" className="font-medium">Number of Questions</label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger id="questionCount">
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="7">7 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleCreateSession} 
              className="w-full sm:w-auto"
              disabled={createSessionMutation.isPending || !cvContent}
            >
              {createSessionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Interview...
                </>
              ) : (
                <>
                  Start Interview Practice
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Answering Phase */}
      {session && isAnswering && currentQuestion && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Question {currentQuestionIndex + 1} of {session.questions.length}</CardTitle>
                {timer !== null && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                    timer < 30 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    <Timer className="h-4 w-4" />
                    <span className="font-mono">{formatTimeRemaining(timer)}</span>
                  </div>
                )}
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">{currentQuestion.text}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{currentQuestion.type}</Badge>
                  <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                </div>
              </div>
              
              {currentQuestion.expectedTopics && currentQuestion.expectedTopics.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                    <Book className="h-4 w-4 mr-2" />
                    <span>Suggested topics to cover:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {currentQuestion.expectedTopics.map((topic, i) => (
                      <li key={i} className="text-sm">{topic}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="answer" className="font-medium">Your Answer:</label>
                  {!timerRunning && timer === null && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={startTimer}
                    >
                      <Timer className="mr-2 h-4 w-4" />
                      Start Timer
                    </Button>
                  )}
                </div>
                <Textarea 
                  id="answer"
                  value={currentAnswer} 
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your interview answer here..."
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleSubmitAnswer} 
                className="w-full sm:w-auto"
                disabled={answerQuestionMutation.isPending || !currentAnswer.trim()}
              >
                {answerQuestionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Review Phase */}
      {session && isReviewing && (
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle>Interview Performance Summary</CardTitle>
              <CardDescription>
                {session.jobTitle ? `Interview for: ${session.jobTitle}` : "Practice Interview"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center text-center p-6">
                <div className="relative h-40 w-40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">
                      {session.overallScore}
                    </span>
                  </div>
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#e2e8f0" 
                      strokeWidth="10" 
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={session.overallScore && session.overallScore >= 75 ? "#4ade80" : 
                             (session.overallScore && session.overallScore >= 50 ? "#60a5fa" : "#f87171")}
                      strokeWidth="10"
                      strokeDasharray={`${(session.overallScore || 0) * 2.83} 283`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mt-4">Overall Score</h3>
              </div>
              
              {session.overallFeedback && (
                <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-medium mb-2">Expert Feedback</h3>
                  <div className="prose prose-sm max-w-none">
                    {session.overallFeedback.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Question by Question Analysis</h3>
                <Accordion type="single" collapsible className="w-full">
                  {session.questions.map((question, index) => {
                    const evaluation = session.evaluations[question.id];
                    return (
                      <AccordionItem key={index} value={`question-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center space-x-3">
                            <div className={`rounded-full px-3 py-1 text-sm font-medium ${
                              evaluation ? getScoreBadgeColor(evaluation.score) : "bg-gray-100"
                            }`}>
                              {evaluation ? `${evaluation.score}/100` : "Unanswered"}
                            </div>
                            <span>{question.text.substring(0, 50)}...</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-2">
                            <div className="bg-muted/30 p-4 rounded-md">
                              <h4 className="font-medium mb-1">Question:</h4>
                              <p>{question.text}</p>
                            </div>
                            
                            {session.userAnswers[question.id] && (
                              <div className="p-4 rounded-md border">
                                <h4 className="font-medium mb-1">Your Answer:</h4>
                                <p className="text-sm">{session.userAnswers[question.id]}</p>
                              </div>
                            )}
                            
                            {evaluation && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-green-50 p-4 rounded-md">
                                    <h4 className="font-medium flex items-center text-green-800">
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Strengths
                                    </h4>
                                    <ul className="mt-2 space-y-1">
                                      {evaluation.strengths.map((strength, i) => (
                                        <li key={i} className="text-sm text-green-700">• {strength}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div className="bg-red-50 p-4 rounded-md">
                                    <h4 className="font-medium flex items-center text-red-800">
                                      <Lightbulb className="h-4 w-4 mr-2" />
                                      Areas to Improve
                                    </h4>
                                    <ul className="mt-2 space-y-1">
                                      {evaluation.weaknesses.map((weakness, i) => (
                                        <li key={i} className="text-sm text-red-700">• {weakness}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                
                                {evaluation.improvementTips.length > 0 && (
                                  <div className="bg-blue-50 p-4 rounded-md">
                                    <h4 className="font-medium flex items-center text-blue-800">
                                      <Lightbulb className="h-4 w-4 mr-2" />
                                      Tips for Improvement
                                    </h4>
                                    <ul className="mt-2 space-y-1">
                                      {evaluation.improvementTips.map((tip, i) => (
                                        <li key={i} className="text-sm text-blue-700">• {tip}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {evaluation.overallFeedback && (
                                  <div className="p-4 rounded-md border border-primary/20">
                                    <h4 className="font-medium mb-1">Feedback Summary:</h4>
                                    <p className="text-sm">{evaluation.overallFeedback}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row gap-3">
              <Button onClick={() => {
                setSession(null);
                setIsReviewing(false);
                setCurrentQuestionIndex(0);
                setCurrentAnswer("");
              }} variant="outline">
                Start New Interview
              </Button>
              <Button asChild>
                <Link href="/dashboard">
                  Back to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}