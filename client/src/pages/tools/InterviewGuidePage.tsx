import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { AlertCircle, Copy, MessageCircle, Check, ArrowRight, Search, Lightbulb, Brain, Clock, Award, Book } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Job types and interview questions
const interviewQuestions = {
  "software-developer": {
    title: "Software Developer",
    description: "Technical, problem-solving, and collaboration questions for software development roles",
    commonQuestions: [
      {
        question: "Can you describe your experience with object-oriented programming principles?",
        tips: "Discuss encapsulation, inheritance, polymorphism, and abstraction. Provide examples of how you've applied these concepts in past projects.",
        sampleAnswer: "I have extensive experience implementing OOP principles in my work. For example, at my previous company, I developed a modular inventory management system where I used encapsulation to hide implementation details, inheritance to create specialized product classes, and polymorphism to handle different product types uniformly. This resulted in a maintainable codebase that other developers could easily understand and extend."
      },
      {
        question: "How do you approach debugging a complex issue in your code?",
        tips: "Outline your systematic process: reproducing the issue, checking logs, using debugging tools, isolating the problem, and implementing solutions.",
        sampleAnswer: "When facing complex bugs, I follow a structured approach. First, I try to reproduce the issue consistently. Then I review logs and use debugging tools to trace execution. I often isolate components by commenting out code sections to narrow down the problem area. Recently, I troubleshooted a performance issue by using profiling tools to identify an inefficient database query that was causing slowdowns. After optimizing the query, response times improved by 60%."
      },
      {
        question: "Describe a challenging software development project you've worked on and how you ensured its success.",
        tips: "Choose a relevant project, explain challenges faced, your specific contributions, and the outcomes achieved. Highlight team collaboration.",
        sampleAnswer: "At XYZ Company, I led a team migrating a legacy system to a modern microservices architecture while ensuring zero downtime. The main challenges included maintaining data integrity during the transition and managing interdependencies between services. I created a detailed migration plan, implemented feature flags to gradually roll out changes, and established comprehensive testing protocols. Through daily stand-ups and weekly reviews, we completed the migration two weeks ahead of schedule, resulting in a 40% improvement in system performance."
      },
      {
        question: "How do you stay updated with the latest technologies and programming languages?",
        tips: "Mention specific resources (blogs, courses, communities) you follow and how you apply new learning in practical ways.",
        sampleAnswer: "I maintain a structured approach to professional development. I allocate 5 hours weekly to learning through platforms like Pluralsight and Udemy. I'm active in several tech communities including Stack Overflow and local developer meetups in Johannesburg. I apply new knowledge by building small proof-of-concept projects. For instance, after learning about React hooks, I refactored a personal project to implement this pattern, which helped me understand the practical benefits and limitations."
      },
      {
        question: "How do you ensure your code is maintainable and readable for other developers?",
        tips: "Discuss coding standards, documentation practices, code reviews, and refactoring techniques you apply.",
        sampleAnswer: "Code maintainability is crucial in team environments. I adhere to established coding standards and naming conventions specific to each language. I write comprehensive documentation including function purpose, parameters, and return values. I practice the DRY principle and break complex functions into smaller, reusable ones. I actively participate in code reviews, both receiving and providing constructive feedback. Recently, I implemented automated documentation generation in our team which improved our onboarding process for new developers."
      }
    ],
    behaviouralQuestions: [
      {
        question: "Tell me about a time when you had to meet a tight deadline for a development project.",
        tips: "Use the STAR method (Situation, Task, Action, Result) to structure your response. Focus on planning, prioritization, and communication.",
        sampleAnswer: "At ABC Tech, we needed to implement a critical security update within 48 hours after discovering a vulnerability. I prioritized the tasks by severity and impact, focused on the core security fixes first, and delegated certain testing responsibilities to team members. I maintained transparent communication with stakeholders through hourly updates. We successfully deployed the patch within 36 hours, preventing any data breaches. This experience reinforced my ability to work effectively under pressure while maintaining code quality."
      },
      {
        question: "Describe a situation where you disagreed with a team member about a technical approach. How did you resolve it?",
        tips: "Show your communication skills, willingness to consider different perspectives, and focus on objective decision-making.",
        sampleAnswer: "During a project at XYZ Corp, a colleague and I disagreed about the database architecture for a high-traffic application. I favored a NoSQL approach for scalability, while they preferred a relational database for data integrity. Instead of forcing my opinion, I suggested we create a small prototype of both approaches and test them against our specific requirements. The tests revealed that for our particular use case, the relational database performed better while meeting scalability needs. This data-driven approach led to a solution we both supported and taught me the value of practical testing over theoretical debates."
      },
      {
        question: "How do you handle working on multiple projects with competing deadlines?",
        tips: "Discuss your prioritization method, time management techniques, and how you communicate about capacity and deadlines.",
        sampleAnswer: "When managing multiple projects, I first assess each project's priority based on business impact, deadlines, and dependencies. I use a Kanban system to visualize all tasks and their status. For time management, I apply time-blocking techniques, allocating focused hours to specific projects without context switching. When facing competing priorities, I proactively communicate with stakeholders to realign expectations or secure additional resources if needed. This approach helped me successfully deliver three concurrent projects last quarter, all meeting their quality targets and deadlines."
      }
    ],
    technicalQuestions: [
      {
        question: "What is the time complexity of searching in a balanced binary search tree?",
        tips: "Explain big O notation clearly. Mention that for a balanced BST, search operations are O(log n).",
        sampleAnswer: "The time complexity for searching in a balanced binary search tree is O(log n), where n is the number of nodes. This logarithmic efficiency occurs because with each comparison, we eliminate half of the remaining nodes from consideration. In the worst case, we need to travel from root to leaf, which in a balanced tree is log n steps. This is significantly more efficient than linear search operations in unsorted arrays, which have O(n) complexity."
      },
      {
        question: "Explain the differences between REST and GraphQL APIs.",
        tips: "Compare data fetching, endpoint structure, versioning, and use cases for each approach.",
        sampleAnswer: "REST and GraphQL represent different approaches to API design. REST uses multiple endpoints for different resources with fixed data structures returned from each endpoint, while GraphQL provides a single endpoint where clients can specify exactly which data they need. REST follows a stateless client-server model with standardized HTTP methods, making it simple to cache responses. GraphQL gives clients more control over data retrieval, reducing over-fetching and under-fetching of data, but introduces more complexity in implementation. I've worked with both - using REST for simpler services and GraphQL for applications with complex data relationships and varying client needs."
      },
      {
        question: "How would you optimize a slow-performing SQL query?",
        tips: "Mention examining execution plans, adding appropriate indexes, normalizing/denormalizing as needed, and query rewriting techniques.",
        sampleAnswer: "To optimize a slow SQL query, I first analyze its execution plan to identify bottlenecks like table scans or inefficient joins. I then implement appropriate indexes for columns used in WHERE clauses, joins, and ORDER BY statements. I examine if the query itself can be rewritten, perhaps by avoiding subqueries in favor of joins where appropriate. I also consider if the database schema might benefit from selective denormalization for read-heavy operations. In a recent project, I improved a report query's performance by 90% by adding a composite index and rewriting a correlated subquery as a join."
      }
    ],
    saContext: [
      {
        question: "What local development communities or events in South Africa do you participate in?",
        tips: "Mention specific meetups, conferences, or online communities focused on the South African tech scene.",
        sampleAnswer: "I'm an active member of the Johannesburg JavaScript Meetup Group where we discuss emerging frontend technologies monthly. I've presented at DevConf in Cape Town on implementing PWAs for low-bandwidth environments, specifically addressing South African mobile user needs. I also contribute to the ZATech Slack community, particularly in channels focused on software development opportunities in underserved communities. These engagements help me stay connected with local industry trends and challenges specific to the South African context."
      },
      {
        question: "How would you approach developing applications considering South Africa's bandwidth constraints and diversity of devices?",
        tips: "Discuss progressive enhancement, offline capabilities, data optimization, and responsive design considerations.",
        sampleAnswer: "South Africa's digital landscape presents unique challenges with varying connectivity quality and device capabilities. I design applications with progressive enhancement principles, ensuring core functionality works on basic devices while enhancing experiences for users with better technology. I implement aggressive caching strategies and offline functionality using Service Workers. For data efficiency, I compress images and implement lazy loading. In a recent project for a retail client, I reduced initial load sizes by 70% and implemented offline product browsing, which increased engagement in rural areas by 35% where connectivity is intermittent."
      },
      {
        question: "How have you incorporated POPIA compliance into your development work?",
        tips: "Reference specific technical implementations for data protection, consent management, and user privacy.",
        sampleAnswer: "POPIA compliance has become central to my development approach. In practice, this means implementing proper data encryption both in transit and at rest for all personal information. I develop with data minimization principles, collecting only what's necessary for the specific processing purpose. I've built configurable data retention policies that automatically archive or delete data after statutory periods. For user consent, I've created granular permission systems rather than all-or-nothing approaches. In my last role, I led the implementation of a comprehensive audit trail system that tracked all access to personal information, which proved invaluable during compliance reviews."
      }
    ]
  },
  "financial-analyst": {
    title: "Financial Analyst",
    description: "Financial modeling, analysis, and industry-specific questions for finance roles",
    commonQuestions: [
      {
        question: "Can you walk me through how you build a financial model?",
        tips: "Outline your structured approach to modeling: gathering data, setting assumptions, building projections, sensitivity analysis, and documentation.",
        sampleAnswer: "My financial modeling process begins with understanding the business and gathering historical data. I establish key assumptions with stakeholders and create a flexible model structure with clearly separated inputs, calculations, and outputs. For a recent valuation project, I built a three-statement model with five-year projections, incorporating scenario analysis for different growth rates. I always implement error-checking mechanisms and document assumptions thoroughly so others can understand the model's logic. My approach prioritizes accuracy while maintaining usability for business decision-makers."
      },
      {
        question: "How do you stay current with financial regulations and reporting standards?",
        tips: "Mention specific resources, professional memberships, and how you implement regulatory changes in your work.",
        sampleAnswer: "I maintain my knowledge through multiple channels. I'm a member of SAICA and attend their quarterly updates on financial reporting standards. I subscribe to the Financial Mail and PWC's regulatory newsletters for timely updates on local regulations. I've implemented a personal system where I allocate three hours weekly to review regulatory changes, particularly focusing on IFRS updates and JSE listing requirements. When new standards are announced, I create implementation checklists for my team to ensure compliance. This systematic approach helped us smoothly transition to IFRS 16 lease accounting standards ahead of deadline."
      },
      {
        question: "Describe a complex financial analysis you conducted and the impact of your findings.",
        tips: "Choose a relevant example, explain the analytical approach, tools used, challenges overcome, and business outcomes.",
        sampleAnswer: "At XYZ Company, I led a working capital optimization project for a manufacturing client with R500M annual revenue. Using advanced Excel modeling and Power BI for data visualization, I analyzed three years of transaction data to identify inefficiencies in their cash conversion cycle. The analysis revealed inventory holding periods 40% above industry benchmarks and inconsistent supplier payment terms. I recommended specific inventory reduction strategies and supplier contract renegotiations, providing detailed implementation steps. The client implemented my recommendations, releasing R45M in cash within six months and improving their cash conversion cycle by 15 days."
      },
      {
        question: "How do you explain complex financial concepts to non-financial stakeholders?",
        tips: "Emphasize your communication skills, use of visual aids, analogies, and ability to focus on business implications rather than technical details.",
        sampleAnswer: "Communication clarity is crucial in finance roles. I tailor my approach based on the audience's financial literacy. For executives, I focus on KPIs and business implications rather than calculation details. I frequently use visual aids like dashboards and simple charts to illustrate trends and comparisons. When discussing complex concepts like weighted average cost of capital, I use relevant analogies that connect to their business context. Recently, I created a one-page dashboard for department managers showing how their operational decisions impact company-wide financial metrics, which significantly improved budget adherence across departments."
      },
      {
        question: "What financial metrics do you consider most important when evaluating a company's performance?",
        tips: "Discuss both traditional metrics and industry-specific KPIs. Explain why certain metrics matter in different contexts.",
        sampleAnswer: "The most valuable metrics depend on the company's industry, maturity stage, and strategic objectives. For profitability, I examine EBITDA margins and return on invested capital rather than just gross margin. For operational efficiency, I analyze the cash conversion cycle, particularly in manufacturing and retail sectors. For growth companies, I prioritize customer acquisition costs versus lifetime value. Beyond traditional metrics, I consider industry-specific KPIs—like revenue per available room for hospitality or average revenue per user for subscription businesses. I believe contextual analysis of metrics provides more insight than absolute numbers."
      }
    ],
    behaviouralQuestions: [
      {
        question: "Tell me about a time when you identified a financial discrepancy or risk that others had missed.",
        tips: "Highlight your attention to detail, analytical thinking, and integrity. Explain the impact of your discovery.",
        sampleAnswer: "While reviewing quarterly financial statements at ABC Corporation, I noticed unusual fluctuations in overhead allocations that didn't align with production volumes. Despite the statements already passing initial review, I conducted a deeper analysis and discovered a systematic error in the allocation formula that had been overlooked for several quarters. I immediately documented my findings with supporting calculations and approached the financial controller. After verification, we restated the affected reports and implemented additional validation checks. This experience reinforced my belief in thorough analysis beyond surface-level reviews, and the company recognized me for preventing potentially significant reporting inaccuracies."
      },
      {
        question: "Describe a situation where you had to influence a business decision using financial analysis.",
        tips: "Focus on how you translated financial insights into business recommendations and how you communicated these effectively.",
        sampleAnswer: "At XYZ Company, management was considering expanding our distribution network with five new facilities. I conducted a comprehensive NPV analysis that revealed two of the proposed locations would likely become unprofitable within three years due to demographic trends and competitive factors. Rather than simply presenting negative findings, I developed an alternative expansion plan with projected ROI for each location. I created a concise executive summary with clear visualizations and met individually with key stakeholders to address specific concerns. The board ultimately adopted my modified recommendation, resulting in a more targeted expansion that achieved 30% higher returns than the original plan within the first year."
      },
      {
        question: "How do you handle tight deadlines for financial reporting or analysis?",
        tips: "Describe your prioritization approach, time management strategies, and quality control processes under pressure.",
        sampleAnswer: "During month-end closing at my previous company, our CFO unexpectedly requested a comprehensive business unit performance analysis needed for a board meeting in 48 hours. I immediately mapped out critical dependencies and built a work-back schedule. I prioritized gathering raw data first and automated repetitive calculations using Excel macros I had previously developed. I maintained quality by implementing reconciliation checks at key stages rather than only at the end. I also clearly communicated progress to stakeholders throughout. We delivered the analysis on time with no errors, and I subsequently created a standardized template that reduced preparation time for similar future requests by 60%."
      }
    ],
    technicalQuestions: [
      {
        question: "What methods would you use to value a company, and when would you use each?",
        tips: "Discuss DCF, comparable company analysis, precedent transactions, and asset-based approaches with their appropriate applications.",
        sampleAnswer: "For company valuation, I employ several methods depending on the company's profile and available information. Discounted Cash Flow analysis is my primary approach for established companies with predictable cash flows, using a WACC that appropriately reflects South African market risk premiums. For companies in well-defined sectors, I use comparable company analysis with appropriate regional and size adjustments, particularly important in the JSE context where direct comparables may be limited. Precedent transactions analysis helps incorporate control premiums but requires adjustment in our volatile market. For asset-heavy businesses like mining companies, I often include resource-based valuations. I typically present multiple approaches with sensitivity analyses to provide a valuation range rather than a single figure, which is especially important given South Africa's market volatility."
      },
      {
        question: "Explain how changes in working capital affect cash flow.",
        tips: "Demonstrate understanding of the relationship between inventory, accounts receivable, accounts payable, and operating cash flow.",
        sampleAnswer: "Working capital changes directly impact a company's operating cash flow, often in counterintuitive ways. An increase in current assets (like accounts receivable or inventory) consumes cash as the company invests in these items. Conversely, an increase in current liabilities (such as accounts payable) provides cash as the company effectively borrows from suppliers. For example, if a manufacturing company increases inventory by R1 million, this appears positive on the income statement but actually represents a R1 million cash outflow on the cash flow statement. This relationship is particularly critical in South African retail and manufacturing sectors where supply chain disruptions can significantly impact working capital requirements. I've found that optimizing the cash conversion cycle through inventory management and payment term negotiations often provides more immediate cash flow benefits than focusing solely on profitability."
      },
      {
        question: "How would you calculate a company's weighted average cost of capital (WACC)?",
        tips: "Walk through the WACC formula, discussing the determination of cost of equity, cost of debt, and capital structure considerations.",
        sampleAnswer: "To calculate WACC, I weight the cost of each capital component by its proportionate use. For cost of equity, I typically use the Capital Asset Pricing Model, adjusting beta based on the company's sector and leverage. In South Africa, I pay particular attention to the equity risk premium, which I would set higher than for developed markets to account for additional country risk. For the risk-free rate, I use the 10-year government bond yield. For cost of debt, I take the company's effective interest rate after tax advantages. The capital structure weights are based on market values rather than book values where possible. For a JSE mid-cap company I recently analyzed, this resulted in a WACC of 15.2%, reflecting both the higher cost of capital in South Africa and company-specific risk factors. I also perform sensitivity analysis around key inputs since small changes in assumptions can significantly impact valuation outcomes."
      }
    ],
    saContext: [
      {
        question: "How do you account for exchange rate volatility in financial projections for South African companies?",
        tips: "Discuss hedging strategies, scenario analysis, and South African-specific monetary policy considerations.",
        sampleAnswer: "Exchange rate volatility presents significant challenges for South African financial projections. I implement a multi-faceted approach including sensitivity analysis showing P&L impact for every 10% ZAR movement. For companies with substantial forex exposure, I build scenario-based projections incorporating historical volatility patterns specific to the Rand. I also consider natural hedging opportunities where possible, matching currency for revenues and costs. Beyond technical analysis, I stay informed on SARB monetary policy and political developments that impact currency movements. In a recent projection for a manufacturing client with significant import components, I implemented a tiered hedging strategy that protected margins during a period when the Rand depreciated 15% against the dollar, saving approximately R3M in projected costs."
      },
      {
        question: "How do you incorporate B-BBEE considerations into financial analysis and corporate valuation in South Africa?",
        tips: "Reference scorecard implications, procurement advantages, sector charter specifics, and their financial impact.",
        sampleAnswer: "B-BBEE factors materially impact financial performance in the South African context. In valuation work, I quantify both revenue opportunities from preferential procurement policies and potential costs of maintaining compliance. For companies in sectors with specific charters like mining or financial services, I model the financial implications of meeting sector-specific targets. When analyzing acquisition targets, I assess B-BBEE credentials as a significant component of enterprise value, particularly for companies competing for government or large corporate contracts. In a recent valuation for a mid-sized IT services company, I applied a 12% premium to the base valuation based on their Level 1 B-BBEE status, which was justified by their sustained ability to secure contracts with SOEs that required minimum B-BBEE levels."
      },
      {
        question: "How do South African accounting standards (IFRS) differ from US GAAP in ways that affect financial analysis?",
        tips: "Highlight key differences in revenue recognition, lease accounting, development costs, or other relevant areas.",
        sampleAnswer: "While both IFRS and US GAAP are high-quality frameworks, several differences significantly impact financial analysis of South African companies. IFRS allows for the revaluation of property, plant and equipment to fair value, while US GAAP maintains historical cost model. This affects asset values and depreciation expenses on South African balance sheets. Development costs can be capitalized under IFRS if certain criteria are met, while US GAAP generally expenses these costs, impacting profitability comparisons for R&D-intensive companies. For financial analysts comparing South African companies with international peers, these differences require normalization adjustments. When I performed a comparative analysis of a JSE-listed retail company against its global competitors, I had to restate certain items to ensure comparability, particularly around lease accounting treatment and impairment practices."
      }
    ]
  },
  "marketing-specialist": {
    title: "Marketing Specialist",
    description: "Campaign development, analytics, and strategic questions for marketing roles",
    commonQuestions: [
      {
        question: "How do you develop and implement a marketing strategy?",
        tips: "Discuss your systematic approach including research, target audience definition, channel selection, execution, and performance measurement.",
        sampleAnswer: "My approach to marketing strategy begins with thorough market research and competitive analysis. I establish clear objectives aligned with business goals and develop detailed buyer personas based on demographic and psychographic research. For campaign planning, I use a channel-mix approach balancing digital and traditional media based on target audience behavior. Implementation follows a phased approach with continuous performance monitoring against predetermined KPIs. For instance, at ABC Company, I led a product launch campaign where this methodology resulted in 35% higher engagement than previous campaigns and a 28% conversion rate within the first quarter."
      },
      {
        question: "Describe a successful marketing campaign you've managed. What made it effective?",
        tips: "Choose a relevant example, discuss objectives, strategy, tactics, results, and lessons learned.",
        sampleAnswer: "At XYZ Corporation, I managed a campaign to introduce a new financial service to young professionals in major South African metros. The campaign objective was to generate 2,000 qualified leads within three months. I developed a multi-channel strategy focusing on Instagram and YouTube for awareness, coupled with targeted LinkedIn ads for conversion. What made it particularly effective was our hyper-local content approach - we created city-specific creative elements addressing financial challenges unique to each metro area. We also partnered with local influencers in each city who embodied our target audience. The campaign exceeded targets by 45%, generating 2,900 qualified leads at a 22% lower cost-per-acquisition than projected. The key lesson was that locally relevant content significantly outperformed generic messaging, which informed our approach to subsequent campaigns."
      },
      {
        question: "How do you measure the ROI of marketing activities?",
        tips: "Highlight your analytical approach, specific metrics you track, attribution models you use, and how you tie marketing activities to business outcomes.",
        sampleAnswer: "Measuring marketing ROI requires both campaign-specific metrics and broader business impact analysis. I implement a multi-touch attribution model to understand the contribution of different channels to conversions. For digital campaigns, I track cost-per-acquisition, conversion rates, and customer lifetime value. For brand campaigns, I measure shifts in awareness, consideration, and preference through pre/post surveys. I also analyze sales data correlation with marketing activities to establish causation where possible. At my previous company, I implemented a dashboard connecting CRM and marketing automation data, which revealed that email nurture campaigns had 3.2x higher ROI than social media advertising for our B2B products, leading to a reallocation of 30% of our budget toward email marketing."
      },
      {
        question: "How do you stay current with changing marketing trends and technologies?",
        tips: "Discuss specific resources, learning habits, testing approaches, and how you evaluate which trends to adopt.",
        sampleAnswer: "I maintain a structured approach to professional development in marketing. I subscribe to key publications like MarketingWeek and local industry newsletters from the Marketing Association of South Africa. I dedicate time weekly to online learning through platforms like HubSpot Academy and Google's digital marketing courses to stay certified in core platforms. I belong to several marketing communities including the Digital Marketing Institute where I participate in monthly webinars. Beyond passive learning, I apply new knowledge through small-scale tests before major implementation. For instance, when TikTok emerged as a marketing channel, I ran three controlled campaigns with varied approaches before recommending a broader strategy to my organization, which resulted in 40% higher engagement rates than our established platforms."
      },
      {
        question: "How do you adapt marketing strategies for different audience segments?",
        tips: "Demonstrate your understanding of audience segmentation, personalization techniques, and channel optimization for different demographics.",
        sampleAnswer: "Audience segmentation is fundamental to effective marketing. I start by analyzing both demographic data and behavioral patterns to create distinct segments with unique needs and preferences. For each segment, I develop tailored value propositions addressing their specific pain points. Channel selection and messaging tone vary significantly by segment - for instance, at ABC Retail, I discovered through A/B testing that our 45+ audience responded best to informational email content, while our 18-30 segment engaged more with interactive social content. Message timing also varies by segment; our professional audience engaged most during commuting hours while parents responded better to evening content. This segmented approach resulted in a 34% increase in overall engagement and 28% higher conversion rates compared to our previous broad-targeting strategy."
      }
    ],
    behaviouralQuestions: [
      {
        question: "Tell me about a time when a marketing campaign didn't perform as expected. How did you handle it?",
        tips: "Show your analytical thinking, adaptability, and resilience. Focus on the lessons learned and how you improved future campaigns.",
        sampleAnswer: "At XYZ Company, we launched a digital campaign for a new product line that significantly underperformed against our projections, achieving only 40% of expected leads in the first two weeks. Rather than panicking, I conducted a comprehensive analysis of campaign elements, discovering that while click-through rates were strong, conversion rates on our landing pages were extremely low. Through user testing, we identified that the landing page had confusing navigation and an overly complicated form. I quickly assembled a cross-functional team including our UX designer and developer to implement a streamlined landing page with simplified form fields. Within 48 hours of the change, conversion rates improved by 250%, and we ultimately exceeded our original campaign goals. This experience reinforced the importance of testing all campaign components pre-launch and established a new quality assurance process for our team."
      },
      {
        question: "Describe a situation where you had to convince stakeholders to approve a marketing initiative they were initially resistant to.",
        tips: "Highlight your persuasion skills, use of data to build your case, and how you addressed concerns effectively.",
        sampleAnswer: "Our executive team was hesitant to invest in an influencer marketing program I proposed, concerned about ROI and brand reputation risks. Rather than pushing harder, I took a strategic approach. First, I conducted a small pilot campaign using a minimal budget to generate preliminary results, which showed 3x higher engagement than our traditional channels. I then prepared a comprehensive presentation with competitor analysis showing how similar brands were successfully leveraging influencer partnerships. Most importantly, I addressed their concerns directly by developing a rigorous influencer vetting process and ROI measurement framework. I also brought in a trusted industry expert to share success stories. The executive team ultimately approved a phased implementation with regular review points. The program has since become our highest-performing channel for reaching our younger audience segments, and the measured approach helped build trust with the leadership team."
      },
      {
        question: "How do you handle feedback or criticism about marketing materials you've developed?",
        tips: "Demonstrate your professionalism, ability to separate personal attachment from work product, and how you use feedback constructively.",
        sampleAnswer: "I view feedback as an essential part of creating effective marketing materials. When presenting new creative concepts to our sales director at ABC Company, she expressed strong concerns that the messaging wouldn't resonate with our business clients. Rather than becoming defensive, I asked specific questions to understand her perspective and discovered she had recent customer insights I hadn't been aware of. I thanked her for the feedback and scheduled time with key sales team members to gather additional context. Based on these insights, I revised the campaign messaging while maintaining the core creative concept. The revised materials were significantly stronger and received positive reception from both internal stakeholders and our audience. This experience reinforced my belief that cross-functional feedback improves marketing effectiveness, and I now proactively seek input from sales colleagues earlier in the creative process."
      }
    ],
    technicalQuestions: [
      {
        question: "Explain how you would set up and analyze an A/B test for a marketing campaign.",
        tips: "Walk through statistical significance, test design, controlling variables, and interpreting results accurately.",
        sampleAnswer: "When designing A/B tests, I follow a structured methodology to ensure valid results. First, I identify a single variable to test based on potential impact, whether that's subject lines, CTA placement, or creative elements. I determine the minimum sample size needed for statistical significance using power analysis, typically aiming for 95% confidence levels. I randomly assign audience segments to control and test groups, ensuring groups are comparable in key demographics. During the test, I monitor for external factors that might skew results. For analysis, I look beyond surface metrics to conversion impacts, segmenting results to identify if certain subgroups respond differently to variants. Recently, I conducted an A/B test for email campaigns that revealed personalized subject lines performed 32% better overall, but interestingly, performed 50% better with our enterprise segment while showing minimal impact with our SMB customers, which informed our segmentation strategy."
      },
      {
        question: "How do you approach Search Engine Optimization for a website or content?",
        tips: "Discuss technical SEO, content optimization, user experience factors, and measurement approaches.",
        sampleAnswer: "My SEO approach integrates technical fundamentals with content strategy and user experience optimization. On the technical side, I ensure proper site structure, meta tag optimization, schema markup, and mobile responsiveness. For content strategy, I conduct comprehensive keyword research focusing on search intent rather than just volume, prioritizing long-tail keywords relevant to our South African audience where competition may be lower. I develop a content calendar addressing each stage of the customer journey with appropriate keywords. I pay particular attention to local SEO elements including Google My Business optimization and location-specific content for our multiple provincial offices. For measurement, I track rankings for priority keywords, but focus more on organic traffic growth, user engagement metrics, and conversion rates from organic channels. At my previous company, this comprehensive approach improved organic visibility by 45% year-over-year and increased conversion rates from organic traffic by 28%."
      },
      {
        question: "What factors would you consider when allocating budget across different marketing channels?",
        tips: "Discuss audience presence, channel performance data, customer acquisition costs, attribution models, and testing strategies.",
        sampleAnswer: "Budget allocation requires balancing multiple factors to maximize ROI. I start with customer journey mapping to understand which channels influence different stages of the decision process. I analyze historical performance data by channel, examining not just conversion rates but also acquisition costs and customer lifetime value by acquisition source. For new channels, I allocate test budgets based on audience concentration and competitive presence. I employ a 70/20/10 framework: 70% to proven high-performing channels, 20% to scaling promising channels with limited data, and 10% to experimental channels. I also consider seasonality and campaign objectives - awareness campaigns might weight toward different channels than direct response initiatives. At ABC Company, this approach led us to redistribute our budget away from broad display advertising toward a combination of targeted LinkedIn campaigns and content marketing, reducing our overall acquisition costs by 35% while maintaining lead volume."
      }
    ],
    saContext: [
      {
        question: "How do you adapt marketing strategies to reach diverse South African audiences across different language groups and income levels?",
        tips: "Discuss multilingual strategies, channel selection based on access patterns, and cultural sensitivity considerations.",
        sampleAnswer: "South Africa's diverse population requires nuanced marketing approaches. For campaigns with national reach, I develop a core message that translates effectively across cultural contexts, then adapt creative elements and channels for specific audience segments. Language selection is critical - for a recent financial services campaign, we created content in five languages (English, Zulu, Xhosa, Afrikaans, and Sotho) based on regional demographics. Channel selection varies significantly by income segment - for upper-income audiences, digital channels dominate, while middle and lower-income segments require a mix including radio, out-of-home, and increasingly, mobile messaging platforms like WhatsApp which has near-universal penetration. Cultural contexts also influence timing - planning around both national holidays and cultural observances important to specific communities. This multi-layered approach helped us achieve 40% higher engagement rates with previously underperforming audience segments in township and rural areas."
      },
      {
        question: "How do you navigate the challenges of marketing in regions with limited internet connectivity in South Africa?",
        tips: "Address strategies for data-light digital approaches, alternative channels, and hybrid online/offline tactics.",
        sampleAnswer: "Connectivity challenges significantly impact marketing strategy in many South African regions. I implement a layered approach starting with channel selection appropriate to infrastructure realities - using USSD campaigns, SMS, and radio for areas with minimal connectivity while leveraging data-light digital options for regions with intermittent access. For digital content, I insist on progressive loading designs and minification of assets - we reduced average page load size by 60% for a retail client, significantly improving access in rural areas. Where possible, I implement offline functionality allowing content to be accessed without continuous connectivity. I also leverage community-based approaches - in township areas, we've used community influencers and local ambassadors to extend reach beyond digital limitations. For a financial services campaign targeting broader access, this multi-channel approach achieved 32% higher penetration in low-connectivity regions compared to our previous primarily-digital strategies."
      },
      {
        question: "What considerations are unique to social media marketing in the South African context?",
        tips: "Discuss platform preferences by demographic, content types that resonate locally, and South African social trends.",
        sampleAnswer: "Social media marketing in South Africa requires specific platform and content strategies that differ from global norms. Platform demographics are distinctive - Facebook remains dominant across most age groups, particularly outside major metros, while Instagram and TikTok see higher adoption among youth in urban areas. Unlike some markets, Twitter maintains significant influence among opinion leaders and for brand customer service. WhatsApp is essential not just for messaging but increasingly as a marketing channel through broadcast lists and community groups. Content preferences show distinctive patterns - South African audiences engage particularly strongly with local cultural references, humor that reflects our unique context, and content addressing shared national experiences. Video content receives 2.5x higher engagement than static content, particularly when it features recognizable local settings and accents. Data costs significantly impact format preferences - in a recent campaign, we found that optimized short-form video content (under 30 seconds) delivered 40% higher completion rates than longer formats, especially among prepaid data users."
      }
    ]
  },
  "sales-representative": {
    title: "Sales Representative",
    description: "Negotiation, relationship-building, and closing questions for sales roles",
    commonQuestions: [
      {
        question: "How do you approach the sales process from prospecting to closing?",
        tips: "Outline your structured sales methodology, emphasizing qualification, needs analysis, value demonstration, and closing techniques.",
        sampleAnswer: "I follow a consultative sales approach that begins with targeted prospecting based on ideal customer profiles. For qualification, I use the BANT framework (Budget, Authority, Need, Timeline) to prioritize prospects with highest potential. My discovery process focuses on asking strategic questions to uncover both stated and unstated needs. I then develop tailored solutions that directly address identified challenges, using ROI calculations to demonstrate value. For presentations, I adapt my style to different stakeholder perspectives, addressing both technical and business concerns. When handling objections, I validate the concern before providing a solution. For closing, I use assumptive techniques when signals are positive and alternative choice approaches when decision-makers need a sense of control. This systematic approach helped me exceed my targets by 30% for three consecutive quarters at my previous company."
      },
      {
        question: "Describe your experience with different sales methodologies, and which you find most effective.",
        tips: "Discuss specific methodologies (SPIN, Challenger, Solution Selling, etc.) and why certain approaches work better in specific contexts.",
        sampleAnswer: "I've worked with several methodologies throughout my career. At ABC Corp, I used SPIN Selling (Situation, Problem, Implication, Need-payoff), which works exceptionally well for complex B2B sales requiring deep discovery. At XYZ Tech, I employed Challenger Sale techniques focused on teaching prospects new perspectives about their business. Currently, I use a hybrid approach combining elements of Solution Selling for discovery and Challenger techniques for differentiation. I've found that rigid adherence to a single methodology is less effective than adapting methods to the specific buying process and customer dynamics. For example, with technically sophisticated clients, I lead with educational content and insights (Challenger), while with clients who know their problems but not solutions, I focus more on consultative discovery (SPIN). This flexible approach has helped me consistently achieve 125% of quota throughout changing market conditions."
      },
      {
        question: "How do you build and maintain relationships with clients?",
        tips: "Emphasize long-term relationship building over transactional selling, discussing specific tactics for ongoing value delivery.",
        sampleAnswer: "Relationship building is central to my sales approach. Initial relationships start with thorough research before first contact - understanding the prospect's business challenges, recent company developments, and industry trends. During early interactions, I focus on establishing credibility through industry knowledge rather than product features. After initial sales, I implement a structured relationship program including quarterly business reviews to assess solution performance against objectives, proactive sharing of relevant content and market insights, and staying alert to expansion opportunities. I maintain detailed records of client preferences and concerns in our CRM. At ABC Company, this approach led to 85% client retention and 40% account expansion through referrals and upselling. I've found that relationships thrive on a foundation of authentic interest in client success rather than transaction frequency."
      },
      {
        question: "Tell me about a challenging sale you closed. What made it difficult and how did you succeed?",
        tips: "Choose a relevant example demonstrating perseverance, strategic thinking, and your ability to overcome significant obstacles.",
        sampleAnswer: "At XYZ Corporation, I pursued a major manufacturing client who had been with their previous supplier for over 15 years. The challenges were multi-layered: an entrenched competitor relationship, a complex stakeholder environment with 7 decision-makers across departments, and a procurement policy requiring extensive proof of superiority to justify changing vendors. My approach began with mapping the full decision-making unit and identifying the business pain points each stakeholder experienced. I discovered that while the technical team was satisfied, operations was experiencing significant downtime issues that weren't being addressed. I arranged for our technical specialists to conduct an on-site analysis, quantifying the cost of their current challenges. We then developed a phased implementation proposal that minimized transition risks. The pivotal moment came when I secured internal champions by demonstrating a projected 28% reduction in downtime costs. After a six-month sales cycle, we secured a three-year contract worth R12 million annually, which has since expanded to additional facilities."
      },
      {
        question: "How do you handle objections during the sales process?",
        tips: "Demonstrate your systematic approach to addressing objections, emphasizing listening, validation, and constructive responses.",
        sampleAnswer: "I view objections as valuable opportunities rather than obstacles. My approach follows a consistent framework: First, I listen completely without interrupting to understand the full objection. Then I validate the concern with statements like 'I understand why that would be important to you.' Next, I ask clarifying questions to uncover the real issue behind the objection, as stated objections often mask deeper concerns. Only then do I respond with a relevant solution, using evidence and success stories to support my points. For instance, when selling enterprise software that faced pricing objections, I discovered through exploration that the real concern was implementation risk rather than budget. I pivoted to discussing our phased implementation methodology and shared case studies of similar organizations who had successfully adopted our solution. This approach converted a near-lost sale into our largest deal that quarter. I also document objection patterns to help refine our value proposition and address common concerns proactively in future presentations."
      }
    ],
    behaviouralQuestions: [
      {
        question: "Tell me about a time when you lost a sale. What did you learn from it?",
        tips: "Show your ability to analyze failures objectively and apply lessons to improve future performance.",
        sampleAnswer: "At ABC Company, I was pursuing a major retail client and progressed through multiple positive meetings with the operations team. However, I ultimately lost the deal to a competitor despite offering a superior technical solution. Upon reflection, I realized I had focused too narrowly on my operations department champions without adequately engaging finance stakeholders who had significant influence. The competitor had effectively demonstrated ROI through their finance-oriented presentation format while I had emphasized technical specifications. This experience transformed my approach to enterprise sales - I now map all influential stakeholders early in the process and tailor materials for each group's priorities. I also developed a standardized ROI calculator tool that translates technical benefits into financial terms. Six months later, I applied these lessons when pursuing a similar client, ensuring finance stakeholders were engaged from the first meeting, which resulted in securing a contract nearly twice the size of the opportunity I had lost."
      },
      {
        question: "How do you handle rejection and maintain motivation during difficult sales periods?",
        tips: "Demonstrate resilience, healthy perspective on rejection, and specific strategies for maintaining productivity during challenging times.",
        sampleAnswer: "I've developed a structured approach to handling rejection that keeps me productive through challenging periods. First, I maintain perspective by viewing rejection as feedback on my approach, not a personal failure. I analyze each significant rejection for actionable insights - was my targeting incorrect, my value proposition misaligned, or my timing poor? This analytical approach converts disappointments into learning opportunities. To maintain motivation, I implement a consistent daily routine focused on high-value activities regardless of outcomes. During a particularly challenging quarter when market conditions affected all sales, I increased my prospecting activity by 40% and focused on relationship-building with existing clients, which created a pipeline that delivered results the following quarter. I also use visualization techniques and review past successes as reminders of capability. This resilience-focused mindset helped me achieve 112% of target last year despite an industry downturn that saw average performance drop by 20%."
      },
      {
        question: "Describe a situation where you had to adapt your sales approach to meet the needs of a challenging client.",
        tips: "Highlight your adaptability, customer insight, and willingness to modify your approach when necessary.",
        sampleAnswer: "At XYZ Corporation, I was assigned to a major prospective client who had declined meetings with our company twice before. Through research, I discovered the procurement director had a reputation for being extremely data-driven and skeptical of sales presentations. Rather than requesting a standard meeting, I created a detailed benchmark report comparing their current solution's performance against industry standards, using public information and our internal research team. I sent this with a brief note offering to discuss the findings without any sales agenda. This earned a 30-minute meeting which revealed that the client valued quantitative analysis over relationship-building approaches that had worked with other prospects. I adapted completely, replacing our standard slide deck with spreadsheets and performance data. Throughout the six-month sales cycle, I maintained this evidence-based approach, providing case studies with statistical outcomes rather than testimonials. This tailored method secured a R5 million contract with a client previously considered unwinnable, and has informed how we approach similar analytical stakeholders."
      }
    ],
    technicalQuestions: [
      {
        question: "How do you use CRM systems to manage your sales pipeline effectively?",
        tips: "Demonstrate your systematic approach to pipeline management, forecasting, and leveraging CRM data for sales insights.",
        sampleAnswer: "I use CRM systems as a strategic tool rather than just a reporting mechanism. I maintain rigorous data hygiene, updating opportunity information after every meaningful interaction, which gives me real-time pipeline visibility. I've developed a custom probability scoring system that more accurately reflects our specific sales cycle milestones rather than using default percentage stages. For pipeline management, I use weighted forecasting reports and aging analysis to prioritize opportunities needing attention. I analyze conversion rates between stages to identify process bottlenecks - for instance, at ABC Company, I discovered our proposal-to-negotiation conversion was 20% below other stages, which led to revising our proposal templates with better ROI articulation. I also leverage relationship mapping features to visualize decision-maker connections. On the activity side, I use the CRM to balance prospecting, advancing opportunities, and account management by setting weekly activity goals in each category. This disciplined approach has resulted in 95% forecast accuracy over the past year, compared to the team average of 70%."
      },
      {
        question: "What negotiation strategies do you use when facing price pressure from clients?",
        tips: "Discuss value-based selling, understanding the buyer's constraints, bundling approaches, and non-price negotiation tactics.",
        sampleAnswer: "When facing price pressure, I focus on value preservation rather than defaulting to discounting. First, I work to understand the nature of the price objection - whether it's budget constraints, perceived value gaps, or competitive positioning. For budget issues, I explore flexible payment terms or phased implementation rather than reducing overall value. I use value-reinforcement techniques, quantifying the ROI and cost of inaction to reframe the investment perspective. If concessions are necessary, I practice trading rather than giving - offering a discount only in exchange for something valuable like a longer contract term, reference rights, or volume commitments. I also employ unbundling strategies when appropriate, creating good-better-best options that maintain margin on core elements. At XYZ Company, my approach to negotiation resulted in average discounting 45% lower than team averages while maintaining a competitive close rate. In one notable case, I maintained full pricing by restructuring payment timing to meet the client's budget cycle constraints, which preserved R350,000 in annual revenue compared to the discount they initially requested."
      },
      {
        question: "How do you conduct an effective needs analysis with a prospect?",
        tips: "Walk through your discovery process, questioning techniques, active listening approaches, and how you validate identified needs.",
        sampleAnswer: "My needs analysis process focuses on uncovering both explicit and implicit requirements through a structured discovery approach. I begin with preparation, researching the company's industry position, recent initiatives, and public challenges. For the discovery conversation, I use a funnel approach starting with broader questions about business objectives before narrowing to specific challenges. I employ the SPIN methodology (Situation, Problem, Implication, Need-payoff) to help the prospect articulate the impact of their challenges. Active listening is crucial - I practice clarification techniques, summarizing what I've heard to confirm understanding. I pay particular attention to emotional cues that often reveal unstated priorities. To ensure comprehensive discovery, I engage multiple stakeholders with role-appropriate questions, as technical users often have different concerns than economic buyers. After discovery, I document and validate my understanding by sending a summary of identified needs, which both confirms accuracy and demonstrates attentiveness. This thorough approach at ABC Corporation resulted in 35% higher solution adoption rates than the company average, as our implementations more precisely addressed actual client requirements."
      }
    ],
    saContext: [
      {
        question: "How do you adapt your sales approach to different cultural contexts across South Africa's diverse business environment?",
        tips: "Discuss cultural intelligence, relationship-building variations, and communication style adaptations across South African business cultures.",
        sampleAnswer: "South Africa's business landscape requires careful cultural navigation beyond just language differences. I've developed a culturally-adaptive approach that recognizes distinct business cultures across our diverse environment. In traditional Afrikaans business settings, I've found that establishing credibility and respect through more formal interactions precedes relationship development. In many African business contexts, I allocate more time for relationship-building before transitioning to business discussions, recognizing that trust is a prerequisite rather than a byproduct of business relationships. Communication styles also require adaptation - direct communication approaches effective in urban corporate settings may be perceived as disrespectful in more traditional contexts where indirect communication and respect for hierarchy are valued. I pay particular attention to temporal perspectives - some business cultures prioritize punctuality and rapid decisions, while others take a more deliberate approach to relationships and decisions. This cultural adaptability helped me successfully establish relationships across five provinces with widely varying business cultures, ultimately exceeding regional targets by 30% through appropriate localization of my sales approach."
      },
      {
        question: "How do you incorporate B-BBEE considerations into your sales approach when working with South African businesses?",
        tips: "Address procurement scoring impacts, supplier development opportunities, and alignment with clients' transformation goals.",
        sampleAnswer: "B-BBEE considerations are integral to the sales process when working with both public and private sectors in South Africa. I begin by understanding each organization's specific procurement scoring methodology and transformation objectives beyond compliance. For public sector and SOE prospects, I collaborate with our compliance team to develop bid documentation that clearly articulates our B-BBEE contribution. For private sector clients, I position our B-BBEE credentials in terms of how they help meet the client's own scorecard objectives, particularly around preferential procurement points. Beyond compliance elements, I identify opportunities to align with clients' enterprise and supplier development initiatives, which often creates higher-value partnerships beyond the immediate transaction. At ABC Corporation, I developed a value proposition specifically highlighting how our level 2 B-BBEE status would improve clients' preferential procurement scores, which became a significant competitive advantage. In one major account, our transformation alignment resulted in a partnership that included both our core offering and participation in their supplier development program, increasing the contract value by 40%."
      },
      {
        question: "How do you adjust your sales strategy to address South Africa's economic challenges and regional business disparities?",
        tips: "Discuss approaches to economic volatility, geographic market differences, and solutions aligned with South African business constraints.",
        sampleAnswer: "South Africa's complex economic environment requires strategic adaptations across different regions and market segments. I develop regionally-tailored value propositions that address specific economic conditions - in economically constrained regions, I emphasize cost efficiency and essential functionality, while in more developed business centers, innovation and competitive advantage often resonate more strongly. Given currency volatility, I've developed flexible pricing models including ZAR-fixed options that remove exchange rate uncertainty for clients, which has been a significant advantage when competing against international alternatives. For businesses facing cash flow constraints, I collaborate with our finance team to create payment structures aligned with South African business cycles and budgeting processes. I also adapt ROI timelines based on regional business realities - while Johannesburg enterprises might focus on aggressive growth metrics, businesses in developing regions often prioritize stability and gradual expansion. This nuanced approach helped me exceed targets in the Eastern Cape region, traditionally considered a challenging market, by developing solutions specifically addressing regional business constraints around infrastructure and skilled resource limitations."
      }
    ]
  }
};

// Common interview preparation tips
const generalInterviewTips = [
  {
    title: "Research the Company Thoroughly",
    description: "Go beyond the company website. Research recent news, leadership changes, competitors, and industry challenges specific to South Africa."
  },
  {
    title: "Prepare for South African Context Questions",
    description: "Be ready to discuss how regulatory frameworks like B-BBEE, NQF qualifications, and local market conditions relate to your role."
  },
  {
    title: "Practice the STAR Method",
    description: "Structure answers to behavioral questions using Situation, Task, Action, and Result to create compelling, concise responses."
  },
  {
    title: "Prepare Questions to Ask",
    description: "Develop thoughtful questions about the company's strategy, team culture, and growth opportunities that demonstrate your genuine interest."
  },
  {
    title: "Analyze the Job Description",
    description: "Identify key requirements and prepare examples that demonstrate your relevant experience for each major responsibility."
  },
  {
    title: "Understand Salary Expectations",
    description: "Research market rates for your role in South Africa, considering factors like location, company size, and industry sector."
  },
  {
    title: "Practice Virtual Interview Etiquette",
    description: "If interviewing remotely, test your technology, ensure a professional background, and practice looking at the camera rather than the screen."
  },
  {
    title: "Prepare for Technical Assessments",
    description: "Many South African employers use practical assessments. Practice relevant technical skills and prepare examples of your work."
  }
];

const InterviewGuidePage = () => {
  const { toast } = useToast();
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Copy answer to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Answer copied successfully",
    });
  };
  
  // Filter questions based on search query
  const filterQuestions = (questions: any[]) => {
    if (!searchQuery) return questions;
    
    return questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.sampleAnswer?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  // Get current job type data
  const getCurrentJobData = () => {
    if (!selectedJobType) return null;
    return interviewQuestions[selectedJobType as keyof typeof interviewQuestions];
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Interview Guide | ATSBoost</title>
        <meta name="description" content="Prepare for job interviews with our comprehensive guide featuring common questions, sample answers, and tips tailored for South African job seekers." />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">South African Interview Guide</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Prepare for job interviews with sample questions, expert answers, and South African context-specific guidance
        </p>
      </div>
      
      {!selectedJobType ? (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Select a Job Type</CardTitle>
              <CardDescription>
                Choose your target job role to see tailored interview questions and answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(interviewQuestions).map(([id, data]) => (
                  <Card 
                    key={id} 
                    className="cursor-pointer hover:border-amber-300 transition-colors"
                    onClick={() => setSelectedJobType(id)}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4">
                        {id === "software-developer" && <Brain className="h-8 w-8 text-blue-500" />}
                        {id === "financial-analyst" && <FilePieChart className="h-8 w-8 text-green-500" />}
                        {id === "marketing-specialist" && <Award className="h-8 w-8 text-purple-500" />}
                        {id === "sales-representative" && <MessageCircle className="h-8 w-8 text-amber-500" />}
                      </div>
                      <h3 className="font-medium text-lg mb-2">{data.title}</h3>
                      <p className="text-sm text-muted-foreground">{data.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">General Interview Preparation Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generalInterviewTips.map((tip, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-medium text-lg mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Key South African Interview Considerations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-blue-50">
                <h3 className="font-medium mb-2 flex items-center">
                  <Book className="h-5 w-5 text-blue-500 mr-2" />
                  Professional Designations and Qualifications
                </h3>
                <p className="text-sm">
                  Be prepared to discuss your qualifications in terms of NQF (National Qualifications Framework) levels. 
                  For professional roles, membership in appropriate South African professional bodies is often expected 
                  and should be highlighted.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-blue-50">
                <h3 className="font-medium mb-2 flex items-center">
                  <Award className="h-5 w-5 text-blue-500 mr-2" />
                  B-BBEE and Transformation
                </h3>
                <p className="text-sm">
                  Understanding B-BBEE (Broad-Based Black Economic Empowerment) is important, especially for management roles. 
                  Companies may ask about your experience with transformation initiatives and diversity promotion.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-blue-50">
                <h3 className="font-medium mb-2 flex items-center">
                  <MessageCircle className="h-5 w-5 text-blue-500 mr-2" />
                  Cultural Awareness
                </h3>
                <p className="text-sm">
                  South Africa's multicultural environment values candidates who demonstrate cultural awareness and sensitivity. 
                  Experience working with diverse teams and in multicultural environments is often highly regarded.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setSelectedJobType(null)}>
              Back to Job Types
            </Button>
            <div className="text-2xl font-bold">{getCurrentJobData()?.title} Interview Guide</div>
            <div className="w-[100px]"></div> {/* Empty div for flex alignment */}
          </div>
          
          <div className="relative w-full max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search questions or answers..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="common">
            <TabsList className="w-full justify-start mb-4 overflow-x-auto">
              <TabsTrigger value="common">Common Questions</TabsTrigger>
              <TabsTrigger value="behavioural">Behavioural</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="saContext">South African Context</TabsTrigger>
            </TabsList>
            
            <TabsContent value="common">
              <Accordion type="single" collapsible className="space-y-4">
                {filterQuestions(getCurrentJobData()?.commonQuestions || []).map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium flex items-center">
                            <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                            Interview Tips
                          </h4>
                        </div>
                        <p className="text-sm mt-1">{item.tips}</p>
                      </div>
                      
                      <div className="relative">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium flex items-center">
                              <Check className="h-4 w-4 text-blue-500 mr-2" />
                              Sample Answer
                            </h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2"
                              onClick={() => copyToClipboard(item.sampleAnswer)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <p className="text-sm mt-2">{item.sampleAnswer}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                
                {filterQuestions(getCurrentJobData()?.commonQuestions || []).length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No questions found</h3>
                    <p className="text-muted-foreground">Try a different search term</p>
                  </div>
                )}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="behavioural">
              <Accordion type="single" collapsible className="space-y-4">
                {filterQuestions(getCurrentJobData()?.behaviouralQuestions || []).map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium flex items-center">
                            <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                            Interview Tips
                          </h4>
                        </div>
                        <p className="text-sm mt-1">{item.tips}</p>
                      </div>
                      
                      <div className="relative">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium flex items-center">
                              <Check className="h-4 w-4 text-blue-500 mr-2" />
                              Sample Answer
                            </h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2"
                              onClick={() => copyToClipboard(item.sampleAnswer)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <p className="text-sm mt-2">{item.sampleAnswer}</p>
                        </div>
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Using the STAR Method</AlertTitle>
                        <AlertDescription className="text-xs">
                          Remember to structure your behavioral answers using the STAR method: Situation, Task, Action, and Result. This helps create a clear, compelling narrative.
                        </AlertDescription>
                      </Alert>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                
                {filterQuestions(getCurrentJobData()?.behaviouralQuestions || []).length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No questions found</h3>
                    <p className="text-muted-foreground">Try a different search term</p>
                  </div>
                )}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="technical">
              <Accordion type="single" collapsible className="space-y-4">
                {filterQuestions(getCurrentJobData()?.technicalQuestions || []).map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium flex items-center">
                            <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                            Interview Tips
                          </h4>
                        </div>
                        <p className="text-sm mt-1">{item.tips}</p>
                      </div>
                      
                      <div className="relative">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium flex items-center">
                              <Check className="h-4 w-4 text-blue-500 mr-2" />
                              Sample Answer
                            </h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2"
                              onClick={() => copyToClipboard(item.sampleAnswer)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <p className="text-sm mt-2">{item.sampleAnswer}</p>
                        </div>
                      </div>
                      
                      <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                        <MessageCircle className="h-4 w-4" />
                        <AlertTitle>Technical Accuracy</AlertTitle>
                        <AlertDescription className="text-xs">
                          While these sample answers demonstrate structure and depth, make sure to customize with your actual technical knowledge and experiences.
                        </AlertDescription>
                      </Alert>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                
                {filterQuestions(getCurrentJobData()?.technicalQuestions || []).length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No questions found</h3>
                    <p className="text-muted-foreground">Try a different search term</p>
                  </div>
                )}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="saContext">
              <Accordion type="single" collapsible className="space-y-4">
                {filterQuestions(getCurrentJobData()?.saContext || []).map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium flex items-center">
                            <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                            Interview Tips
                          </h4>
                        </div>
                        <p className="text-sm mt-1">{item.tips}</p>
                      </div>
                      
                      <div className="relative">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium flex items-center">
                              <Check className="h-4 w-4 text-blue-500 mr-2" />
                              Sample Answer
                            </h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2"
                              onClick={() => copyToClipboard(item.sampleAnswer)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <p className="text-sm mt-2">{item.sampleAnswer}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-green-50">
                        <h4 className="text-sm font-medium flex items-center text-green-800">
                          <Clock className="h-4 w-4 text-green-500 mr-2" />
                          South African Context
                        </h4>
                        <p className="text-xs text-green-800 mt-2">
                          Questions about South African business contexts show your understanding of local market dynamics, regulatory frameworks, and cultural considerations, which are highly valued by employers.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                
                {filterQuestions(getCurrentJobData()?.saContext || []).length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No questions found</h3>
                    <p className="text-muted-foreground">Try a different search term</p>
                  </div>
                )}
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default InterviewGuidePage;