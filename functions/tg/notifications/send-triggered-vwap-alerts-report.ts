import { VwapAlert } from "../../../models/vwap-alert.ts";

import { formatTriggeredVwapAlertsMsg } from "../formatters/alerts-msg/triggered-vwap-alerts-msg.ts";
import { sendTgTechMessage } from "../tg-clients.ts";

export async function sendTriggeredVwapAlertsReport(
  projectName: string,
  alerts: VwapAlert[]
) {
  const msg = formatTriggeredVwapAlertsMsg(projectName, alerts);
  await sendTgTechMessage(msg);
}
