import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Building2, Upload, Shield, CheckCircle, Users, Target } from 'lucide-react';

interface RecruiterSignupForm {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  location: string;
  province: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  bbbeeLevel?: number;
  verificationDocuments: File[];
}

const SOUTH_AFRICAN_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
  'Retail', 'Construction', 'Mining', 'Agriculture', 'Tourism',
  'Government', 'Non-profit', 'Media', 'Legal', 'Consulting'
];

const COMPANY_SIZES = [
  '1-10 employees', '11-50 employees', '51-200 employees', 
  '201-500 employees', '500+ employees'
];

export default function RecruiterSignupPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<RecruiterSignupForm>({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    location: '',
    province: '',
    city: '',
    contactEmail: '',
    contactPhone: '',
    bbbeeLevel: undefined,
    verificationDocuments: []
  });

  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const createEmployerMutation = useMutation({
    mutationFn: async (data: Partial<RecruiterSignupForm>) => {
      const response = await apiRequest('POST', '/api/employers', data);
      return response.json();
    },
    onSuccess: (employer) => {
      toast({
        title: "Recruiter Profile Created",
        description: "Your company profile has been created. You can now start posting jobs and accessing candidates.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employers/me'] });
      navigate('/employer/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create recruiter profile",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof RecruiterSignupForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({ 
        ...prev, 
        verificationDocuments: [...prev.verificationDocuments, ...fileArray]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      verificationDocuments: prev.verificationDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.companyName || !formData.industry || !formData.contactEmail) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createEmployerMutation.mutate(formData);
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.companyName || !formData.industry || !formData.companySize) {
        toast({
          title: "Required Fields",
          description: "Please complete all company information fields",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <Helmet>
        <title>Join as Recruiter | Hire Mzansi</title>
        <meta name="description" content="Join Hire Mzansi as a recruiter to access pre-screened South African candidates through our AI-powered matching system." />
      </Helmet>

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join as a Recruiter
          </h1>
          <p className="text-lg text-gray-600">
            Access pre-screened South African candidates through our AI-powered matching system
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Acme Corp"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companySize">Company Size *</Label>
                    <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="website">Company Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell us about your company..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Next: Location Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Location & Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="province">Province *</Label>
                    <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOUTH_AFRICAN_PROVINCES.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Cape Town"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="hr@company.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="011 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bbbeeLevel">B-BBEE Level (Optional)</Label>
                  <Select 
                    value={formData.bbbeeLevel?.toString() || ''} 
                    onValueChange={(value) => handleInputChange('bbbeeLevel', value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select B-BBEE level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4</SelectItem>
                      <SelectItem value="5">Level 5</SelectItem>
                      <SelectItem value="6">Level 6</SelectItem>
                      <SelectItem value="7">Level 7</SelectItem>
                      <SelectItem value="8">Level 8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next: Verification
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Company Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Why We Need Verification</h3>
                  <p className="text-sm text-blue-700">
                    To maintain trust and quality, we verify all companies on our platform. 
                    This helps candidates feel confident about opportunities.
                  </p>
                </div>

                <div>
                  <Label>Upload Verification Documents</Label>
                  <div className="mt-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600 mb-2">
                        Upload company registration documents, tax certificates, or other verification materials
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm">
                          Choose Files
                        </Button>
                      </Label>
                    </div>
                  </div>

                  {formData.verificationDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.verificationDocuments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 mb-1">Next Steps</p>
                      <p className="text-amber-700">
                        After submission, our team will review your application within 24-48 hours. 
                        You'll receive an email confirmation once approved.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createEmployerMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createEmployerMutation.isPending ? 'Creating Profile...' : 'Create Recruiter Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Benefits Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Quality Candidates</h3>
              <p className="text-sm text-gray-600">
                Access pre-screened candidates with verified skills and experience
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">AI Matching</h3>
              <p className="text-sm text-gray-600">
                Our AI finds the best matches based on your specific requirements
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Pay Per Success</h3>
              <p className="text-sm text-gray-600">
                Only pay when you find candidates you want to contact
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}