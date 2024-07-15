import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface requestBody {
  username: string;
  email: string;
  password: string;
}

export async function signup(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body as unknown as requestBody;

    const user = await prisma.users.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (user) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await prisma.users.create({
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
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: "Internal server error", error_message: error.message });
    } else {
      res.status(500).json({
        error: "Internal server error",
        error_message: "an unknown error occured",
      });
    }
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const { email, password } = req.body as unknown as requestBody;
    const user = await prisma.users.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(400).json({ error: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET as string
    );

    let currentDate = new Date();

    let oneMonthFromNow = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const cookieOptions = {
      httpOnly: true,
      sameSite: "none" as const,
      secure: true,
      expires: oneMonthFromNow,
    };

    res
      .status(200)
      .cookie("token", `Bearer ${token}`, cookieOptions)
      .json({ message: "User signed in" });
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: "Internal server error", error_message: error.message });
    } else {
      res.status(500).json({
        error: "Internal server error",
        error_message: "an unknown error occured",
      });
    }
  }
}

export function isLoggedIn(req: Request, res: Response) {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const newToken = token.replace("Bearer ", "");

    const decoded = jwt.verify(newToken, process.env.JWT_SECRET as string);

    res.status(200).json({ message: "User is logged in", data: decoded });
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid or expired token" });
    } else if (error instanceof Error) {
      res
        .status(500)
        .json({ error: "Internal server error", error_message: error.message });
    } else {
      res.status(500).json({
        error: "Internal server error",
        error_message: "An unknown error occurred",
      });
    }
  }
}
