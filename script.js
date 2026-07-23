const STORAGE_KEY = "ai-chatbot-history";

const messagesEl = document.querySelector("#messages");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const clearButton = document.querySelector("#clearChat");
const statusEl = document.querySelector("#serverStatus");
const suggestionButtons = document.querySelectorAll("[data-prompt]");

let messages = loadMessages();

function loadMessages() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [
      {
        role: "assistant",
        content:
          "สวัสดีครับ ผมเป็น AI Chatbot ลองถามเรื่อง coding, automation, data หรือ business workflow ได้เลย",
      },
    ];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function renderMessages() {
  messagesEl.innerHTML = "";
  messages.forEach((message) => {
    messagesEl.append(createMessageEl(message.role, message.content));
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function createMessageEl(role, content) {
  const item = document.createElement("article");
  item.className = `message ${role}`;
  item.textContent = content;
  return item;
}

async function checkServer() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    statusEl.classList.toggle("ready", data.ok && data.hasApiKey);
    statusEl.classList.toggle("error", !data.hasApiKey);
    statusEl.querySelector("span:last-child").textContent = data.hasApiKey
      ? "AI ready"
      : "API key needed";
  } catch {
    statusEl.classList.add("error");
    statusEl.querySelector("span:last-child").textContent = "Server offline";
  }
}

async function sendMessage(content) {
  const userMessage = { role: "user", content };
  messages.push(userMessage);
  saveMessages();
  renderMessages();

  const loadingEl = createMessageEl("assistant loading", "Thinking...");
  messagesEl.append(loadingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  sendButton.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.filter((message) => ["user", "assistant"].includes(message.role)),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    messages.push({ role: "assistant", content: data.reply });
  } catch (error) {
    messages.push({
      role: "assistant",
      content: `ยังตอบจาก AI ไม่ได้: ${error.message}`,
    });
  } finally {
    saveMessages();
    renderMessages();
    sendButton.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = input.value.trim();
  if (!content) return;
  input.value = "";
  await sendMessage(content);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

clearButton.addEventListener("click", () => {
  messages = [];
  localStorage.removeItem(STORAGE_KEY);
  messages = loadMessages();
  renderMessages();
});

suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    input.focus();
  });
});

renderMessages();
checkServer();
