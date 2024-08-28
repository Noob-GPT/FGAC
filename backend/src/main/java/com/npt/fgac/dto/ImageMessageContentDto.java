package com.npt.fgac.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class ImageMessageContentDto {
    private String role;
    private List<ImageText> content;
    public ImageMessageContentDto(String role, List<ImageText> content) {
        this.role = role;
        this.content = content;
    }
}
