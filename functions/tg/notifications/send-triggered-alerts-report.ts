import { Alert } from "../../../models/alert.ts";

import { formatTriggeredAlertsMsg } from "../formatters/alerts-msg/triggered-alerts-msg.ts";
import { sendTgTechMessage } from "../tg-clients.ts";

export async function sendTriggeredAlertsReport(
  projectName: string,
  alerts: Alert[]
) {
  const msg = formatTriggeredAlertsMsg(projectName, alerts);
  await sendTgTechMessage(msg);
}
