import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  BookOpen,
  Target,
  TrendingUp,
  MessageCircle,
  FileText,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

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
  userId: number;
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

export default function InterviewPracticePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // State management
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  
  // Form state for session creation
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("5");
  const [interviewType, setInterviewType] = useState("general");

  // Fetch user's latest CV for context
  const { data: latestCV } = useQuery({
    queryKey: ["/api/latest-cv"],
    enabled: !!user,
  });

  // Fetch user's interview sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/interview/sessions"],
    enabled: !!user,
  });

  // Create new interview session
  const createSessionMutation = useMutation({
    mutationFn: async (params: any): Promise<InterviewSession> => {
      const response = await fetch("/api/interview/create-session", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          cvContent: (latestCV as any)?.extractedText || "",
        }),
      });
      if (!response.ok) throw new Error('Failed to create session');
      return response.json();
    },
    onSuccess: (session: InterviewSession) => {
      setCurrentSession(session);
      setSessionStarted(true);
      setCurrentQuestionIndex(0);
      setCurrentAnswer("");
      setSessionCompleted(false);
      toast({
        title: "Interview Session Created",
        description: `Generated ${session.questions.length} questions for your practice.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create interview session",
        variant: "destructive",
      });
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ sessionId, questionId, answer }: any): Promise<InterviewEvaluation> => {
      const response = await fetch(`/api/interview/sessions/${sessionId}/answers`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId, answer }),
      });
      if (!response.ok) throw new Error('Failed to submit answer');
      return response.json();
    },
    onSuccess: (evaluation: InterviewEvaluation) => {
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          userAnswers: {
            ...currentSession.userAnswers,
            [currentSession.questions[currentQuestionIndex].id]: currentAnswer,
          },
          evaluations: {
            ...currentSession.evaluations,
            [currentSession.questions[currentQuestionIndex].id]: evaluation,
          },
        };
        setCurrentSession(updatedSession);
      }
      
      // Move to next question or complete session
      if (currentQuestionIndex < (currentSession?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer("");
        resetTimer();
      } else {
        completeSession();
      }
      
      toast({
        title: "Answer Submitted",
        description: `Score: ${evaluation.score}/100`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
        variant: "destructive",
      });
    },
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/interview/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to complete session');
      return response.json();
    },
    onSuccess: (result: any) => {
      if (currentSession) {
        setCurrentSession({
          ...currentSession,
          overallScore: result.score,
          overallFeedback: result.feedback,
          completedAt: new Date().toISOString(),
        });
      }
      setSessionCompleted(true);
      setIsTimerActive(false);
      queryClient.invalidateQueries({ queryKey: ["/api/interview/sessions"] });
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            setIsTimerActive(false);
            // Auto-submit when time runs out
            if (currentAnswer.trim()) {
              handleSubmitAnswer();
            } else {
              handleSkipQuestion();
            }
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, currentAnswer]);

  const startSession = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please provide a job description to generate relevant questions.",
        variant: "destructive",
      });
      return;
    }
    
    createSessionMutation.mutate({
      jobTitle,
      jobDescription,
      difficulty,
      questionCount: parseInt(questionCount),
      type: interviewType,
    });
  };

  const startTimer = () => {
    const currentQuestion = currentSession?.questions[currentQuestionIndex];
    if (currentQuestion?.timeLimit) {
      setTimeLeft(currentQuestion.timeLimit);
      setIsTimerActive(true);
    }
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(null);
  };

  const handleSubmitAnswer = () => {
    if (!currentSession || !currentAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsTimerActive(false);
    submitAnswerMutation.mutate({
      sessionId: currentSession.id,
      questionId: currentSession.questions[currentQuestionIndex].id,
      answer: currentAnswer,
    });
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < (currentSession?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer("");
      resetTimer();
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    if (currentSession) {
      completeSessionMutation.mutate(currentSession.id);
    }
  };

  const startNewSession = () => {
    setCurrentSession(null);
    setSessionStarted(false);
    setSessionCompleted(false);
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Alert>
          <MessageCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in to access the interview practice feature.
            <div className="mt-2">
              <Link href="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Interview Practice | Hire Mzansi</title>
        <meta 
          name="description" 
          content="Practice job interviews with AI-powered questions tailored to your CV and job descriptions. Get instant feedback and improve your interview skills."
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            AI Interview Practice
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Practice with AI-generated interview questions tailored to your CV and target roles. 
            Get instant feedback and improve your interview confidence.
          </p>
        </div>

        {!sessionStarted ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Session Setup */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Setup Interview Practice
                  </CardTitle>
                  <CardDescription>
                    Configure your practice session based on the role you're targeting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Job Title (Optional)
                      </label>
                      <Input
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g., Software Developer"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Interview Type
                      </label>
                      <Select value={interviewType} onValueChange={setInterviewType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Interview</SelectItem>
                          <SelectItem value="behavioral">Behavioral Questions</SelectItem>
                          <SelectItem value="technical">Technical Interview</SelectItem>
                          <SelectItem value="situational">Situational Questions</SelectItem>
                          <SelectItem value="competency">Competency-Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Difficulty Level
                      </label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Number of Questions
                      </label>
                      <Select value={questionCount} onValueChange={setQuestionCount}>
                        <SelectTrigger>
                          <SelectValue />
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

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Job Description *
                    </label>
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here to generate relevant interview questions..."
                      className="min-h-32"
                    />
                  </div>

                  <Button 
                    onClick={startSession} 
                    disabled={createSessionMutation.isPending}
                    className="w-full"
                  >
                    {createSessionMutation.isPending ? (
                      "Generating Questions..."
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Interview Practice
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Previous Sessions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : sessions && Array.isArray(sessions) && sessions.length > 0 ? (
                    <div className="space-y-2">
                      {sessions.slice(0, 5).map((session: InterviewSession) => (
                        <div key={session.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm truncate">
                              {session.jobTitle || "General Interview"}
                            </p>
                            {session.overallScore && (
                              <Badge variant="outline" className={getScoreColor(session.overallScore)}>
                                {session.overallScore}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No previous sessions yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : sessionCompleted ? (
          // Session Results
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Interview Practice Completed
              </CardTitle>
              <CardDescription>
                Here's your performance summary and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentSession?.overallScore && (
                <div className="text-center mb-8">
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(currentSession.overallScore)}`}>
                    {currentSession.overallScore}%
                  </div>
                  <p className="text-muted-foreground">Overall Score</p>
                </div>
              )}

              {currentSession?.overallFeedback && (
                <div className="mb-8 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Overall Feedback</h3>
                  <p className="text-sm">{currentSession.overallFeedback}</p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <h3 className="font-semibold">Question-by-Question Results</h3>
                {currentSession?.questions.map((question, index) => {
                  const evaluation = currentSession.evaluations[question.id];
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <p className="font-medium mt-1">{question.text}</p>
                        </div>
                        {evaluation && (
                          <Badge variant="outline" className={getScoreColor(evaluation.score)}>
                            {evaluation.score}%
                          </Badge>
                        )}
                      </div>
                      
                      {evaluation && (
                        <div className="mt-3 space-y-2">
                          {evaluation.strengths.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-green-700">Strengths:</p>
                              <ul className="text-sm text-green-600 ml-4">
                                {evaluation.strengths.map((strength, i) => (
                                  <li key={i}>• {strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {evaluation.improvementTips.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-orange-700">Improvement Tips:</p>
                              <ul className="text-sm text-orange-600 ml-4">
                                {evaluation.improvementTips.map((tip, i) => (
                                  <li key={i}>• {tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={startNewSession}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start New Session
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    View Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Active Interview Session
          currentSession && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>
                        Question {currentQuestionIndex + 1} of {currentSession.questions.length}
                      </CardTitle>
                      <CardDescription>
                        {currentSession.jobTitle && `${currentSession.jobTitle} Interview`}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      {timeLeft !== null && (
                        <div className={`text-2xl font-bold ${timeLeft <= 30 ? 'text-red-600' : 'text-primary'}`}>
                          {formatTime(timeLeft)}
                        </div>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={((currentQuestionIndex + 1) / currentSession.questions.length) * 100} 
                    className="mt-4"
                  />
                </CardHeader>
                <CardContent>
                  {(() => {
                    const currentQuestion = currentSession.questions[currentQuestionIndex];
                    return (
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                              {currentQuestion.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {currentQuestion.type}
                            </Badge>
                            {currentQuestion.timeLimit && (
                              <Badge variant="outline">
                                <Clock className="mr-1 h-3 w-3" />
                                {Math.floor(currentQuestion.timeLimit / 60)}m
                              </Badge>
                            )}
                          </div>
                          <h2 className="text-xl font-semibold mb-4">
                            {currentQuestion.text}
                          </h2>
                          
                          {currentQuestion.expectedTopics && currentQuestion.expectedTopics.length > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-800 mb-1">
                                Consider covering these topics:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {currentQuestion.expectedTopics.map((topic, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Your Answer
                          </label>
                          <Textarea
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            className="min-h-32"
                          />
                        </div>

                        <div className="flex gap-3">
                          {currentQuestion.timeLimit && !isTimerActive && timeLeft === null && (
                            <Button onClick={startTimer} variant="outline">
                              <Clock className="mr-2 h-4 w-4" />
                              Start Timer
                            </Button>
                          )}
                          
                          <Button 
                            onClick={handleSubmitAnswer}
                            disabled={submitAnswerMutation.isPending || !currentAnswer.trim()}
                          >
                            {submitAnswerMutation.isPending ? (
                              "Evaluating..."
                            ) : currentQuestionIndex === currentSession.questions.length - 1 ? (
                              "Complete Interview"
                            ) : (
                              <>
                                Submit & Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            onClick={handleSkipQuestion}
                            variant="outline"
                          >
                            Skip Question
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )
        )}
      </div>
    </>
  );
}