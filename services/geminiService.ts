import { GoogleGenAI } from "@google/genai";

const AI_API_KEY = process.env.API_KEY || ''; 

let aiClient: GoogleGenAI | null = null;

if (AI_API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: AI_API_KEY });
} else {
    console.warn("API_KEY not found. Gemini features will be mocked.");
}

export const generateAgentResponse = async (taskDescription: string): Promise<string> => {
    if (!aiClient) {
        // Mock response if no key
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `[MOCK AGENT RESULT]\n\nI have completed the task: "${taskDescription}".\n\nHere is the deliverable:\n- Analysis complete\n- Verified on-chain data\n- Optimized execution path\n\nCode snippet:\nfunction verify() { return true; }`;
    }

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