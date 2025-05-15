/**
 * AI-Powered Job Interview Simulation Service
 * 
 * This service provides interview simulation capabilities:
 * - Generate tailored interview questions based on job descriptions and CV
 * - Evaluate user answers using AI
 * - Provide feedback and improvement suggestions
 * - Support different interview types (behavioral, technical, etc.)
 */

// @ts-check

import OpenAI from "openai";
import { log } from '../vite';
import { JobPosting } from './jobBoardService';

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const INTERVIEW_CONFIG = {
  MODEL: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
  MAX_TOKENS: 2000,
  TEMPERATURE: {
    QUESTIONS: 0.7, // More creative for generating diverse questions
    EVALUATION: 0.2, // More consistent for evaluations
    FEEDBACK: 0.4, // Balance between consistency and creativity for feedback
  },
  MAX_QUESTIONS: 15, // Maximum number of questions to generate
  DEFAULT_QUESTIONS: 5, // Default number of questions
};

// Types for interview data
export type InterviewType = 
  | 'general'      // General interview questions
  | 'behavioral'   // Behavioral questions (STAR method)
  | 'technical'    // Technical questions specific to job
  | 'situational'  // Situational judgment questions
  | 'cultural'     // Company culture fit questions
  | 'panel'        // Simulated panel interview
  | 'stress'       // Stress interview with tough questions 
  | 'competency';  // Competency-based questions

export interface InterviewQuestion {
  id: string;
  text: string;
  type: InterviewType;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedTopics?: string[]; // Topics the answer should cover
  timeLimit?: number; // Suggested time limit in seconds
  followUpQuestions?: string[]; // Potential follow-up questions
}

export interface InterviewEvaluation {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  missingTopics?: string[]; // Key topics that weren't addressed
  keyPoints?: {
    addressed: string[];
    missed: string[];
  };
  overallFeedback: string;
}

export interface InterviewSession {
  id: string;
  jobTitle?: string; 
  jobDescription?: string;
  questions: InterviewQuestion[];
  userAnswers: Record<string, string>; // Question ID -> User's answer
  evaluations: Record<string, InterviewEvaluation>; // Question ID -> Evaluation
  overallScore?: number; // Overall session score
  overallFeedback?: string; // Overall session feedback
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Generate interview questions based on job description, CV content, and preferences
 * 
 * @param jobDescription The job description
 * @param cvContent The user's CV content
 * @param options Generation options
 * @returns List of interview questions
 */
export async function generateInterviewQuestions(
  jobDescription: string,
  cvContent: string,
  options: {
    type?: InterviewType;
    count?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    industry?: string;
    role?: string;
  } = {}
): Promise<InterviewQuestion[]> {
  const {
    type = 'general',
    count = INTERVIEW_CONFIG.DEFAULT_QUESTIONS,
    difficulty = 'mixed',
    industry,
    role,
  } = options;

  // Limit question count to prevent abuse
  const questionCount = Math.min(count, INTERVIEW_CONFIG.MAX_QUESTIONS);
  
  // Prepare the prompt
  const prompt = `Generate ${questionCount} realistic ${type} interview questions for a South African job seeker applying for a position with this job description:

${jobDescription}

The candidate's CV includes:
${cvContent.substring(0, 1000)}${cvContent.length > 1000 ? '...' : ''}

${industry ? `The industry is: ${industry}` : ''}
${role ? `The specific role is: ${role}` : ''}

The questions should be of ${difficulty} difficulty.

For each question:
1. Provide the main question
2. Suggest 2-3 follow-up questions the interviewer might ask
3. List key topics/points a good answer should address
4. Indicate difficulty level ('easy', 'medium', or 'hard')
5. Suggest a time limit for answering (in seconds)

Focus on questions relevant to the South African job market, including:
- Questions about B-BBEE understanding if relevant
- Knowledge of local industry regulations
- South African workplace norms and culture
- Relevant South African certifications or qualifications

Return ONLY a JSON array of question objects. Each object should have:
- id: a unique identifier (string)
- text: the main question (string)
- type: the question type (string)
- difficulty: 'easy', 'medium', or 'hard' (string)
- expectedTopics: array of topics a good answer should cover (array of strings)
- timeLimit: suggested time limit in seconds (number)
- followUpQuestions: array of potential follow-up questions (array of strings)`;

  try {
    const response = await openai.chat.completions.create({
      model: INTERVIEW_CONFIG.MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert South African job interview coach specializing in creating realistic interview questions tailored to job descriptions and candidate CVs."
        },
        { role: "user", content: prompt }
      ],
      temperature: INTERVIEW_CONFIG.TEMPERATURE.QUESTIONS,
      max_tokens: INTERVIEW_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate interview questions: Empty response");
    }

    // Parse and validate questions
    const parsedData = JSON.parse(content);
    const questions = Array.isArray(parsedData.questions) ? parsedData.questions : 
                     (Array.isArray(parsedData) ? parsedData : []);

    // Ensure each question has required fields
    return questions.map((q: any, index: number) => ({
      id: q.id || `q-${Date.now()}-${index}`,
      text: q.text || `Question ${index + 1}`,
      type: q.type || type,
      difficulty: q.difficulty || 'medium',
      expectedTopics: Array.isArray(q.expectedTopics) ? q.expectedTopics : [],
      timeLimit: typeof q.timeLimit === 'number' ? q.timeLimit : 120,
      followUpQuestions: Array.isArray(q.followUpQuestions) ? q.followUpQuestions : [],
    }));
  } catch (error) {
    log(`Error generating interview questions: ${error instanceof Error ? error.message : String(error)}`, 'interview');
    // Return a simple fallback question set
    return createFallbackQuestions(type, questionCount);
  }
}

/**
 * Create fallback questions if API call fails
 */
function createFallbackQuestions(type: InterviewType, count: number): InterviewQuestion[] {
  const fallbackQuestions: Record<InterviewType, string[]> = {
    general: [
      "Tell me about yourself and your career journey so far.",
      "What are your key strengths and how do they relate to this role?",
      "Where do you see yourself in 5 years?",
      "Why do you want to work for our company?",
      "Describe your ideal work environment."
    ],
    behavioral: [
      "Tell me about a time you faced a significant challenge at work. How did you overcome it?",
      "Describe a situation where you had to work as part of a team to solve a problem.",
      "Give an example of a time you had to meet a tight deadline.",
      "Tell me about a time you had a conflict with a colleague. How did you resolve it?",
      "Describe a situation where you had to learn a new skill quickly."
    ],
    technical: [
      "What technical skills do you bring to this role?",
      "How do you stay updated with the latest developments in your field?",
      "Describe a technical problem you solved recently.",
      "What technical tools or software are you most proficient with?",
      "How do you approach learning new technical skills?"
    ],
    situational: [
      "How would you handle a situation where you're given conflicting instructions?",
      "What would you do if you disagreed with a decision your manager made?",
      "How would you prioritize multiple urgent tasks?",
      "What would you do if a team member wasn't contributing their fair share?",
      "How would you handle a client who changed requirements midway through a project?"
    ],
    cultural: [
      "What type of company culture do you thrive in?",
      "How do you contribute to a positive workplace culture?",
      "Describe your ideal relationship with your manager.",
      "How do you handle workplace diversity and inclusion?",
      "What values are most important to you in a workplace?"
    ],
    panel: [
      "How do you adjust your communication style when speaking to different stakeholders?",
      "Tell us about a project you're particularly proud of.",
      "How do you handle feedback from multiple sources that might conflict?",
      "What unique perspective would you bring to our team?",
      "How do you prepare for important meetings or presentations?"
    ],
    stress: [
      "Tell me about your biggest failure and what you learned from it.",
      "What would your critics say about you?",
      "How do you handle high-pressure situations?",
      "What's the most difficult decision you've had to make professionally?",
      "How do you respond to unexpected changes or crises?"
    ],
    competency: [
      "Give an example that demonstrates your problem-solving abilities.",
      "Describe how you organize and plan for major projects.",
      "Tell me about a time you had to make a decision with incomplete information.",
      "How do you approach continuous learning and development?",
      "Describe a situation that demonstrates your leadership abilities."
    ]
  };

  // Get questions for the requested type
  const questions = fallbackQuestions[type] || fallbackQuestions.general;
  
  // Generate the requested number of questions
  return questions.slice(0, count).map((text, index) => ({
    id: `fallback-${Date.now()}-${index}`,
    text,
    type,
    difficulty: 'medium',
    expectedTopics: [],
    timeLimit: 120,
    followUpQuestions: []
  }));
}

/**
 * Evaluate a user's answer to an interview question
 * 
 * @param question The interview question
 * @param answer The user's answer
 * @param jobDescription Optional job description for context
 * @returns Evaluation of the answer
 */
export async function evaluateAnswer(
  question: InterviewQuestion,
  answer: string,
  jobDescription?: string
): Promise<InterviewEvaluation> {
  const prompt = `Evaluate this interview answer for a South African job seeker.

Question: ${question.text}

${question.expectedTopics?.length ? `Topics the answer should cover:
${question.expectedTopics.join(', ')}` : ''}

${jobDescription ? `Job Description:
${jobDescription.substring(0, 500)}${jobDescription.length > 500 ? '...' : ''}` : ''}

The user's answer:
${answer}

Provide a detailed, constructive evaluation including:
1. A score from 0-100
2. At least 3 specific strengths of the answer
3. At least 3 specific areas for improvement
4. Specific tips to make the answer more compelling
5. Any key topics that were missed
6. Overall feedback with actionable advice

Consider South African context where appropriate (local industry knowledge, B-BBEE awareness, cultural aspects, etc.)

Provide your evaluation in JSON format with these fields:
- score: number from 0-100
- strengths: array of strings
- weaknesses: array of strings
- improvementTips: array of strings
- missingTopics: array of strings (topics from expectedTopics that weren't addressed)
- keyPoints: object with "addressed" and "missed" arrays of strings
- overallFeedback: detailed feedback string`;

  try {
    const response = await openai.chat.completions.create({
      model: INTERVIEW_CONFIG.MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert South African job interview coach specializing in evaluating interview answers and providing constructive feedback."
        },
        { role: "user", content: prompt }
      ],
      temperature: INTERVIEW_CONFIG.TEMPERATURE.EVALUATION,
      max_tokens: INTERVIEW_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to evaluate answer: Empty response");
    }

    const evaluation = JSON.parse(content);
    
    // Validate and sanitize the evaluation
    return {
      score: typeof evaluation.score === 'number' ? 
        Math.min(100, Math.max(0, evaluation.score)) : 50,
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
      weaknesses: Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : [],
      improvementTips: Array.isArray(evaluation.improvementTips) ? evaluation.improvementTips : [],
      missingTopics: Array.isArray(evaluation.missingTopics) ? evaluation.missingTopics : [],
      keyPoints: {
        addressed: Array.isArray(evaluation.keyPoints?.addressed) ? evaluation.keyPoints.addressed : [],
        missed: Array.isArray(evaluation.keyPoints?.missed) ? evaluation.keyPoints.missed : []
      },
      overallFeedback: evaluation.overallFeedback || 'No feedback provided'
    };
  } catch (error) {
    log(`Error evaluating answer: ${error instanceof Error ? error.message : String(error)}`, 'interview');
    // Return a basic evaluation
    return {
      score: 50,
      strengths: ["Your answer addressed the question"],
      weaknesses: ["The answer could be more detailed"],
      improvementTips: ["Consider using the STAR method for structured responses"],
      overallFeedback: "We couldn't process a detailed evaluation. Please try again or contact support if the issue persists."
    };
  }
}

/**
 * Generate overall feedback for an entire interview session
 * 
 * @param session The completed interview session
 * @returns Updated session with overall feedback
 */
export async function generateSessionFeedback(
  session: InterviewSession
): Promise<InterviewSession> {
  // Check if we have evaluations to provide feedback on
  const evaluationCount = Object.keys(session.evaluations).length;
  if (evaluationCount === 0) {
    return {
      ...session,
      overallScore: 0,
      overallFeedback: "No question evaluations available to generate feedback."
    };
  }

  // Calculate average score
  const totalScore = Object.values(session.evaluations)
    .reduce((sum, eval_) => sum + eval_.score, 0);
  const averageScore = Math.round(totalScore / evaluationCount);

  // For small sessions, we can generate simple feedback without API call
  if (evaluationCount <= 2) {
    const allStrengths = Object.values(session.evaluations)
      .flatMap(eval_ => eval_.strengths);
    const allWeaknesses = Object.values(session.evaluations)
      .flatMap(eval_ => eval_.weaknesses);
    
    return {
      ...session,
      overallScore: averageScore,
      overallFeedback: `Overall Score: ${averageScore}/100. Key strengths include: ${allStrengths.slice(0, 3).join(', ')}. Areas to improve: ${allWeaknesses.slice(0, 3).join(', ')}.`
    };
  }

  // For more complex sessions, generate comprehensive feedback
  try {
    // Prepare a summary of the session for the API
    const sessionSummary = {
      jobTitle: session.jobTitle || 'Unspecified position',
      questionCount: evaluationCount,
      averageScore,
      questions: Object.keys(session.evaluations).map(questionId => {
        const question = session.questions.find(q => q.id === questionId);
        const evaluation = session.evaluations[questionId];
        
        return {
          question: question?.text || 'Unknown question',
          score: evaluation.score,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses
        };
      })
    };

    const prompt = `Generate comprehensive feedback for this completed interview session:
${JSON.stringify(sessionSummary, null, 2)}

Provide detailed overall feedback including:
1. Overall assessment of interview performance
2. 3-5 major strengths demonstrated across the interview
3. 3-5 key areas for improvement
4. Specific recommendations for future interviews
5. How well the candidate demonstrated fit for the position

Focus on actionable advice specifically relevant to the South African job market.

Provide your feedback in JSON format with:
- overallAssessment: string with general feedback
- majorStrengths: array of strings
- keyAreasForImprovement: array of strings
- specificRecommendations: array of strings
- fitAssessment: string assessing position fit
- finalAdvice: string with most important takeaway`;

    const response = await openai.chat.completions.create({
      model: INTERVIEW_CONFIG.MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert South African job interview coach specializing in providing comprehensive interview feedback and career advice."
        },
        { role: "user", content: prompt }
      ],
      temperature: INTERVIEW_CONFIG.TEMPERATURE.FEEDBACK,
      max_tokens: INTERVIEW_CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate session feedback: Empty response");
    }

    const feedback = JSON.parse(content);
    
    // Format feedback into a readable string
    const formattedFeedback = `
# Interview Performance Review

## Overall Assessment
${feedback.overallAssessment || 'Your overall interview performance was satisfactory.'}

## Major Strengths
${Array.isArray(feedback.majorStrengths) ? 
  feedback.majorStrengths.map((s: string) => `- ${s}`).join('\n') : 
  '- No specific strengths identified.'}

## Areas for Improvement
${Array.isArray(feedback.keyAreasForImprovement) ? 
  feedback.keyAreasForImprovement.map((s: string) => `- ${s}`).join('\n') : 
  '- No specific improvement areas identified.'}

## Recommendations
${Array.isArray(feedback.specificRecommendations) ? 
  feedback.specificRecommendations.map((s: string) => `- ${s}`).join('\n') : 
  '- No specific recommendations available.'}

## Position Fit
${feedback.fitAssessment || 'Your fit for the position could not be fully assessed.'}

## Final Advice
${feedback.finalAdvice || 'Continue practicing your interview skills and tailoring responses to specific job requirements.'}
`;

    return {
      ...session,
      overallScore: averageScore,
      overallFeedback: formattedFeedback,
      completedAt: new Date()
    };
  } catch (error) {
    log(`Error generating session feedback: ${error instanceof Error ? error.message : String(error)}`, 'interview');
    // Return basic feedback as fallback
    return {
      ...session,
      overallScore: averageScore,
      overallFeedback: `Overall interview score: ${averageScore}/100. The system couldn't generate detailed feedback. Please try again later.`,
      completedAt: new Date()
    };
  }
}

/**
 * Create a new interview session
 * 
 * @param jobDescription The job description
 * @param cvContent The user's CV content
 * @param options Interview options
 * @returns New interview session
 */
export async function createInterviewSession(
  jobDescription: string,
  cvContent: string,
  options: {
    jobTitle?: string;
    type?: InterviewType;
    questionCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    industry?: string;
    role?: string;
  } = {}
): Promise<InterviewSession> {
  // Generate questions
  const questions = await generateInterviewQuestions(
    jobDescription,
    cvContent,
    {
      type: options.type,
      count: options.questionCount,
      difficulty: options.difficulty,
      industry: options.industry,
      role: options.role
    }
  );

  // Create new session
  return {
    id: `session-${Date.now()}`,
    jobTitle: options.jobTitle,
    jobDescription,
    questions,
    userAnswers: {},
    evaluations: {},
    createdAt: new Date()
  };
}

/**
 * Add a user's answer to an interview session and evaluate it
 * 
 * @param session The current interview session
 * @param questionId The ID of the question being answered
 * @param answer The user's answer
 * @returns Updated interview session with answer and evaluation
 */
export async function answerQuestion(
  session: InterviewSession,
  questionId: string,
  answer: string
): Promise<InterviewSession> {
  // Find the question
  const question = session.questions.find(q => q.id === questionId);
  if (!question) {
    throw new Error(`Question with ID ${questionId} not found in session`);
  }

  // Store the answer
  const updatedAnswers = {
    ...session.userAnswers,
    [questionId]: answer
  };

  // Evaluate the answer
  const evaluation = await evaluateAnswer(
    question,
    answer,
    session.jobDescription
  );

  // Update evaluations
  const updatedEvaluations = {
    ...session.evaluations,
    [questionId]: evaluation
  };

  // Update session
  return {
    ...session,
    userAnswers: updatedAnswers,
    evaluations: updatedEvaluations
  };
}

/**
 * Complete an interview session by generating overall feedback
 * 
 * @param session The current interview session
 * @returns Completed interview session with overall feedback
 */
export async function completeSession(
  session: InterviewSession
): Promise<InterviewSession> {
  // Check if all questions have been answered
  const answeredQuestions = Object.keys(session.userAnswers).length;
  
  if (answeredQuestions === 0) {
    throw new Error("Cannot complete session: No questions have been answered");
  }

  // Generate overall feedback
  const completedSession = await generateSessionFeedback(session);
  
  return completedSession;
}

/**
 * Generate interview questions based on a job posting
 * 
 * @param jobPosting The job posting data
 * @param cvContent The user's CV content
 * @param options Interview options
 * @returns List of interview questions
 */
export async function generateQuestionsFromJobPosting(
  jobPosting: JobPosting,
  cvContent: string,
  options: {
    type?: InterviewType;
    count?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  } = {}
): Promise<InterviewQuestion[]> {
  // Extract job description from posting
  const jobDescription = `
Job Title: ${jobPosting.title}
Company: ${jobPosting.company}
Location: ${jobPosting.location}
Industry: ${jobPosting.industry}
Job Type: ${jobPosting.jobType}
Experience Level: ${jobPosting.experienceLevel}
Description: ${jobPosting.description}
Requirements: ${jobPosting.requirements.join(', ')}
Skills: ${jobPosting.skills.join(', ')}
  `;

  // Generate questions
  return generateInterviewQuestions(
    jobDescription,
    cvContent,
    {
      type: options.type,
      count: options.count,
      difficulty: options.difficulty,
      industry: jobPosting.industry,
      role: jobPosting.title
    }
  );
}

/**
 * Create a new interview session based on a job posting
 * 
 * @param jobPosting The job posting data
 * @param cvContent The user's CV content
 * @param options Interview options
 * @returns New interview session
 */
export async function createSessionFromJobPosting(
  jobPosting: JobPosting,
  cvContent: string,
  options: {
    type?: InterviewType;
    questionCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  } = {}
): Promise<InterviewSession> {
  // Extract job description from posting
  const jobDescription = `
Job Title: ${jobPosting.title}
Company: ${jobPosting.company}
Location: ${jobPosting.location}
Industry: ${jobPosting.industry}
Job Type: ${jobPosting.jobType}
Experience Level: ${jobPosting.experienceLevel}
Description: ${jobPosting.description}
Requirements: ${jobPosting.requirements.join(', ')}
Skills: ${jobPosting.skills.join(', ')}
  `;

  // Create session
  return createInterviewSession(
    jobDescription,
    cvContent,
    {
      jobTitle: jobPosting.title,
      type: options.type,
      questionCount: options.questionCount,
      difficulty: options.difficulty,
      industry: jobPosting.industry,
      role: jobPosting.title
    }
  );
}