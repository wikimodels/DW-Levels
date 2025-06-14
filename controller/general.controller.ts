// deno-lint-ignore-file no-explicit-any
import { Request, Response } from "npm:express@4.18.2";
import { refreshAlertsRepos } from "../functions/mongodb-vwap-alerts/refresh-alerts-repos.ts";
import { logger } from "../global/logger.ts";
import { refreashConfig } from "../functions/config/reload-config-from-doppler.ts";
import { authenticateUser } from "../functions/config/authenticate-user.ts";
import { validateEmail } from "../functions/config/validate-email.ts";
import { cleanTriggeredAlerts } from "../functions/utils/clean-triggered-alerts.ts";
import { ConfigOperator } from "../global/config-operator.ts";
import { proxyBinanceRequest } from "../functions/bi-proxy.ts";

export async function refreshAlertsReposController(
  _req: Request,
  res: Response
) {
  try {
    await refreshAlertsRepos();
    return res.status(200).json({ message: "Repos refreshed successfully!" });
  } catch (error) {
    logger.error("❌ Error refreshing repos:", error);
    return res
      .status(500)
      .json({ error: "Error in refreshAlertsReposController" });
  }
}

export async function cleanTriggeredAlertsController(
  _req: Request,
  res: Response
) {
  try {
    await cleanTriggeredAlerts();
    return res
      .status(200)
      .json({ message: "Triggered Alerts are cleaned up successfully!" });
  } catch (error) {
    logger.error("❌ Error cleaning up Triggered Alerts:", error);
    return res
      .status(500)
      .json({ error: "Error in cleanTriggeredAlertsController" });
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

export const validateEmailController = async (req: any, res: any) => {
  try {
    // Extract the token from the request body or Authorization header
    const email = req.body?.email;
    console.log(email);
    if (!email) {
      return res.status(400).send("Email is missing");
    }

    const data = await validateEmail(email);
    res.send(data);
  } catch (error) {
    logger.error("Error in googleAuthController:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getConfigController = (_req: any, res: any) => {
  try {
    res.send(ConfigOperator.getConfig());
  } catch (error) {
    logger.error("Error in getConfigController:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getBinanceProxyController = async (req: any, res: any) => {
  console.log(req.url);
  try {
    const response = await proxyBinanceRequest(); // this is a Response object

    const body = await response.text(); // extract body text
    const status = response.status;
    const contentType =
      response.headers.get("Content-Type") || "application/json";

    res.status(status).set("Content-Type", contentType).send(body);
  } catch (error) {
    logger.error("Error in getBinanceProxyController:", error);
    res.status(500).send("Internal Server Error");
  }
};
