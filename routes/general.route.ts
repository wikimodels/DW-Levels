import express from "npm:express@4.18.2";
import {
  cleanTriggeredAlertsController,
  googleAuthController,
  refreshReposController,
  reloadConfigFromDopplerController,
  validateEmailController,
} from "../controller/general.controller.ts";

const router = express.Router();
// Routes
router.get("/refresh-repos", refreshReposController);
router.get("/refresh-config", reloadConfigFromDopplerController);
router.post("/user-auth", googleAuthController);
router.post("/clean-triggered-alerts", cleanTriggeredAlertsController);
router.post("/email/validate", validateEmailController);

export default router;
