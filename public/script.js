// ===========================
// KONFIGURASI
// ===========================

const API_URL = "/chat";

// ===========================
// ELEMENT HTML
// ===========================

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// ===========================
// MEMORY CHAT
// ===========================

let interactionId = null;

// conversation akan dikirim ke backend
let conversation = [];

// ===========================
// EVENT
// ===========================

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();

    }

});

// ===========================
// FUNGSI KIRIM PESAN
// ===========================

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text) return;

    // tampilkan chat user

    addMessage("user", text);

    // kosongkan textbox

    messageInput.value = "";

    // simpan conversation

    conversation.push({

        role: "user",

        type: "text",

        text: text

    });

    sendButton.disabled = true;

    typingIndicator.classList.remove("hidden");

    scrollBottom();

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                conversation,

                interactionId

            })

        });

        const data = await response.json();

        typingIndicator.classList.add("hidden");

        sendButton.disabled = false;

        if (!response.ok) {

            addMessage("bot", "Terjadi kesalahan pada server.");

            return;

        }

        // tampilkan jawaban AI

        addMessage("bot", data.result);

        // simpan jawaban AI ke history

        conversation.push({

            role: "model",

            type: "text",

            text: data.result

        });

        // simpan interaction id

        interactionId = data.interactionId;

    }

    catch (err) {

        typingIndicator.classList.add("hidden");

        sendButton.disabled = false;

        addMessage("bot", "Server tidak dapat dihubungi.");

        console.error(err);

    }

}

// ===========================
// TAMBAH CHAT
// ===========================

function addMessage(role, text) {

    const wrapper = document.createElement("div");

    wrapper.className = `message ${role}`;

    const avatar = document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent = role === "user" ? "🧑" : "🤖";

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    bubble.textContent = text;

    wrapper.appendChild(avatar);

    wrapper.appendChild(bubble);

    chatBox.appendChild(wrapper);

    scrollBottom();

}

// ===========================
// AUTO SCROLL
// ===========================

function scrollBottom() {

    chatBox.scrollTop = chatBox.scrollHeight;

}