// deno-lint-ignore-file no-explicit-any

import { TelegramBot } from "https://deno.land/x/telegram_bot_api@0.4.0/mod.ts";
import { logger } from "../../global/logger.ts";

import { ConfigOperator } from "../../global/config-operator.ts";
import { TelegramBotOperator } from "../../global/tg-bot-operator.ts";

// Helper function to send a message
async function sendMessage(
  bot: TelegramBot,
  chatId: string,
  msg: string,
  fallbackBot: TelegramBot,
  parseMode: string = "html"
) {
  try {
    await bot.sendMessage({
      chat_id: chatId,
      parse_mode: parseMode,
      text: msg,
      disable_web_page_preview: true,
    });
  } catch (error: any) {
    logger.error(`Error sending message with primary bot:`, error);

    // If the primary bot fails, use the fallback bot to send the error message
    try {
      await fallbackBot.sendMessage({
        chat_id: chatId,
        parse_mode: parseMode,
        text: `Error: ${error.message}\nOriginal message: ${msg}`,
        disable_web_page_preview: true,
      });
    } catch (fallbackError) {
      logger.error(`Error sending message with fallback bot:`, fallbackError);
    }
  }
}

// Function to send a general message using the technical bot
export async function sendTgTechMessage(msg: string) {
  const config = ConfigOperator.getConfig();
  const techBot = TelegramBotOperator.getTechBot();
  const businessBot = TelegramBotOperator.getBusinessBot();
  await sendMessage(techBot, config.tgUser, msg, businessBot);
}

// Function to send a business-related message using the business bot
export async function sendTgBusinessMessage(msg: string) {
  const config = ConfigOperator.getConfig();
  const techBot = TelegramBotOperator.getTechBot();
  const businessBot = TelegramBotOperator.getBusinessBot();
  await sendMessage(businessBot, config.tgUser, msg, techBot);
}
