import { GoogleGenAI, Type } from "@google/genai";
import { Question, Category } from "../types";

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateQuestions = async (category: Category, count: number = 5, difficulty: string = "Moderate"): Promise<Question[]> => {
  if (!apiKey) {
    console.error("Gemini API Key is missing");
    try {
      const res = await fetch(`/api/questions?category=${encodeURIComponent(category)}&limit=${count}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (dbError) {
      console.error("Database fallback failed:", dbError);
    }
    return [];
  }

  try {
    console.log(`Generating ${count} questions for ${category} with difficulty ${difficulty}`);
    const prompt = `Generate ${count} multiple-choice questions for the Civil Service Exam Reviewer.
    Category: ${category}.
    Difficulty: ${difficulty}.
    Ensure the questions are realistic and follow the standard format of Civil Service Exams.
    Provide 4 options for each question.
    
    CRITICAL INSTRUCTION FOR EXPLANATIONS:
    The explanation must be highly detailed and written for a general audience (non-technical). 
    Use a step-by-step approach:
    1. State the core concept being tested in simple terms.
    2. Provide a clear, easy-to-follow breakdown of the logic or calculation needed.
    3. Explain exactly why the correct answer is right.
    4. Mention common pitfalls or why other choices might be confusing.
    Keep the tone encouraging and educational. Avoid complex jargon or technical terms that a general exam-taker wouldn't know.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ["text", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text from Gemini");
    }
    
    const data = JSON.parse(responseText);
    console.log(`Successfully generated ${data.length} questions from Gemini`);

    return data.map((q: any, index: number) => ({
      id: `${category}-${Date.now()}-${index}`,
      category,
      text: q.text,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
    }));

  } catch (error) {
    console.error("Error generating questions from Gemini:", error);
    // Fallback to database questions instead of mock
    try {
      console.log(`Falling back to database for ${category}`);
      const res = await fetch(`/api/questions?category=${encodeURIComponent(category)}&limit=${count}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (dbError) {
      console.error("Database fallback failed:", dbError);
    }
    return [];
  }
};
