function toggleMobileMenu(){
	document.getElementById("menu").classList.toggle("active");
}




window.addEventListener("load", () => {
  const canvas = document.getElementById('logoCanvas');
  const ctx = canvas.getContext('2d');

  // Make sure canvas size matches element size
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Font style
  ctx.font = "bold 50px Arial";
  ctx.fillStyle = "#3cb371"; // Mint green
  ctx.textBaseline = "top";


    // ✨ Glow effect
  ctx.shadowColor = "#3cb371";   // same as text color
  ctx.shadowBlur = 20;           // how intense the glow is
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  const text = ".bySHREYANSI.";
  let index = 0;

  function drawLetterByLetter() {
    if (index < text.length) {
      ctx.fillText(text[index], 50 + index * 40, 20);
      index++;
      setTimeout(drawLetterByLetter, 150);
    }
  }

  drawLetterByLetter();
});


const worker = new Worker("chatbot-worker.js");
const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && input.value.trim()) {
    const msg = input.value.trim();
    appendMessage("user", msg);
    worker.postMessage(msg);
    input.value = "";
  }
});

worker.onmessage = (e) => {
  appendMessage("bot", e.data);
};

function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = sender;
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}




  function getLocation() {
    const locationInput = document.getElementById('location');

    if (!navigator.geolocation) {
      locationInput.value = "Geolocation is not supported by your browser.";
      return;
    }

    locationInput.value = "Fetching location...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        locationInput.value = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            locationInput.value = "Permission denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            locationInput.value = "Position unavailable.";
            break;
          case error.TIMEOUT:
            locationInput.value = "Request timed out.";
            break;
          default:
            locationInput.value = "Error retrieving location.";
        }
      }
    );
  }



//   const wordWorker = new Worker("wordCounter-worker.js");
// const contactTextarea = document.getElementById("message"); 
// const wordCountOutput = document.getElementById("wordCountOutput");

// contactTextarea.addEventListener("input", () => {
//   wordWorker.postMessage(contactTextarea.value);
// });

// wordWorker.onmessage = (e) => {
//   const { wordCount, charCount } = e.data;
//   wordCountOutput.textContent = `Words: ${wordCount} | Characters: ${charCount}`;
// };


// Only run when the DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  const worker = new Worker("wordCounter-worker.js");
  const textarea = document.getElementById("message");
  const output = document.getElementById("wordCountOutput");

  if (textarea && output) {
    textarea.addEventListener("input", () => {
      const value = textarea.value;
      worker.postMessage(value);
    });

    worker.onmessage = (e) => {
      const { wordCount, charCount } = e.data;
      output.textContent = `Words: ${wordCount} | Characters: ${charCount}`;
    };
  } else {
    console.warn("Textarea or output not found in DOM");
  }
});
