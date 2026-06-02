import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt a awm lo" }, { status: 400 });
    }

    // He model hi thlalak siam thei tak tak a ni
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation"
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      },
    });

    const response = result.response;
    const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

    if (!imagePart) {
      return NextResponse.json({ error: "Thlalak ka siam thei lo. A dang han try teh" }, { status: 500 });
    }

    const base64Image = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    return NextResponse.json({ image: base64Image });

  } catch (error) {
    console.error("Image Gen Error:", error);
    return NextResponse.json({
      error: "Ka tihpalh, thlalak siamna ah ka buai. Model a la support lo a niang. Vawi khat han try leh teh."
    }, { status: 500 });
  }
}
