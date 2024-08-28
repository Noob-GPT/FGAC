package com.npt.fgac.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class ImageUrl {
    private String url;
    @JsonCreator
    public ImageUrl(String url) {
        this.url = url;
    }
}
