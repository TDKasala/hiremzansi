import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  BuildingIcon, 
  MinusCircle, 
  PlusCircle, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Download, 
  Search,
  FileText,
  CheckCircle2,
  Copy
} from "lucide-react";
import { Link } from "wouter";

// Industry template interface matching our API response
interface IndustryTemplate {
  searchTerms: string[];
  locations: string[];
  skills: string[];
  qualifications: string[];
  experienceLevels: string[];
  employmentTypes: string[];
  salaryRange: string | null;
}

interface TemplateResponse {
  industry: string;
  template: IndustryTemplate;
  metadata: {
    isCustomTemplate: boolean;
    supportedIndustries: string[];
  };
}

const IndustryTemplatesPage = () => {
  const { toast } = useToast();
  const [selectedIndustry, setSelectedIndustry] = useState<string>("Mining & Minerals");
  const [activeTab, setActiveTab] = useState<string>("search-terms");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  // Get industry template from API
  const { 
    data: templateData,
    isLoading
  } = useQuery<TemplateResponse>({
    queryKey: ['/api/sa-industry-template', selectedIndustry],
    queryFn: async () => {
      const response = await fetch(`/api/sa-industry-template/${encodeURIComponent(selectedIndustry)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch industry template");
      }
      return response.json();
    },
    enabled: !!selectedIndustry,
  });

  // Reference data query for dropdown options
  const { data: referenceData } = useQuery({
    queryKey: ['/api/sa-reference-data'],
    enabled: true,
  });
  
  // Get supported industries from template data or reference data
  const supportedIndustries = templateData?.metadata?.supportedIndustries || 
    referenceData?.industries?.map((i: any) => i.name) || [];
  
  // Handle industry change
  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
  };
  
  // Handle copying content to clipboard
  const handleCopy = (section: string, content: string[]) => {
    navigator.clipboard.writeText(content.join(", ")).then(() => {
      setCopiedSection(section);
      toast({
        title: "Copied to clipboard",
        description: `${content.length} items copied from ${section}`,
      });
      
      // Reset the copied status after 2 seconds
      setTimeout(() => {
        setCopiedSection(null);
      }, 2000);
    });
  };
  
  // Handle downloading template as JSON
  const handleDownload = () => {
    if (!templateData) return;
    
    const dataStr = JSON.stringify(templateData.template, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${selectedIndustry.toLowerCase().replace(/\s+/g, '-')}-template.json`);
    linkElement.click();
    
    toast({
      title: "Template downloaded",
      description: `${selectedIndustry} template saved as JSON file`,
    });
  };

  return (
    <div className="container py-6 space-y-6">
      <Helmet>
        <title>Industry-Specific Templates | South African Job Search</title>
        <meta 
          name="description" 
          content="Specialized search templates for South African industries with locally relevant keywords, skills, and qualifications"
        />
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">South African Industry Templates</h1>
        <p className="text-muted-foreground">
          Specialized search templates for major South African industries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar with industry selection */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BuildingIcon size={18} /> Industry Selection
              </CardTitle>
              <CardDescription>
                Choose an industry to view specialized template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Industry</label>
                <Select 
                  value={selectedIndustry} 
                  onValueChange={handleIndustryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedIndustries.map((industry: string) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleDownload}
                disabled={isLoading || !templateData}
              >
                <Download size={16} className="mr-2" />
                Download Template
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About Industry Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Our South African industry templates provide specialized search terms, skills, and qualifications 
                relevant to major sectors in the South African job market.
              </p>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Locally relevant search terms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Industry-specific skills</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>South African qualifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Regional job locations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - template display */}
        <div className="lg:col-span-9">
          {isLoading ? (
            <Card className="w-full h-[600px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-lg">Loading template...</p>
              </div>
            </Card>
          ) : templateData ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedIndustry} Template</CardTitle>
                    <CardDescription>
                      Specialized search template for the {selectedIndustry} sector in South Africa
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                      <Link to="/jobs">
                        <Search size={16} className="mr-2" />
                        Search Jobs
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/job-recommendations">
                        <FileText size={16} className="mr-2" />
                        Get Recommendations
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <Tabs defaultValue="search-terms" value={activeTab} onValueChange={setActiveTab}>
                <div className="px-6">
                  <TabsList className="w-full">
                    <TabsTrigger value="search-terms" className="flex-1">Search Terms</TabsTrigger>
                    <TabsTrigger value="skills" className="flex-1">Skills</TabsTrigger>
                    <TabsTrigger value="locations" className="flex-1">Locations</TabsTrigger>
                    <TabsTrigger value="qualifications" className="flex-1">Qualifications</TabsTrigger>
                    <TabsTrigger value="job-types" className="flex-1">Job Types</TabsTrigger>
                  </TabsList>
                </div>
                
                <CardContent className="pt-6">
                  <TabsContent value="search-terms" className="mt-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Industry-Specific Search Terms</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopy('search-terms', templateData.template.searchTerms)}
                        disabled={copiedSection === 'search-terms'}
                      >
                        {copiedSection === 'search-terms' ? (
                          <CheckCircle2 size={16} className="mr-2 text-green-500" />
                        ) : (
                          <Copy size={16} className="mr-2" />
                        )}
                        {copiedSection === 'search-terms' ? 'Copied' : 'Copy All'}
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {templateData.template.searchTerms.map((term, index) => (
                        <Badge key={index} variant="secondary" className="text-sm py-1.5">
                          {term}
                        </Badge>
                      ))}
                      {templateData.template.searchTerms.length === 0 && (
                        <p className="text-muted-foreground">No search terms available for this industry</p>
                      )}
                    </div>
                    
                    <div className="mt-6 text-sm text-muted-foreground">
                      <p>
                        These search terms are specifically tailored for the {selectedIndustry} sector
                        in South Africa. Use them when searching for jobs on major job boards and
                        company career pages.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="skills" className="mt-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Required Skills</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopy('skills', templateData.template.skills)}
                        disabled={copiedSection === 'skills'}
                      >
                        {copiedSection === 'skills' ? (
                          <CheckCircle2 size={16} className="mr-2 text-green-500" />
                        ) : (
                          <Copy size={16} className="mr-2" />
                        )}
                        {copiedSection === 'skills' ? 'Copied' : 'Copy All'}
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {templateData.template.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-sm py-1.5 bg-primary/5">
                          {skill}
                        </Badge>
                      ))}
                      {templateData.template.skills.length === 0 && (
                        <p className="text-muted-foreground">No skills available for this industry</p>
                      )}
                    </div>
                    
                    <div className="mt-6 text-sm text-muted-foreground">
                      <p>
                        These are common skills required in the {selectedIndustry} sector in South Africa.
                        Ensure your CV highlights these skills if you have them, or consider developing
                        them to improve your job prospects.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="locations" className="mt-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Common Job Locations</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopy('locations', templateData.template.locations)}
                        disabled={copiedSection === 'locations'}
                      >
                        {copiedSection === 'locations' ? (
                          <CheckCircle2 size={16} className="mr-2 text-green-500" />
                        ) : (
                          <Copy size={16} className="mr-2" />
                        )}
                        {copiedSection === 'locations' ? 'Copied' : 'Copy All'}
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {templateData.template.locations.map((location, index) => (
                        <Badge key={index} variant="outline" className="text-sm py-1.5 flex items-center gap-1">
                          <MapPin size={12} />
                          {location}
                        </Badge>
                      ))}
                      {templateData.template.locations.length === 0 && (
                        <p className="text-muted-foreground">No locations available for this industry</p>
                      )}
                    </div>
                    
                    <div className="mt-6 text-sm text-muted-foreground">
                      <p>
                        These are the main regions and cities where {selectedIndustry} jobs are concentrated
                        in South Africa. Consider these locations when conducting your job search.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="qualifications" className="mt-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Required Qualifications</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopy('qualifications', templateData.template.qualifications)}
                        disabled={copiedSection === 'qualifications'}
                      >
                        {copiedSection === 'qualifications' ? (
                          <CheckCircle2 size={16} className="mr-2 text-green-500" />
                        ) : (
                          <Copy size={16} className="mr-2" />
                        )}
                        {copiedSection === 'qualifications' ? 'Copied' : 'Copy All'}
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {templateData.template.qualifications.map((qualification, index) => (
                        <Badge key={index} variant="outline" className="text-sm py-1.5 flex items-center gap-1 bg-blue-50">
                          <GraduationCap size={12} />
                          {qualification}
                        </Badge>
                      ))}
                      {templateData.template.qualifications.length === 0 && (
                        <p className="text-muted-foreground">No qualifications available for this industry</p>
                      )}
                    </div>
                    
                    <div className="mt-6 text-sm text-muted-foreground">
                      <p>
                        These are typical qualifications requested for {selectedIndustry} positions in
                        South Africa, including relevant degrees, diplomas, and NQF levels.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="job-types" className="mt-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Employment Types & Experience Levels</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopy('job-types', templateData.template.employmentTypes)}
                        disabled={copiedSection === 'job-types'}
                      >
                        {copiedSection === 'job-types' ? (
                          <CheckCircle2 size={16} className="mr-2 text-green-500" />
                        ) : (
                          <Copy size={16} className="mr-2" />
                        )}
                        {copiedSection === 'job-types' ? 'Copied' : 'Copy All'}
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Employment Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {templateData.template.employmentTypes.map((type, index) => (
                            <Badge key={index} variant="outline" className="text-sm py-1.5 flex items-center gap-1">
                              <Briefcase size={12} />
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Experience Levels</h4>
                        <div className="flex flex-wrap gap-2">
                          {templateData.template.experienceLevels.map((level, index) => (
                            <Badge key={index} variant="outline" className="text-sm py-1.5">
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {templateData.template.salaryRange && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Typical Salary Range</h4>
                          <Badge variant="secondary" className="text-sm py-1.5">
                            {templateData.template.salaryRange}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 text-sm text-muted-foreground">
                      <p>
                        These are common employment types and experience levels for {selectedIndustry} positions.
                        The salary range is indicative of current market rates in South Africa.
                      </p>
                    </div>
                  </TabsContent>
                </CardContent>
                
                <CardFooter className="flex flex-col items-start gap-4 border-t pt-6">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">How to use this template:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Copy relevant terms to use in your job search</li>
                      <li>Incorporate these skills and qualifications in your CV</li>
                      <li>Target your job applications to these locations</li>
                      <li>Set appropriate salary expectations for this industry</li>
                    </ol>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button asChild>
                      <Link to="/jobs">
                        <Search size={16} className="mr-2" />
                        Search for {selectedIndustry} Jobs
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/upload">
                        <FileText size={16} className="mr-2" />
                        Upload CV for Analysis
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Tabs>
            </Card>
          ) : (
            <Card className="w-full h-[400px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg">Failed to load template</p>
                <Button onClick={() => setSelectedIndustry("Mining & Minerals")}>
                  Try Again
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndustryTemplatesPage;