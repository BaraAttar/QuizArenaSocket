// roomHandler.js
const { startQuiz } = require("./quiz/startQuiz");
const roomCache = new Map(); // أو استبدل بـ roomCache إذا لديك ملف خارجي

function getRoomMembers(io, roomID) {
  const room = io.sockets.adapter.rooms.get(roomID);
  if (!room) return [];
  return Array.from(room)
    .map((id, index) => {
      const socket = io.sockets.sockets.get(id);
      return {
        userName: socket?.user?.userName ?? null,
        isAdmin: index === 0,
      };
    })
    .filter(member => member.userName !== null);
}

function emitRoomMembers(io, roomID) {
  const members = getRoomMembers(io, roomID);
  io.to(roomID).emit("room-members", { members });
}

function joinRoom(io, client, roomID) {
  const room = io.sockets.adapter.rooms.get(roomID);
  const roomSize = room?.size ?? 0;

  if (room) {
    for (const socketId of room) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket?.user?.id === client.user?.id) {
        client.emit("already-in-room", {
          status: 409,
          message: `User ${client.user.id} is already in room ${roomID}.`,
        });
        return false;
      }
    }
  }

  if (roomSize >= 2) {
    client.emit("room-full", {
      status: 403,
      message: `Room ${roomID} is full.`,
    });
    return false;
  }

  client.join(roomID);
  emitRoomMembers(io, roomID);
  return true;
}

function handleDisconnect(io, client, roomID) {
  client.to(roomID).emit("user-left", { userID: client.user?.id });
  const currentRoom = io.sockets.adapter.rooms.get(roomID);
  if (!currentRoom || currentRoom.size === 0) {
    roomCache.delete(roomID);
  } else {
    emitRoomMembers(io, roomID);
  }
}

module.exports = (io, client) => {
  const roomID = client.handshake.query?.roomID ? String(client.handshake.query.roomID) : null;

  if (!roomID) {
    client.emit("error", { message: "RoomID is required" });
    client.disconnect(true);
    return;
  }

  const joined = joinRoom(io, client, roomID);
  if (!joined) return;

  // تشغيل اللعبة إذا وصل عدد اللاعبين 2 ولم تبدأ بعد
  const roomSize = io.sockets.adapter.rooms.get(roomID)?.size ?? 0;
  if (roomSize === 2 && !roomCache.has(roomID)) {
    startQuiz(io, roomID);
  }

  client.on("disconnect", () => handleDisconnect(io, client, roomID));
};
