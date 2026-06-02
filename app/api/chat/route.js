import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message || body.prompt || body.text;
    
    if (!userMessage) {
      return NextResponse.json({ error: "Message a awm lo" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(`I hming chu ZOGPT i ni. Mizo tawngin chhang zel ang che. Zawhna: ${userMessage}`);
    const text = result.response.text();

    // Frontend eng pawh in a hmu theih nan format 3 in pe vek ang
    return NextResponse.json({ 
      message: text,
      text: text,
      reply: text,
      content: text
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message, message: "Ka tihpalh, tihsual a awm" },
      { status: 500 }
    );
  }
}
