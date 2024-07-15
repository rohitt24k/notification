import { Server } from "socket.io";
import { Server as httpServer } from "http";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

function initialize_socket_server(server: httpServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  const users = new Map();

  io.on("connection", (socket) => {
    console.log("new connection");

    const cookies = socket.handshake.headers.cookie;
    const parsedCookies = cookies && parse(cookies);
    // console.log(parsedCookies);

    if (!parsedCookies) {
      return;
    }

    const decoded =
      parsedCookies &&
      process.env.JWT_SECRET &&
      jwt.verify(
        parsedCookies.token.replace("Bearer ", ""),
        process.env.JWT_SECRET
      );

    const { id, username, email } = decoded as {
      id: string;
      username: string;
      email: string;
    };

    users.set(id, { socketId: socket.id, username, email, id });
    io.emit("users", Array.from(users.values()));

    socket.on("disconnect", () => {
      console.log("user disconnected");
      users.delete(id);
      io.emit("users", Array.from(users.values()));
    });

    socket.on("ping", (id: string) => {
      const user = users.get(id);

      if (user) {
        io.to(user.socketId).emit("ping", { username });
      }
    });

    socket.on("pingAll", () => {
      socket.broadcast.emit("ping", { username });
    });
  });

  return io;
}

export { initialize_socket_server };
