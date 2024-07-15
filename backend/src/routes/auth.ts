import express, { Request, Response } from "express";
import { signin, signup, isLoggedIn } from "../controllers/auth";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", signin);
router.get("/is-logged-in", isLoggedIn);

export default router;
