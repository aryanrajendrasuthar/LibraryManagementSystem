package com.library.service;

import com.library.dto.BookRequest;
import com.library.dto.BookResponse;
import com.library.entity.Book;
import com.library.exception.BusinessException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final OpenLibraryService openLibraryService;

    public Page<BookResponse> searchBooks(String query, String category, Boolean available, Pageable pageable) {
        return bookRepository.searchBooks(query, category, available, pageable).map(BookResponse::from);
    }

    public BookResponse getBook(Long id) {
        return BookResponse.from(findById(id));
    }

    public List<String> getCategories() {
        return bookRepository.findAllCategories();
    }

    @Transactional
    public BookResponse addBook(BookRequest req) {
        if (bookRepository.existsByIsbn(req.getIsbn())) {
            throw new BusinessException("A book with ISBN " + req.getIsbn() + " already exists");
        }
        Book book = Book.builder()
                .isbn(req.getIsbn())
                .title(req.getTitle())
                .author(req.getAuthor())
                .category(req.getCategory())
                .publisher(req.getPublisher())
                .publishedYear(req.getPublishedYear())
                .totalCopies(req.getTotalCopies())
                .availableCopies(req.getTotalCopies())
                .coverUrl(req.getCoverUrl())
                .description(req.getDescription())
                .build();
        return BookResponse.from(bookRepository.save(book));
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest req) {
        Book book = findById(id);
        int diff = req.getTotalCopies() - book.getTotalCopies();
        book.setIsbn(req.getIsbn());
        book.setTitle(req.getTitle());
        book.setAuthor(req.getAuthor());
        book.setCategory(req.getCategory());
        book.setPublisher(req.getPublisher());
        book.setPublishedYear(req.getPublishedYear());
        book.setTotalCopies(req.getTotalCopies());
        book.setAvailableCopies(Math.max(0, book.getAvailableCopies() + diff));
        book.setCoverUrl(req.getCoverUrl());
        book.setDescription(req.getDescription());
        return BookResponse.from(bookRepository.save(book));
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = findById(id);
        if (book.getAvailableCopies() < book.getTotalCopies()) {
            throw new BusinessException("Cannot delete a book with active loans");
        }
        bookRepository.delete(book);
    }

    public Map<String, Object> lookupIsbn(String isbn) {
        return openLibraryService.lookupByIsbn(isbn);
    }

    Book findById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + id));
    }
}
