package com.npt.fgac.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ImageText {
    private String type;
    private String text;
    private ImageUrl imageUrl; // JSON 키와 일치시키기 위해 변경

    @JsonCreator
    public ImageText(@JsonProperty("type") String type,
                     @JsonProperty("text") String text,
                     @JsonProperty("image_url") ImageUrl imageUrl) {
        this.type = type;
        this.text = text;
        this.imageUrl = imageUrl;
    }
}

