package com.npt.fgac.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor  // 기본 생성자 추가
public class ChatMessageDto {
    private String role;
    private String content;
    // JSON 역직렬화를 위한 생성자에 @JsonCreator 사용
    @JsonCreator
    public ChatMessageDto(String content) {
        this.role = "user";
        this.content = content;
    }
}
