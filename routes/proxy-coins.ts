import express from "npm:express@4.18.2";
import { getProxyCoins } from "../controller/proxy-coins.controller.ts";

const router = express.Router();
// Routes
router.get("/proxy-coins", getProxyCoins);

export default router;
