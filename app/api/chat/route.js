import { NextResponse } from 'next/server';

export async function POST(request) {
  const { message } = await request.json();

  if (!message) {
    return NextResponse.json({ error: 'Message a awm lo' }, { status: 400 });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: 'I hming chu ZOGPT a ni. Mizo AI fel tak i ni a, Mizo tawngin i chhang zel tur a ni. Tawi fel fai takin chhang la, tawngkam mawi tak hmang ang che. Tunlai thil thleng pawh i hre thei.'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!groqRes.ok) {
      const errorData = await groqRes.json();
      console.error('Groq Error:', errorData);
      throw new Error('Groq API a buai');
    }

    const data = await groqRes.json();
    const reply = data.choices[0].message.content;
    return NextResponse.json({ reply });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Tihpalh, ka buai rih. Min lo zawt leh rawh' }, { status: 500 });
  }
}
