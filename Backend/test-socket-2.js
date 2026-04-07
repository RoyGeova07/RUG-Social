const { io } = require("socket.io-client");

const URL = "http://localhost:3000";

const TOKEN = "NO CHELE, NO SUBIRE EL TOKENNNNNN";
const chatId = "253c8330-34f6-4628-b5c3-d374d0c17393";

const socket = io(URL, {
  auth: {
    token: TOKEN
  }
});

socket.on("connect", () => 
{

  console.log("🔵 USER 2 conectado:", socket.id);

  socket.emit("join_chat",chatId)
   console.log("➡️ USER 2 join chat");
  
});

// ✍️ typing
socket.on("user_typing", (data) => {
  console.log("✍️ USER 2 ve typing:", data);
});

socket.on("user_stopped_typing", (data) => {
  console.log("🛑 USER 2 ve stop typing:", data);
});

// 📩 mensajes
socket.on("new_message", (data) => {
  console.log("📩 USER 2 recibe mensaje:", data);
});

// 🗑️ delete
socket.on("message_deleted", (data) => {
  console.log("🗑️ USER 2 ve mensaje eliminado:", data);
});

// 🔔 notificaciones
socket.on("new_notification", (data) => {
  console.log("🔔 USER 2 notificación:", data);
});

// errores
socket.on("connect_error", (err) => {
  console.log("❌ Error conexión:", err.message);
});

socket.on("error", (err) => {
  console.log("❌ Error server:", err);
});