package com.npt.fgac.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ImageMessageDto {
    private String model;
    private List<ImageMessageContentDto> messages;
    public ImageMessageDto(String model, List<ImageMessageContentDto> messages){
        this.model = model;
        this.messages = messages;
    }
}
