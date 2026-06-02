import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    
    const userMessage = body.message || body.messages?.[body.messages.length - 1]?.content;
    const history = body.messages || [];

    if (!userMessage) {
      return NextResponse.json(
        { error: "Message a awm lo" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "I hming chu ZOGPT i ni. Mizo tawngin chhang zel ang che. I tawngkam a polite in a fel fai tur a ni."
    });

    const chat = model.startChat({
      history: history.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    // Hei hi a pawimawh ber: { message: text }
    return NextResponse.json({ message: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "API Error: " + error.message },
      { status: 500 }
    );
  }
}
