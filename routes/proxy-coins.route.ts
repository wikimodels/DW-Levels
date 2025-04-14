import express from "npm:express@4.18.2";
import {
  getProxyCoinsController,
  updateProxyCoinsController,
} from "../controller/proxy-coins.controller.ts";

const router = express.Router();
// Routes
router.get("/proxy-coins", getProxyCoinsController);
router.get("/proxy-coins/refresh", updateProxyCoinsController);

export default router;
