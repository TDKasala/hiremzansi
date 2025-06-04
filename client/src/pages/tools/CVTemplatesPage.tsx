import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Eye, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Bookmark,
  CheckCircle,
  Clock,
  Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// CV template data
const cvTemplates = [
  {
    id: 1,
    title: "Professional Plus",
    image: "/assets/cv-template-1.jpg",
    category: "corporate",
    popular: true,
    free: false,
    description: "A clean, professional template ideal for corporate positions with a focus on readability and ATS optimization.",
    features: [
      "ATS-friendly format",
      "B-BBEE section included",
      "Skills matrix with ratings",
      "NQF qualification layout"
    ]
  },
  {
    id: 2,
    title: "Graduate Essential",
    image: "/assets/cv-template-2.jpg",
    category: "graduate",
    popular: false,
    free: true,
    description: "Perfect for recent graduates entering the South African job market. Emphasizes education and skills over limited work experience.",
    features: [
      "Education-focused layout",
      "Skills and achievements highlight",
      "Internship/volunteer section",
      "Projects portfolio section"
    ]
  },
  {
    id: 3,
    title: "Technical Specialist",
    image: "/assets/cv-template-3.jpg",
    category: "technical",
    popular: false,
    free: false,
    description: "Designed for IT, engineering and technical professionals with dedicated sections for technical skills and projects.",
    features: [
      "Technical skills matrix",
      "Project showcase section",
      "GitHub/portfolio links",
      "Certifications highlight"
    ]
  },
  {
    id: 4,
    title: "Executive Brief",
    image: "/assets/cv-template-4.jpg",
    category: "corporate",
    popular: false,
    free: false,
    description: "For senior management and executive positions, showcasing leadership experience and strategic achievements.",
    features: [
      "Executive summary",
      "Key achievements section",
      "Leadership experience focus",
      "Board positions section"
    ]
  },
  {
    id: 5,
    title: "Creative Portfolio",
    image: "/assets/cv-template-5.jpg",
    category: "creative",
    popular: true,
    free: false,
    description: "For design, media and creative professionals. Includes portfolio section while maintaining ATS compatibility.",
    features: [
      "Portfolio highlights",
      "Skills visualization",
      "ATS-friendly despite design",
      "Brand personality section"
    ]
  },
  {
    id: 6,
    title: "Modern Simple",
    image: "/assets/cv-template-6.jpg",
    category: "general",
    popular: false,
    free: true,
    description: "A versatile, clean template suitable for most industries with South African specific sections.",
    features: [
      "Simple, clean layout",
      "B-BBEE status section",
      "NQF qualification format",
      "Highly ATS compatible"
    ]
  }
];

export default function CVTemplatesPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTemplates = selectedCategory === "all" 
    ? cvTemplates 
    : cvTemplates.filter(template => template.category === selectedCategory);

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <>
      <Helmet>
        <title>South African CV Templates | Hire Mzansi</title>
        <meta 
          name="description" 
          content="Download ATS-friendly CV templates designed specifically for the South African job market, featuring B-BBEE and NQF sections." 
        />
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">South African CV Templates</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional, ATS-optimized CV templates specifically designed for the South African job market
          </p>
        </div>
        
        <div className="mb-8">
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <div className="flex justify-center">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Templates</TabsTrigger>
                <TabsTrigger value="corporate">Corporate</TabsTrigger>
                <TabsTrigger value="graduate">Graduate</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="creative">Creative</TabsTrigger>
              </TabsList>
            </div>
            
            {/* We don't need separate content here as we're filtering the same grid */}
            <TabsContent value="all"></TabsContent>
            <TabsContent value="corporate"></TabsContent>
            <TabsContent value="graduate"></TabsContent>
            <TabsContent value="technical"></TabsContent>
            <TabsContent value="creative"></TabsContent>
          </Tabs>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="overflow-hidden flex flex-col group hover:border-primary/40 transition-colors">
                <div className="relative bg-gray-100 h-48 overflow-hidden">
                  {!template.image ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <FileText className="h-16 w-16" />
                    </div>
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      {/* Would normally be an actual image */}
                      <FileText className="h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-500 absolute">Preview Image</p>
                    </div>
                  )}
                  
                  {template.popular && (
                    <Badge variant="default" className="absolute top-2 right-2 bg-primary">
                      Popular
                    </Badge>
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription className="text-xs flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        5 min setup • {template.free ? 'Free' : 'Premium'}
                      </CardDescription>
                    </div>
                    
                    {template.category === 'corporate' && <Briefcase className="h-5 w-5 text-muted-foreground" />}
                    {template.category === 'graduate' && <GraduationCap className="h-5 w-5 text-muted-foreground" />}
                    {template.category === 'technical' && <FileText className="h-5 w-5 text-muted-foreground" />}
                    {template.category === 'creative' && <Bookmark className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-sm mb-4">{template.description}</p>
                  
                  <div className="space-y-1">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                    
                    {template.features.length > 3 && (
                      <p className="text-xs text-muted-foreground pl-6">
                        +{template.features.length - 3} more features
                      </p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4 gap-2 flex">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-1 h-4 w-4" />
                    Preview
                  </Button>
                  
                  {template.free ? (
                    <Button size="sm" className="flex-1">
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1" asChild>
                      <a href="/pricing">
                        <Lock className="mr-1 h-4 w-4" />
                        Premium
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">CV Template Best Practices for South Africa</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  Essential Elements
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span>Include B-BBEE status if applicable</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span>Specify NQF levels for all qualifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span>List language proficiencies (important in multilingual SA)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span>Include ID number (last 3 digits can be XXX for privacy)</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  ATS Optimization
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span>Use standard section headings (Experience, Education)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span>Avoid tables, text boxes, and complex formatting</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span>Use industry-standard job titles</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span>Include relevant South African industry keywords</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6">
              <Button asChild>
                <a href="/upload">
                  Check Your CV's ATS Score
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}