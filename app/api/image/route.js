import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt a awm lo" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp", // Thlalak siam thei model
      systemInstruction: "I hming chu ZOGPT i ni. Mizo tawngin i chhang ang."
    });

    const result = await model.generateContent([
      { text: `Create a high quality, detailed image of: ${prompt}` }
    ]);

    const response = result.response;
    const imageData = response.candidates[0].content.parts.find(p => p.inlineData);
    
    if (!imageData) {
      return NextResponse.json({ error: "Thlalak ka siam thei lo. A dang han try teh" }, { status: 500 });
    }

    const base64Image = `data:${imageData.inlineData.mimeType};base64,${imageData.inlineData.data}`;

    return NextResponse.json({ image: base64Image });

  } catch (error) {
    console.error("Image Gen Error:", error);
    return NextResponse.json({
      error: "Ka tihpalh, thlalak siamna ah ka buai. Vawi khat han try leh teh."
    }, { status: 500 });
  }
}
