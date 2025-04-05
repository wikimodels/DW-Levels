import express from "npm:express@4.18.2";
import { refreshReposController } from "../controller/general.controller.ts";

const router = express.Router();
// Routes
router.get("/refresh-repos", refreshReposController);

export default router;
