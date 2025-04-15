import express from "npm:express@4.18.2";
import {
  googleAuthController,
  refreshReposController,
  reloadConfigFromDopplerController,
} from "../controller/general.controller.ts";

const router = express.Router();
// Routes
router.get("/refresh-repos", refreshReposController);
router.get("/refresh-config", reloadConfigFromDopplerController);
router.post("/user-auth", googleAuthController);

export default router;
