package com.npt.fgac.service;

import com.npt.fgac.dto.CompletionRequestDto;
import com.npt.fgac.dto.ImageMessageDto;

import java.util.List;
import java.util.Map;

public interface ChatGPTService {
    List<Map<String, Object>> modelList();
    List<Map<String, Object>> prompt(CompletionRequestDto completionRequestDto);
    List<Map<String, Object>> promptImage(ImageMessageDto imageMessageDto);
}
