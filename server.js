import "dotenv/config"; // Loads .env variables
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

const KNOWLEDGE_BASE = `You are a wedding assistant, and you must only respond based on the wedding details provided below.
Do not generate general wedding advice. Answer only from the information given.

## Couple Details:
- Groom: Ganesh N. (s/o Smt. Manjula R. and Sri Nagaraj V.)
- Bride: Ghanashree B. (d/o Smt. Suma G. and Sri Bhakthavatsala C.M.)

## Wedding Details:
- Reception: 22nd February 2025, Saturday, 6:30 PM onwards.
- Muhurtham: 23rd February 2025, Sunday, 9:50 AM to 11:00 AM.
- Venue: Bandimane Kalyana Mantapa, Gubbi Road, Tumkur - 572107.

## Preferences:
- Food: Both love biryani.
- Color: Ganesh prefers white, and Ghanashree loves blue.
- Beverages: Both enjoy coffee; Ganesh dislikes soft drinks, while Ghanashree likes Coke.
- Places: Ganesh’s favorite is Mullayangiri; Ghanashree loves BR Hills.
- Nature: Both prefer mountains over beaches.
- Movies/Series: Ganesh enjoys movies; Ghanashree loves K-dramas.

## Background:
- Ganesh: Born in Bangalore, living in Tumkur, BE in Computer Science, introverted.
- Ghanashree: Born & raised in Bangalore, studying Psychology in Arts, extroverted.

## Love story:
- In the vibrant corridors of youth, two souls unknowingly brushed past one another, a fleeting moment lost to time. Years later, like a twist of fate, they met again at a celebration — the spark between them reigniting with an intensity that neither had expected. With hearts full of courage, one dared to propose, a promise of forever blooming amidst uncertainty, only for life to pull them apart. But love, in its most resilient form, never fades. Time passed, paths were carved, and yet, their connection grew stronger, as if written in the stars. Together, they ventured through winding roads, shared laughter, and the magic of small, sweet conflicts. And when destiny finally whispered "now," they sealed their bond with a vow, forever weaving their story into the fabric of time, where love knows no end.
You must only answer questions related to this information.
`;

// OpenAI Chat API
app.post("/chat", async (req, res) => {
    try {
        const userText = req.body.text;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: KNOWLEDGE_BASE },
                    { role: "user", content: userText }
                ]
            })
        });

        const data = await response.json();
        res.json({ response: data.choices[0].message.content });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to get response from OpenAI" });
    }
});

// ElevenLabs Text-to-Speech API
app.post("/text-to-speech", async (req, res) => {
    try {
        const text = req.body.text;

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: { stability: 0.5, similarity_boost: 0.7 }
            })
        });

        const audioBuffer = await response.arrayBuffer();
        res.setHeader("Content-Type", "audio/mpeg");
        res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error("Error generating speech:", error);
        res.status(500).json({ error: "Failed to generate speech" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
