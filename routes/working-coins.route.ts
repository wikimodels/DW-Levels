import express from "npm:express@4.18.2";
import {
  addWorkingCoinController,
  addWorkingCoinsController,
  deleteWorkingCoinsController,
  getWorkingCoinsController,
} from "../controller/coins.controller.ts";

const router = express.Router();

router.get("/working-coins", getWorkingCoinsController);
router.post("/working-coins/add/one", addWorkingCoinController);
router.post("/working-coins/add/many", addWorkingCoinsController);
router.put("/working-coins/update/one", addWorkingCoinController);
router.delete("/working-coins/delete/many", deleteWorkingCoinsController);

export default router;
