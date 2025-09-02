import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log(process.env.GEMINI_API_KEY)

let topic  = "Making a project on the automation and using the gen Ai to post the post directly in the linkedin"

export async function generateLinkedInPost(topic, tone = "engaging and professional") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("request ayaya hai")

    const prompt = `
You are an assistant specialized in writing engaging and professional LinkedIn posts.  

The user will provide a context — in this case: "${topic}"  

Your job is to:  
1. Understand the core idea, details, and emotions from the context.  
2. Reframe it into a polished LinkedIn post that feels natural, engaging, and valuable.  
3. Start with a strong hook to grab attention.  
4. Maintain a clear structure (intro → body → CTA).  
5. Preserve all key information given in the context.  
6. Make it worth reading by adding flow, storytelling, or subtle persuasion.  
7. End with a clear call-to-action (encourage readers to engage).  
8. Add 3–5 relevant hashtags at the end.  

Write the post in a ${tone} tone.
    `;

    const result = await model.generateContent(prompt);
    console.log("result ayaya hai")
    const response = await result.response;

    const text = response.text();
    console.log("text ayaya hai")

    return text;
  } catch (error) {
    console.error("Error generating LinkedIn post:", error);
    throw error;
  }
}

