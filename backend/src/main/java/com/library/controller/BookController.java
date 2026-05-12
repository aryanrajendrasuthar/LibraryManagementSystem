package com.library.controller;

import com.library.dto.BookRequest;
import com.library.dto.BookResponse;
import com.library.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public Page<BookResponse> searchBooks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean available,
            @PageableDefault(size = 12) Pageable pageable) {
        return bookService.searchBooks(query, category, available, pageable);
    }

    @GetMapping("/{id}")
    public BookResponse getBook(@PathVariable Long id) {
        return bookService.getBook(id);
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return bookService.getCategories();
    }

    @GetMapping("/isbn-lookup/{isbn}")
    public Map<String, Object> lookupIsbn(@PathVariable String isbn) {
        return bookService.lookupIsbn(isbn);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public BookResponse addBook(@Valid @RequestBody BookRequest req) {
        return bookService.addBook(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public BookResponse updateBook(@PathVariable Long id, @Valid @RequestBody BookRequest req) {
        return bookService.updateBook(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
    }
}
