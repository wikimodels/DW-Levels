import express from "npm:express@4.18.2";
import {
  addWorkingCoinController,
  deleteWorkingCoinsController,
  getWorkingCoinsController,
} from "../controller/coins.controller.ts";

const router = express.Router();

router.get("/working-coins", getWorkingCoinsController);
router.post("/working-coins/add/one", addWorkingCoinController);
router.put("/working-coins/update/one", addWorkingCoinController);
router.delete("/working-coins/delete/many", deleteWorkingCoinsController);

export default router;
