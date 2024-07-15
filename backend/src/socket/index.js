"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize_socket_server = initialize_socket_server;
const socket_io_1 = require("socket.io");
const cookie_1 = require("cookie");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function initialize_socket_server(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });
    const users = new Map();
    io.on("connection", (socket) => {
        console.log("new connection");
        const cookies = socket.handshake.headers.cookie;
        const parsedCookies = cookies && (0, cookie_1.parse)(cookies);
        // console.log(parsedCookies);
        if (!parsedCookies) {
            return;
        }
        const decoded = parsedCookies &&
            process.env.JWT_SECRET &&
            jsonwebtoken_1.default.verify(parsedCookies.token.replace("Bearer ", ""), process.env.JWT_SECRET);
        const { id, username, email } = decoded;
        users.set(id, { socketId: socket.id, username, email, id });
        io.emit("users", Array.from(users.values()));
        socket.on("disconnect", () => {
            console.log("user disconnected");
            users.delete(id);
            io.emit("users", Array.from(users.values()));
        });
        socket.on("ping", (id) => {
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
