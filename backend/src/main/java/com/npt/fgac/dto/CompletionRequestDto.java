package com.npt.fgac.dto;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CompletionRequestDto {

    private String model;

    private List<ChatMessageDto> messages;

    private float temperature;

    public CompletionRequestDto(ChatMessageDto messages) {
        this.model = "gpt-4o";
        this.messages = new ArrayList<>();  // 리스트 초기화
        this.messages.add(messages);
        this.temperature = 0.8f;
    }
}
