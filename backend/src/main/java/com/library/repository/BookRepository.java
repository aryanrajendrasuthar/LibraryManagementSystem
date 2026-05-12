package com.library.repository;

import com.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    @Query("""
        SELECT b FROM Book b
        WHERE (:query IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :query, '%')))
        AND (:category IS NULL OR b.category = :category)
        AND (:available IS NULL OR (:available = TRUE AND b.availableCopies > 0)
                                OR (:available = FALSE AND b.availableCopies = 0))
        """)
    Page<Book> searchBooks(@Param("query") String query,
                           @Param("category") String category,
                           @Param("available") Boolean available,
                           Pageable pageable);

    @Query("SELECT DISTINCT b.category FROM Book b ORDER BY b.category")
    List<String> findAllCategories();

    @Query("SELECT COUNT(b) FROM Book b WHERE b.category = :category")
    long countByCategory(@Param("category") String category);

    @Query("SELECT b.category, COUNT(b) FROM Book b GROUP BY b.category")
    List<Object[]> countByEachCategory();
}
