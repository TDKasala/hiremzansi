import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Edit, 
  Save, 
  CheckCircle, 
  Sparkles, 
  FileText, 
  ArrowRight,
  Eye,
  Lightbulb 
} from 'lucide-react';

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
  };
  professionalSummary: string;
  skills: string;
  workExperience: string;
  education: string;
  certifications: string;
  languages: string;
}

export function CVEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: ''
    },
    professionalSummary: '',
    skills: '',
    workExperience: '',
    education: '',
    certifications: '',
    languages: ''
  });

  const handleInputChange = (field: keyof CVData, value: string) => {
    if (field === 'personalInfo') return;
    setCvData(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonalInfoChange = (field: keyof CVData['personalInfo'], value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handleGenerateOptimizedCV = async () => {
    setIsGenerating(true);
    
    try {
      // Collect all CV content
      const cvContent = `
        PERSONAL INFORMATION:
        Name: ${cvData.personalInfo.fullName}
        Email: ${cvData.personalInfo.email}
        Phone: ${cvData.personalInfo.phone}
        Location: ${cvData.personalInfo.location}
        LinkedIn: ${cvData.personalInfo.linkedIn}

        PROFESSIONAL SUMMARY:
        ${cvData.professionalSummary}

        SKILLS:
        ${cvData.skills}

        WORK EXPERIENCE:
        ${cvData.workExperience}

        EDUCATION:
        ${cvData.education}

        CERTIFICATIONS:
        ${cvData.certifications}

        LANGUAGES:
        ${cvData.languages}
      `.trim();

      const response = await fetch('/api/cv/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: cvContent,
          type: 'written_cv'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate optimized CV');
      }

      const result = await response.json();
      
      toast({
        title: "CV Optimized Successfully!",
        description: "Your AI-optimized CV is ready for preview",
      });

      // Redirect to optimized CV preview page with the optimized content
      setLocation(`/cv/optimized?content=${encodeURIComponent(result.optimizedContent)}`);
      
    } catch (error) {
      console.error('Error generating optimized CV:', error);
      toast({
        title: "Error",
        description: "Failed to generate optimized CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const cvContent = `
        ${cvData.personalInfo.fullName}
        ${cvData.personalInfo.email} | ${cvData.personalInfo.phone}
        ${cvData.personalInfo.location}
        ${cvData.personalInfo.linkedIn}

        PROFESSIONAL SUMMARY
        ${cvData.professionalSummary}

        SKILLS
        ${cvData.skills}

        WORK EXPERIENCE
        ${cvData.workExperience}

        EDUCATION
        ${cvData.education}

        CERTIFICATIONS
        ${cvData.certifications}

        LANGUAGES
        ${cvData.languages}
      `.trim();

      const response = await fetch('/api/cv/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: cvContent,
          fileName: `${cvData.personalInfo.fullName || 'My CV'}.txt`,
          type: 'draft'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save CV draft');
      }

      toast({
        title: "Draft Saved",
        description: "Your CV draft has been saved successfully",
      });
      
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Edit className="mr-2 h-5 w-5" />
          AI-Powered CV Writer
        </CardTitle>
        <CardDescription>
          Create and optimize your CV with AI assistance for the South African job market
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CV Editor Panel */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={cvData.personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.co.za"
                    value={cvData.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+27 71 234 5678"
                    value={cvData.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Cape Town, Western Cape"
                    value={cvData.personalInfo.location}
                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                  <Input
                    id="linkedIn"
                    placeholder="https://linkedin.com/in/johndoe"
                    value={cvData.personalInfo.linkedIn}
                    onChange={(e) => handlePersonalInfoChange('linkedIn', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea 
                id="summary"
                className="mt-1 min-h-[120px]" 
                placeholder="Write a compelling professional summary that highlights your key skills, experience, and career objectives..."
                value={cvData.professionalSummary}
                onChange={(e) => handleInputChange('professionalSummary', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills</Label>
              <Textarea 
                id="skills"
                className="mt-1 min-h-[100px]" 
                placeholder="List your key skills, technologies, and competencies. Include both technical and soft skills..."
                value={cvData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="experience">Work Experience</Label>
              <Textarea 
                id="experience"
                className="mt-1 min-h-[200px]" 
                placeholder="Describe your work experience in reverse chronological order. Include job titles, company names, dates, and key achievements with quantifiable results..."
                value={cvData.workExperience}
                onChange={(e) => handleInputChange('workExperience', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="education">Education</Label>
              <Textarea 
                id="education"
                className="mt-1 min-h-[100px]" 
                placeholder="List your educational qualifications, including degrees, institutions, graduation dates, and relevant coursework..."
                value={cvData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea 
                id="certifications"
                className="mt-1 min-h-[80px]" 
                placeholder="List relevant professional certifications, licenses, and achievements..."
                value={cvData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="languages">Languages</Label>
              <Textarea 
                id="languages"
                className="mt-1 min-h-[80px]" 
                placeholder="List languages you speak and your proficiency level (e.g., English - Native, Afrikaans - Conversational)..."
                value={cvData.languages}
                onChange={(e) => handleInputChange('languages', e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveDraft} variant="outline" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button 
                onClick={handleGenerateOptimizedCV} 
                className="flex-1"
                disabled={isGenerating || !cvData.personalInfo.fullName || !cvData.professionalSummary}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI-Optimized CV
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Suggestions Panel */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">AI Writing Assistant</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Lightbulb className="mr-2 h-4 w-4" />
                ATS Optimization Tips
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use action verbs (achieved, managed, developed)</li>
                <li>• Include quantifiable results (increased sales by 25%)</li>
                <li>• Match keywords from job descriptions</li>
                <li>• Use standard section headings</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2 flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                South African Context
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Include B-BBEE status if applicable</li>
                <li>• Mention local market experience</li>
                <li>• Use South African English spelling</li>
                <li>• Include relevant local certifications</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2 flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                Professional Formatting
              </h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Keep it to 1-2 pages maximum</li>
                <li>• Use consistent bullet points</li>
                <li>• Include proper contact information</li>
                <li>• Use professional email address</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                What Happens Next?
              </h4>
              <div className="text-sm text-purple-800 space-y-2">
                <p>Once you click "Generate AI-Optimized CV":</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>AI analyzes your content for improvements</li>
                  <li>Optimizes for ATS compatibility</li>
                  <li>Enhances with SA market context</li>
                  <li>Shows you the polished result</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}