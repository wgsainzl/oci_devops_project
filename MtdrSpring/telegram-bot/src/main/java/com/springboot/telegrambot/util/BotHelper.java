package com.springboot.telegrambot.util;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.methods.ParseMode;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboard;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.generics.TelegramClient;

public class BotHelper {

    private static final Logger logger = LoggerFactory.getLogger(BotHelper.class);

    public static void sendMessageToTelegram(Long chatId, String text, TelegramClient bot) {
        try {
            // prepare message
            SendMessage messageToTelegram = 
                    SendMessage
                    .builder()
                    .chatId(chatId)
                    .text(text)
                    .replyMarkup(new ReplyKeyboardRemove(true))
                    .build();

            // send message
            bot.execute(messageToTelegram);

        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    public static void sendMessageToTelegram(Long chatId, String text, TelegramClient bot, ReplyKeyboardMarkup rk ) {
        try {
            // prepare message
            SendMessage messageToTelegram = 
                    SendMessage
                    .builder()
                    .chatId(chatId)
                    .text(text)
                    .replyMarkup(rk)
                    .build();

            // send message
            bot.execute(messageToTelegram);

        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    public static void sendHtmlMessageToTelegram(Long chatId, String text, TelegramClient bot) {
        try {
            SendMessage messageToTelegram = 
                    SendMessage
                    .builder()
                    .chatId(chatId)
                    .text(text)
                    .parseMode(ParseMode.HTML)
                    .replyMarkup(new ReplyKeyboardRemove(true))
                    .build();

            bot.execute(messageToTelegram);
        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    // --- NEW: HTML + Custom Keyboard ---
    public static void sendHtmlMessageWithKeyboard(Long chatId, String text, TelegramClient bot, ReplyKeyboard rk) {
        try {
            SendMessage messageToTelegram = 
                    SendMessage
                    .builder()
                    .chatId(chatId)
                    .text(text)
                    .parseMode(ParseMode.HTML)
                    .replyMarkup(rk)
                    .build();

            bot.execute(messageToTelegram);

        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
    }

    public static void sendMarkdown(Long chatId, String markdownText, TelegramClient bot) {
        if (markdownText == null || markdownText.isBlank()) return;
        
        String telegramHtml = toTelegramHtml(markdownText);
        
        if (telegramHtml.length() <= 4000) {
            sendHtmlChunk(chatId, telegramHtml, markdownText, bot);
            return;
        }

        // Message is too long, chunk it by lines to avoid breaking HTML tags
        String[] lines = telegramHtml.split("\n");
        StringBuilder currentChunk = new StringBuilder();
        
        for (String line : lines) {
            if (currentChunk.length() + line.length() + 1 > 4000) {
                sendHtmlChunk(chatId, currentChunk.toString(), currentChunk.toString().replaceAll("<[^>]*>", ""), bot);
                currentChunk = new StringBuilder();
            }
            currentChunk.append(line).append("\n");
        }
        if (currentChunk.length() > 0) {
            sendHtmlChunk(chatId, currentChunk.toString(), currentChunk.toString().replaceAll("<[^>]*>", ""), bot);
        }
    }

    private static void sendHtmlChunk(Long chatId, String htmlText, String fallbackText, TelegramClient bot) {
        try {
            SendMessage messageToTelegram = SendMessage.builder()
                    .chatId(chatId)
                    .text(htmlText)
                    .parseMode(ParseMode.HTML)
                    .replyMarkup(new ReplyKeyboardRemove(true)) // Clear keyboards on reports
                    .build();
            bot.execute(messageToTelegram);
        } catch (Exception e) {
            logger.warn("Formatted message parsing failed, sending plain text to chatId={}", chatId, e);
            // Fallback to plain text if HTML tags are malformed
            sendMessageToTelegram(chatId, fallbackText, bot);
        }
    }

    private static String toTelegramHtml(String markdownText) {
        String[] lines = markdownText.split("\\r?\\n");
        StringBuilder html = new StringBuilder();
        for (String rawLine : lines) {
            String line = rawLine == null ? "" : rawLine.trim();
            if (line.startsWith("### ")) {
                html.append("<b>").append(escapeHtml(line.substring(4))).append("</b>\n");
            } else if (line.startsWith("## ")) {
                html.append("<b>").append(escapeHtml(line.substring(3))).append("</b>\n");
            } else if (line.startsWith("# ")) {
                html.append("<b>").append(escapeHtml(line.substring(2))).append("</b>\n");
            } else if (line.startsWith("- ")) {
                html.append("• ").append(escapeHtml(line.substring(2))).append("\n");
            } else {
                html.append(escapeHtml(rawLine)).append("\n");
            }
        }
        
        String result = html.toString().trim();
        // Convert ** bold ** to <b> bold </b>
        result = result.replaceAll("\\*\\*(.*?)\\*\\*", "<b>$1</b>");
        // Convert * italic * to <i> italic </i>
        result = result.replaceAll("(?<!\\*)\\*(?!\\*)(.*?)(?<!\\*)\\*(?!\\*)", "<i>$1</i>");
        // Convert ` code ` to <code> code </code>
        result = result.replaceAll("`([^`]+)`", "<code>$1</code>");
        
        return result;
    }

    private static String escapeHtml(String text) {
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    public static org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup createKeyboard(java.util.List<String> buttons) {
        org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup keyboardMarkup = 
            org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup.builder().resizeKeyboard(true).build();
        
        java.util.List<org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow> keyboard = new java.util.ArrayList<>();
        
        org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow row = new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow();
        for (String btn : buttons) {
            row.add(btn);
        }
        keyboard.add(row);
        
        org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow cancelRow = new org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow();
        cancelRow.add("/cancel");
        keyboard.add(cancelRow);
        
        keyboardMarkup.setKeyboard(keyboard);
        return keyboardMarkup;
    }
}