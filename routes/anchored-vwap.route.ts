import express from "npm:express@4.18.2";
import {
  saveAnchorPoint,
  deleteAnchorPoint,
  getAnchorPoints,
} from "../controller/anchored-vwap.controller.ts";

const router = express.Router();
router.get("/anchor-point", getAnchorPoints);
router.post("/anchor-point/add", saveAnchorPoint);
router.post("/anchor-point/delete", deleteAnchorPoint);

export default router;
