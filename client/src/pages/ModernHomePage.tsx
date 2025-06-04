import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { 
  TrendingUp, 
  Zap, 
  Target, 
  Shield, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Users,
  FileText,
  Brain,
  Star,
  Briefcase,
  MapPin,
  Clock,
  Award
} from 'lucide-react';

const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay }}
    className="relative"
  >
    {children}
  </motion.div>
);

const CountUpNumber = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export function ModernHomePage() {
  const [, setLocation] = useLocation();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your CV against South African job market standards",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Job Matching",
      description: "Smart matching system connects you with relevant opportunities instantly",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "B-BBEE Optimization",
      description: "Specialized tools for South African employment equity requirements",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive feedback and improvement suggestions in seconds",
      color: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    {
      name: "Thabo Mthembu",
      role: "Senior Developer",
      company: "Cape Town Tech",
      content: "ATSBoost helped me land my dream job at a top JSE company. The B-BBEE optimization was game-changing!",
      rating: 5,
      avatar: "TM"
    },
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      company: "Johannesburg Media",
      content: "The AI analysis identified gaps I never noticed. Got 3 interview calls within a week!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael van der Merwe",
      role: "Financial Analyst",
      company: "Durban Finance",
      content: "Finally, a CV tool that understands the South African job market. Highly recommended!",
      rating: 5,
      avatar: "MV"
    }
  ];

  const stats = [
    { label: "CVs Analyzed", value: 50000, suffix: "+" },
    { label: "Job Matches", value: 25000, suffix: "+" },
    { label: "Success Rate", value: 87, suffix: "%" },
    { label: "Companies", value: 1200, suffix: "+" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Background Elements */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-10 blur-3xl"
        />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <FloatingElement>
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              South Africa's #1 CV Optimization Platform
            </Badge>
          </FloatingElement>

          <FloatingElement delay={0.2}>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
              Transform Your Career
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                in South Africa
              </span>
            </h1>
          </FloatingElement>

          <FloatingElement delay={0.4}>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get past ATS systems, land interviews, and secure your dream job with 
              AI-powered CV optimization designed for the South African market.
            </p>
          </FloatingElement>

          <FloatingElement delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                onClick={() => setLocation('/upload')}
              >
                <FileText className="w-5 h-5 mr-2" />
                Analyze My CV Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-purple-500 px-8 py-6 text-lg rounded-full"
                onClick={() => setLocation('/how-it-works')}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </div>
          </FloatingElement>

          {/* Stats Section */}
          <FloatingElement delay={0.8}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    <CountUpNumber end={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </FloatingElement>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose ATSBoost?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed specifically for the South African job market with cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} p-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mock Interview Feature Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0">
                <Crown className="w-4 h-4 mr-2" />
                Premium Feature
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                AI-Powered Mock Interviews
              </h2>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Practice interviews with advanced AI that understands the South African job market. 
                Get personalized feedback, scoring, and improvement suggestions tailored to your industry.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  { icon: Brain, text: "AI analyzes your responses in real-time" },
                  { icon: Target, text: "Industry-specific questions and scenarios" },
                  { icon: Award, text: "Detailed scoring and improvement recommendations" },
                  { icon: MapPin, text: "South African workplace context included" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center text-white"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg p-2 mr-4">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-lg">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <Button
                size="lg"
                className="bg-white text-purple-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-2xl"
                onClick={() => setLocation('/mock-interview')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try Mock Interview
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Interview Progress</span>
                    <span className="text-purple-200">Question 3 of 5</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full w-3/5"></div>
                  </div>
                  
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-white text-sm mb-3">
                      "Tell me about a time you demonstrated leadership in a team project."
                    </p>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">Answer recorded - Score: 87/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white">4.2</div>
                      <div className="text-xs text-purple-200">Avg Score</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white">12</div>
                      <div className="text-xs text-purple-200">Interviews</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white">89%</div>
                      <div className="text-xs text-purple-200">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple. Fast. Effective.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your CV optimized in just 3 easy steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your CV",
                description: "Simply upload your CV or paste your job description for targeted analysis",
                icon: FileText
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our advanced AI analyzes your CV against South African job market standards",
                icon: Brain
              },
              {
                step: "03",
                title: "Get Results",
                description: "Receive detailed feedback, scores, and actionable improvement suggestions",
                icon: Award
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl font-bold text-purple-200 mb-4">{step.step}</div>
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-purple-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of South Africans who've transformed their careers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                        <div className="text-gray-600">{testimonial.role}</div>
                        <div className="text-sm text-gray-500">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of South Africans who've already boosted their career prospects with ATSBoost
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300"
              onClick={() => setLocation('/upload')}
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Free Analysis Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}