import { Router } from "express";
import { handleWebhook } from "./webhool.controller.js";

const router = Router();

router.route("/github").post(handleWebhook);

export default router;