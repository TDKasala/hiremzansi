import { db } from "../db";
import { randomUUID } from "crypto";
import OpenAI from "openai";

// Initialize xAI (primary) and OpenAI (fallback)
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Types for interview simulations
export interface InterviewQuestion {
  id: string;
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedTopics?: string[];
  timeLimit?: number;
  followUpQuestions?: string[];
}

export interface InterviewEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  missingTopics?: string[];
  keyPoints?: {
    addressed: string[];
    missed: string[];
  };
  overallFeedback: string;
}

export interface InterviewSession {
  id: string;
  userId: number;
  jobTitle?: string;
  jobDescription?: string;
  questions: InterviewQuestion[];
  userAnswers: Record<string, string>;
  evaluations: Record<string, InterviewEvaluation>;
  overallScore?: number;
  overallFeedback?: string;
  createdAt: string;
  completedAt?: string;
}

interface InterviewParams {
  jobTitle?: string;
  jobDescription: string;
  cvContent: string;
  type?: string;
  questionCount?: number;
  difficulty?: string;
}

// Template questions for fallback
const behavioralQuestionTemplates = [
  "Tell me about a time when you had to work under pressure.",
  "Describe a situation where you had to work with a difficult team member.",
  "Give me an example of a goal you reached and tell me how you achieved it.",
  "Tell me about a time you made a mistake. How did you handle it?",
  "Describe a time when you had to adapt to a significant change at work."
];

const technicalQuestionTemplates = [
  "What are your strongest technical skills and how have you applied them?",
  "Describe a challenging technical problem you solved recently.",
  "How do you stay updated with the latest technologies in your field?",
  "Walk me through your approach to debugging a complex issue.",
  "What tools and technologies do you prefer to work with and why?"
];

const situationalQuestionTemplates = [
  "How would you handle a situation where you disagree with your supervisor?",
  "What would you do if you were assigned a task you've never done before?",
  "How would you prioritize multiple urgent deadlines?",
  "What would you do if you noticed a colleague wasn't pulling their weight?",
  "How would you handle receiving constructive criticism?"
];

export class InterviewSimulationService {
  // Generate interview questions based on job description and CV
  async generateQuestions(params: InterviewParams): Promise<InterviewQuestion[]> {
    try {
      // Prepare the prompt
      const systemPrompt = `You are an expert interview coach specializing in helping job seekers prepare for interviews in South Africa. 
Your task is to create realistic interview questions based on the job description and CV provided.

Generate ${params.questionCount || 5} questions that would likely be asked in a real interview for this position.
The interview type is: ${params.type || 'general'}.
The difficulty level should be: ${params.difficulty || 'mixed'}.

For each question, provide:
1. A clear and specific question text
2. The question type (behavioral, technical, situational, competency-based, etc.)
3. The difficulty (easy, medium, hard)
4. Expected topics the candidate should cover
5. A reasonable time limit for answering (in seconds)
6. Optional follow-up questions an interviewer might ask

Format your response as a JSON object with the following structure:
{
  "questions": [
    {
      "id": "unique-id-1",
      "text": "The interview question text",
      "type": "behavioral|technical|situational|cultural|competency",
      "difficulty": "easy|medium|hard",
      "expectedTopics": ["topic1", "topic2", "topic3"],
      "timeLimit": 120,
      "followUpQuestions": ["Follow-up question 1", "Follow-up question 2"]
    }
  ]
}`;

      const userPrompt = `Job Title: ${params.jobTitle || 'Not specified'}
Job Description:
${params.jobDescription}

Candidate's CV:
${params.cvContent}`;

      // Try xAI first, fallback to OpenAI
      let response;
      try {
        response = await xai.chat.completions.create({
          model: "grok-2-1212",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 2500
        });
        console.log("Successfully used xAI for interview question generation");
      } catch (xaiError: any) {
        console.log("xAI failed, falling back to OpenAI:", xaiError.message);
        response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 2500
        });
      }

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to generate interview questions - empty response");
      }
      
      // Parse the response
      const parsed = JSON.parse(content);
      
      // Add unique IDs if they're missing
      const questions = parsed.questions.map((q: any) => ({
        ...q,
        id: q.id || randomUUID()
      }));
      
      return questions;
    } catch (error) {
      console.error("Error generating interview questions:", error);
      
      // Fallback to template questions if AI fails
      return this.generateTemplateQuestions(
        params.type || 'general',
        params.difficulty || 'mixed',
        params.questionCount || 5
      );
    }
  }
  
  // Generate template questions as a fallback
  private generateTemplateQuestions(
    type: string, 
    difficulty: string, 
    count: number
  ): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];
    
    // Select template based on interview type
    let templates: string[] = [];
    let questionType = '';
    
    switch (type.toLowerCase()) {
      case 'behavioral':
      case 'star':
        templates = behavioralQuestionTemplates;
        questionType = 'behavioral';
        break;
      case 'technical':
        templates = technicalQuestionTemplates;
        questionType = 'technical';
        break;
      case 'situational':
        templates = situationalQuestionTemplates;
        questionType = 'situational';
        break;
      default:
        templates = [...behavioralQuestionTemplates, ...technicalQuestionTemplates, ...situationalQuestionTemplates];
        questionType = 'mixed';
        break;
    }
    
    // Shuffle and select questions
    const shuffled = templates.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    for (const template of selected) {
      // Determine difficulty
      let questionDifficulty: 'easy' | 'medium' | 'hard';
      if (difficulty === 'mixed') {
        const rand = Math.random();
        questionDifficulty = rand < 0.33 ? 'easy' : rand < 0.66 ? 'medium' : 'hard';
      } else {
        questionDifficulty = difficulty as 'easy' | 'medium' | 'hard';
      }
      
      questions.push({
        id: randomUUID(),
        text: template,
        type: questionType === 'mixed' 
          ? (Math.random() < 0.33 ? 'behavioral' : (Math.random() < 0.5 ? 'technical' : 'situational'))
          : questionType,
        difficulty: questionDifficulty,
        timeLimit: 120, // 2 minutes default
        expectedTopics: []
      });
    }
    
    return questions;
  }
  
  // Evaluate an answer to an interview question
  async evaluateAnswer(
    question: InterviewQuestion,
    answer: string,
    jobDescription: string
  ): Promise<InterviewEvaluation> {
    try {
      // Prepare the prompt
      const systemPrompt = `You are an expert interview evaluator with experience in South African hiring practices.
Your task is to evaluate the candidate's answer to an interview question for a position.

Provide a fair, constructive, and detailed evaluation that includes:
1. A numerical score from 0-100
2. At least 3 strengths
3. At least 2 weaknesses or areas for improvement
4. 2-3 specific, actionable tips for improvement
5. Overall feedback (2-3 sentences)

If the question has expected topics, check if the candidate addressed them and list any that were missed.

Format your response as a JSON object with the following structure:
{
  "score": 85,
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "improvementTips": ["Tip 1", "Tip 2", "Tip 3"],
  "missingTopics": ["Topic 1", "Topic 2"],
  "keyPoints": {
    "addressed": ["Point 1", "Point 2"],
    "missed": ["Point 3", "Point 4"]
  },
  "overallFeedback": "Overall feedback text"
}`;

      const userPrompt = `Job Description:
${jobDescription}

Question (${question.type}, ${question.difficulty}): 
${question.text}

Expected Topics:
${question.expectedTopics?.join(', ') || 'Not specified'}

Candidate's Answer:
${answer}`;

      // Try xAI first, fallback to OpenAI
      let response;
      try {
        response = await xai.chat.completions.create({
          model: "grok-2-1212",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1500
        });
        console.log("Successfully used xAI for interview answer evaluation");
      } catch (xaiError: any) {
        console.log("xAI failed, falling back to OpenAI:", xaiError.message);
        response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1500
        });
      }

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to evaluate answer - empty response");
      }
      
      // Parse the response
      const evaluation = JSON.parse(content);
      
      return evaluation;
    } catch (error) {
      console.error("Error evaluating answer:", error);
      
      // Return a generic evaluation if AI fails
      return {
        score: 60,
        strengths: [
          "You provided an answer to the question",
          "Some relevant points were addressed"
        ],
        weaknesses: [
          "The answer could be more specific",
          "Additional examples would strengthen your response"
        ],
        improvementTips: [
          "Be more specific with examples from your experience",
          "Structure your answer using the STAR method (Situation, Task, Action, Result)",
          "Relate your answer more directly to the job requirements"
        ],
        overallFeedback: "Your answer addressed the question on a basic level. With more specific examples and structure, you could significantly improve the impact of your response."
      };
    }
  }
  
  // Generate overall feedback for the entire interview
  async generateOverallFeedback(session: InterviewSession): Promise<{ score: number, feedback: string }> {
    try {
      // Prepare summary of questions and scores
      const questionSummaries = session.questions.map(q => {
        const evaluation = session.evaluations[q.id];
        return {
          question: q.text,
          type: q.type,
          score: evaluation?.score || 0,
          strengths: evaluation?.strengths || [],
          weaknesses: evaluation?.weaknesses || []
        };
      });
      
      // Calculate average score
      const totalScore = questionSummaries.reduce((sum, q) => sum + q.score, 0);
      const averageScore = Math.round(totalScore / questionSummaries.length);
      
      // Prepare the prompt
      const systemPrompt = `You are an expert interview coach with experience in South African job markets.
Provide comprehensive feedback on the candidate's overall interview performance.

Your feedback should:
1. Be encouraging yet honest
2. Highlight major patterns in strengths and weaknesses
3. Provide 3-5 key recommendations for improving future interview performance
4. Consider South African interview norms and expectations
5. Be specific and actionable

Format your response as a plain text paragraph (not JSON).`;

      const userPrompt = `Job Title: ${session.jobTitle || 'Not specified'}
Job Description: 
${session.jobDescription || 'Not provided'}

Question and Answer Summary:
${JSON.stringify(questionSummaries, null, 2)}

Average Score: ${averageScore}/100`;

      // Try xAI first, fallback to OpenAI
      let response;
      try {
        response = await xai.chat.completions.create({
          model: "grok-2-1212",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1200
        });
        console.log("Successfully used xAI for interview overall feedback");
      } catch (xaiError: any) {
        console.log("xAI failed, falling back to OpenAI:", xaiError.message);
        response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1200
        });
      }

      const feedback = response.choices[0].message.content || '';
      
      return { score: averageScore, feedback };
    } catch (error) {
      console.error("Error generating overall feedback:", error);
      
      // Calculate a fallback score if AI fails
      const scores = Object.values(session.evaluations).map(e => e.score);
      const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
        : 60;
      
      // Return generic feedback
      return { 
        score: averageScore,
        feedback: "Based on your interview responses, you demonstrated both strengths and areas for improvement. To enhance your interview performance, focus on providing more specific examples, structuring your answers with the STAR method, and closely aligning your responses to the job requirements. Practice articulating your experiences concisely while highlighting relevant skills. With continued preparation, your interview confidence and effectiveness will improve."
      };
    }
  }
  
  // Create a new interview session
  async createSession(userId: number, params: InterviewParams): Promise<InterviewSession> {
    // Generate interview questions
    const questions = await this.generateQuestions(params);
    
    // Create new session
    const session: InterviewSession = {
      id: randomUUID(),
      userId,
      jobTitle: params.jobTitle,
      jobDescription: params.jobDescription,
      questions,
      userAnswers: {},
      evaluations: {},
      createdAt: new Date().toISOString(),
      overallScore: undefined,
      overallFeedback: undefined,
      completedAt: undefined
    };
    
    // Store the session
    this.storeSession(session);
    
    return session;
  }
  
  // Submit an answer to a question and evaluate it
  async submitAnswer(
    session: InterviewSession,
    questionId: string,
    answer: string
  ): Promise<InterviewSession> {
    // Find the question
    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question with ID ${questionId} not found`);
    }
    
    // Store the answer
    session.userAnswers[questionId] = answer;
    
    // Evaluate the answer
    const evaluation = await this.evaluateAnswer(
      question,
      answer,
      session.jobDescription || ''
    );
    
    // Store the evaluation
    session.evaluations[questionId] = evaluation;
    
    return session;
  }
  
  // Complete an interview session with overall feedback
  async completeSession(session: InterviewSession): Promise<InterviewSession> {
    // Generate overall feedback
    const { score, feedback } = await this.generateOverallFeedback(session);
    
    // Update session
    session.overallScore = score;
    session.overallFeedback = feedback;
    session.completedAt = new Date().toISOString();
    
    return session;
  }
  
  // In-memory storage for sessions (replace with database later)
  private sessions: Map<string, InterviewSession> = new Map();
  private userSessions: Map<number, string[]> = new Map();

  // Get a session by ID
  async getSessionById(sessionId: string): Promise<InterviewSession | null> {
    return this.sessions.get(sessionId) || null;
  }
  
  // Get all sessions for a user
  async getUserSessions(userId: number): Promise<InterviewSession[]> {
    const sessionIds = this.userSessions.get(userId) || [];
    return sessionIds.map(id => this.sessions.get(id)).filter(Boolean) as InterviewSession[];
  }

  // Store session
  private storeSession(session: InterviewSession): void {
    this.sessions.set(session.id, session);
    
    const userSessionIds = this.userSessions.get(session.userId) || [];
    if (!userSessionIds.includes(session.id)) {
      userSessionIds.push(session.id);
      this.userSessions.set(session.userId, userSessionIds);
    }
  }

  // Submit answer with session ID
  async submitAnswerById(sessionId: string, questionId: string, answer: string, userId: number): Promise<InterviewEvaluation> {
    const session = await this.getSessionById(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or access denied");
    }

    const updatedSession = await this.submitAnswer(session, questionId, answer);
    this.storeSession(updatedSession);

    return updatedSession.evaluations[questionId];
  }

  // Complete session with session ID
  async completeSessionById(sessionId: string, userId: number): Promise<InterviewSession> {
    const session = await this.getSessionById(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or access denied");
    }

    const completedSession = await this.completeSession(session);
    this.storeSession(completedSession);

    return completedSession;
  }
}

// Export instance
export const interviewSimulationService = new InterviewSimulationService();