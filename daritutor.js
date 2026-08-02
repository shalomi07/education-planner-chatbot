app.post("/chat", async (req, res) => {
  // 1. extract [conversation] dan [interactionId] jika ada, dari [req.body]
  const { conversation, interactionId } = req.body;
  // req.body = { conversation: [ { ... } ] }
  // conversation --> [ {  } ]

  try {
    // 2. tambahkan satpam untuk mengecek apakah dia berbentuk array atau bukan
    // satpam 1 --> cek dia bentuknya array atau bukan
    if (!Array.isArray(conversation)) {
      return res.status(400).json({ error: "Messages must be an array!!!!!!1!" });
    }

    const payload = {
      // conversation harus berisi --> { role: 'user' | 'model', type: 'text', text: '<isi-teksnya>' } dalam bentuk array
      input: conversation,
      model: "gemma-4-26b-a4b-it",
      generation_config: {
        temperature: 0.9,
        top_p: 0.9,
      },
      system_instruction: "Jawab dengan bahasa Jawa, dan dalam intonasi yang sopan dan nggak kasar!"
    };

    // satpam ke-2 --> cek apakah ada [interactionId]
    if (interactionId) {
      payload.previous_interaction_id = interactionId;
    }

    // 3. lemparkan request ke Gemini API
    const aiResponse = await ai.interactions.create(payload);

    // 4. kembalikan hasilnya berupa teks
    return res.status(200).json({ result: aiResponse.output_text, interactionId: aiResponse.previous_interaction_id });
  } catch (e) {
    // kalau error, log dan juga kembalikan pesan error-nya di sini
    console.log(e);
    return res.status(500).json({ error: "Ada masalah di server kami, nanti kami perbaiki dulu ya!" });
  }
});