package com.npt.fgac.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor  // 기본 생성자 추가
public class ChatMessageDto {
    private String role;
    private Object content;
    // JSON 역직렬화를 위한 생성자에 @JsonCreator 사용
    @JsonCreator
    public ChatMessageDto(String role, Object content) {
        this.role = role;
        this.content = content;
    }
}
