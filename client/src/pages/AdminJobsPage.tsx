import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Plus, Edit, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface JobPosting {
  id: number;
  title: string;
  description: string;
  location: string;
  province: string;
  city: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange: string;
  requiredSkills: string[];
  industry: string;
  isActive: boolean;
  deadline: string;
  createdAt: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    province: '',
    city: '',
    employmentType: '',
    experienceLevel: '',
    salaryRange: '',
    requiredSkills: '',
    industry: '',
    deadline: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        deadline: formData.deadline ? new Date(formData.deadline) : null
      };

      const url = editingJob ? `/api/admin/jobs/${editingJob.id}` : '/api/admin/jobs';
      const method = editingJob ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, url, jobData);
      
      if (response.ok) {
        toast({
          title: "Success",
          description: editingJob ? "Job updated successfully" : "Job created successfully"
        });
        
        setShowCreateForm(false);
        setEditingJob(null);
        setFormData({
          title: '',
          description: '',
          location: '',
          province: '',
          city: '',
          employmentType: '',
          experienceLevel: '',
          salaryRange: '',
          requiredSkills: '',
          industry: '',
          deadline: ''
        });
        
        await fetchJobs();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save job');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save job",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: JobPosting) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      province: job.province,
      city: job.city,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      salaryRange: job.salaryRange,
      requiredSkills: job.requiredSkills?.join(', ') || '',
      industry: job.industry,
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const response = await apiRequest('DELETE', `/api/admin/jobs/${jobId}`);
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Job deleted successfully"
        });
        await fetchJobs();
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
    }
  };

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
  const experienceLevels = ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Executive'];
  const industries = [
    'Information Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Agriculture', 'Mining', 'Government', 'Other'
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Management</h1>
          <p className="text-muted-foreground">Create and manage job postings</p>
        </div>
        <Button onClick={() => {
          setShowCreateForm(true);
          setEditingJob(null);
          setFormData({
            title: '', description: '', location: '', province: '', city: '',
            employmentType: '', experienceLevel: '', salaryRange: '', requiredSkills: '',
            industry: '', deadline: ''
          });
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      {(showCreateForm || editingJob) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</CardTitle>
            <CardDescription>
              {editingJob ? 'Update job posting details' : 'Fill in the job posting details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
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
              </div>

              <div>
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Select value={formData.province} onValueChange={(value) => setFormData({ ...formData, province: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(province => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location Details</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Remote, Hybrid, On-site"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select value={formData.employmentType} onValueChange={(value) => setFormData({ ...formData, employmentType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryRange">Salary Range</Label>
                  <Input
                    id="salaryRange"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="e.g., R25,000 - R35,000"
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requiredSkills">Required Skills (comma-separated)</Label>
                <Input
                  id="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="e.g., React, TypeScript, Node.js"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowCreateForm(false);
                  setEditingJob(null);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <Badge variant={job.isActive ? "default" : "secondary"}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.industry}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.city}, {job.province}
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salaryRange}
                      </div>
                    )}
                    {job.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm mb-3 line-clamp-2">{job.description}</p>
                  
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.requiredSkills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.requiredSkills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requiredSkills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(job)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(job.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {jobs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-4">Create your first job posting to get started</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Job
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}