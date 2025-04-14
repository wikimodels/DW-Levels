import express from "npm:express@4.18.2";
import { getProxyKlineBySymbolController } from "../controller/proxy-kline.controller.ts";

const router = express.Router();
// Routes
router.get("/proxy-kline", getProxyKlineBySymbolController);

export default router;
