package com.npt.fgac.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ChatGPTConfig {
    // .yml파일에서 값을 받아오는 코드
    // @Value를 사용하면 application.properties, application.yml, 시스템 환경 변수, 또는 시스템 속성에서 값을 가져와 스프링 빈의 필드에 주입할 수 있습니다.
    // 라이브러리 추가 하지않고 .yml파일에서 설정해줌 다른방법도 많음
    @Value("${my.api.key}")
    private String secretKey;

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate;
    }

    @Bean
    public HttpHeaders httpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
