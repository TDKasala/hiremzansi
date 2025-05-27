import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building, 
  Users, 
  MapPin, 
  DollarSign, 
  Target, 
  CheckCircle,
  Upload,
  Zap,
  Shield,
  Clock
} from "lucide-react";

export default function PremiumRecruiterPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    companySize: '',
    jobTitle: '',
    jobDescription: '',
    requirements: '',
    location: '',
    salaryRange: '',
    employmentType: '',
    urgency: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Job posting:', formData);
  };

  return (
    <>
      <Helmet>
        <title>Premium Talent Matching for Recruiters | ATSBoost</title>
        <meta name="description" content="Find pre-screened, qualified candidates in South Africa. Our AI matches your job requirements with top talent for just R200 per connection." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
                <Building className="w-4 h-4 mr-2" />
                Recruiter Premium Matching
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Find Top Talent with AI-Powered Matching
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get matched with pre-screened, qualified candidates who fit your exact requirements.
                Pay only R200 to unlock contact details when you find the perfect candidate.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Job Posting Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Post Your Job Requirement
                  </CardTitle>
                  <CardDescription>
                    Describe your ideal candidate and job requirements. Our AI will match you with qualified professionals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Company Name</label>
                        <Input
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Your company name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Contact Person</label>
                        <Input
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="recruiter@company.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="011 123 4567"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Industry</label>
                        <Input
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          placeholder="e.g. Technology, Finance, Healthcare"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Company Size</label>
                        <select
                          name="companySize"
                          value={formData.companySize}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-1000">201-1000 employees</option>
                          <option value="1000+">1000+ employees</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Job Title</label>
                      <Input
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior Software Developer, Marketing Manager"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Job Description</label>
                      <Textarea
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleInputChange}
                        placeholder="Describe the role, responsibilities, and what the ideal candidate will be doing..."
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Required Skills & Qualifications</label>
                      <Textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        placeholder="List required skills, qualifications, experience level, certifications..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <Input
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Johannesburg, Cape Town, Remote, etc."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Salary Range</label>
                        <Input
                          name="salaryRange"
                          value={formData.salaryRange}
                          onChange={handleInputChange}
                          placeholder="e.g. R30,000 - R45,000 per month"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Employment Type</label>
                        <select
                          name="employmentType"
                          value={formData.employmentType}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select employment type</option>
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="contract">Contract</option>
                          <option value="freelance">Freelance</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Hiring Urgency</label>
                        <select
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select urgency</option>
                          <option value="immediate">Immediate (within 1 week)</option>
                          <option value="urgent">Urgent (within 2 weeks)</option>
                          <option value="normal">Normal (within 1 month)</option>
                          <option value="flexible">Flexible (when we find the right person)</option>
                        </select>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Post Job & Start Matching
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-lg border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-600">Why Choose Premium Matching?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">AI-Powered Screening</h4>
                      <p className="text-sm text-gray-600">Advanced algorithms pre-screen candidates for quality matches</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Verified Candidates</h4>
                      <p className="text-sm text-gray-600">All candidates are verified with authentic CVs and credentials</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Faster Hiring</h4>
                      <p className="text-sm text-gray-600">Reduce time-to-hire by 60% with pre-qualified talent</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Cost-Effective</h4>
                      <p className="text-sm text-gray-600">Pay only R200 per successful candidate connection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-700 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Success Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quality Match Rate</span>
                    <span className="font-bold text-purple-700">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Time-to-Hire</span>
                    <span className="font-bold text-purple-700">8 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Candidate Response Rate</span>
                    <span className="font-bold text-purple-700">89%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-sm">Post your job requirements</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-sm">AI matches qualified candidates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-sm">Review candidate profiles & scores</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span className="text-sm">Pay R200 to connect with top candidates</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}