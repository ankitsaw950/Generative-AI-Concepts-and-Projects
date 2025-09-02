import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let topic = "Making a project on automation and using Gen AI to post directly on LinkedIn";

export async function generateLinkedInPost(topic, tone = "engaging and professional") {
  try {
    console.log("Request received...");

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

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // or another available Groq model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    });

    console.log("Response received...");

    const text = result.choices[0]?.message?.content || "No response generated.";
    return text;

  } catch (error) {
    console.error("Error generating LinkedIn post:", error);
    throw error;
  }
}
