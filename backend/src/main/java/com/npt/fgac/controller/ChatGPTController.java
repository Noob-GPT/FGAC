package com.npt.fgac.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.npt.fgac.dto.*;
import com.npt.fgac.service.ChatGPTService;
import com.npt.fgac.service.ImgurService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1/chatGpt")
@RequiredArgsConstructor
@Slf4j
public class ChatGPTController {
    private final ChatGPTService chatGPTService;
    private final ImgurService imgurService;

    /**
     * [API] ChatGPT 모델 리스트를 조회합니다.
     */
    @GetMapping("/modelList")
    public ResponseEntity<List<Map<String, Object>>> selectModelList() {
        List<Map<String, Object>> result = chatGPTService.modelList();
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    /**
     * [API] ChatGPT 모델 리스트를 조회합니다.
     */
    @PostMapping("/prompt")
    public ResponseEntity<List<Map<String, Object>>> selectPrompt(@RequestBody ChatMessageDto chatMessageDto) {
        CompletionRequestDto completionRequestDto = new CompletionRequestDto(chatMessageDto);
        List<Map<String, Object>> result = chatGPTService.prompt(completionRequestDto);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/image")
    public ResponseEntity<String> selectImage(@RequestParam("image") MultipartFile multipartFile) {
        if (multipartFile.isEmpty()) {
            return new ResponseEntity<>("Please select a file to upload", HttpStatus.BAD_REQUEST);
        }
        String fileName = imgurService.uploadImage(multipartFile);
        return new ResponseEntity<>(fileName, HttpStatus.OK);
    }

    @PostMapping(value = "/prompt/image")
    public ResponseEntity<List<Map<String, Object>>> selectPrompt(
            @RequestParam("text") String text,
            @RequestParam("imgUrl") String imgUrl) throws JsonProcessingException {
        log.debug(imgUrl);
        ObjectMapper objectMapper = new ObjectMapper();

        // Imgur에 사진 업로드
        String imgurUrl = imgUrl;
//        String imgurUrl = imgurService.uploadImage(multipartFile);

        // ImageText 객체 생성
        ImageText imageText = new ImageText("text", text, null);
        ImageUrl imageUrl = new ImageUrl(imgurUrl);
        ImageText imageURL = new ImageText("image_url", null, imageUrl);

        // ImageMessageContentDto 객체 생성
        ImageMessageContentDto imageMessageContentDto = new ImageMessageContentDto("user", Arrays.asList(imageText, imageURL));

        // ImageMessageDto 객체 생성
        ImageMessageDto imageMessageDto = new ImageMessageDto("gpt-4o", Arrays.asList(imageMessageContentDto));

        // 객체를 JSON 문자열로 변환
        String jsonString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(imageMessageDto);

        // JSON 문자열 출력
        System.out.println(jsonString);

        // ChatGPT 서비스 호출
        List<Map<String, Object>> result = chatGPTService.promptImage(imageMessageDto);

        return new ResponseEntity<>(result, HttpStatus.OK);
    }


//    @PostMapping(value = "/prompt/image", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
//    public ResponseEntity<List<Map<String, Object>>> selectPrompt(
//            @RequestParam("text") String text,
//            @RequestPart("imageFile") MultipartFile multipartFile) throws JsonProcessingException {
//
//        ObjectMapper objectMapper = new ObjectMapper();
//
//        // Imgur에 사진 업로드
//        String imgurUrl = imgurService.uploadImage(multipartFile);
//
//        // ImageText 객체 생성
//        ImageText imageText = new ImageText("text", text, null);
//        ImageUrl imageUrl = new ImageUrl(imgurUrl);
//        ImageText imageURL = new ImageText("image_url", null, imageUrl);
//
//        // ImageMessageContentDto 객체 생성
//        ImageMessageContentDto imageMessageContentDto = new ImageMessageContentDto("user", Arrays.asList(imageText, imageURL));
//
//        // ImageMessageDto 객체 생성
//        ImageMessageDto imageMessageDto = new ImageMessageDto("gpt-4o", Arrays.asList(imageMessageContentDto));
//
//        // 객체를 JSON 문자열로 변환
//        String jsonString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(imageMessageDto);
//
//        // JSON 문자열 출력
//        System.out.println(jsonString);
//
//        // ChatGPT 서비스 호출
//        List<Map<String, Object>> result = chatGPTService.promptImage(imageMessageDto);
//
//        return new ResponseEntity<>(result, HttpStatus.OK);
//    }
}
