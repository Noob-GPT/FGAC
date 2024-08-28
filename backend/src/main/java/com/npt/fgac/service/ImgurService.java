package com.npt.fgac.service;

import org.springframework.web.multipart.MultipartFile;

public interface ImgurService {
    String uploadImage(MultipartFile file);
}
