export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST method chauh a ni' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message a awm lo' });
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
            content: 'Nang chu ZOGPT i ni. AI fel tak, Mizo tawng thiam tak i ni. Mizo tawngin chhang zel ang che. I hriat loh chuan "Ka hre lo" ti mai rawh. Tawi fel fai takin chhang la, tawngkam mawi tak hmang ang che.'
          },
          {
            role: 'user',
            content: message
          }
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

    res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'A buai, min lo zawt leh rawh' });
  }
}
