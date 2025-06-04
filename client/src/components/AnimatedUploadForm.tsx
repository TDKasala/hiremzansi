import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Target, 
  CheckCircle,
  AlertCircle,
  Brain,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AnimatedUploadFormProps {
  onAnalyze: (file: File, jobDescription?: string) => Promise<void>;
  isAnalyzing?: boolean;
}

export function AnimatedUploadForm({ onAnalyze, isAnalyzing = false }: AnimatedUploadFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [step, setStep] = useState<'upload' | 'description' | 'ready'>('upload');
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setUploadedFile(acceptedFiles[0]);
      setStep('description');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleAnalyze = async () => {
    if (uploadedFile) {
      setStep('ready');
      await onAnalyze(uploadedFile, jobDescription);
    }
  };

  const resetForm = () => {
    setUploadedFile(null);
    setJobDescription('');
    setStep('upload');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center space-x-4 mb-8"
      >
        {['upload', 'description', 'ready'].map((s, index) => (
          <div key={s} className="flex items-center">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                ${step === s || (index < ['upload', 'description', 'ready'].indexOf(step)) 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'bg-gray-200 text-gray-500'}`}
              animate={{ scale: step === s ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {index + 1}
            </motion.div>
            {index < 2 && (
              <div className={`w-12 h-1 mx-2 ${
                index < ['upload', 'description', 'ready'].indexOf(step) 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                  : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: File Upload */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4"
                  >
                    <Upload className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your CV</h2>
                  <p className="text-gray-600">Upload your CV to get started with AI-powered analysis</p>
                </div>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                    ${isDragActive 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-25'}`}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    animate={{ y: isDragActive ? -10 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FileText className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {isDragActive ? 'Drop your CV here' : 'Drop your CV here or click to browse'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Supports PDF, DOC, and DOCX files up to 10MB
                    </p>
                    <Badge variant="outline" className="border-purple-200 text-purple-700">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Free Analysis
                    </Badge>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Job Description */}
        {step === 'description' && (
          <motion.div
            key="description"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full p-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Target Your Analysis</h2>
                  <p className="text-gray-600">Add a job description for targeted CV optimization (optional)</p>
                </div>

                {/* File confirmation */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center mb-6 p-4 bg-green-50 rounded-xl border border-green-200"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">{uploadedFile?.name} uploaded successfully</span>
                </motion.div>

                <div className="space-y-4">
                  <Label htmlFor="job-description" className="text-lg font-semibold text-gray-900">
                    Job Description (Optional)
                  </Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job description here to get targeted feedback and see how well your CV matches specific requirements..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    className="resize-none border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                  />
                  <p className="text-sm text-gray-500">
                    Adding a job description helps us provide more specific recommendations and matching scores.
                  </p>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400"
                  >
                    Upload Different CV
                  </Button>
                  <Button
                    onClick={() => setStep('ready')}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Continue to Analysis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Ready to Analyze */}
        {step === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ 
                      rotateY: isAnalyzing ? 360 : 0,
                      scale: isAnalyzing ? [1, 1.1, 1] : 1
                    }}
                    transition={{ 
                      rotateY: { duration: 2, repeat: isAnalyzing ? Infinity : 0 },
                      scale: { duration: 1, repeat: isAnalyzing ? Infinity : 0 }
                    }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full p-4"
                  >
                    <Brain className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isAnalyzing ? 'Analyzing Your CV...' : 'Ready for Analysis'}
                  </h2>
                  <p className="text-gray-600">
                    {isAnalyzing 
                      ? 'Our AI is analyzing your CV against South African job market standards'
                      : 'Your CV is ready for comprehensive AI analysis'
                    }
                  </p>
                </div>

                {/* Analysis preview */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Your CV</h3>
                    <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <FileText className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-blue-900">{uploadedFile?.name}</div>
                        <div className="text-sm text-blue-600">
                          {uploadedFile && (uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Analysis Includes</h3>
                    <div className="space-y-2">
                      {[
                        'ATS Compatibility Score',
                        'Skills Gap Analysis',
                        'B-BBEE Optimization',
                        'Job Market Insights',
                        'Improvement Suggestions'
                      ].map((item, index) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center text-sm text-gray-700"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {item}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                  >
                    <Progress value={33} className="h-2 mb-2" />
                    <p className="text-sm text-gray-600 text-center">
                      Processing your CV with advanced AI algorithms...
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isAnalyzing}
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400"
                  >
                    Start Over
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
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
                        <Zap className="w-4 h-4 mr-2" />
                        Start AI Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}