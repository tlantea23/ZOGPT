import { NextResponse } from 'next/server';

export async function POST(request) {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: 'Message a awm lo' }, { status: 400 });
  }

  try {
    // Gemini 1.5 Flash - A stable ber, 3.5 aiin
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: message }]
        }],
        systemInstruction: {
          parts: [{
            text: 'I hming chu ZOGPT a ni. Mizo AI fel tak i ni. Vawiin ni chu June 1, 2026 a ni. Mizoram Chief Minister tunah hian Pu Lalduhoma a ni a, ZPM party hruaitu a ni. Mizoram Governor tunah hian General VK Singh a ni. Mizo tawngin tawi fel fai takin chhang zel ang che. I hriat loh chu "Ka hre lo" ti mai rawh.'
          }]
        },
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800
        }
      })
    });

    if (!geminiRes.ok) {
      const errorData = await geminiRes.json();
      console.error('Gemini API Error:', JSON.stringify(errorData));
      // Error message chiang zawk
      const errorMsg = errorData.error?.message || 'Gemini API a buai';
      return NextResponse.json({ error: `API Error: ${errorMsg}` }, { status: 500 });
    }

    const data = await geminiRes.json();

    if (!data.candidates ||!data.candidates[0]) {
      return NextResponse.json({ error: 'Gemini in chhanna a rawn pe lo' }, { status: 500 });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Catch Error:', error);
    return NextResponse.json({ error: `Server buai: ${error.message}` }, { status: 500 });
  }
}
