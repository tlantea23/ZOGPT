import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt a awm lo" }, { status: 400 });
    }

    // Google Imagen 3 API call
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: `high quality, 4k, detailed photo of: ${prompt}` }],
        parameters: { sampleCount: 1 }
      })
    });

    const data = await response.json();

    if (!response.ok ||!data.predictions ||!data.predictions[0].bytesBase64Encoded) {
      console.error("Imagen API Error:", data);
      return NextResponse.json({ error: "Thlalak ka siam thei lo. Prompt dang han try teh." }, { status: 500 });
    }

    const base64Image = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;

    return NextResponse.json({ image: base64Image });

  } catch (error) {
    console.error("Image Gen Error:", error);
    return NextResponse.json({
      error: "Ka tihpalh, thlalak siamna ah ka buai. Vawi khat han try leh teh."
    }, { status: 500 });
  }
}
