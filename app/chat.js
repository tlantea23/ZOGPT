export default async function handler(req, res) {
  const { message } = req.body;

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'Nang chu ZOGPT i ni. Mizo tawngin chhang zel ang che. Tawi fel takin chhang rawh.' },
        { role: 'user', content: message }
      ]
    })
  });

  const data = await groqRes.json();
  res.status(200).json({ reply: data.choices[0].message.content });
}
