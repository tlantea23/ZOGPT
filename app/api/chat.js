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
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Nang chu ZOGPT i ni. Mizo tawngin chhang zel ang che. Tawi fel fai takin chhang la, tawngkam mawi tak hmang ang che.'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!groqRes.ok) {
      throw new Error('Groq API a buai');
    }

    const data = await groqRes.json();
    const reply = data.choices[0].message.content;
    return NextResponse.json({ reply });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'A buai, min lo zawt leh rawh' }, { status: 500 });
  }
}
