import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, fileData } = await req.json();

    // Get the key from the environment variables for security
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // We use gemini-1.5-flash as it is extremely fast and supports files/images
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `You are StudyBot, an expert academic assistant.
    The user is a student. Help them solve their assignment.
    Be encouraging, provide step-by-step explanations, and ensure the final answer is clear.

    User Question: ${message}`;

    let result;
    if (fileData) {
      // The SDK expects the key to be 'inlineData' but the underlying API
      // sometimes has specific requirements depending on the version.
      // For the JS SDK, the correct structure for parts is:
      const parts = [
        { text: prompt },
        {
          inlineData: {
            mimeType: fileData.inlineData.mimeType,
            data: fileData.inlineData.data
          }
        }
      ];
      result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    } else {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
