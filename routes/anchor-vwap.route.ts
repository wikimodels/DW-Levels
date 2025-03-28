import express from "npm:express@4.18.2";
import {
  saveAnchorPoint,
  deleteAnchorPoint,
  getAnchorPointsBySymbol,
  getAllAnchorPoints,
} from "../controller/anchored-vwap.controller.ts";

const router = express.Router();
router.get("/anchor-point/symbol", getAnchorPointsBySymbol);
router.post("/anchor-point/add", saveAnchorPoint);
router.post("/anchor-point/delete", deleteAnchorPoint);
router.post("/anchor-point/all", getAllAnchorPoints);

export default router;
