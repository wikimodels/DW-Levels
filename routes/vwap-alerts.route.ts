import express from "npm:express@4.18.2";
import {
  addVwapAlertController,
  deleteBySymbolAndOpenTimeController,
  deleteManyVwapController,
  deleteOneVwapController,
  getVwapAlertsBySymbolController,
  getVwapAlertsController,
  moveManyVwapController,
  updateVwapAlertController,
} from "../controller/vwap-alerts.controller.ts";

const router = express.Router();

router.get("/vwap-alerts", getVwapAlertsController);
router.get("/vwap-alerts/symbol", getVwapAlertsBySymbolController);
router.delete(
  "/vwap-alerts/delete/symbol/openTime",
  deleteBySymbolAndOpenTimeController
);
router.post("/vwap-alerts/add/one", addVwapAlertController);
router.put("/vwap-alerts/update/one", updateVwapAlertController);
router.delete("/vwap-alerts/delete/many", deleteManyVwapController);
router.delete("/vwap-alerts/delete/one", deleteOneVwapController);
router.post("/vwap-alerts/move/many", moveManyVwapController);

export default router;
