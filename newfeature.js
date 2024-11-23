let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let responce = document.querySelector("#responce");

if ("speechSynthesis" in window) {
  console.log("Speech synthesis is supported!");
} else {
  console.log("Speech synthesis is not supported in this browser.");
}

// Check available voices
let selectedVoice;
window.speechSynthesis.onvoiceschanged = function () {
  let voices = window.speechSynthesis.getVoices();
  selectedVoice = voices.find((voice) => voice.lang === "en-GB");
};

function speak(text) {
  responce.innerHTML = text;
  window.speechSynthesis.cancel();

  let text_speak = new SpeechSynthesisUtterance(text);
  text_speak.voice = selectedVoice; // Set the selected voice
  text_speak.rate = 1; // Speed of the speech
  text_speak.pitch = 1; // Pitch of the speech
  text_speak.volume = 1; // Volume of the speech
  text_speak.lang = "en-GB"; // Language for speech

  window.speechSynthesis.speak(text_speak);
}

function wishMe() {
  let day = new Date();
  let hours = day.getHours();
  console.log("Current Hour:", hours);

  if (hours >= 0 && hours < 12) {
    speak("Hi, Good Morning");
  } else if (hours >= 12 && hours < 12) {
    speak("Hi, Good Afternoon");
  } else {
    speak("Hi, Good Evening");
  }
}

window.addEventListener("load", () => {
  wishMe();
});

let speechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = (event) => {
  let currentIndex = event.resultIndex;
  let transcript = event.results[currentIndex][0].transcript;
  console.log("Recognized Speech:", transcript); // Log the recognized speech
  content.innerText = transcript;
  takeCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => {
  recognition.start();
  voice.style.display = "block";
  btn.style.display = "none";
});

// Gemini API integration

async function getGeminiResponse(query) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDGx45DZrklJQZ-GJ6BvYRNNTQ7vX9f-dA`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const geminiResponse = data.candidates[0].content.parts[0].text;

    return geminiResponse;
  } catch (error) {
    console.error("Error fetching Gemini API:", error);
    return "Sorry, I couldn't fetch the response from Gemini.";
  }
}

// Command Processing Logic
async function takeCommand(message) {
  voice.style.display = "none";
  btn.style.display = "flex";
  console.log("Processing command:", message); // Log the message being processed

  // Directly query the Gemini API for all inputs
  speak("Let me check that for you...");
  const response = await getGeminiResponse(message);
  speak(response);
}
