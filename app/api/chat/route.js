import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function tryModel(modelName, message) {
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    tools: [{ googleSearch: {} }], // STEP 1: Hei hi a thar
    systemInstruction: "I hming chu ZOGPT i ni a, Mizo tawngin i chhang zel ang. News thar, result, weather zawh che chuan Google Search hmangin zawng la, a ni, thla, kum nen chhang ang che. Link pawimawh telh bawk rawh."
  });
  const result = await model.generateContent(message);
  return result.response.text();
}

export async function POST(req) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: "Message a awm lo" }, { status: 400 });
    }

    let text;
    try {
      text = await tryModel("gemini-2.5-flash", message);
    } catch (err) {
      console.log("2.5-flash a buai, 1.5-flash ka try:", err.message);
      text = await tryModel("gemini-1.5-flash", message);
    }

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ 
      error: "Ka tihpalh, tunah ka buai deuh. Vawi khat han try leh teh." 
    }, { status: 500 });
  }
}
