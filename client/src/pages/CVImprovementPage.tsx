import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, ArrowUpDown, FileCheck, AlertCircle, Check, Award, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const CVImprovementPage = () => {
  const [currentTab, setCurrentTab] = useState('preview');
  
  // Mock data for before/after comparison
  const beforeData = {
    score: 62,
    skills: {
      score: 55,
      items: [
        { name: 'Technical Skills', score: 60, status: 'moderate' },
        { name: 'Soft Skills', score: 40, status: 'poor' },
        { name: 'Keyword Density', score: 65, status: 'moderate' }
      ]
    },
    formatting: {
      score: 70,
      items: [
        { name: 'Structure', score: 75, status: 'good' },
        { name: 'Readability', score: 65, status: 'moderate' },
        { name: 'Length', score: 70, status: 'good' }
      ]
    },
    saContext: {
      score: 45,
      items: [
        { name: 'B-BBEE Status', score: 0, status: 'missing' },
        { name: 'NQF Qualifications', score: 60, status: 'moderate' },
        { name: 'Local Context', score: 75, status: 'good' }
      ]
    },
    strengths: [
      'Good overall structure',
      'Effective presentation of work history'
    ],
    weaknesses: [
      'Missing B-BBEE status information',
      'Limited keyword optimization',
      'Soft skills not well articulated'
    ]
  };
  
  const afterData = {
    score: 86,
    skills: {
      score: 85,
      items: [
        { name: 'Technical Skills', score: 90, status: 'excellent' },
        { name: 'Soft Skills', score: 75, status: 'good' },
        { name: 'Keyword Density', score: 90, status: 'excellent' }
      ]
    },
    formatting: {
      score: 88,
      items: [
        { name: 'Structure', score: 90, status: 'excellent' },
        { name: 'Readability', score: 85, status: 'excellent' },
        { name: 'Length', score: 90, status: 'excellent' }
      ]
    },
    saContext: {
      score: 85,
      items: [
        { name: 'B-BBEE Status', score: 100, status: 'excellent' },
        { name: 'NQF Qualifications', score: 90, status: 'excellent' },
        { name: 'Local Context', score: 75, status: 'good' }
      ]
    },
    strengths: [
      'Clear B-BBEE status presentation',
      'Optimized keyword density for ATS systems',
      'Balanced presentation of technical and soft skills',
      'Well-structured with excellent readability',
      'NQF qualification levels clearly displayed'
    ],
    weaknesses: [
      'Could improve industry-specific terminology'
    ]
  };
  
  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  // Helper function to determine improvement status and color
  const getImprovementStatus = (before: number, after: number) => {
    const difference = after - before;
    if (difference >= 20) return { text: 'Major Improvement', color: 'bg-green-500' };
    if (difference >= 10) return { text: 'Good Improvement', color: 'bg-green-400' };
    if (difference > 0) return { text: 'Slight Improvement', color: 'bg-green-300' };
    if (difference === 0) return { text: 'No Change', color: 'bg-gray-300' };
    return { text: 'Decreased', color: 'bg-red-400' };
  };
  
  // Get status badge for scores
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
      case 'moderate':
        return <Badge className="bg-amber-100 text-amber-800">Moderate</Badge>;
      case 'poor':
        return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
      case 'missing':
        return <Badge className="bg-red-100 text-red-800">Missing</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">CV Improvement Tracking</h1>
          <p className="text-gray-600 mb-6">
            Track your CV improvements over time and see exactly how your optimizations are improving your ATS score.
          </p>
        </header>
        
        <Tabs defaultValue="preview" value={currentTab} onValueChange={setCurrentTab} className="mb-10">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Score Overview</TabsTrigger>
            <TabsTrigger value="before-after">Before/After Comparison</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          {/* SCORE OVERVIEW TAB */}
          <TabsContent value="preview" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              <Card className="md:w-1/2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span>Before Optimization</span>
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Poor</span>
                  </CardTitle>
                  <CardDescription>Original CV Score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="relative h-36 w-36 mx-auto">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl font-bold">{beforeData.score}%</div>
                      </div>
                      <svg className="h-full w-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#f0f0f0"
                          strokeWidth="3"
                          strokeDasharray="100, 100"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#FDA4AF"
                          strokeWidth="3"
                          strokeDasharray={`${beforeData.score}, 100`}
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Skills Score</span>
                        <span>{beforeData.skills.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${beforeData.skills.score}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Format Score</span>
                        <span>{beforeData.formatting.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${beforeData.formatting.score}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>SA Context Score</span>
                        <span>{beforeData.saContext.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${beforeData.saContext.score}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <ul className="w-full text-sm space-y-1">
                    <li className="text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Missing B-BBEE status information
                    </li>
                    <li className="text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Low skill keyword optimization
                    </li>
                  </ul>
                </CardFooter>
              </Card>
              
              <Card className="md:w-1/2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span>After Optimization</span>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Excellent</span>
                  </CardTitle>
                  <CardDescription>Optimized CV Score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="relative h-36 w-36 mx-auto">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl font-bold">{afterData.score}%</div>
                      </div>
                      <svg className="h-full w-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#f0f0f0"
                          strokeWidth="3"
                          strokeDasharray="100, 100"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#86EFAC"
                          strokeWidth="3"
                          strokeDasharray={`${afterData.score}, 100`}
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Skills Score</span>
                        <span>{afterData.skills.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${afterData.skills.score}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Format Score</span>
                        <span>{afterData.formatting.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${afterData.formatting.score}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>SA Context Score</span>
                        <span>{afterData.saContext.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${afterData.saContext.score}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <ul className="w-full text-sm space-y-1">
                    <li className="text-green-600 flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      Added B-BBEE status information
                    </li>
                    <li className="text-green-600 flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      Optimized skills and keywords
                    </li>
                    <li className="text-green-600 flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      Added NQF qualification levels
                    </li>
                  </ul>
                </CardFooter>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Overall Improvement Summary</CardTitle>
                <CardDescription>
                  Your CV improvements across key South African job market factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Overall Score Improvement</h3>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Before: {beforeData.score}%</span>
                        <span className="font-medium">+{afterData.score - beforeData.score}%</span>
                        <span className="text-sm text-gray-600">After: {afterData.score}%</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-white bg-amber-500">
                              {Math.round(((afterData.score - beforeData.score) / beforeData.score) * 100)}% Improvement
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div className="w-full bg-gray-200 rounded-l-full">
                            <div style={{ width: `${beforeData.score}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-400 relative z-0"></div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-r-full">
                            <div style={{ width: `${afterData.score - beforeData.score}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-400 relative z-10"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-amber-500" />
                        Skills Score
                        <Badge className="ml-2 bg-green-100 text-green-800">+{afterData.skills.score - beforeData.skills.score}%</Badge>
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">Keywords and skill presentation significantly improved</p>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${afterData.skills.score}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <FileCheck className="h-4 w-4 mr-2 text-amber-500" />
                        Format Score
                        <Badge className="ml-2 bg-green-100 text-green-800">+{afterData.formatting.score - beforeData.formatting.score}%</Badge>
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">Structure and readability enhanced</p>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${afterData.formatting.score}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Award className="h-4 w-4 mr-2 text-amber-500" />
                        SA Context Score
                        <Badge className="ml-2 bg-green-100 text-green-800">+{afterData.saContext.score - beforeData.saContext.score}%</Badge>
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">B-BBEE and NQF information properly included</p>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${afterData.saContext.score}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => setCurrentTab('before-after')}>View Detailed Comparison</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* BEFORE/AFTER COMPARISON TAB */}
          <TabsContent value="before-after" className="space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Detailed Before & After Comparison</CardTitle>
                  <CardDescription>
                    See exactly what improvements were made to your CV
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="text-center mb-4">
                        <h3 className="font-medium text-lg">Before Optimization</h3>
                        <div className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                          {beforeData.score}% ATS Score
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Skills Assessment</h4>
                          <ul className="space-y-2">
                            {beforeData.skills.items.map((item, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <div className="flex items-center">
                                  <span className="mr-2">{item.score}%</span>
                                  {getStatusBadge(item.status)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Formatting Quality</h4>
                          <ul className="space-y-2">
                            {beforeData.formatting.items.map((item, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <div className="flex items-center">
                                  <span className="mr-2">{item.score}%</span>
                                  {getStatusBadge(item.status)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">South African Context</h4>
                          <ul className="space-y-2">
                            {beforeData.saContext.items.map((item, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <div className="flex items-center">
                                  <span className="mr-2">{item.score}%</span>
                                  {getStatusBadge(item.status)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <div className="text-center mb-4">
                        <h3 className="font-medium text-lg">After Optimization</h3>
                        <div className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          {afterData.score}% ATS Score
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Skills Assessment</h4>
                          <ul className="space-y-2">
                            {afterData.skills.items.map((item, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <div className="flex items-center">
                                  <span className="mr-2">{item.score}%</span>
                                  {getStatusBadge(item.status)}
                                  {item.score > beforeData.skills.items[index].score && (
                                    <span className="ml-2 text-green-600 flex items-center text-xs">
                                      <ChevronUp className="h-3 w-3" />
                                      {item.score - beforeData.skills.items[index].score}%
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Formatting Quality</h4>
                          <ul className="space-y-2">
                            {afterData.formatting.items.map((item, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <div className="flex items-center">
                                  <span className="mr-2">{item.score}%</span>
                                  {getStatusBadge(item.status)}
                                  {item.score > beforeData.formatting.items[index].score && (
                                    <span className="ml-2 text-green-600 flex items-center text-xs">
                                      <ChevronUp className="h-3 w-3" />
                                      {item.score - beforeData.formatting.items[index].score}%
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">South African Context</h4>
                          <ul className="space-y-2">
                            {afterData.saContext.items.map((item, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <div className="flex items-center">
                                  <span className="mr-2">{item.score}%</span>
                                  {getStatusBadge(item.status)}
                                  {item.score > beforeData.saContext.items[index].score && (
                                    <span className="ml-2 text-green-600 flex items-center text-xs">
                                      <ChevronUp className="h-3 w-3" />
                                      {item.score - beforeData.saContext.items[index].score}%
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Specific Improvements Made</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <motion.div
                      variants={itemVariants}
                      className="p-4 border border-amber-200 rounded-lg bg-amber-50"
                    >
                      <h3 className="font-medium text-lg mb-3">South African Specific Improvements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-amber-800 mb-2">B-BBEE Status Information</h4>
                          <p className="text-sm mb-4">Your B-BBEE status information was missing from your original CV. We've added this crucial information in a prominent position.</p>
                          <div className="bg-white p-3 rounded border border-amber-200 mb-2">
                            <div className="text-red-500 text-xs mb-1">Before</div>
                            <div className="text-sm text-gray-500">[No B-BBEE information]</div>
                          </div>
                          <div className="bg-white p-3 rounded border border-green-200">
                            <div className="text-green-500 text-xs mb-1">After</div>
                            <div className="text-sm">B-BBEE Status: Level 2 Contributor</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-amber-800 mb-2">NQF Qualification Levels</h4>
                          <p className="text-sm mb-4">NQF qualification levels were not specified in your original CV. We've clearly indicated NQF levels for all qualifications.</p>
                          <div className="bg-white p-3 rounded border border-amber-200 mb-2">
                            <div className="text-red-500 text-xs mb-1">Before</div>
                            <div className="text-sm text-gray-500">Bachelor of Commerce, University of Cape Town</div>
                          </div>
                          <div className="bg-white p-3 rounded border border-green-200">
                            <div className="text-green-500 text-xs mb-1">After</div>
                            <div className="text-sm">Bachelor of Commerce (NQF Level 7), University of Cape Town</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <h3 className="font-medium text-lg mb-3">Skills & Keywords Optimization</h3>
                      <p className="text-sm mb-4">We've optimized your skills section to better match ATS requirements and South African job market terminology.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-blue-800 mb-2">Technical Skills Enhancement</h4>
                          <div className="bg-white p-3 rounded border border-amber-200 mb-2">
                            <div className="text-red-500 text-xs mb-1">Before</div>
                            <div className="text-sm text-gray-500">
                              <ul className="list-disc pl-5 space-y-1">
                                <li>Excel</li>
                                <li>Data analysis</li>
                                <li>Project management</li>
                              </ul>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border border-green-200">
                            <div className="text-green-500 text-xs mb-1">After</div>
                            <div className="text-sm">
                              <ul className="list-disc pl-5 space-y-1">
                                <li>Advanced MS Excel (Power Query, Power Pivot)</li>
                                <li>Data analysis & visualization (Tableau, PowerBI)</li>
                                <li>Project management (PMBOK, Agile/Scrum)</li>
                                <li>ERP systems (SAP, Oracle)</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-blue-800 mb-2">Soft Skills Presentation</h4>
                          <div className="bg-white p-3 rounded border border-amber-200 mb-2">
                            <div className="text-red-500 text-xs mb-1">Before</div>
                            <div className="text-sm text-gray-500">
                              <ul className="list-disc pl-5 space-y-1">
                                <li>Team player</li>
                                <li>Problem solver</li>
                                <li>Good communication</li>
                              </ul>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border border-green-200">
                            <div className="text-green-500 text-xs mb-1">After</div>
                            <div className="text-sm">
                              <ul className="list-disc pl-5 space-y-1">
                                <li>Cross-functional team leadership & collaboration</li>
                                <li>Strategic problem-solving & decision-making</li>
                                <li>Client relationship management & stakeholder communication</li>
                                <li>Conflict resolution & negotiation</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                      <h3 className="font-medium text-lg mb-3">Formatting Improvements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-purple-800 mb-2">Structure Enhancement</h4>
                          <p className="text-sm">Restructured CV sections for optimal ATS scanning and readability, with clear section headings and consistent formatting.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-purple-800 mb-2">Readability Optimization</h4>
                          <p className="text-sm">Improved font consistency, spacing, bullet points, and alignment for better visual hierarchy and ATS parsing.</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button onClick={() => setCurrentTab('recommendations')}>View Recommendations</Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* RECOMMENDATIONS TAB */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Further Improvement Recommendations</CardTitle>
                <CardDescription>
                  While your CV has improved significantly, here are some additional recommendations to make it even better
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border border-amber-200 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-amber-500" />
                      South African Professional Body Memberships
                    </h3>
                    <p className="text-sm mb-3">
                      Consider adding relevant South African professional body memberships to further enhance your CV's local context. This can include:
                    </p>
                    <ul className="text-sm space-y-2 pl-5 list-disc">
                      <li>SAICA (South African Institute of Chartered Accountants)</li>
                      <li>ECSA (Engineering Council of South Africa)</li>
                      <li>HPCSA (Health Professions Council of South Africa)</li>
                      <li>SACAP (South African Council for the Architectural Profession)</li>
                      <li>Or other industry-specific professional bodies</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-blue-200 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                      Industry-Specific Terminology
                    </h3>
                    <p className="text-sm mb-3">
                      Your CV would benefit from more industry-specific terminology relevant to your field in the South African context:
                    </p>
                    <ul className="text-sm space-y-2 pl-5 list-disc">
                      <li>Research common terms used in job listings for your role</li>
                      <li>Incorporate South African business and industry terminology</li>
                      <li>Reference relevant South African regulations and standards</li>
                      <li>Include specific software or methodologies commonly used in your industry in South Africa</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-green-200 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-green-500" />
                      Achievements Quantification
                    </h3>
                    <p className="text-sm mb-3">
                      Adding more specific, quantifiable achievements can further strengthen your CV:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Before:</h4>
                        <div className="bg-white p-3 rounded border text-sm">
                          Improved department efficiency and reduced costs
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">After:</h4>
                        <div className="bg-white p-3 rounded border text-sm">
                          Improved department efficiency by 27% and reduced operational costs by R145,000 annually through process optimization
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-purple-200 rounded-lg">
                    <h3 className="font-medium mb-3 flex items-center">
                      <ChevronDown className="h-5 w-5 mr-2 text-purple-500" />
                      Additional South African Context Elements
                    </h3>
                    <p className="text-sm mb-3">
                      Consider adding these South African specific elements to your CV:
                    </p>
                    <ul className="text-sm space-y-2 pl-5 list-disc">
                      <li>Experience with South African tax and labor laws (if applicable)</li>
                      <li>Familiarity with Employment Equity Act and implementation</li>
                      <li>South African language proficiencies (e.g., English, Afrikaans, isiZulu, etc.)</li>
                      <li>Knowledge of specific provincial business environments if applying for region-specific roles</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => setCurrentTab('preview')}>Return to Overview</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-center">
          <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
            Analyze a New CV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CVImprovementPage;