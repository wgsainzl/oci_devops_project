package com.springboot.MyTodoList.web.features.summaryjob.dto;

public class SummaryJobUpdateRequest {
    private String generatedSummary;
    private String errorMessage;

    public String getGeneratedSummary() {
        return generatedSummary;
    }

    public void setGeneratedSummary(String generatedSummary) {
        this.generatedSummary = generatedSummary;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
