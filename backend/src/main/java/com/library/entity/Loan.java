package com.library.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "borrowed_at", nullable = false)
    private LocalDateTime borrowedAt = LocalDateTime.now();

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Column(name = "fine_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @Column(name = "fine_paid", nullable = false)
    private boolean finePaid = false;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private LoanStatus status = LoanStatus.ACTIVE;

    public enum LoanStatus {
        ACTIVE, RETURNED, OVERDUE
    }

    public boolean isOverdue() {
        return status == LoanStatus.ACTIVE && LocalDateTime.now().isAfter(dueDate);
    }
}
