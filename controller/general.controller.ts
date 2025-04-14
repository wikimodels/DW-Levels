import { Request, Response } from "npm:express@4.18.2";
import { refreshRepos } from "../functions/mongodb-vwap-alerts/refresh-repos.ts";
import { logger } from "../global/logger.ts";

export async function refreshReposController(_req: Request, res: Response) {
  try {
    await refreshRepos();
    return res.status(200).json({ message: "Repos refreshed successfully!" });
  } catch (error) {
    logger.error("❌ Error refreshing repos:", error);
    return res.status(500).json({ error: "Error in refreshReposController" });
  }
}
