const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

// Danh sách các webhook URL cho từng website
const websiteWebhooks = {
    default: "https://n8n.supover.com/webhook/faa1a747-947c-4310-bdfc-bb4be152d9a4",
    supover: "https://n8n.supover.com/webhook/faa1a747-947c-4310-bdfc-bb4be152d9a4",
    pressify: "https://n8n.supover.com/webhook/b3dd7238-ccb5-45c1-86a3-9d38422a22b3",
};

// Lấy website ID từ window hoặc sử dụng default
const currentWebsiteId = window.chatbotWebsiteId || "default";
console.log("Using configuration for website ID:", currentWebsiteId);

// Lấy webhook URL tương ứng với website
const currentWebhookUrl = websiteWebhooks[currentWebsiteId] || websiteWebhooks["default"];

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent =
        className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
};

const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: userMessage,
            websiteId: currentWebsiteId, // Thêm website ID vào body để webhook có thể xử lý khác nhau
        }),
    };

    try {
        console.log(`Sending request to webhook: ${currentWebhookUrl}`);
        const response = await fetch(currentWebhookUrl, requestOptions);
        const data = await response.text();
        messageElement.textContent = data || data.message || "No response received";
    } catch (error) {
        console.error("Error fetching response:", error);
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    } finally {
        console.log("Scrolling chatbox to the bottom...");
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
};

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking, Please Wait...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
};

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
