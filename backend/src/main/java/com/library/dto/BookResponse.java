package com.library.dto;

import com.library.entity.Book;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class BookResponse {
    private Long id;
    private String isbn;
    private String title;
    private String author;
    private String category;
    private String publisher;
    private Integer publishedYear;
    private int totalCopies;
    private int availableCopies;
    private boolean available;
    private String coverUrl;
    private String description;
    private LocalDateTime createdAt;

    public static BookResponse from(Book b) {
        return BookResponse.builder()
                .id(b.getId())
                .isbn(b.getIsbn())
                .title(b.getTitle())
                .author(b.getAuthor())
                .category(b.getCategory())
                .publisher(b.getPublisher())
                .publishedYear(b.getPublishedYear())
                .totalCopies(b.getTotalCopies())
                .availableCopies(b.getAvailableCopies())
                .available(b.isAvailable())
                .coverUrl(b.getCoverUrl())
                .description(b.getDescription())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
