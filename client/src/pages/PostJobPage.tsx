import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Building2,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'wouter';

const jobPostingSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().min(20, 'Requirements must be at least 20 characters'),
  location: z.string().min(3, 'Location is required'),
  province: z.string().min(1, 'Province is required'),
  city: z.string().min(1, 'City is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  experienceLevel: z.string().min(1, 'Experience level is required'),
  salaryRange: z.string().optional(),
  industry: z.string().min(1, 'Industry is required'),
  benefits: z.string().optional(),
  isRemote: z.boolean().default(false),
  deadline: z.string().min(1, 'Application deadline is required')
});

type JobPostingForm = z.infer<typeof jobPostingSchema>;

export default function PostJobPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<JobPostingForm>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      location: '',
      province: '',
      city: '',
      employmentType: '',
      experienceLevel: '',
      salaryRange: '',
      industry: '',
      benefits: '',
      isRemote: false,
      deadline: ''
    }
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: JobPostingForm) => {
      // Convert requirements to array format expected by backend
      const jobData = {
        ...data,
        requirements: data.requirements.split('\n').filter(req => req.trim()),
        benefits: data.benefits ? data.benefits.split('\n').filter(benefit => benefit.trim()) : [],
        isActive: true,
        isFeatured: false
      };

      const response = await apiRequest('POST', '/api/job-postings', jobData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create job posting');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast({
        title: "Job Posted Successfully!",
        description: `Your job posting "${data.title}" has been created and is now live.`,
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Post Job",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const provinces = [
    'Western Cape', 'Eastern Cape', 'Northern Cape', 'Free State',
    'KwaZulu-Natal', 'North West', 'Gauteng', 'Mpumalanga', 'Limpopo'
  ];

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Mining', 'Agriculture', 'Tourism',
    'Government', 'Non-Profit', 'Media', 'Legal', 'Consulting'
  ];

  const employmentTypes = [
    'Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'
  ];

  const experienceLevels = [
    'Entry Level', 'Mid Level', 'Senior Level', 'Executive'
  ];

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Job Posted Successfully - Hire Mzansi</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-700">Job Posted Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Your job posting is now live and will be visible to qualified candidates.
                  You'll receive notifications when candidates apply.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link href="/recruiter/dashboard">
                      View Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                    Post Another Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Post a Job - Hire Mzansi</title>
        <meta name="description" content="Post job opportunities on Hire Mzansi and connect with talented South African professionals." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/jobs" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
            <p className="text-muted-foreground mt-2">
              Connect with South Africa's top talent by posting your job opportunity.
            </p>
          </div>

          <form onSubmit={form.handleSubmit((data) => createJobMutation.mutate(data))}>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      placeholder="e.g. Senior Software Developer"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Select onValueChange={(value) => form.setValue('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry.toLowerCase().replace(/\s+/g, '-')}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.industry && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.industry.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="employmentType">Employment Type *</Label>
                    <Select onValueChange={(value) => form.setValue('employmentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.employmentType && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.employmentType.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">Experience Level *</Label>
                    <Select onValueChange={(value) => form.setValue('experienceLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level.toLowerCase().replace(/\s+/g, '-')}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.experienceLevel && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.experienceLevel.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="salaryRange">Salary Range (Optional)</Label>
                    <Input
                      id="salaryRange"
                      {...form.register('salaryRange')}
                      placeholder="e.g. R25,000 - R35,000 per month"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deadline">Application Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      {...form.register('deadline')}
                    />
                    {form.formState.errors.deadline && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.deadline.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="province">Province *</Label>
                    <Select onValueChange={(value) => form.setValue('province', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.province && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.province.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...form.register('city')}
                      placeholder="e.g. Cape Town"
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Full Address</Label>
                    <Input
                      id="location"
                      {...form.register('location')}
                      placeholder="e.g. Cape Town, Western Cape"
                    />
                    {form.formState.errors.location && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.location.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Job Description & Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                      rows={6}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements *</Label>
                    <Textarea
                      id="requirements"
                      {...form.register('requirements')}
                      placeholder="List the key requirements, one per line..."
                      rows={6}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Enter each requirement on a new line</p>
                    {form.formState.errors.requirements && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.requirements.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="benefits">Benefits & Perks (Optional)</Label>
                    <Textarea
                      id="benefits"
                      {...form.register('benefits')}
                      placeholder="List benefits and perks, one per line..."
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Enter each benefit on a new line</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <Button 
                type="submit" 
                size="lg"
                disabled={createJobMutation.isPending}
                className="px-8"
              >
                {createJobMutation.isPending ? 'Posting Job...' : 'Post Job'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}