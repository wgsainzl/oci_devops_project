package com.springboot.telegrambot.util;

public enum BotCommands {

	START_COMMAND("/start"), 
	HIDE_COMMAND("/hide"), 
	TODO_LIST("/tasks"),
	ADD_ITEM("/addtask"),
	LLM_REPORT("/report"),
	SPRINTS_LIST("/sprints"),
	UPDATE_TASK("/updatetask");

	private String command;

	BotCommands(String enumCommand) {
		this.command = enumCommand;
	}

	public String getCommand() {
		return command;
	}
}
