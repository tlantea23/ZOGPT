import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function tryModel(modelName, contents) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    tools: [{ googleSearch: {} }],
    systemInstruction: "I hming chu ZOGPT i ni. Mizo tawngin chhang zel ang che. Thlalak an rawn thawn che chuan chiang takin sawifiah ang che. News thar zawh che chuan Google Search hmangin zawng la, date nen chhang ang che."
  });
  const result = await model.generateContent(contents);
  return result.response.text();
}

export async function POST(req) {
  try {
    const { message, image } = await req.json();

    if (!message &&!image) {
      return NextResponse.json({ error: "Message emaw thlalak a awm lo" }, { status: 400 });
    }

    // Thlalak leh thu kha Gemini format ah siam
    const parts = [];
    if (message) parts.push({ text: message });
    if (image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image // base64 data
        }
      });
    }

    let text;
    try {
      text = await tryModel("gemini-2.5-flash", parts);
    } catch (err) {
      console.log("2.5-flash a buai, 1.5-flash ka try:", err.message);
      text = await tryModel("gemini-1.5-flash", parts);
    }

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({
      error: "Ka tihpalh, thlalak ka chhiar thei lo. Vawi khat han try leh teh."
    }, { status: 500 });
  }
}
