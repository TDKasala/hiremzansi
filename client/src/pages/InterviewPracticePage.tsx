import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, Lightbulb, CheckCircle, XCircle, Play, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tips: string[];
  sampleAnswer?: string;
}

interface InterviewSession {
  jobTitle: string;
  difficulty: string;
  questionCount: number;
  questions: InterviewQuestion[];
  currentIndex: number;
  startTime: Date;
  userAnswers: string[];
  feedback: string[];
}

const InterviewPracticePage: React.FC = () => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Sample questions database
  const questionDatabase: InterviewQuestion[] = [
    {
      id: '1',
      question: 'Tell me about yourself and your background.',
      type: 'behavioral',
      category: 'Introduction',
      difficulty: 'easy',
      tips: [
        'Keep it concise - 2-3 minutes maximum',
        'Focus on relevant professional experience',
        'End with why you\'re interested in this role',
        'Practice this as it\'s usually the first question'
      ],
      sampleAnswer: 'I\'m a software developer with 3 years of experience building web applications...'
    },
    {
      id: '2',
      question: 'Describe a challenging project you worked on and how you overcame obstacles.',
      type: 'behavioral',
      category: 'Problem Solving',
      difficulty: 'medium',
      tips: [
        'Use the STAR method (Situation, Task, Action, Result)',
        'Choose a relevant example that shows your skills',
        'Focus on your specific contributions',
        'Quantify the results when possible'
      ]
    },
    {
      id: '3',
      question: 'How do you handle working under pressure and tight deadlines?',
      type: 'behavioral',
      category: 'Work Style',
      difficulty: 'medium',
      tips: [
        'Provide specific examples',
        'Show your organizational skills',
        'Mention stress management techniques',
        'Demonstrate adaptability'
      ]
    },
    {
      id: '4',
      question: 'What are your greatest strengths and how do they apply to this role?',
      type: 'behavioral',
      category: 'Self Assessment',
      difficulty: 'easy',
      tips: [
        'Choose strengths relevant to the job',
        'Provide concrete examples',
        'Show how they benefit the employer',
        'Be genuine and confident'
      ]
    },
    {
      id: '5',
      question: 'Describe a time when you had to work with a difficult team member.',
      type: 'situational',
      category: 'Teamwork',
      difficulty: 'hard',
      tips: [
        'Focus on professional handling',
        'Show communication skills',
        'Demonstrate conflict resolution',
        'Emphasize positive outcomes'
      ]
    }
  ];

  const startNewSession = (jobTitle: string, difficulty: string, questionCount: number) => {
    const filteredQuestions = questionDatabase
      .filter(q => difficulty === 'all' || q.difficulty === difficulty)
      .slice(0, questionCount);
    
    setSession({
      jobTitle,
      difficulty,
      questionCount,
      questions: filteredQuestions,
      currentIndex: 0,
      startTime: new Date(),
      userAnswers: [],
      feedback: []
    });
    setCurrentAnswer('');
    setIsAnswerSubmitted(false);
    setShowTips(false);
    setSessionComplete(false);
  };

  const submitAnswer = () => {
    if (!session || !currentAnswer.trim()) return;

    const updatedAnswers = [...session.userAnswers, currentAnswer];
    const feedback = generateFeedback(currentAnswer, session.questions[session.currentIndex]);
    const updatedFeedback = [...session.feedback, feedback];

    setSession({
      ...session,
      userAnswers: updatedAnswers,
      feedback: updatedFeedback
    });

    setIsAnswerSubmitted(true);
  };

  const nextQuestion = () => {
    if (!session) return;

    if (session.currentIndex + 1 >= session.questions.length) {
      setSessionComplete(true);
    } else {
      setSession({
        ...session,
        currentIndex: session.currentIndex + 1
      });
      setCurrentAnswer('');
      setIsAnswerSubmitted(false);
      setShowTips(false);
    }
  };

  const generateFeedback = (answer: string, question: InterviewQuestion): string => {
    const wordCount = answer.split(' ').length;
    let feedback = '';

    if (wordCount < 20) {
      feedback = 'Your answer could be more detailed. Try to provide specific examples and expand on your thoughts.';
    } else if (wordCount > 200) {
      feedback = 'Great detail! Consider being more concise while maintaining the key points.';
    } else {
      feedback = 'Good length for your answer. Make sure to include specific examples that demonstrate your skills.';
    }

    return feedback;
  };

  const resetSession = () => {
    setSession(null);
    setCurrentAnswer('');
    setIsAnswerSubmitted(false);
    setShowTips(false);
    setSessionComplete(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Interview Practice
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practice common interview questions and improve your responses with personalized feedback
            </p>
          </motion.div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                Start Practice Session
              </CardTitle>
              <CardDescription>
                Configure your interview practice session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="jobTitle">Job Title/Role</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Software Developer, Marketing Manager"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Difficulty Level</Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy - Entry Level</SelectItem>
                    <SelectItem value="medium">Medium - Mid Level</SelectItem>
                    <SelectItem value="hard">Hard - Senior Level</SelectItem>
                    <SelectItem value="all">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Number of Questions</Label>
                <Select defaultValue="5">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions (Quick Practice)</SelectItem>
                    <SelectItem value="5">5 Questions (Standard)</SelectItem>
                    <SelectItem value="8">8 Questions (Comprehensive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => startNewSession('Software Developer', 'medium', 5)}
              >
                Start Practice Session
              </Button>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Behavioral Questions</h3>
                <p className="text-sm text-gray-600">
                  Practice telling your story with STAR method
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Expert Tips</h3>
                <p className="text-sm text-gray-600">
                  Get personalized feedback on your responses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Timed Practice</h3>
                <p className="text-sm text-gray-600">
                  Improve your response timing and confidence
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                Session Complete!
              </CardTitle>
              <CardDescription>
                Great job completing your interview practice session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {session.questions.length}
                  </div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((new Date().getTime() - session.startTime.getTime()) / 60000)}
                  </div>
                  <div className="text-sm text-gray-600">Minutes Practiced</div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Key Takeaways</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Practice using the STAR method for behavioral questions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Keep answers concise but detailed with examples
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Research the company and role before your interview
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={resetSession} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Session
                </Button>
                <Button className="flex-1">
                  Continue to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Interview Practice - {session.jobTitle}
            </h1>
            <Badge variant="outline">
              Question {session.currentIndex + 1} of {session.questions.length}
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((session.currentIndex + 1) / session.questions.length) * 100}%`
              }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {currentQuestion.type}
                    </Badge>
                    <CardTitle className="text-lg">
                      {currentQuestion.question}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={
                      currentQuestion.difficulty === 'easy'
                        ? 'default'
                        : currentQuestion.difficulty === 'medium'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="answer">Your Answer</Label>
                  <Textarea
                    id="answer"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="mt-2 min-h-[150px]"
                    disabled={isAnswerSubmitted}
                  />
                </div>

                {isAnswerSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-50 rounded-lg border"
                  >
                    <h4 className="font-semibold text-blue-900 mb-2">Feedback</h4>
                    <p className="text-blue-800 text-sm">
                      {session.feedback[session.currentIndex]}
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  {!isAnswerSubmitted ? (
                    <Button 
                      onClick={submitAnswer}
                      disabled={!currentAnswer.trim()}
                      className="flex-1"
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion} className="flex-1">
                      {session.currentIndex + 1 >= session.questions.length
                        ? 'Complete Session'
                        : 'Next Question'
                      }
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowTips(!showTips)}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Tips
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Tips for This Question
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentQuestion.tips.map((tip, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session.questions.map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index < session.currentIndex
                            ? 'bg-green-500 text-white'
                            : index === session.currentIndex
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index < session.currentIndex ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className="text-sm">
                        Question {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPracticePage;