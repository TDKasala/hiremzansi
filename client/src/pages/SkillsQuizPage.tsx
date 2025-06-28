import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, CardContent, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Code,
  Briefcase,
  Users,
  Calculator,
  Globe,
  Lightbulb
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  questions: QuizQuestion[];
}

const SkillsQuizPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const quizCategories: QuizCategory[] = [
    {
      id: 'technical',
      name: 'Technical Skills',
      description: 'Test your programming, software development, and technical problem-solving abilities with questions relevant to the South African tech industry.',
      icon: <Code className="h-6 w-6 text-blue-600" />,
      questions: [
        {
          id: 1,
          text: 'Which programming language is most commonly used for web development in South African startups?',
          options: ['Java', 'JavaScript', 'Python', 'C#'],
          correctAnswer: 1,
          explanation: 'JavaScript is widely used in South African web development due to its versatility and the growing startup ecosystem.'
        },
        {
          id: 2,
          text: 'What is the most important factor when optimizing database queries for South African e-commerce platforms?',
          options: ['Memory usage', 'Network latency', 'CPU utilization', 'Disk I/O'],
          correctAnswer: 1,
          explanation: 'Network latency is crucial in South Africa due to infrastructure challenges and the need to serve customers across different regions efficiently.'
        },
        {
          id: 3,
          text: 'Which cloud provider is most commonly adopted by South African enterprises?',
          options: ['AWS', 'Microsoft Azure', 'Google Cloud', 'IBM Cloud'],
          correctAnswer: 1,
          explanation: 'Microsoft Azure has strong adoption in South Africa due to existing enterprise relationships and local data center presence.'
        },
        {
          id: 4,
          text: 'What is the most critical security consideration for fintech applications in South Africa?',
          options: ['User interface design', 'POPIA compliance and data protection', 'Social media integration', 'Mobile responsiveness'],
          correctAnswer: 1,
          explanation: 'POPIA (Protection of Personal Information Act) compliance is mandatory for financial applications handling South African customer data.'
        },
        {
          id: 5,
          text: 'Which development methodology is most suitable for South African software startups?',
          options: ['Waterfall', 'Agile/Scrum', 'RAD', 'Spiral'],
          correctAnswer: 1,
          explanation: 'Agile/Scrum methodology allows rapid iteration and adaptation, crucial for startups in the dynamic South African market.'
        },
        {
          id: 6,
          text: 'What is the preferred database solution for high-traffic South African e-commerce platforms?',
          options: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'],
          correctAnswer: 1,
          explanation: 'PostgreSQL offers excellent performance, reliability, and advanced features needed for complex e-commerce operations.'
        },
        {
          id: 7,
          text: 'Which mobile development approach is most cost-effective for South African SMEs?',
          options: ['Native iOS only', 'Native Android only', 'Cross-platform (React Native/Flutter)', 'Web-based PWA'],
          correctAnswer: 2,
          explanation: 'Cross-platform development reduces costs while covering both major platforms, ideal for resource-constrained SMEs.'
        },
        {
          id: 8,
          text: 'What is the most important API design principle for South African enterprise integrations?',
          options: ['Complex data structures', 'RESTful design with clear documentation', 'Proprietary protocols', 'SOAP-only interfaces'],
          correctAnswer: 1,
          explanation: 'RESTful APIs with clear documentation ensure easier integration and maintenance across diverse enterprise systems.'
        },
        {
          id: 9,
          text: 'Which version control strategy works best for distributed South African development teams?',
          options: ['Centralized SVN', 'Git with feature branches', 'Manual file sharing', 'Local-only development'],
          correctAnswer: 1,
          explanation: 'Git with feature branches enables effective collaboration across different locations and time zones in South Africa.'
        },
        {
          id: 10,
          text: 'What is the primary consideration when choosing a tech stack for load-shedding resilience?',
          options: ['Newest technologies only', 'Offline-first capabilities and low power consumption', 'Cloud-only solutions', 'GPU-intensive processing'],
          correctAnswer: 1,
          explanation: 'Offline-first capabilities and low power consumption are essential for maintaining service during South Africa\'s load-shedding periods.'
        }
      ]
    },
    {
      id: 'business',
      name: 'Business Acumen',
      description: 'Evaluate your understanding of business principles, strategy, and market dynamics within the South African economic context.',
      icon: <Briefcase className="h-6 w-6 text-green-600" />,
      questions: [
        {
          id: 1,
          text: 'What is the primary benefit of B-BBEE compliance for South African businesses?',
          options: ['Tax reduction', 'Government contracts access', 'Employee satisfaction', 'International recognition'],
          correctAnswer: 1,
          explanation: 'B-BBEE compliance is essential for accessing government contracts and tenders in South Africa, making it a crucial business consideration.'
        },
        {
          id: 2,
          text: 'Which sector contributes most to South Africa\'s GDP?',
          options: ['Mining', 'Manufacturing', 'Services', 'Agriculture'],
          correctAnswer: 2,
          explanation: 'The services sector is the largest contributor to South Africa\'s GDP, including finance, telecommunications, and business services.'
        },
        {
          id: 3,
          text: 'What is the most effective way to enter the South African market for international companies?',
          options: ['Direct investment', 'Joint ventures with local partners', 'Franchising', 'Online sales only'],
          correctAnswer: 1,
          explanation: 'Joint ventures with local partners provide crucial market knowledge, regulatory compliance support, and established networks.'
        },
        {
          id: 4,
          text: 'Which economic indicator is most important for South African business planning?',
          options: ['Inflation rate', 'Exchange rate volatility', 'GDP growth', 'Unemployment rate'],
          correctAnswer: 1,
          explanation: 'Exchange rate volatility significantly impacts import costs, export competitiveness, and overall business planning in South Africa.'
        },
        {
          id: 5,
          text: 'What is the primary challenge for small businesses in South African townships?',
          options: ['High taxes', 'Limited access to finance and markets', 'Government regulation', 'Competition from large corporations'],
          correctAnswer: 1,
          explanation: 'Limited access to finance and markets remains the biggest barrier for township businesses to scale and grow.'
        },
        {
          id: 6,
          text: 'Which industry offers the best growth opportunities in South Africa\'s economy?',
          options: ['Mining', 'Renewable energy and green technology', 'Traditional manufacturing', 'Agriculture'],
          correctAnswer: 1,
          explanation: 'Renewable energy and green technology sectors are experiencing rapid growth due to energy challenges and global sustainability trends.'
        },
        {
          id: 7,
          text: 'What is the most effective pricing strategy for South African consumer goods?',
          options: ['Premium pricing only', 'Value-based pricing considering affordability', 'Cost-plus pricing', 'Penetration pricing'],
          correctAnswer: 1,
          explanation: 'Value-based pricing that considers local affordability and purchasing power is most effective in the diverse South African market.'
        },
        {
          id: 8,
          text: 'Which business model works best for South African e-commerce startups?',
          options: ['Subscription-only', 'Marketplace with multiple payment options', 'Direct sales only', 'Advertising-based'],
          correctAnswer: 1,
          explanation: 'Marketplace models with multiple payment options accommodate diverse customer preferences and payment capabilities.'
        },
        {
          id: 9,
          text: 'What is the key factor for successful franchise operations in South Africa?',
          options: ['Lowest fees', 'Strong local adaptation and support', 'International brand recognition', 'Standardized operations only'],
          correctAnswer: 1,
          explanation: 'Strong local adaptation and support help franchises succeed in South Africa\'s diverse market conditions and customer preferences.'
        },
        {
          id: 10,
          text: 'Which risk management strategy is most important for South African businesses?',
          options: ['Currency hedging and political risk insurance', 'Insurance only', 'Diversification only', 'Cash reserves only'],
          correctAnswer: 0,
          explanation: 'Currency hedging and political risk insurance address key uncertainties in the South African business environment.'
        }
      ]
    },
    {
      id: 'communication',
      name: 'Communication Skills',
      description: 'Test your verbal, written, and interpersonal communication abilities in professional South African workplace contexts.',
      icon: <Users className="h-6 w-6 text-purple-600" />,
      questions: [
        {
          id: 1,
          text: 'In a multicultural South African workplace, what is the most important communication principle?',
          options: ['Speaking louder', 'Using simple English only', 'Cultural sensitivity and inclusivity', 'Avoiding local languages'],
          correctAnswer: 2,
          explanation: 'Cultural sensitivity and inclusivity are crucial in South Africa\'s diverse workplace environment with 11 official languages and varied cultural backgrounds.'
        },
        {
          id: 2,
          text: 'When presenting to senior management in a South African corporation, what approach is most effective?',
          options: ['Very detailed technical explanations', 'High-level summary with supporting data', 'Informal conversational style', 'Pure visual presentations'],
          correctAnswer: 1,
          explanation: 'South African business culture appreciates concise, well-structured presentations with clear data to support key points.'
        },
        {
          id: 3,
          text: 'How should feedback be delivered in South African professional settings?',
          options: ['Direct and blunt', 'Constructive and respectful', 'Written only', 'Through intermediaries'],
          correctAnswer: 1,
          explanation: 'Constructive and respectful feedback aligns with South African workplace values of ubuntu (humanity) while maintaining professionalism.'
        },
        {
          id: 4,
          text: 'What is the most effective way to communicate during virtual meetings in South Africa?',
          options: ['English only', 'Include multiple languages and clear visual aids', 'Technical jargon', 'Formal presentations only'],
          correctAnswer: 1,
          explanation: 'Including multiple languages and clear visual aids ensures better understanding across diverse teams and accommodates connectivity challenges.'
        },
        {
          id: 5,
          text: 'How should conflict be addressed in South African multicultural teams?',
          options: ['Ignore cultural differences', 'Acknowledge cultural perspectives and find common ground', 'Impose one cultural approach', 'Separate conflicting parties'],
          correctAnswer: 1,
          explanation: 'Acknowledging cultural perspectives while finding common ground leverages diversity as a strength in conflict resolution.'
        },
        {
          id: 6,
          text: 'What communication style works best for customer service in South Africa?',
          options: ['Formal and distant', 'Warm, patient, and culturally aware', 'Rushed and efficient', 'Technical and detailed'],
          correctAnswer: 1,
          explanation: 'Warm, patient, and culturally aware communication builds trust and relationships, essential for South African customer service excellence.'
        },
        {
          id: 7,
          text: 'How should important announcements be communicated in South African organizations?',
          options: ['Email only', 'Multiple channels including local languages', 'Management meetings only', 'Notice boards only'],
          correctAnswer: 1,
          explanation: 'Multiple channels including local languages ensure comprehensive reach and understanding across diverse workforce demographics.'
        },
        {
          id: 8,
          text: 'What is the key to effective cross-cultural communication in South African business?',
          options: ['Standardized communication only', 'Active listening and cultural empathy', 'Speaking louder', 'Using translators only'],
          correctAnswer: 1,
          explanation: 'Active listening and cultural empathy build bridges across South Africa\'s diverse cultural landscape and enhance business relationships.'
        },
        {
          id: 9,
          text: 'How should written communication be structured for South African audiences?',
          options: ['Complex academic language', 'Clear, concise, and accessible language', 'Technical terminology only', 'Informal messaging only'],
          correctAnswer: 1,
          explanation: 'Clear, concise, and accessible language ensures effective communication across different education levels and language backgrounds.'
        },
        {
          id: 10,
          text: 'What is the most important factor in building trust through communication in South Africa?',
          options: ['Speaking the most languages', 'Consistency, transparency, and respect for diversity', 'Using formal titles only', 'Avoiding difficult topics'],
          correctAnswer: 1,
          explanation: 'Consistency, transparency, and respect for diversity build lasting trust and credibility in South African professional relationships.'
        }
      ]
    },
    {
      id: 'analytical',
      name: 'Analytical Thinking',
      description: 'Assess your problem-solving, data analysis, and logical reasoning skills relevant to South African business challenges.',
      icon: <Calculator className="h-6 w-6 text-orange-600" />,
      questions: [
        {
          id: 1,
          text: 'A South African company sees 20% growth in Cape Town but 10% decline in Johannesburg. What should be the first analytical step?',
          options: ['Focus marketing on Cape Town', 'Close Johannesburg operations', 'Analyze regional differences and causes', 'Hire more staff in Cape Town'],
          correctAnswer: 2,
          explanation: 'Proper analysis requires understanding the root causes of regional performance differences before making strategic decisions.'
        },
        {
          id: 2,
          text: 'When analyzing market data for a South African retail chain, which metric is most important for expansion decisions?',
          options: ['Total revenue', 'Customer acquisition cost vs lifetime value', 'Number of transactions', 'Average transaction size'],
          correctAnswer: 1,
          explanation: 'Customer acquisition cost vs lifetime value provides the most comprehensive view of sustainable growth potential in new markets.'
        },
        {
          id: 3,
          text: 'A manufacturing company in South Africa needs to optimize supply chain costs. What analytical approach is most effective?',
          options: ['Focus only on lowest-cost suppliers', 'Analyze total cost of ownership including risks', 'Choose local suppliers only', 'Automate everything'],
          correctAnswer: 1,
          explanation: 'Total cost of ownership analysis includes quality, reliability, and risk factors, crucial for South African supply chain management.'
        },
        {
          id: 4,
          text: 'When analyzing customer churn for a South African telecom company, which factor is most critical?',
          options: ['Price sensitivity only', 'Service quality vs price value perception', 'Competitor pricing only', 'Customer demographics only'],
          correctAnswer: 1,
          explanation: 'Service quality vs price value perception captures the complex decision-making process of South African consumers balancing cost and service expectations.'
        },
        {
          id: 5,
          text: 'A retail chain wants to expand in South Africa. What analytical framework is most appropriate?',
          options: ['Revenue projections only', 'Market penetration analysis with local socio-economic factors', 'Competitor analysis only', 'Location analysis only'],
          correctAnswer: 1,
          explanation: 'Market penetration analysis with local socio-economic factors considers South Africa\'s diverse economic landscape and consumer behavior patterns.'
        },
        {
          id: 6,
          text: 'How should a South African company analyze the impact of load-shedding on operations?',
          options: ['Historical revenue loss only', 'Multi-factor analysis including productivity, costs, and mitigation strategies', 'Power consumption only', 'Employee satisfaction only'],
          correctAnswer: 1,
          explanation: 'Multi-factor analysis provides comprehensive understanding of load-shedding impacts and enables effective mitigation planning.'
        },
        {
          id: 7,
          text: 'What is the best approach for analyzing B-BBEE transformation progress?',
          options: ['Compliance checklist only', 'Integrated scorecard analysis with business impact metrics', 'Demographic data only', 'Training hours only'],
          correctAnswer: 1,
          explanation: 'Integrated scorecard analysis with business impact metrics ensures both compliance and meaningful transformation outcomes.'
        },
        {
          id: 8,
          text: 'When analyzing market opportunities in South African townships, what factor is most important?',
          options: ['Population size only', 'Purchasing power and infrastructure accessibility analysis', 'Competition levels only', 'Government incentives only'],
          correctAnswer: 1,
          explanation: 'Purchasing power and infrastructure accessibility analysis reveals realistic market potential and implementation requirements for township markets.'
        },
        {
          id: 9,
          text: 'How should currency fluctuation risks be analyzed for South African importers?',
          options: ['Exchange rate trends only', 'Comprehensive risk modeling with hedging scenarios', 'Competitor pricing only', 'Historical data only'],
          correctAnswer: 1,
          explanation: 'Comprehensive risk modeling with hedging scenarios provides actionable insights for managing currency volatility in South African markets.'
        },
        {
          id: 10,
          text: 'What analytical approach works best for optimizing staff productivity in diverse South African teams?',
          options: ['Time tracking only', 'Performance analysis with cultural and skills development factors', 'Output measurement only', 'Attendance tracking only'],
          correctAnswer: 1,
          explanation: 'Performance analysis with cultural and skills development factors addresses both productivity and team dynamics in South Africa\'s diverse workplace.'
        }
      ]
    },
    {
      id: 'digital',
      name: 'Digital Literacy',
      description: 'Evaluate your understanding of digital tools, online platforms, and technology trends relevant to the South African market.',
      icon: <Globe className="h-6 w-6 text-indigo-600" />,
      questions: [
        {
          id: 1,
          text: 'Which digital payment method is most widely adopted in South Africa?',
          options: ['Credit cards', 'Mobile money (like MTN MoMo)', 'Bank transfers', 'Cash on delivery'],
          correctAnswer: 1,
          explanation: 'Mobile money solutions have gained significant traction in South Africa, especially for reaching unbanked populations.'
        },
        {
          id: 2,
          text: 'What is the most effective digital marketing channel for reaching South African consumers?',
          options: ['Facebook ads', 'Google search ads', 'WhatsApp Business', 'Email marketing'],
          correctAnswer: 2,
          explanation: 'WhatsApp Business is extremely popular in South Africa for customer communication and marketing due to high mobile penetration.'
        },
        {
          id: 3,
          text: 'When implementing digital transformation in a South African company, what should be the priority?',
          options: ['Latest technology adoption', 'Employee digital skills training', 'Complete system replacement', 'Outsourcing to global vendors'],
          correctAnswer: 1,
          explanation: 'Employee digital skills training ensures successful adoption and maximizes ROI on digital transformation investments.'
        },
        {
          id: 4,
          text: 'Which cybersecurity measure is most critical for South African businesses?',
          options: ['Antivirus software only', 'Comprehensive security awareness training and multi-layered protection', 'Firewall only', 'Password complexity only'],
          correctAnswer: 1,
          explanation: 'Comprehensive security awareness training and multi-layered protection address both technical and human vulnerabilities in the South African threat landscape.'
        },
        {
          id: 5,
          text: 'What is the most effective approach for e-commerce in the South African market?',
          options: ['Desktop-only experience', 'Mobile-first design with multiple payment options', 'International platform only', 'Cash-only transactions'],
          correctAnswer: 1,
          explanation: 'Mobile-first design with multiple payment options caters to South Africa\'s high mobile penetration and diverse payment preferences.'
        },
        {
          id: 6,
          text: 'Which digital tool is most valuable for South African SME management?',
          options: ['Complex ERP systems', 'Cloud-based integrated business solutions', 'Spreadsheets only', 'Paper-based systems'],
          correctAnswer: 1,
          explanation: 'Cloud-based integrated business solutions provide scalability, affordability, and accessibility that SMEs need without large upfront investments.'
        },
        {
          id: 7,
          text: 'How should South African companies approach data backup and storage?',
          options: ['Local storage only', 'Hybrid cloud and local backup with compliance considerations', 'International cloud only', 'No backup needed'],
          correctAnswer: 1,
          explanation: 'Hybrid cloud and local backup with compliance considerations balances accessibility, security, and regulatory requirements like POPIA.'
        },
        {
          id: 8,
          text: 'What digital marketing strategy works best for South African audiences?',
          options: ['Email marketing only', 'Multi-channel approach including social media and WhatsApp', 'Print advertising only', 'Radio advertising only'],
          correctAnswer: 1,
          explanation: 'Multi-channel approach including social media and WhatsApp leverages South Africa\'s high social media engagement and WhatsApp usage.'
        },
        {
          id: 9,
          text: 'Which technology consideration is most important for South African remote work?',
          options: ['High-end hardware only', 'Reliable connectivity solutions and collaboration tools', 'Video conferencing only', 'File sharing only'],
          correctAnswer: 1,
          explanation: 'Reliable connectivity solutions and collaboration tools address South Africa\'s infrastructure challenges while enabling effective remote work.'
        },
        {
          id: 10,
          text: 'What is the key to successful digital adoption in diverse South African teams?',
          options: ['Technical training only', 'Inclusive digital literacy programs with multilingual support', 'Management directives only', 'Generational separation'],
          correctAnswer: 1,
          explanation: 'Inclusive digital literacy programs with multilingual support ensure all team members can effectively participate in digital transformation regardless of background.'
        }
      ]
    },
    {
      id: 'leadership',
      name: 'Leadership & Management',
      description: 'Test your leadership abilities, team management skills, and understanding of South African workplace dynamics.',
      icon: <Lightbulb className="h-6 w-6 text-yellow-600" />,
      questions: [
        {
          id: 1,
          text: 'What leadership style is most effective in diverse South African teams?',
          options: ['Authoritative top-down', 'Collaborative and inclusive', 'Hands-off delegation', 'Micromanagement'],
          correctAnswer: 1,
          explanation: 'Collaborative and inclusive leadership respects South Africa\'s diverse workforce and leverages different perspectives for better outcomes.'
        },
        {
          id: 2,
          text: 'How should a manager handle conflict between team members from different cultural backgrounds?',
          options: ['Ignore and let them resolve it', 'Impose a standard solution', 'Facilitate open dialogue with cultural awareness', 'Separate the team members'],
          correctAnswer: 2,
          explanation: 'Facilitating open dialogue while being culturally aware helps resolve conflicts constructively and builds stronger team relationships.'
        },
        {
          id: 3,
          text: 'What is the most important factor for employee retention in South African companies?',
          options: ['Highest salary possible', 'Career development opportunities', 'Flexible working conditions', 'Company car'],
          correctAnswer: 1,
          explanation: 'Career development opportunities are highly valued by South African professionals seeking growth and skills advancement.'
        },
        {
          id: 4,
          text: 'How should a leader approach transformation and B-BBEE compliance in South Africa?',
          options: ['Legal compliance only', 'Genuine transformation with meaningful economic participation', 'Minimal effort approach', 'Outsource to consultants only'],
          correctAnswer: 1,
          explanation: 'Genuine transformation with meaningful economic participation creates lasting value and builds authentic business relationships in South Africa.'
        },
        {
          id: 5,
          text: 'What leadership approach works best during load-shedding periods in South Africa?',
          options: ['Blame external factors', 'Proactive planning with transparent communication', 'Business as usual', 'Remote work cancellation'],
          correctAnswer: 1,
          explanation: 'Proactive planning with transparent communication helps teams adapt and maintain productivity despite infrastructure challenges.'
        },
        {
          id: 6,
          text: 'How should a manager handle performance issues in a diverse South African workplace?',
          options: ['One-size-fits-all approach', 'Culturally sensitive individualized support and development', 'Immediate termination', 'Ignore performance gaps'],
          correctAnswer: 1,
          explanation: 'Culturally sensitive individualized support and development recognizes diverse backgrounds while maintaining performance standards.'
        },
        {
          id: 7,
          text: 'What is the most effective way to motivate teams during economic uncertainty in South Africa?',
          options: ['Promise unrealistic rewards', 'Transparent communication with skills development focus', 'Reduce communication', 'Focus on job security only'],
          correctAnswer: 1,
          explanation: 'Transparent communication with skills development focus builds trust and long-term value even during challenging economic periods.'
        },
        {
          id: 8,
          text: 'How should leaders address language barriers in South African multicultural teams?',
          options: ['English-only policy', 'Multilingual support with translation tools and patience', 'Separate language groups', 'Ignore language challenges'],
          correctAnswer: 1,
          explanation: 'Multilingual support with translation tools and patience creates inclusive environments that leverage diverse linguistic capabilities.'
        },
        {
          id: 9,
          text: 'What delegation strategy works best in South African organizations?',
          options: ['Central control only', 'Empowerment with cultural awareness and support systems', 'Complete hands-off approach', 'Micromanagement'],
          correctAnswer: 1,
          explanation: 'Empowerment with cultural awareness and support systems builds capability while respecting diverse working styles and backgrounds.'
        },
        {
          id: 10,
          text: 'How should a leader approach innovation in resource-constrained South African environments?',
          options: ['Wait for better resources', 'Creative problem-solving with local partnerships and frugal innovation', 'Copy international solutions only', 'Postpone innovation efforts'],
          correctAnswer: 1,
          explanation: 'Creative problem-solving with local partnerships and frugal innovation leverages South African resourcefulness and builds sustainable competitive advantages.'
        }
      ]
    }
  ];

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer !== null) {
      setIsAnswerSubmitted(true);
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion && selectedAnswer === currentQuestion.correctAnswer) {
        setScore(prev => prev + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    const category = quizCategories.find(c => c.id === selectedCategory);
    if (!category) return;

    if (currentQuestionIndex < category.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const getCurrentQuestion = () => {
    const category = quizCategories.find(c => c.id === selectedCategory);
    return category?.questions[currentQuestionIndex];
  };

  const getScorePercentage = () => {
    const category = quizCategories.find(c => c.id === selectedCategory);
    if (!category) return 0;
    return (score / category.questions.length) * 100;
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) {
      return "Excellent! You have strong knowledge in this area and are well-prepared for interviews.";
    } else if (percentage >= 60) {
      return "Good job! You have solid understanding with some room for improvement.";
    } else if (percentage >= 40) {
      return "Fair performance. Consider reviewing the topics and practicing more.";
    }
    return "You might need more preparation. Consider focusing on these areas before your next interview.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-secondary mb-4">Skills Assessment Quiz</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Practice with our interactive quizzes to prepare for job interviews and assess your knowledge 
            of key skills and concepts relevant to the South African job market.
          </p>
        </div>

        {!selectedCategory ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {quizCategories.map((category) => (
              <Card 
                key={category.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow border-t-4 border-primary"
              >
                <CardHeader className="bg-gradient-to-r from-amber-50 to-white pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {category.icon}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryExpansion(category.id)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedCategories.includes(category.id) ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className={`text-sm text-gray-600 mb-4 ${expandedCategories.includes(category.id) ? '' : 'line-clamp-2'}`}>
                    {category.description}
                  </p>
                  {expandedCategories.includes(category.id) && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-medium">Quiz includes:</p>
                      <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                        <li>{category.questions.length} questions</li>
                        <li>Explanations for all answers</li>
                        <li>South African context focus</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-center pt-3">
                  <Button 
                    onClick={() => handleCategorySelect(category.id)}
                    className="w-full bg-primary hover:bg-amber-500 text-white"
                  >
                    Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-lg border-t-4 border-primary">
              {quizCompleted ? (
                // Quiz Results
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-6"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-primary mb-4">
                      <Award className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-secondary mb-2">Quiz Completed!</h3>
                    <p className="text-gray-600">
                      You scored {score} out of {quizCategories.find(c => c.id === selectedCategory)?.questions.length}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Score</span>
                      <span>{Math.round(getScorePercentage())}%</span>
                    </div>
                    <Progress value={getScorePercentage()} className="h-3" />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-700 font-medium">{getScoreMessage()}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={resetQuiz}
                      className="flex-1 bg-primary hover:bg-amber-500 text-white"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Try Another Quiz
                    </Button>
                  </div>
                </motion.div>
              ) : (
                // Quiz Questions
                <div>
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b">
                    <div className="flex justify-between items-center mb-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetQuiz}
                        className="hover:bg-amber-100"
                      >
                        Back to Categories
                      </Button>
                      <span className="text-sm font-medium">
                        Question {currentQuestionIndex + 1} of {quizCategories.find(c => c.id === selectedCategory)?.questions.length}
                      </span>
                    </div>
                    <div className="mb-2">
                      <Progress 
                        value={(currentQuestionIndex + 1) / (quizCategories.find(c => c.id === selectedCategory)?.questions.length || 1) * 100} 
                        className="h-2"
                      />
                    </div>
                    <CardTitle className="text-lg">
                      {quizCategories.find(c => c.id === selectedCategory)?.name}: Question {currentQuestionIndex + 1}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <h3 className="text-xl font-medium text-gray-900">
                          {getCurrentQuestion()?.text}
                        </h3>
                        
                        <RadioGroup 
                          value={selectedAnswer?.toString() || ""}
                          className="space-y-3"
                        >
                          {getCurrentQuestion()?.options.map((option, index) => (
                            <div 
                              key={index} 
                              className={`relative border rounded-lg p-4 cursor-pointer transition-all
                                ${selectedAnswer === index ? 'border-primary' : 'border-gray-200'} 
                                ${isAnswerSubmitted ? 
                                  index === getCurrentQuestion()?.correctAnswer 
                                    ? 'bg-green-50 border-green-500' 
                                    : selectedAnswer === index && index !== getCurrentQuestion()?.correctAnswer 
                                      ? 'bg-red-50 border-red-500' 
                                      : 'opacity-60'
                                  : 'hover:border-primary hover:bg-amber-50'
                                }
                              `}
                              onClick={() => handleAnswerSelect(index)}
                            >
                              <div className="flex items-start">
                                <RadioGroupItem 
                                  value={index.toString()} 
                                  id={`option-${index}`} 
                                  className="mt-1"
                                  disabled={isAnswerSubmitted}
                                />
                                <Label 
                                  htmlFor={`option-${index}`} 
                                  className="ml-3 cursor-pointer flex-1"
                                >
                                  {option}
                                </Label>
                                {isAnswerSubmitted && (
                                  index === getCurrentQuestion()?.correctAnswer ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
                                  ) : selectedAnswer === index ? (
                                    <XCircle className="h-5 w-5 text-red-500 ml-2 flex-shrink-0" />
                                  ) : null
                                )}
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                        
                        {isAnswerSubmitted && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                          >
                            <h4 className="font-medium mb-1">Explanation:</h4>
                            <p className="text-gray-700 text-sm">
                              {getCurrentQuestion()?.explanation}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                  
                  <CardFooter className="bg-gray-50 border-t p-4">
                    {isAnswerSubmitted ? (
                      <Button 
                        className="w-full bg-primary hover:bg-amber-500 text-white"
                        onClick={handleNextQuestion}
                      >
                        {currentQuestionIndex < (quizCategories.find(c => c.id === selectedCategory)?.questions.length || 1) - 1 
                          ? "Next Question" 
                          : "See Results"
                        }
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-primary hover:bg-amber-500 text-white"
                        onClick={handleAnswerSubmit}
                        disabled={selectedAnswer === null}
                      >
                        Submit Answer
                      </Button>
                    )}
                  </CardFooter>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsQuizPage;