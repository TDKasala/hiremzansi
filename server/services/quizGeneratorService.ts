import OpenAI from "openai";

// Initialize OpenAI with the xAI base URL and API key
const xaiClient = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY
});

// Initialize regular OpenAI client for fallback
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateQuizQuestions(
  category: string,
  count: number = 5
): Promise<QuizQuestion[]> {
  const prompt = buildPromptForCategory(category, count);
  const systemPrompt = `You are a South African job market expert who creates educational content for job seekers. 
  Create challenging but fair quiz questions with 4 multiple-choice options (a, b, c, d) for each question. 
  One option must be correct. Include detailed explanations for why the correct answer is right.
  Your output must be valid JSON.`;
  
  // First try xAI
  try {
    console.log(`Generating ${count} quiz questions for category: ${category}`);
    
    // Try using the Grok model to generate questions
    const response = await xaiClient.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("Invalid response format from xAI quiz generation");
    }

    console.log(`Successfully generated ${result.questions.length} questions using xAI`);
    
    return result.questions.map((q: any) => ({
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswerIndex,
      explanation: q.explanation
    }));
  } catch (error) {
    console.log("xAI quiz generation failed, falling back to OpenAI:", error.message);
    
    // Try OpenAI as fallback
    try {
      const openaiResponse = await openaiClient.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(openaiResponse.choices[0].message.content || "{}");
      
      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error("Invalid response format from OpenAI quiz generation");
      }
      
      console.log(`Successfully generated ${result.questions.length} questions using OpenAI fallback`);
      
      return result.questions.map((q: any) => ({
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswerIndex,
        explanation: q.explanation
      }));
    } catch (openaiError) {
      console.error("Both xAI and OpenAI failed for quiz generation:", openaiError);
      // Fall back to static questions if both APIs fail
      return getFallbackQuestions(category, count);
    }
  }
}

function buildPromptForCategory(category: string, count: number): string {
  switch (category) {
    case "interview":
      return `Generate ${count} multiple-choice questions about South African job interview skills, including:
      - Interview preparation techniques
      - Common interview questions in South Africa
      - STAR method for behavioral questions
      - South African workplace etiquette
      - Salary negotiation in a South African context
      
      Return the response as a JSON object with this structure:
      {
        "questions": [
          {
            "text": "question text",
            "options": ["option 1", "option 2", "option 3", "option 4"],
            "correctAnswerIndex": 0,
            "explanation": "detailed explanation of why the answer is correct"
          }
        ]
      }`;

    case "technical":
      return `Generate ${count} multiple-choice questions about technical skills relevant to the South African job market, including:
      - Software skills in demand in South Africa
      - Technical certifications valued by South African employers
      - Industry-specific technical knowledge
      - Data privacy regulations (POPIA)
      - Technical terminology relevant in South African businesses
      
      Return the response as a JSON object with this structure:
      {
        "questions": [
          {
            "text": "question text",
            "options": ["option 1", "option 2", "option 3", "option 4"],
            "correctAnswerIndex": 0,
            "explanation": "detailed explanation of why the answer is correct"
          }
        ]
      }`;

    case "workplace":
      return `Generate ${count} multiple-choice questions about South African workplace culture and regulations, including:
      - B-BBEE policies and implementation
      - South African labor laws
      - Workplace cultural norms specific to South Africa
      - Professional communication in South African businesses
      - South African business etiquette
      
      Return the response as a JSON object with this structure:
      {
        "questions": [
          {
            "text": "question text",
            "options": ["option 1", "option 2", "option 3", "option 4"],
            "correctAnswerIndex": 0,
            "explanation": "detailed explanation of why the answer is correct"
          }
        ]
      }`;

    default:
      return `Generate ${count} multiple-choice questions about job seeking skills relevant to South Africa, including:
      - CV optimization for South African employers
      - Job search strategies in South Africa
      - South African professional networking
      - Work visa requirements (for foreigners)
      - Industry trends in South Africa
      
      Return the response as a JSON object with this structure:
      {
        "questions": [
          {
            "text": "question text",
            "options": ["option 1", "option 2", "option 3", "option 4"],
            "correctAnswerIndex": 0,
            "explanation": "detailed explanation of why the answer is correct"
          }
        ]
      }`;
  }
}

// Fallback questions if the API fails
function getFallbackQuestions(category: string, count: number): QuizQuestion[] {
  // Provide a small set of fallback questions for each category
  const fallbackQuestionSets: Record<string, QuizQuestion[]> = {
    "interview": [
      {
        text: "What is the STAR method used for in interviews?",
        options: [
          "Starting The Application Right - ensuring your CV passes ATS systems",
          "Situation, Task, Action, Result - a method for answering behavioral questions",
          "Skills, Talents, Achievements, References - organizing your CV sections",
          "Structured Talking And Responding - a formal interview speech pattern"
        ],
        correctAnswer: 1,
        explanation: "The STAR method (Situation, Task, Action, Result) is a structured way to answer behavioral interview questions by describing a specific situation, the task you needed to accomplish, the action you took, and the results you achieved."
      },
      {
        text: "In a South African context, how should you address questions about salary expectations?",
        options: [
          "Provide an exact figure based on your previous salary",
          "Refuse to discuss salary until a formal offer is made",
          "Research industry standards and provide a reasonable range",
          "Ask what the interviewer earns to establish fair comparison"
        ],
        correctAnswer: 2,
        explanation: "It's best to research salary ranges for your position, industry, and location in South Africa, and then provide a reasonable range rather than a specific number. This shows you've done your homework while maintaining negotiation flexibility."
      }
    ],
    "technical": [
      {
        text: "Which of these software skills is most in-demand in South Africa's financial sector?",
        options: [
          "Advanced Excel and financial modeling",
          "WordPress development",
          "Adobe Creative Suite",
          "AutoCAD"
        ],
        correctAnswer: 0,
        explanation: "Advanced Excel and financial modeling skills are highly valued in South Africa's financial sector due to their essential role in data analysis, financial reporting, and forecasting."
      },
      {
        text: "What does POPIA stand for in the South African business context?",
        options: [
          "Protection of Personal Information Act",
          "Public Office Private Interest Agreement",
          "Protocol for Operational Process Improvement Assessment",
          "Professional Online Presence and Internet Accessibility"
        ],
        correctAnswer: 0,
        explanation: "POPIA stands for the Protection of Personal Information Act, which is South Africa's data protection law that regulates how organizations handle personal information."
      }
    ],
    "workplace": [
      {
        text: "What does B-BBEE stand for in South African business?",
        options: [
          "Better Business Bureau for Economic Empowerment",
          "Black-Based Business and Employment Equity",
          "Broad-Based Black Economic Empowerment",
          "Business Bureau for Black Employee Empowerment"
        ],
        correctAnswer: 2,
        explanation: "B-BBEE stands for Broad-Based Black Economic Empowerment, which is a South African government policy designed to advance economic transformation and enhance the economic participation of Black people in the South African economy."
      },
      {
        text: "In South African workplace communication, what does 'now-now' typically mean?",
        options: [
          "Immediately",
          "In a short while, but not immediately",
          "Tomorrow morning",
          "At the end of the workday"
        ],
        correctAnswer: 1,
        explanation: "In South African English, 'now-now' typically means 'in a short while' or 'soon, but not immediately.' It's an informal time reference that suggests something will happen relatively soon but not right away."
      }
    ],
    "default": [
      {
        text: "Which of these is most important to include on a CV for South African employers?",
        options: [
          "A professional photo",
          "Your B-BBEE status",
          "References",
          "Hobbies and personal interests"
        ],
        correctAnswer: 1,
        explanation: "Including your B-BBEE status is important for South African employers due to the country's employment equity policies. This information helps employers understand how your hiring might impact their B-BBEE scorecard."
      },
      {
        text: "What is 'Ubuntu' in the context of South African workplace culture?",
        options: [
          "A Linux operating system commonly used in South African businesses",
          "A philosophy emphasizing community, interconnectedness, and compassion",
          "The official code of conduct for South African businesses",
          "A government-mandated workplace diversity program"
        ],
        correctAnswer: 1,
        explanation: "Ubuntu is a Nguni Bantu term that embodies the philosophy of interconnectedness and belief in a universal bond of sharing that connects all humanity. In South African workplace culture, it emphasizes compassion, reciprocity, dignity, harmony, and humanity in the interest of building and maintaining a community with justice and mutual caring."
      }
    ]
  };

  // Return the appropriate set of fallback questions or default if category not found
  const fallbackSet = fallbackQuestionSets[category] || fallbackQuestionSets.default;
  
  // Return up to the requested count
  return fallbackSet.slice(0, count);
}