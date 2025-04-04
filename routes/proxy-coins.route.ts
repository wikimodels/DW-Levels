import express from "npm:express@4.18.2";
import {
  getProxyCoins,
  updateProxyCoins,
} from "../controller/proxy-coins.controller.ts";

const router = express.Router();
// Routes
router.get("/proxy-coins", getProxyCoins);
router.get("/proxy-coins/refresh", updateProxyCoins);

export default router;
