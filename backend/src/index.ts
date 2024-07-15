import express, { Request, Response } from "express";
import { config } from "dotenv";
import http from "http";
import authRoutes from "./routes/auth";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initialize_socket_server } from "./socket";

config();
const app = express();
const server = http.createServer(app);
initialize_socket_server(server);
const port = 8000 || process.env.PORT;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
