import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Search, Copy, ChevronRight, AlertCircle, CheckCircle, Filter, Clock, Copy as CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Pre-defined industry keywords for South Africa
const industryKeywords: Record<string, string[]> = {
  technology: [
    "Software Development", "Cybersecurity", "Cloud Computing", "Systems Analysis", 
    "Network Administration", "DevOps", "Machine Learning", "Artificial Intelligence", 
    "Web Development", "Mobile Development", "UI/UX Design", "Database Administration",
    "Project Management", "Agile", "Scrum", "MICT SETA", "Microsoft", "AWS", "Azure",
    "MCSE", "CompTIA", "CCNA", "Linux", "Windows Server", "SQL", "Python", "Java", "C#",
    "React", "Angular", "Node.js", "REST API", "SAP", "ERP", "CRM", "ICT", "NQF Level 6",
    "Information Security", "POPIA Compliance", "B-BBEE Level", "IT Support", "Technical Support"
  ],
  finance: [
    "Financial Analysis", "Investment Banking", "Chartered Accountant", "SAICA", "SAIPA", 
    "SAIT", "CIMA", "ACCA", "Financial Modelling", "Risk Management", "Compliance", 
    "Regulatory Reporting", "Auditing", "Tax", "IFRS", "JSE", "FAIS", "FICA", 
    "FSCA", "B-BBEE", "King IV", "Companies Act", "Financial Services", "Banking",
    "Insurance", "Asset Management", "Wealth Management", "Financial Planning", "NQF Level 7",
    "CA(SA)", "CFO", "Financial Director", "Management Accounting", "Treasury Management"
  ],
  healthcare: [
    "HPCSA", "Medical Aid", "Patient Care", "SANC", "Registered Nurse", "Medical Doctor",
    "Pharmacist", "Occupational Therapy", "Physiotherapy", "Healthcare Management",
    "Clinical Research", "Medical Records", "Medical Coding", "Infection Control",
    "Primary Healthcare", "Hospital Administration", "Community Healthcare Worker",
    "NHI", "National Health Insurance", "Medical Practice", "B-BBEE Healthcare Provider",
    "Healthcare Practitioner", "Medical Ethics", "EMR/EHR Systems", "Healthcare Policy",
    "Nursing Council", "NQF Level 6", "Dispensing License", "Medical Scheme"
  ],
  education: [
    "SACE", "Curriculum Development", "Educational Leadership", "Teaching", "Assessment",
    "CAPS", "IEB", "E-learning", "Higher Education", "Basic Education", "TVET", 
    "Educational Psychology", "Academic Administration", "Student Support", "Tutoring",
    "Mentoring", "Professional Development", "NQF Level", "SAQA", "CHE", "DHET",
    "Distance Learning", "School Management", "Educational Technology", "Tertiary Education",
    "Academic Research", "Instructional Design", "Early Childhood Development", "ECD"
  ],
  government: [
    "Public Administration", "Policy Development", "Legislative Compliance", "PFMA",
    "MFMA", "Municipal Management", "Public Service", "Government Relations", "Tender Process",
    "B-BBEE", "Supply Chain Management", "Public Sector", "Service Delivery", "Batho Pele",
    "Governance", "Local Government", "Provincial Government", "National Government",
    "Public Procurement", "Constitutional Law", "Administrative Law", "Public Finance",
    "Government Ethics", "Public Policy", "DPSA", "DPME", "Department", "Ministry"
  ],
  mining: [
    "Mineral Extraction", "Mining Engineering", "Geology", "Safety Management", "Environmental Compliance",
    "Mine Planning", "Mineral Processing", "SHEQ", "Drill and Blast", "Mine Ventilation",
    "Rock Mechanics", "Metallurgy", "Mine Surveying", "Mining Legislation", "Underground Mining",
    "Open Pit Mining", "Mineral Resource Management", "MHSA", "DMR", "Mine Health and Safety Act",
    "Mining Charter", "Social and Labour Plan", "SLP", "Rehabilitation", "B-BBEE Mining Partner",
    "Mining Rights", "Prospecting License", "Miner Certificate", "Blasting Certificate"
  ],
  legal: [
    "Attorney", "Legal Practitioner", "Legal Advisory", "Legal Compliance", "Contracts Management",
    "Commercial Law", "Corporate Law", "Labour Law", "Constitutional Law", "Litigation",
    "Legal Research", "Legal Drafting", "Legal Analysis", "Legal Advocacy", "Legal Consulting",
    "Law Society", "Legal Practice Council", "Admitted Attorney", "LLB", "Masters in Law",
    "B-BBEE Legal Service Provider", "POPIA Compliance", "CCMA", "High Court", "Magistrate Court",
    "Legal Correspondence", "Legal Ethics", "Case Management", "Legal Framework", "Statutory Compliance"
  ],
  retail: [
    "Retail Management", "Merchandising", "Inventory Management", "Sales Strategy", "Customer Experience",
    "Retail Operations", "Visual Merchandising", "Loss Prevention", "CRM", "POS Systems",
    "Category Management", "Trade Marketing", "Retail Analytics", "Store Management", "Area Management",
    "Regional Management", "Retail Training", "Retail Compliance", "Consumer Protection Act",
    "B-BBEE Retail Partner", "Retail Distribution", "Omnichannel Retail", "E-commerce",
    "Shopper Marketing", "FMCG", "Quick Service Restaurant", "QSR", "Franchise Management"
  ],
  construction: [
    "Project Management", "Construction Supervision", "Civil Engineering", "Structural Engineering",
    "Quantity Surveying", "Building Information Modelling", "BIM", "Construction Safety",
    "Construction Quality Control", "Site Management", "Building Codes", "JBCC", "NEC",
    "FIDIC", "Construction Regulations", "CIDB", "NHBRC", "OHS Act", "B-BBEE Construction Partner",
    "Green Building", "SANS", "National Building Regulations", "Construction Planning",
    "Construction Estimation", "Construction Drawing", "CAD", "Contract Administration"
  ],
  hospitality: [
    "Hospitality Management", "Guest Relations", "Food and Beverage", "Hotel Operations",
    "Event Management", "Front Office", "Housekeeping", "Reservations", "Revenue Management",
    "Guest Experience", "Hospitality Training", "Accommodation Management", "FEDHASA",
    "CATHSSETA", "Tourism Grading Council", "B-BBEE Tourism Partner", "Hospitality Marketing",
    "Restaurant Management", "Culinary Arts", "Conference Management", "Tourism Development",
    "Customer Service Excellence", "Hospitality Standards", "Hospitality Systems"
  ]
};

const ATSKeywordsPage = () => {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [industryFilter, setIndustryFilter] = useState("technology");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordResults, setKeywordResults] = useState<{
    essential: string[];
    recommended: string[];
    saContext: string[];
  }>({
    essential: [],
    recommended: [],
    saContext: []
  });
  
  // Function to handle job description analysis
  const analyzeJobDescription = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description to analyze",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    // This would typically be an API call to the backend for analysis
    // For demonstration, we'll use a simplified local analysis
    setTimeout(() => {
      const words = jobDescription.toLowerCase().split(/\\s+/);
      const industry = industryKeywords[industryFilter] || [];
      
      // Extract keywords from the job description that match our industry list
      const matchedKeywords = industry.filter(keyword => 
        jobDescription.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // South African context specific keywords
      const saKeywords = [
        "B-BBEE", "NQF Level", "SAQA", "SETA", "South Africa", "SA", "Johannesburg", 
        "Cape Town", "Durban", "Pretoria", "POPIA", "FICA", "PFMA", "MFMA"
      ].filter(keyword => 
        jobDescription.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Essential keywords (high frequency or importance)
      const essentialKeywords = matchedKeywords.slice(0, Math.min(8, matchedKeywords.length));
      
      // Recommended additional keywords
      const recommendedKeywords = industry
        .filter(keyword => !essentialKeywords.includes(keyword))
        .slice(0, 12);
      
      setKeywordResults({
        essential: essentialKeywords,
        recommended: recommendedKeywords,
        saContext: saKeywords
      });
      
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "We've identified key ATS keywords for your job description",
      });
    }, 1500);
  };
  
  // Function to copy keywords to clipboard
  const copyKeywords = (type: "essential" | "recommended" | "saContext") => {
    const keywordsToCopy = keywordResults[type].join(", ");
    navigator.clipboard.writeText(keywordsToCopy);
    
    toast({
      title: "Copied to clipboard",
      description: `${type === "essential" ? "Essential" : type === "recommended" ? "Recommended" : "South African context"} keywords copied`,
    });
  };
  
  // Filter displayed industry keywords based on search
  const filteredKeywords = industryKeywords[industryFilter]?.filter(keyword => 
    !searchKeyword || keyword.toLowerCase().includes(searchKeyword.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>ATS Keywords Tool | ATSBoost</title>
        <meta name="description" content="Find the perfect ATS keywords for your South African job applications. Our tool identifies essential and recommended keywords to boost your CV's performance." />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">ATS Keywords Optimizer</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Identify the essential keywords needed to pass Applicant Tracking Systems (ATS) and boost your CV's score for South African jobs.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Description Analysis</CardTitle>
              <CardDescription>
                Paste a job description to extract key ATS keywords
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Paste the job description here..." 
                className="min-h-[200px]" 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={analyzeJobDescription} 
                  className="bg-amber-500 hover:bg-amber-600"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze Keywords
                    </>
                  )}
                </Button>
              </div>
              
              {(keywordResults.essential.length > 0 || keywordResults.recommended.length > 0) && (
                <div className="mt-6 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Essential Keywords</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyKeywords("essential")}
                        className="text-xs"
                      >
                        <CopyIcon className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keywordResults.essential.length > 0 ? (
                        keywordResults.essential.map((keyword, index) => (
                          <Badge key={index} variant="default" className="bg-blue-500">
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No essential keywords found</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Recommended Keywords</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyKeywords("recommended")}
                        className="text-xs"
                      >
                        <CopyIcon className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keywordResults.recommended.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">South African Context Keywords</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyKeywords("saContext")}
                        className="text-xs"
                      >
                        <CopyIcon className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keywordResults.saContext.length > 0 ? (
                        keywordResults.saContext.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-800">
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No South African context keywords found. Consider adding B-BBEE status, NQF level, or other SA-specific qualifications.</p>
                      )}
                    </div>
                  </div>
                  
                  <Alert className="bg-amber-50 border-amber-200">
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                    <AlertTitle>Optimize your CV with these keywords</AlertTitle>
                    <AlertDescription>
                      Include these keywords naturally in your CV, especially in your skills section, work experience, and professional summary. Don't just list them - contextualize how you've used these skills or qualifications.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Industry Keywords</span>
                <div className="text-sm font-normal flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  <select 
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="bg-transparent border-none focus:outline-none"
                  >
                    {Object.keys(industryKeywords).map(industry => (
                      <option key={industry} value={industry}>
                        {industry.charAt(0).toUpperCase() + industry.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </CardTitle>
              <CardDescription>
                Common keywords for {industryFilter} jobs in South Africa
              </CardDescription>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search keywords..." 
                  className="pl-8" 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto pr-2">
                {filteredKeywords.length > 0 ? (
                  <div className="space-y-1">
                    {filteredKeywords.map((keyword, index) => (
                      <div 
                        key={index} 
                        className="py-1.5 px-2 rounded-md hover:bg-slate-50 flex justify-between items-center"
                      >
                        <span>{keyword}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(keyword);
                            toast({
                              title: "Copied",
                              description: `"${keyword}" copied to clipboard`,
                            });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No keywords found matching your search</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>ATS Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <ChevronRight className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">Use exact keyword matches from the job description</p>
              </div>
              <div className="flex items-start">
                <ChevronRight className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">Include both spelled-out terms and acronyms (e.g., "Broad-Based Black Economic Empowerment" and "B-BBEE")</p>
              </div>
              <div className="flex items-start">
                <ChevronRight className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">Place keywords in context, not just in a list</p>
              </div>
              <div className="flex items-start">
                <ChevronRight className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">Include South African specific qualifications (NQF levels, SAQA accreditation)</p>
              </div>
              <div className="flex items-start">
                <ChevronRight className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">Avoid excessive keyword stuffing which can trigger spam filters</p>
              </div>
              <div className="flex items-start">
                <ChevronRight className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">Use standard job titles rather than creative ones</p>
              </div>
              <div className="flex items-start">
                <ChevronRight className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm">Include relevant local regulatory bodies and certifications</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ATSKeywordsPage;