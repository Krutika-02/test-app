document.getElementById("startSpeech").addEventListener("click", function() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function(event) {
        let userText = event.results[0][0].transcript;
        document.querySelector("#userText span").innerText = userText;

        fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: userText })
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector("#aiResponse span").innerText = data.response;
            getVoiceFromElevenLabs(data.response);
        })
        .catch(error => console.error("Error:", error));
    };
});

function getVoiceFromElevenLabs(text) {
    fetch("http://localhost:3000/text-to-speech", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.blob())
    .then(blob => {
        let audioUrl = URL.createObjectURL(blob);
        let audio = new Audio(audioUrl);
        audio.play();
    })
    .catch(error => console.error("Error generating speech:", error));
}
