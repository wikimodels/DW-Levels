import express from "npm:express@4.18.2";
import {
  cleanTriggeredAlertsController,
  getBinanceProxyController,
  getConfigController,
  googleAuthController,
  refreshAlertsReposController,
  reloadConfigFromDopplerController,
  validateEmailController,
} from "../controller/general.controller.ts";

const router = express.Router();
// Routes
router.get("/bi", getBinanceProxyController);
router.get("/config", getConfigController);
router.get("/refresh-repos", refreshAlertsReposController);
router.get("/refresh-config", reloadConfigFromDopplerController);
router.get("/clean-triggered-alerts", cleanTriggeredAlertsController);
router.post("/user-auth", googleAuthController);
router.post("/email/validate", validateEmailController);

export default router;
