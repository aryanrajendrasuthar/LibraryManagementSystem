package com.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class BookRequest {
    @NotBlank
    private String isbn;
    @NotBlank
    private String title;
    @NotBlank
    private String author;
    @NotBlank
    private String category;
    private String publisher;
    private Integer publishedYear;
    @NotNull @Positive
    private Integer totalCopies;
    private String coverUrl;
    private String description;
}
