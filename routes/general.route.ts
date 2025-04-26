import express from "npm:express@4.18.2";
import {
  cleanTriggeredAlertsController,
  getConfigController,
  googleAuthController,
  refreshReposController,
  reloadConfigFromDopplerController,
  validateEmailController,
} from "../controller/general.controller.ts";

const router = express.Router();
// Routes
router.get("/config", getConfigController);
router.get("/refresh-repos", refreshReposController);
router.get("/refresh-config", reloadConfigFromDopplerController);
router.get("/clean-triggered-alerts", cleanTriggeredAlertsController);
router.post("/user-auth", googleAuthController);
router.post("/email/validate", validateEmailController);

export default router;
