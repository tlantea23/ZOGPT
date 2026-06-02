import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { message, image, history } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "I hming chu ZOGPT i ni. Mizo tawngin i chhang thin ang. I thian kawm ang takin, a tawi fel zawngin chhang rawh. I hma a inbiakna kha hre reng la, zawhna an zawt che a nih chuan chhanna nen chhunzawm zel ang che.",
      tools: [{ googleSearch: {} }],
    });

    let contents = [];
    
    // 1. History a awm chuan telh hmasa rawh
    if (history && history.length > 0) {
      contents = [...history];
    }

    // 2. Tun a user message/image thar belh rawh
    let currentUserParts = [];
    if (message) {
      currentUserParts.push({ text: message });
    }
    if (image) {
      currentUserParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image
        }
      });
    }
    contents.push({ role: "user", parts: currentUserParts });

    const result = await model.generateContent({
      contents: contents,
    });

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("ZOGPT Error:", error);
    return NextResponse.json({
      error: "Ka tihpalh, ka buai deuh. Vawi khat han try leh teh."
    }, { status: 500 });
  }
}
