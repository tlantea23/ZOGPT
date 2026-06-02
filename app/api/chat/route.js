import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function tryModel(modelName, message) {
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: "I hming chu ZOGPT i ni a, Mizo tawngin i chhang zel ang. Polite takin, tawi fel takin chhang ang che."
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
      // 1-na: 2.5-flash try hmasa ber rawh
      text = await tryModel("gemini-2.5-flash", message);
    } catch (err) {
      console.log("2.5-flash a buai, 1.5-flash ka try:", err.message);
      // 2-na: A fail chuan 1.5-flash hmang rawh - hei hi a stable zawk
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
