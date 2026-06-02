import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt a awm lo" }, { status: 400 });
    }

    // Pollinations.ai - Free, API Key ngai lo, a thawk nghal
    const encodedPrompt = encodeURIComponent(`${prompt}, high quality, 4k, detailed, mizo style`);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    
    // Image hi download la, base64 ah convert ang
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error('Pollinations API a fail');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;

    return NextResponse.json({ image: base64Image });

  } catch (error) {
    console.error("Image Gen Error:", error);
    return NextResponse.json({
      error: "Ka tihpalh, thlalak siamna ah ka buai. Vawi khat han try leh teh."
    }, { status: 500 });
  }
}
