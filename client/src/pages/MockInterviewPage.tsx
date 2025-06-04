import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '../context/AuthContext';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Star,
  Clock,
  Brain,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  Crown,
  Sparkles
} from 'lucide-react';

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tips: string[];
}

interface InterviewSession {
  id: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  responses: { questionId: string; answer: string; score?: number; feedback?: string }[];
  overallScore?: number;
  completedAt?: Date;
}

export default function MockInterviewPage() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Marketing', 'Engineering',
    'Sales', 'Human Resources', 'Operations', 'Legal', 'Education'
  ];

  const roles = [
    'Entry Level', 'Mid Level', 'Senior Level', 'Management', 'Executive'
  ];

  const sampleQuestions: InterviewQuestion[] = [
    {
      id: '1',
      question: 'Tell me about yourself and your professional background.',
      category: 'General',
      difficulty: 'beginner',
      tips: ['Keep it professional and relevant', 'Focus on career highlights', 'Connect to the role you\'re applying for']
    },
    {
      id: '2',
      question: 'What interests you about this industry in South Africa?',
      category: 'Industry Knowledge',
      difficulty: 'intermediate',
      tips: ['Show knowledge of local market', 'Mention specific trends or challenges', 'Connect to your career goals']
    },
    {
      id: '3',
      question: 'Describe a challenging project you worked on and how you overcame obstacles.',
      category: 'Behavioral',
      difficulty: 'intermediate',
      tips: ['Use the STAR method', 'Be specific about your role', 'Highlight problem-solving skills']
    },
    {
      id: '4',
      question: 'How do you handle workplace diversity and inclusion, particularly in the South African context?',
      category: 'Cultural Fit',
      difficulty: 'advanced',
      tips: ['Show understanding of SA workplace dynamics', 'Mention B-BBEE awareness', 'Demonstrate inclusive mindset']
    },
    {
      id: '5',
      question: 'Where do you see yourself in 5 years within the South African job market?',
      category: 'Career Goals',
      difficulty: 'beginner',
      tips: ['Show ambition but be realistic', 'Align with company growth', 'Mention local market understanding']
    }
  ];

  const startInterview = () => {
    if (!selectedRole || !selectedIndustry) return;
    
    const newSession: InterviewSession = {
      id: Date.now().toString(),
      questions: sampleQuestions,
      currentQuestionIndex: 0,
      responses: []
    };
    
    setSession(newSession);
    setSessionComplete(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        console.log('Audio recorded:', audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const submitAnswer = async () => {
    if (!session || !currentAnswer.trim()) return;

    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100

    const newResponse = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      score,
      feedback: generateFeedback(currentAnswer, score)
    };

    const updatedSession = {
      ...session,
      responses: [...session.responses, newResponse]
    };

    if (session.currentQuestionIndex < session.questions.length - 1) {
      updatedSession.currentQuestionIndex += 1;
    } else {
      // Interview complete
      const overallScore = Math.round(
        updatedSession.responses.reduce((sum, r) => sum + (r.score || 0), 0) / updatedSession.responses.length
      );
      updatedSession.overallScore = overallScore;
      updatedSession.completedAt = new Date();
      setSessionComplete(true);
    }

    setSession(updatedSession);
    setCurrentAnswer('');
    setIsAnalyzing(false);
  };

  const generateFeedback = (answer: string, score: number): string => {
    if (score >= 90) return 'Excellent response! Your answer was comprehensive and well-structured.';
    if (score >= 80) return 'Good answer with solid content. Consider adding more specific examples.';
    if (score >= 70) return 'Decent response. Try to be more specific and provide concrete examples.';
    return 'Your answer needs improvement. Focus on structure and relevant details.';
  };

  const resetInterview = () => {
    setSession(null);
    setCurrentAnswer('');
    setSessionComplete(false);
    setSelectedRole('');
    setSelectedIndustry('');
  };

  const currentQuestion = session?.questions[session.currentQuestionIndex];
  const progress = session ? ((session.currentQuestionIndex + (currentAnswer ? 1 : 0)) / session.questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <Crown className="w-4 h-4 mr-2" />
            Premium Feature
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-4">
            AI-Powered Mock Interview
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Practice interviews with AI feedback tailored for the South African job market
          </p>
        </motion.div>

        {!session && !sessionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Brain className="w-6 h-6 mr-2 text-purple-600" />
                  Set Up Your Interview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Industry</label>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Experience Level</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">What You'll Get:</h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" />5 tailored interview questions</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" />AI-powered response analysis</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" />Personalized feedback and scoring</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" />South African market context</li>
                  </ul>
                </div>

                <Button
                  onClick={startInterview}
                  disabled={!selectedRole || !selectedIndustry}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Mock Interview
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {session && !sessionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Question {session.currentQuestionIndex + 1} of {session.questions.length}
                  </CardTitle>
                  <Badge variant="outline" className="border-purple-200 text-purple-700">
                    {currentQuestion?.category}
                  </Badge>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {currentQuestion?.question}
                  </h3>
                  
                  {currentQuestion?.tips && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">Tips for a great answer:</h4>
                      <ul className="space-y-1 text-sm text-yellow-800">
                        {currentQuestion.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <Sparkles className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "outline"}
                      className="flex-shrink-0"
                    >
                      {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    
                    {isRecording && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="flex items-center text-red-600"
                      >
                        <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                        Recording...
                      </motion.div>
                    )}
                  </div>

                  <Textarea
                    placeholder="Type your answer here or use voice recording above..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    rows={6}
                    className="resize-none border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                  />

                  <div className="flex gap-4">
                    <Button
                      onClick={submitAnswer}
                      disabled={!currentAnswer.trim() || isAnalyzing}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {isAnalyzing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={resetInterview}
                      variant="outline"
                      className="border-2 border-gray-300 hover:border-gray-400"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {session.responses.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-green-600" />
                    Previous Responses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.responses.map((response, index) => (
                      <div key={response.questionId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Question {index + 1}</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="font-bold">{response.score}/100</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{response.feedback}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {sessionComplete && session?.overallScore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardContent className="p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center"
                >
                  <Award className="w-12 h-12" />
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-4">Interview Complete!</h2>
                <div className="text-5xl font-bold mb-2">{session.overallScore}/100</div>
                <p className="text-green-100 mb-6">
                  {session.overallScore >= 90 ? 'Outstanding performance!' :
                   session.overallScore >= 80 ? 'Great job!' :
                   session.overallScore >= 70 ? 'Good effort!' : 'Keep practicing!'}
                </p>
                
                <Button
                  onClick={resetInterview}
                  className="bg-white text-green-600 hover:bg-gray-100"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start New Interview
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}