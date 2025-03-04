import express from "npm:express@4.18.2";

import {
  addAlertController,
  updateAlertController,
  getAlertsController,
  deleteManyController,
  moveManyController
} from "../controller/alerts.controller.ts";

const router = express.Router();
// Routes
// Define the route for fetching alerts based on collection name
router.get("/alerts", getAlertsController);
router.post("/alerts/add/one", addAlertController);
router.put("/alerts/update/one", updateAlertController);
router.delete("/alerts/delete/many", deleteManyController);
router.post("/alerts/move/many", moveManyController);
export default router;
