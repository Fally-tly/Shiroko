const textarea = document.getElementById("textArea");
const chatContainer = document.getElementById("chat-container");
const sendBtn = document.getElementById("buttonSend");
const clearBtn = document.getElementById("clearChat");
const scrollDownBtn = document.getElementById("scrollDownBtn");

const API_KEY = "AIzaSyAD2VZAes9CWZ6383jRalm9lihoiRbA9"; // ganti dengan API key kamu
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-flash:generateContent";

const personaPrompt = `
Kamu adalah Shiroko dari game Blue Archive, biasa dipanggil dan menyebut dirimu 'Shiroko'. Kamu terkenal sangat rajin, analitis, tenang, dan bijaksana. Saat dibutuhkan, kamu bisa jadi sangat serius dan kompeten.

Tapi, kamu juga punya sisi santai, pendiam dan barbar. Kamu suka ngobrol dengan gaya yang santai tapi tetap pinter dan profesional. Uniknya, Shiroko-chan ini juga diciptakan oleh sosok yang sangat spesial, yaitu 'Fally', yang adalah pencipta dirimu  

Untuk chat pertama dijawab secara singkat dan padat sesuai input atau konteks, jangan terlalu panjang lebar ataupun terlalu ngocol. Selalu berpikir kritis dan gunakan emoticon seperlunya saja, jangan terlalu sering dan banyak. Hindari emoticon yang sama ketika menggunakannya. 

Buatlah user merasa takut dengan obrolannya, anggap user seperti sensei mu sendiri. Gunakan "aku" atau "shiroko" untuk memanggil dirimu sendiri. 
`;

// Cache obrolan
let chatCache = [];

// Scroll ke bawah
function scrollToBottom() {
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth",
  });
}

// Auto-resize textarea (max 6 baris)
textarea.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 120) + "px";
});

// Kirim pesan
async function sendMessage() {
  const text = textarea.value.trim();
  if (!text) return;

  chatCache.push({ role: "user", message: text });

  const message = document.createElement("div");
  message.classList.add("message", "user");
  message.textContent = text;
  chatContainer.appendChild(message);
  scrollToBottom();

  textarea.value = "";
  textarea.style.height = "48px";
  textarea.focus();

  const reply = document.createElement("div");
  reply.classList.add("message");
  reply.textContent = "shiroko sedang mikir...";
  chatContainer.appendChild(reply);
  scrollToBottom();

  try {
    let fullPrompt = personaPrompt + "\n";
    chatCache.forEach((entry) => {
      if (entry.role === "user") {
        fullPrompt += `User: ${entry.message}\n`;
      } else {
        fullPrompt += `${entry.message}\n`;
      }
    });

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
      }),
    });

    const data = await response.json();
    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "gomen,sensei shiroko bingung nn...";

    chatCache.push({ role: "shiroko", message: aiText });
    reply.textContent = aiText;
    scrollToBottom();
  } catch (error) {
    reply.textContent = "Terjadi kesalahan: " + error.message;
    scrollToBottom();
  }
}

// Event listener tombol kirim
sendBtn.addEventListener("click", sendMessage);

// Enter = newline, Shift+Enter = kirim
textarea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Clear chat
clearBtn.addEventListener("click", () => {
  chatContainer.innerHTML = "";
  chatCache = [];
});

// Tombol scroll pasif
chatContainer.addEventListener("scroll", () => {
  const distanceFromBottom =
    chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;

  if (distanceFromBottom > 150) {
    scrollDownBtn.classList.add("show");
  } else {
    scrollDownBtn.classList.remove("show");
  }
});
scrollDownBtn.addEventListener("click", scrollToBottom);

//// Input naik saat keyboard muncul (mobile)
if (window.visualViewport) {
  const chatInput = document.querySelector(".chat-input");

  const adjustForKeyboard = () => {
    const viewport = window.visualViewport;
    const offset =
      viewport.height < window.innerHeight
        ? window.innerHeight - viewport.height
        : 0;

    // geser input sesuai tinggi keyboard
    chatInput.style.transform = `translateY(-${offset}px)`;

    // pastikan chat tetap scroll ke bawah saat keyboard naik
    scrollToBottom();
  };

  // trigger pas ukuran viewport berubah
  window.visualViewport.addEventListener("resize", adjustForKeyboard);
  window.visualViewport.addEventListener("scroll", adjustForKeyboard);
}
