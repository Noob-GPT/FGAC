package com.npt.fgac.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.npt.fgac.config.ChatGPTConfig;
import com.npt.fgac.dto.CompletionRequestDto;
import com.npt.fgac.dto.ImageMessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatGPTServiceImpl implements ChatGPTService {
    private final ChatGPTConfig chatGPTConfig;
    /**
     * 사용 가능한 모델 리스트를 조회하는 비즈니스 로직
     *
     * @return
     */
    @Override
    public List<Map<String, Object>> modelList() {
        log.debug("[+] 모델 리스트를 조회합니다.");
        List<Map<String, Object>> resultList = new ArrayList<>();

        // [STEP1] 토큰 정보가 포함된 Header를 가져옵니다.
        HttpHeaders headers = chatGPTConfig.httpHeaders();

        // [STEP2] 통신을 위한 RestTemplate을 구성합니다.
        ResponseEntity<String> response = chatGPTConfig.restTemplate()
                .exchange(
                        "https://api.openai.com/v1/models",
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        String.class);

        try {
            // [STEP3] Jackson을 기반으로 응답값을 가져옵니다.
            ObjectMapper om = new ObjectMapper();
            JsonNode rootNode = om.readTree(response.getBody());

            // JSON 최상위 노드에서 'data' 필드를 가져오기
            JsonNode dataNode = rootNode.path("data");

            if (dataNode.isArray()) {
                for (JsonNode node : dataNode) {
                    // 각 노드를 Map으로 변환
                    Map<String, Object> map = om.convertValue(node, new TypeReference<>() {});
                    resultList.add(map);
                }
            }

            // 디버깅용 로그 출력
            for (Map<String, Object> object : resultList) {
                String id = (String) object.get("id");
                String objectName = (String) object.get("object");
                Integer created = (Integer) object.get("created"); // 숫자는 Long으로 받는 것이 안전합니다.
                String ownedBy = (String) object.get("owned_by");
                log.debug("ID: " + object.get("id"));
                log.debug("Object: " + object.get("object"));
                log.debug("Created: " + object.get("created"));
                log.debug("Owned By: " + object.get("owned_by"));
            }
        } catch (JsonMappingException e) {
            System.out.println("JsonMappingException :: " + e.getMessage());
        } catch (JsonProcessingException e) {
            System.out.println("JsonProcessingException :: " + e.getMessage());
        }
        return resultList;
    }

    @Override
    public List<Map<String, Object>> prompt(CompletionRequestDto completionRequestDto) {
        log.debug("[+] 프롬프트를 수행합니다.");

        List<Map<String, Object>> resultList = new ArrayList<>();

        // [STEP1] 토큰 정보가 포함된 Header를 가져옵니다.
        HttpHeaders headers = chatGPTConfig.httpHeaders();

        // [STEP5] 통신을 위한 RestTemplate을 구성합니다.
        HttpEntity<CompletionRequestDto> requestEntity = new HttpEntity<>(completionRequestDto, headers);

        ResponseEntity<String> response = chatGPTConfig.restTemplate()
                .exchange(
                        "https://api.openai.com/v1/chat/completions",
                        HttpMethod.POST,
                        requestEntity,
                        String.class);

        try {
            // [STEP3] Jackson을 기반으로 응답값을 가져옵니다.
            ObjectMapper om = new ObjectMapper();
            JsonNode rootNode = om.readTree(response.getBody());

            // JSON 최상위 노드에서 'choices' 필드를 가져오기
            JsonNode choicesNode = rootNode.path("choices");

            // 'choices'가 배열인 경우 각각의 요소를 처리
            if (choicesNode.isArray()) {
                for (JsonNode node : choicesNode) {
                    // 각 'choice' 노드를 Map으로 변환
                    Map<String, Object> map = om.convertValue(node, new TypeReference<Map<String, Object>>() {});
                    resultList.add(map);
                }
            }

        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        return resultList;
    }
    @Override
    public List<Map<String, Object>> promptImage(ImageMessageDto imageMessageDto){
        log.debug("[+] 프롬프트를 수행합니다.");

        List<Map<String, Object>> resultList = new ArrayList<>();

        // [STEP1] 토큰 정보가 포함된 Header를 가져옵니다.
        HttpHeaders headers = chatGPTConfig.httpHeaders();

        // [STEP5] 통신을 위한 RestTemplate을 구성합니다.
        HttpEntity<ImageMessageDto> requestEntity = new HttpEntity<>(imageMessageDto, headers);

        ResponseEntity<String> response = chatGPTConfig.restTemplate()
                .exchange("https://api.openai.com/v1/chat/completions",
                        HttpMethod.POST,
                        requestEntity,
                        String.class);
        try {
            // [STEP3] Jackson을 기반으로 응답값을 가져옵니다.
            ObjectMapper om = new ObjectMapper();
            JsonNode rootNode = om.readTree(response.getBody());

            // JSON 최상위 노드에서 'choices' 필드를 가져오기
            JsonNode choicesNode = rootNode.path("choices");

            // 'choices'가 배열인 경우 각각의 요소를 처리
            if (choicesNode.isArray()) {
                for (JsonNode node : choicesNode) {
                    // 각 'choice' 노드를 Map으로 변환
                    Map<String, Object> map = om.convertValue(node, new TypeReference<Map<String, Object>>() {});
                    resultList.add(map);
                }
            }

        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        return resultList;

    }

}

//    /**
//     * 모델이 유효한지 확인하는 비즈니스 로직
//     *
//     * @param modelName
//     * @return
//     */
//    @Override
//    public List<Map<String, Object>> isValidModel(String modelName) {
//        log.debug("[+] 모델이 유효한지 조회합니다. 모델 : " + modelName);
//        List<Map<String, Object>> result;
//
//        // [STEP1] 토큰 정보가 포함된 Header를 가져옵니다.
//        HttpHeaders headers = chatGPTConfig.httpHeaders();
//
//        // [STEP2] 통신을 위한 RestTemplate을 구성합니다.
//        ResponseEntity response = chatGPTConfig.restTemplate()
//                .exchange(
//                        "<https://api.openai.com/v1/models/>" + modelName,
//                        HttpMethod.GET,
//                        new HttpEntity<>(headers),
//                        String.class);
//        try {
//            // [STEP3] Jackson을 기반으로 응답값을 가져옵니다.
//            ObjectMapper om = new ObjectMapper();
//            result = om.readValue(response.getBody(), new TypeReference<String>() {
//            });
//        } catch (
//                JsonProcessingException e) {
//            throw new RuntimeException(e);
//        }
//        return result;
//    }
//
//
//
//
//    /**
//     * ChatGTP 프롬프트 검색
//     *
//     * @param completionRequestDto
//     * @return
//     */
//    @Override
//    public List<Map<String, Object>> prompt(CompletionRequestDto completionRequestDto) {
//        log.debug("[+] 프롬프트를 수행합니다.");
//
//        List<Map<String, Object>> result = new HashMap<>();
//
//        // [STEP1] 토큰 정보가 포함된 Header를 가져옵니다.
//        HttpHeaders headers = chatGPTConfig.httpHeaders();
//
//        String requestBody = "";
//        ObjectMapper om = new ObjectMapper();
//        // [STEP3] properties의 model을 가져와서 객체에 추가합니다.
//        completionRequestDto = completionRequestDto.builder()
//                .model(model)
//                .prompt(completionRequestDto.getPrompt())
//                .temperature(0.8f)
//                .build();
//
//        try {
//            // [STEP4] Object -> String 직렬화를 구성합니다.
//            requestBody = om.writeValueAsString(completionRequestDto);
//        } catch (JsonProcessingException e) {
//            throw new RuntimeException(e);
//        }
//
//        // [STEP5] 통신을 위한 RestTemplate을 구성합니다.
//        HttpEntity requestEntity = new HttpEntity<>(completionRequestDto, headers);
//        ResponseEntity response = chatGPTConfig.restTemplate()
//                .exchange(
//                        "<https://api.openai.com/v1/completions>",
//                        HttpMethod.POST,
//                        requestEntity,
//                        String.class);
//        try {
//            // [STEP6] String -> HashMap 역직렬화를 구성합니다.
//            result = om.readValue(response.getBody(), new TypeReference<>() {
//            });
//        } catch (JsonProcessingException e) {
//            throw new RuntimeException(e);
//        }
//        return result;
//    }
//}
