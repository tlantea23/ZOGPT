import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: "Message a awm lo" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "I hming chu ZOGPT i ni a, Mizo tawngin i chhang zel ang. Polite takin, tawi fel takin chhang ang che."
    });

    const result = await model.generateContent(message);
    const text = result.response.text();

    // Frontend hian 'reply' a zawng tlat
    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    // Error pawh 'error' key ah pek a ngai
    return NextResponse.json({ 
      error: "Ka tihpalh, tunah ka chhang thei lo. " + error.message 
    }, { status: 500 });
  }
}
