const { io } = require("socket.io-client");

const URL = "http://localhost:3000";
let lastMessageId = null;

const TOKEN = "QUERIAS VER EL TOKEN DEL USUARIO VA? JAJAJAJA";
const chatId = "253c8330-34f6-4628-b5c3-d374d0c17393";

const socket = io(URL, {
  auth: {
    token: TOKEN
  }
});

socket.on("connect", () => {
  console.log("🟢 USER 1 conectado:", socket.id);

  socket.emit("join_chat", chatId);
  console.log("➡️ USER 1 join chat");

  // ✍️ typing
  setTimeout(() => {
    console.log("✍️ USER 1 escribiendo...");
    socket.emit("typing_start", chatId);

    setTimeout(() => {
      console.log("🛑 USER 1 dejó de escribir");
      socket.emit("typing_stop", chatId);
    }, 3000);
  }, 2000);

  // 📤 texto
  setTimeout(() => {
    socket.emit("send_message", {
      chatId,
      type: "texto",
      contenido: "Hola desde USER 1 🔥"
    });

    console.log("📤 USER 1 envió texto");
  }, 6000);

  // 🖼️ imagen
  setTimeout(() => {
    socket.emit("send_message", {
      chatId,
      type: "imagen",
      media_url: "https://picsum.photos/400/300"
    });

    console.log("🖼️ USER 1 envió imagen");
  }, 9000);

  // 🎵 audio
  setTimeout(() => {
    socket.emit("send_message", {
      chatId,
      type: "audio",
      media_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duracion_segundos: 120
    });

    console.log("🎵 USER 1 envió audio");
  }, 12000);

  // 🎥 enviar video
  setTimeout(() => {
    socket.emit("send_message", {
      chatId,
      type: "video",
      media_url: "https://www.w3schools.com/html/mov_bbb.mp4"
    });

    console.log("🎥 USER 1 envió video");
  }, 15000);

  // 🎭 enviar sticker
  setTimeout(() => {
    socket.emit("send_message", {
      chatId,
      type: "sticker",
      sticker_id: "c56518aa-e1a0-43fa-8f41-f7f35e67c43f"
    });

    console.log("🎭 USER 1 envió sticker");
  }, 18000);

  // 🗑️ eliminar último mensaje
  // setTimeout(() => {
  //   if (!lastMessageId) {
  //     console.log("❌ No hay mensaje para eliminar");
  //     return;
  //   }

  //   socket.emit("delete_message", {
  //     chatId,
  //     messageId: lastMessageId
  //   });

  //   console.log("🗑️ USER 1 eliminó mensaje:", lastMessageId);
  // }, 16000);
});

// 📩 mensajes
socket.on("new_message", (data) => {
  console.log("📩 USER 1 recibe mensaje:", data);

  // 🔥 SOLO guardar si es mensaje propio
  if (data.remitente_id === socket.id || data.remitente_id) {
    lastMessageId = data.id;
  }
});

// 🗑️ confirmación delete
socket.on("message_deleted", (data) => {
  console.log("🗑️ USER 1 ve mensaje eliminado:", data);
});

// 🔔 notificaciones
socket.on("new_notification", (data) => {
  console.log("🔔 USER 1 notificación:", data);
});

// errores
socket.on("connect_error", (err) => {
  console.log("❌ Error conexión:", err.message);
});

socket.on("error", (err) => {
  console.log("❌ Error server:", err);
});