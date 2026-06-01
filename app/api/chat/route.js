import { NextResponse } from 'next/server';

export async function POST(request) {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: 'Message a awm lo' }, { status: 400 });
  }

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: message }]
        }],
        systemInstruction: {
          parts: [{
            text: 'I hming chu ZOGPT a ni. Mizo AI fel tak i ni. Vawiin ni chu June 1, 2026 a ni. Mizoram Chief Minister tunah hian Pu Lalduhoma a ni a, ZPM party hruaitu a ni. Mizo tawngin tawi fel fai takin chhang zel ang che. I hriat loh chu "Ka hre lo" ti mai rawh, phuahchawp suh.'
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
      console.error('Gemini Error:', errorData);
      throw new Error('Gemini API a buai');
    }

    const data = await geminiRes.json();
    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Tihpalh, ka buai rih. Min lo zawt leh rawh' }, { status: 500 });
  }
}
