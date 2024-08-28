package com.npt.fgac.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ImageText {
    private String type;
    private String text;
    private ImageUrl image_url;

    @JsonCreator
    public ImageText(String type, String text, ImageUrl image_url) {
        this.type = type;
        this.text = text;
        this.image_url = image_url;
    }
}

