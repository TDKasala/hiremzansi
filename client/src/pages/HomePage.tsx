import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, FileCheck, FileText, LineChart, Star, Target, Trophy, UploadCloud, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <FileCheck className="h-10 w-10 text-amber-500" />,
    title: "ATS Score Analysis",
    description: "Get your CV instantly analyzed and scored against Applicant Tracking Systems."
  },
  {
    icon: <LineChart className="h-10 w-10 text-amber-500" />,
    title: "CV Improvement Tracking",
    description: "Track improvements in your CV over time with our before/after comparison tool."
  },
  {
    icon: <Target className="h-10 w-10 text-amber-500" />,
    title: "South African Optimization",
    description: "Tailored recommendations for the South African job market including B-BBEE and NQF guidelines."
  },
  {
    icon: <Zap className="h-10 w-10 text-amber-500" />,
    title: "AI-Powered Suggestions",
    description: "Smart suggestions to improve your CV based on your industry and target role."
  }
];

const testimonials = [
  {
    quote: "ATSBoost helped me optimize my CV for the South African job market. I added my B-BBEE status and NQF qualifications as suggested, and started getting more interviews immediately.",
    name: "Thabo M.",
    position: "Software Developer, Cape Town",
    rating: 5
  },
  {
    quote: "The CV improvement tracking feature was a game-changer. I could see exactly how my CV was improving with each edit, and which elements were making the biggest difference.",
    name: "Sarah K.",
    position: "Marketing Specialist, Johannesburg",
    rating: 5
  },
  {
    quote: "As someone who recently moved to South Africa, ATSBoost taught me what local employers are looking for. The South African context score was especially helpful.",
    name: "Michael P.",
    position: "Financial Analyst, Durban",
    rating: 4
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const HomePage = () => {
  const stats = [
    { value: "32%", label: "Unemployment Rate in South Africa" },
    { value: "15M+", label: "South Africans Seeking Employment" },
    { value: "75%", label: "CVs Rejected by ATS Before Human Review" },
    { value: "93%", label: "User Success Rate with ATSBoost Optimization" }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,transparent)] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Boost Your CV for the <span className="text-amber-500">South African</span> Job Market
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-600 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Our AI-powered platform analyzes your CV against South African ATS systems, helping you overcome the 32% unemployment crisis with localized optimization.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link href="/analyzer">
                  <Button size="lg" className="w-full sm:w-auto">
                    Analyze Your CV Now
                  </Button>
                </Link>
                <Link href="/cv-improvement">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Track CV Improvements
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <motion.div
                className="relative bg-white p-6 rounded-lg shadow-lg border border-gray-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute -top-3 -right-3 bg-amber-500 text-white py-1 px-3 rounded-full text-sm font-medium">
                  Live Demo
                </div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">ATS Analysis Result</h3>
                  <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    <FileCheck className="h-3 w-3 mr-1" />
                    <span>Passed</span>
                  </div>
                </div>
                <div className="flex justify-center mb-6">
                  <div className="relative h-32 w-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-3xl font-bold">85%</div>
                    </div>
                    <svg className="h-full w-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#FBBF24"
                        strokeWidth="3"
                        strokeDasharray="85, 100"
                        className="animate-dashoffset"
                      />
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Skills Score</span>
                      <span>90%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Format Score</span>
                      <span>88%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>SA Context Score</span>
                      <span>75%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Get Your CV Noticed in South Africa</h2>
            <p className="text-gray-600">Our platform is specifically designed for the South African job market, focusing on local requirements and ATS systems.</p>
          </div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">How ATSBoost Works</h2>
            <p className="text-gray-600">Our simple 3-step process to optimize your CV for the South African job market</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <UploadCloud className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Upload Your CV</h3>
              <p className="text-gray-600">Upload your CV in PDF or Word format. Our system will extract and analyze all the content.</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Analyzed</h3>
              <p className="text-gray-600">Our AI analyzes your CV against South African ATS systems, focusing on local context and requirements.</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Track Improvements</h3>
              <p className="text-gray-600">Implement our recommendations and track your improvements over time with our comparison tool.</p>
            </motion.div>
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/analyzer">
              <Button size="lg" className="px-8">
                Try It Now For Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-gray-600">Join thousands of South Africans who have improved their job prospects with ATSBoost</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md">
                  <CardHeader>
                    <div className="flex mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.position}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Improve Your CV?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of South Africans who have boosted their job prospects with our ATS-optimized CV tools.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/analyzer">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Analyze Your CV Now
              </Button>
            </Link>
            <Link href="/cv-improvement">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 w-full sm:w-auto">
                View CV Improvement Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;