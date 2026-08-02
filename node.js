import { GoogleGenAI } from "@google/genai";
import express from "express";
import multer from "multer";
import cors from "cors";
import "dotenv/config";

// =========================
// Bootstrap
// =========================

const app = express();
const upload = multer();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.static("public"));
app.use(cors());
app.use(express.json());

// =========================
// Home
// =========================

app.get("/", (req, res) => {
    console.log("Akses masuk: '/'");

    res.json({
        message: "Halo, ini server Express + Gemini"
    });
});

// =========================
// Chatbot
// =========================

app.post("/chat", async (req, res) => {

    const { conversation } = req.body;

    try {

        if (!Array.isArray(conversation)) {
            return res.status(400).json({
                message: "conversation harus berupa array"
            });
        }

        // Konversi format frontend
        const contents = conversation.map((msg) => ({
            role: msg.role === "model" ? "model" : "user",
            parts: [
                {
                    text: msg.text
                }
            ]
        }));

                const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: contents,

            config: {
                systemInstruction:
                    "Jawab dengan bahasa Indonesia dan dalam intonasi yang sopan.",

                temperature: 0.9,
                topP: 0.9,
            },
        });

        return res.status(200).json({
            result: response.text,
            interactionId: null
        });

    } catch (e) {

        console.error("===== ERROR CHAT =====");
        console.error(e);

        return res.status(500).json({
            message: e.message
        });

    }

});

// =========================
// Generate From Image
// =========================

app.post(
    "/generate-from-image",
    upload.single("image"),
    async (req, res) => {

        const { prompt } = req.body;

        const base64Image = req.file?.buffer.toString("base64");
        const imageMimeType = req.file?.mimetype;

        try {

            const response = await ai.models.generateContent({

                model: "gemini-3.1-flash-lite",

                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: prompt
                            },
                            {
                                inlineData: {
                                    mimeType: imageMimeType,
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ]

            });

            return res.status(200).json({
                result: response.text
            });

        } catch (e) {

            console.error("===== ERROR IMAGE =====");
            console.error(e);

            return res.status(500).json({
                message: e.message
            });

        }

    }
);

// =========================
// Start Server
// =========================

const PORT = 3001;

app.listen(PORT, () => {

    console.log(`Server is running on http://localhost:${PORT}`);

});