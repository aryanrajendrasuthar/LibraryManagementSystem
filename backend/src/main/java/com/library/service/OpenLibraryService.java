package com.library.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenLibraryService {

    @Value("${app.openlibrary.base-url}")
    private String baseUrl;

    private final WebClient.Builder webClientBuilder;

    public Map<String, Object> lookupByIsbn(String isbn) {
        Map<String, Object> result = new HashMap<>();
        try {
            String key = "ISBN:" + isbn;
            JsonNode response = webClientBuilder.build()
                    .get()
                    .uri(baseUrl + "/api/books?bibkeys={key}&format=json&jscmd=data", key)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response == null || !response.has(key)) {
                return result;
            }

            JsonNode book = response.get(key);
            if (book.has("title")) result.put("title", book.get("title").asText());
            if (book.has("authors") && book.get("authors").isArray() && !book.get("authors").isEmpty()) {
                StringBuilder authors = new StringBuilder();
                book.get("authors").forEach(a -> {
                    if (authors.length() > 0) authors.append(", ");
                    authors.append(a.get("name").asText());
                });
                result.put("author", authors.toString());
            }
            if (book.has("publishers") && book.get("publishers").isArray() && !book.get("publishers").isEmpty()) {
                result.put("publisher", book.get("publishers").get(0).get("name").asText());
            }
            if (book.has("publish_date")) result.put("publishedYear", extractYear(book.get("publish_date").asText()));
            if (book.has("cover")) {
                JsonNode cover = book.get("cover");
                if (cover.has("large")) result.put("coverUrl", cover.get("large").asText());
                else if (cover.has("medium")) result.put("coverUrl", cover.get("medium").asText());
            }
            if (book.has("subjects") && book.get("subjects").isArray() && !book.get("subjects").isEmpty()) {
                result.put("category", book.get("subjects").get(0).get("name").asText());
            }
        } catch (Exception e) {
            log.warn("Open Library lookup failed for ISBN {}: {}", isbn, e.getMessage());
        }
        return result;
    }

    private Integer extractYear(String publishDate) {
        try {
            String[] parts = publishDate.split("[,\\s]+");
            for (String part : parts) {
                if (part.matches("\\d{4}")) return Integer.parseInt(part);
            }
        } catch (Exception ignored) {}
        return null;
    }
}
