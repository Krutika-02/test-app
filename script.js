const openaiApiKey = "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"; 
const elevenLabsApiKey = "sk_ce824746b2d8e9ca6aa3fa93e3db778f76c76788773d7de8"; 
const elevenLabsVoiceId = "JBFqnCBsd6RMkjVDRZzb"; 
const KNOWLEDGE_BASE = `
You are a wedding assistant, and you must only respond based on the wedding details provided below.
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

document.getElementById("startSpeech").addEventListener("click", function() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function(event) {
        let userText = event.results[0][0].transcript;
        document.querySelector("#userText span").innerText = userText;

        fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: KNOWLEDGE_BASE },
                    { role: "user", content: userText }
                ]
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("OpenAI Response:", data);
            let aiResponse = data.choices[0].message.content;
            document.querySelector("#aiResponse span").innerText = aiResponse;
            getVoiceFromElevenLabs(aiResponse); 
        })
        .catch(error => console.error("Error:", error));
    };
});

// Convert Text to Speech using ElevenLabs API
function getVoiceFromElevenLabs(text) {
    fetch("https://api.elevenlabs.io/v1/text-to-speech/" + elevenLabsVoiceId, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsApiKey
        },
        body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.7 }
        })
    })
    .then(response => response.blob()) 
    .then(blob => {
        let audioUrl = URL.createObjectURL(blob);
        let audio = new Audio(audioUrl);
        audio.play(); 
    })
    .catch(error => console.error("Error generating speech:", error));
}
