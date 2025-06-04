import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Heart, 
  CheckCircle,
  Upload,
  Zap,
  Shield
} from "lucide-react";

export default function PremiumJobSeekerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    industry: '',
    experience: '',
    salaryExpectation: '',
    skills: '',
    preferences: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Job seeker profile:', formData);
  };

  return (
    <>
      <Helmet>
        <title>Premium Job Matching for Job Seekers | Hire Mzansi</title>
        <meta name="description" content="Get matched with your perfect job opportunity in South Africa. Our AI analyzes your skills and preferences to find high-quality job matches for just R50." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
                <User className="w-4 h-4 mr-2" />
                Job Seeker Premium Matching
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Find Your Dream Job with AI-Powered Matching
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get matched with vetted job opportunities that align with your skills, experience, and career goals.
                Pay only R50 to unlock contact details when you find the perfect match.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Create Your Job Seeker Profile
                  </CardTitle>
                  <CardDescription>
                    Tell us about yourself and what you're looking for. Our AI will match you with relevant opportunities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="071 234 5678"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <Input
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Johannesburg, Cape Town, etc."
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
                          placeholder="e.g. Finance, IT, Marketing"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Years of Experience</label>
                        <Input
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          placeholder="e.g. 3-5 years"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Salary Expectation (Optional)</label>
                      <Input
                        name="salaryExpectation"
                        value={formData.salaryExpectation}
                        onChange={handleInputChange}
                        placeholder="e.g. R25,000 - R35,000 per month"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Key Skills</label>
                      <Textarea
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="List your key skills, technologies, certifications..."
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Job Preferences</label>
                      <Textarea
                        name="preferences"
                        value={formData.preferences}
                        onChange={handleInputChange}
                        placeholder="Remote work, company size, industry preferences, etc."
                        rows={3}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Create Profile & Start Matching
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-lg border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-600">Why Choose Premium Matching?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">AI-Powered Matches</h4>
                      <p className="text-sm text-gray-600">Advanced algorithms analyze 8+ factors for perfect job matches</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Vetted Opportunities</h4>
                      <p className="text-sm text-gray-600">All job postings are verified and from legitimate employers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Quality Over Quantity</h4>
                      <p className="text-sm text-gray-600">Only 70%+ compatibility matches are shown</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Affordable Pricing</h4>
                      <p className="text-sm text-gray-600">Pay only R50 when you want to connect with an employer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 mb-2">87%</div>
                  <p className="text-sm text-green-600">
                    of job seekers who unlock contact details receive interview invitations within 2 weeks
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-sm">Create your detailed profile</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-sm">Browse your AI-generated matches</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-sm">Pay R50 to unlock contact details</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span className="text-sm">Connect directly with employers</span>
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