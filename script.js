const STORAGE_KEY = "ai-chatbot-history";
const MAX_MESSAGES = 200;
const MAX_CONTENT = 8000;
let sending = false;

const messagesEl = document.querySelector("#messages");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const clearButton = document.querySelector("#clearChat");
const statusEl = document.querySelector("#serverStatus");
const suggestionButtons = document.querySelectorAll("[data-prompt]");

let messages = loadMessages();

function loadMessages() {
  let stored;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch { return []; }
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
    if (stored.length > 2 * 1024 * 1024) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string" && message.content.length <= MAX_CONTENT).slice(-MAX_MESSAGES) : [];
  } catch {
    return [];
  }
}

function saveMessages() {
  messages = messages.slice(-MAX_MESSAGES);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* Keep this session usable when storage is full or disabled. */ }
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
  if (sending || typeof content !== "string" || !content.trim() || content.length > MAX_CONTENT) return;
  sending = true;
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
      signal: AbortSignal.timeout(60000),
      redirect: "error",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.filter((message) => ["user", "assistant"].includes(message.role)),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error("Request failed");
    }

    if (typeof data?.reply !== "string" || data.reply.length > MAX_CONTENT) throw new Error("Invalid reply");
    messages.push({ role: "assistant", content: data.reply });
  } catch (error) {
    messages.push({
      role: "assistant",
      content: "ยังตอบจาก AI ไม่ได้ กรุณาลองใหม่ภายหลัง",
    });
  } finally {
    saveMessages();
    renderMessages();
    sendButton.disabled = false;
    sending = false;
    input.focus();
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = input.value.trim();
  if (!content || content.length > MAX_CONTENT || sending) return;
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
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage disabled */ }
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
