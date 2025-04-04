import express from "npm:express@4.18.2";
import { getProxyKlineBySymbol } from "../controller/proxy-kline.controller.ts";

const router = express.Router();
// Routes
router.get("/proxy-kline", getProxyKlineBySymbol);

export default router;
