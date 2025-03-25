import express from "npm:express@4.18.2";
import {
  saveAnchorPoint,
  calculateVWAP,
  getVWAPData,
  deleteVWAPData,
} from "../controller/anchored-vwap.controller.ts";

const router = express.Router();

// Route to save an anchor point
router.post("/anchor-point", saveAnchorPoint);

// Route to calculate and save VWAP
router.post("/anchored-vwap", calculateVWAP);

// Route to fetch VWAP data by symbol
router.get("/anchored-vwap/:symbol", getVWAPData);

// Route to delete VWAP data
router.delete("/anchored-vwap/:symbol", deleteVWAPData);

export default router;
