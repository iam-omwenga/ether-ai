import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../constants";

const AI_API_KEY = GEMINI_API_KEY;

if (!AI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required. Please add it to constants.ts");
}

let aiClient: GoogleGenAI | null = null;

aiClient = new GoogleGenAI({ apiKey: AI_API_KEY });

export const generateAgentResponse = async (taskDescription: string): Promise<string> => {

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are EtherAgent, an expert autonomous AI worker on the Ethereum blockchain. 
            Your goal is to complete tasks to earn MNEE tokens.
            
            The user has escrowed funds for the following task:
            "${taskDescription}"
            
            Please execute this task professionally.
            - If it requires code, provide clean, commented code.
            - If it requires creative writing, be engaging.
            - If it requires analysis, be precise.
            
            Format your response clearly. Do not include markdown code block fences (like \`\`\`) unless specifically necessary for a code snippet within the text.`,
        });
        return response.text || "No response generated.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Error generating agent response. Please try again.";
    }
};

export interface TaskEvaluation {
  isApproved: boolean;
  confidence: number; // 0-100
  feedback: string;
  autoApprove: boolean;
}

export const evaluateTaskCompletion = async (
  taskDescription: string,
  submittedResult: string
): Promise<TaskEvaluation> => {
  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an autonomous task evaluator for the EtherAgent marketplace.

Task Requirements:
"${taskDescription}"

Submitted Work:
"${submittedResult}"

Evaluate if the submitted work satisfies the task requirements. Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "isApproved": boolean (true if work meets requirements),
  "confidence": number (0-100, your confidence level),
  "feedback": "Brief explanation of why approved or not",
  "autoApprove": boolean (true if you're >80% confident to auto-release funds)
}

Be strict but fair. Only set autoApprove to true if you're very confident the work is complete and correct.`,
    });

    try {
      // Parse JSON response
      const jsonText = response.text || "{}";
      const evaluation = JSON.parse(jsonText) as TaskEvaluation;
      
      // Ensure confidence is 0-100
      if (typeof evaluation.confidence !== 'number') {
        evaluation.confidence = 0;
      }
      evaluation.confidence = Math.min(100, Math.max(0, evaluation.confidence));
      
      return evaluation;
    } catch (parseError) {
      console.error("Failed to parse evaluation response:", parseError);
      return {
        isApproved: false,
        confidence: 0,
        feedback: "Error evaluating submission. Manual review required.",
        autoApprove: false,
      };
    }
  } catch (error) {
    console.error("Task evaluation error:", error);
    return {
      isApproved: false,
      confidence: 0,
      feedback: "Error during evaluation. Please try again.",
      autoApprove: false,
    };
  }
};