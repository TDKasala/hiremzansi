import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Download, 
  Eye, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';

interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: {
    content: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    graduationYear: string;
    gpa?: string;
  }>;
  skills: string[];
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
}

interface SkillSuggestion {
  skill: string;
  category: 'technical' | 'soft' | 'industry' | 'certification';
  relevance: number;
  reason: string;
  trending: boolean;
  salaryImpact?: string;
  demandLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ResumeValidation {
  score: number;
  issues: Array<{
    section: string;
    severity: 'error' | 'warning' | 'suggestion';
    message: string;
    suggestion: string;
  }>;
  strengths: string[];
  improvements: string[];
  atsCompatibility: number;
  saMarketFit: number;
}

export default function ResumeBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    personal: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: {
      content: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });

  const [selectedTemplate, setSelectedTemplate] = useState('ats-friendly-tech');
  const [industry, setIndustry] = useState('technology');
  const [jobTitle, setJobTitle] = useState('Software Developer');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Fetch resume templates
  const { data: templates } = useQuery({
    queryKey: ['/api/resume-builder/templates', industry],
    queryFn: () => fetch(`/api/resume-builder/templates?industry=${industry}`).then(r => r.json())
  });

  // Generate skill suggestions
  const { data: skillSuggestions, refetch: refetchSuggestions } = useQuery({
    queryKey: ['/api/resume-builder/skill-suggestions', resumeData.skills, industry, jobTitle],
    queryFn: () => fetch('/api/resume-builder/skill-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentSkills: resumeData.skills,
        industry,
        jobTitle,
        experience: resumeData.experience.map(exp => exp.description)
      })
    }).then(r => r.json()),
    enabled: resumeData.skills.length > 0 || showSuggestions
  });

  // Real-time validation
  const { data: validation } = useQuery({
    queryKey: ['/api/resume-builder/validate', resumeData],
    queryFn: () => fetch('/api/resume-builder/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData })
    }).then(r => r.json()),
    enabled: Object.keys(resumeData.personal).some(key => resumeData.personal[key as keyof typeof resumeData.personal])
  });

  // Save resume mutation
  const saveResumeMutation = useMutation({
    mutationFn: (data: { resumeData: ResumeData; templateId: string; name: string }) =>
      fetch('/api/resume-builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: 'Resume saved successfully!' });
    }
  });

  // Export resume mutation
  const exportResumeMutation = useMutation({
    mutationFn: (format: string) =>
      fetch('/api/resume-builder/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, format })
      }).then(r => r.text()),
    onSuccess: (content, format) => {
      const blob = new Blob([content], { 
        type: format === 'html' ? 'text/html' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume.${format}`;
      a.click();
      toast({ title: `Resume exported as ${format.toUpperCase()}` });
    }
  });

  const updateResumeData = (section: keyof ResumeData, value: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    updateResumeData('experience', [...resumeData.experience, newExp]);
  };

  const updateExperience = (id: string, field: string, value: any) => {
    const updated = resumeData.experience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    updateResumeData('experience', updated);
  };

  const removeExperience = (id: string) => {
    const filtered = resumeData.experience.filter(exp => exp.id !== id);
    updateResumeData('experience', filtered);
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      graduationYear: '',
      gpa: ''
    };
    updateResumeData('education', [...resumeData.education, newEdu]);
  };

  const updateEducation = (id: string, field: string, value: any) => {
    const updated = resumeData.education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    updateResumeData('education', updated);
  };

  const removeEducation = (id: string) => {
    const filtered = resumeData.education.filter(edu => edu.id !== id);
    updateResumeData('education', filtered);
  };

  const addSkill = (skill: string) => {
    if (!resumeData.skills.includes(skill)) {
      updateResumeData('skills', [...resumeData.skills, skill]);
      refetchSuggestions();
    }
  };

  const removeSkill = (skill: string) => {
    const filtered = resumeData.skills.filter(s => s !== skill);
    updateResumeData('skills', filtered);
    refetchSuggestions();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <Info className="w-4 h-4 text-yellow-500" />;
      default: return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'soft': return 'bg-green-100 text-green-800';
      case 'industry': return 'bg-purple-100 text-purple-800';
      case 'certification': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDemandIcon = (level: string) => {
    switch (level) {
      case 'critical': return <Target className="w-3 h-3 text-red-500" />;
      case 'high': return <TrendingUp className="w-3 h-3 text-orange-500" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dynamic Resume Builder</h1>
        <p className="text-gray-600">Create a professional resume with real-time AI-powered suggestions tailored for the South African market</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Resume Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Choose Template & Industry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jobTitle">Target Job Title</Label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Developer"
                  />
                </div>
              </div>
              
              {templates?.templates && (
                <div>
                  <Label>Template</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {templates.templates.map((template: any) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume Sections */}
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                {/* Personal Information */}
                <TabsContent value="personal" className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={resumeData.personal.name}
                        onChange={(e) => updateResumeData('personal', { ...resumeData.personal, name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personal.email}
                        onChange={(e) => updateResumeData('personal', { ...resumeData.personal, email: e.target.value })}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={resumeData.personal.phone}
                        onChange={(e) => updateResumeData('personal', { ...resumeData.personal, phone: e.target.value })}
                        placeholder="+27 12 345 6789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={resumeData.personal.location}
                        onChange={(e) => updateResumeData('personal', { ...resumeData.personal, location: e.target.value })}
                        placeholder="Johannesburg, South Africa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={resumeData.personal.linkedin}
                        onChange={(e) => updateResumeData('personal', { ...resumeData.personal, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/yourname"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website/Portfolio</Label>
                      <Input
                        id="website"
                        value={resumeData.personal.website}
                        onChange={(e) => updateResumeData('personal', { ...resumeData.personal, website: e.target.value })}
                        placeholder="yourportfolio.com"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Professional Summary */}
                <TabsContent value="summary" className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Professional Summary</h3>
                  <div>
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      value={resumeData.summary.content}
                      onChange={(e) => updateResumeData('summary', { content: e.target.value })}
                      placeholder="Write a compelling 2-3 sentence summary highlighting your key strengths and value proposition..."
                      className="min-h-[120px]"
                    />
                  </div>
                </TabsContent>

                {/* Work Experience */}
                <TabsContent value="experience" className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Work Experience</h3>
                    <Button onClick={addExperience} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
                  
                  {resumeData.experience.map((exp, index) => (
                    <Card key={exp.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Experience {index + 1}</h4>
                          <Button
                            onClick={() => removeExperience(exp.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Job Title</Label>
                            <Input
                              value={exp.title}
                              onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                              placeholder="Software Developer"
                            />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                              placeholder="Company Name"
                            />
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              disabled={exp.current}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`current-${exp.id}`}
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                          />
                          <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
                        </div>
                        
                        <div>
                          <Label>Description & Achievements</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="• Led development of web applications using React and Node.js
• Improved system performance by 30% through optimization
• Managed team of 3 junior developers"
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                {/* Education */}
                <TabsContent value="education" className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Education</h3>
                    <Button onClick={addEducation} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </Button>
                  </div>
                  
                  {resumeData.education.map((edu, index) => (
                    <Card key={edu.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Education {index + 1}</h4>
                          <Button
                            onClick={() => removeEducation(edu.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>
                          <div>
                            <Label>Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                              placeholder="University of the Witwatersrand"
                            />
                          </div>
                          <div>
                            <Label>Graduation Year</Label>
                            <Input
                              value={edu.graduationYear}
                              onChange={(e) => updateEducation(edu.id, 'graduationYear', e.target.value)}
                              placeholder="2023"
                            />
                          </div>
                          <div>
                            <Label>GPA (Optional)</Label>
                            <Input
                              value={edu.gpa}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                              placeholder="3.8/4.0"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                {/* Skills */}
                <TabsContent value="skills" className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <Button 
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      variant="outline"
                      size="sm"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Add Skill</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a skill and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addSkill(input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Current Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {resumeData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="cursor-pointer">
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => saveResumeMutation.mutate({
                resumeData,
                templateId: selectedTemplate,
                name: resumeData.personal.name || 'My Resume'
              })}
              disabled={saveResumeMutation.isPending}
            >
              Save Resume
            </Button>
            <Button
              variant="outline"
              onClick={() => exportResumeMutation.mutate('html')}
              disabled={exportResumeMutation.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Export HTML
            </Button>
            <Button
              variant="outline"
              onClick={() => exportResumeMutation.mutate('text')}
              disabled={exportResumeMutation.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Text
            </Button>
          </div>
        </div>

        {/* Sidebar: Validation & Suggestions */}
        <div className="space-y-6">
          {/* Resume Score */}
          {validation?.validation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Resume Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Score</span>
                    <span className="font-medium">{validation.validation.score}/100</span>
                  </div>
                  <Progress value={validation.validation.score} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>ATS Compatibility</span>
                    <span className="font-medium">{validation.validation.atsCompatibility}/100</span>
                  </div>
                  <Progress value={validation.validation.atsCompatibility} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>SA Market Fit</span>
                    <span className="font-medium">{validation.validation.saMarketFit}/100</span>
                  </div>
                  <Progress value={validation.validation.saMarketFit} className="h-2" />
                </div>

                {validation.validation.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                    <ul className="text-sm space-y-1">
                      {validation.validation.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Issues & Suggestions */}
          {validation?.validation?.issues && validation.validation.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Issues & Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {validation.validation.issues.map((issue: any, index: number) => (
                  <Alert key={index} className={getSeverityColor(issue.severity)}>
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(issue.severity)}
                      <AlertDescription className="flex-1">
                        <div className="font-medium">{issue.message}</div>
                        <div className="text-sm mt-1">{issue.suggestion}</div>
                      </AlertDescription>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Skill Suggestions */}
          {showSuggestions && skillSuggestions?.suggestions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Skill Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {skillSuggestions.suggestions.slice(0, 8).map((suggestion: SkillSuggestion, index: number) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => addSkill(suggestion.skill)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{suggestion.skill}</span>
                      <div className="flex items-center gap-1">
                        {suggestion.trending && <Sparkles className="w-3 h-3 text-yellow-500" />}
                        {getDemandIcon(suggestion.demandLevel)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className={getCategoryColor(suggestion.category)}>
                        {suggestion.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {suggestion.relevance}% relevance
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    {suggestion.salaryImpact && (
                      <p className="text-xs text-green-600 mt-1">
                        Salary impact: {suggestion.salaryImpact}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}