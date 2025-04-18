// deno-lint-ignore-file no-explicit-any
import { Request, Response } from "npm:express@4.18.2";
import { refreshRepos } from "../functions/mongodb-vwap-alerts/refresh-repos.ts";
import { logger } from "../global/logger.ts";
import { refreashConfig } from "../functions/config/reload-config-from-doppler.ts";
import { authenticateUser } from "../functions/config/authenticate-user.ts";

export async function refreshReposController(_req: Request, res: Response) {
  try {
    await refreshRepos();
    return res.status(200).json({ message: "Repos refreshed successfully!" });
  } catch (error) {
    logger.error("❌ Error refreshing repos:", error);
    return res.status(500).json({ error: "Error in refreshReposController" });
  }
}

export const reloadConfigFromDopplerController = async (
  _req: any,
  res: any
) => {
  try {
    const data = await refreashConfig();

    res.send(data);
  } catch (error) {
    logger.error("Error retrieving reloadConfigFromDopplerController:", error);
    res.status(500).send("Error in reloadConfigFromDopplerController");
  }
};

export const googleAuthController = async (req: any, res: any) => {
  try {
    // Extract the token from the request body or Authorization header
    const jwtToken =
      req.body?.token || req.headers?.authorization?.split(" ")[1];
    console.log(jwtToken);
    if (!jwtToken) {
      return res.status(400).send("Token is missing");
    }

    const data = await authenticateUser(jwtToken);
    res.send(data);
  } catch (error) {
    logger.error("Error in googleAuthController:", error);
    res.status(500).send("Internal Server Error");
  }
};
