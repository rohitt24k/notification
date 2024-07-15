"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.signin = signin;
exports.isLoggedIn = isLoggedIn;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
function signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, email, password } = req.body;
            const user = yield prisma.users.findUnique({
                where: {
                    email: email.toLowerCase(),
                },
            });
            if (user) {
                res.status(400).json({ error: "User already exists" });
                return;
            }
            const salt = yield bcrypt_1.default.genSalt(10);
            const password_hash = yield bcrypt_1.default.hash(password, salt);
            const newUser = yield prisma.users.create({
                data: {
                    username: username.toLowerCase(),
                    email: email.toLowerCase(),
                    password_hash,
                },
            });
            console.log(newUser);
            res
                .status(200)
                .json({ message: "User created successfully", data: newUser });
        }
        catch (error) {
            console.log(error);
            if (error instanceof Error) {
                res
                    .status(500)
                    .json({ error: "Internal server error", error_message: error.message });
            }
            else {
                res.status(500).json({
                    error: "Internal server error",
                    error_message: "an unknown error occured",
                });
            }
        }
    });
}
function signin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const user = yield prisma.users.findUnique({
                where: {
                    email: email.toLowerCase(),
                },
            });
            if (!user) {
                res.status(400).json({ error: "User not found" });
                return;
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password_hash);
            if (!isPasswordValid) {
                res.status(400).json({ error: "Invalid password" });
                return;
            }
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                username: user.username,
            }, process.env.JWT_SECRET);
            const cookieOptions = {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
            };
            res
                .status(200)
                .cookie("token", `Bearer ${token}`, cookieOptions)
                .json({ message: "User signed in" });
        }
        catch (error) {
            console.log(error);
            if (error instanceof Error) {
                res
                    .status(500)
                    .json({ error: "Internal server error", error_message: error.message });
            }
            else {
                res.status(500).json({
                    error: "Internal server error",
                    error_message: "an unknown error occured",
                });
            }
        }
    });
}
function isLoggedIn(req, res) {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const newToken = token.replace("Bearer ", "");
        const decoded = jsonwebtoken_1.default.verify(newToken, process.env.JWT_SECRET);
        res.status(200).json({ message: "User is logged in", data: decoded });
    }
    catch (error) {
        console.log(error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid or expired token" });
        }
        else if (error instanceof Error) {
            res
                .status(500)
                .json({ error: "Internal server error", error_message: error.message });
        }
        else {
            res.status(500).json({
                error: "Internal server error",
                error_message: "An unknown error occurred",
            });
        }
    }
}
