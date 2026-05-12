package com.library.dto;

import com.library.entity.Loan;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class LoanResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private String bookAuthor;
    private String bookCoverUrl;
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private LocalDateTime borrowedAt;
    private LocalDateTime dueDate;
    private LocalDateTime returnedAt;
    private BigDecimal fineAmount;
    private boolean finePaid;
    private String status;
    private boolean overdue;

    public static LoanResponse from(Loan l) {
        return LoanResponse.builder()
                .id(l.getId())
                .bookId(l.getBook().getId())
                .bookTitle(l.getBook().getTitle())
                .bookIsbn(l.getBook().getIsbn())
                .bookAuthor(l.getBook().getAuthor())
                .bookCoverUrl(l.getBook().getCoverUrl())
                .memberId(l.getMember().getId())
                .memberName(l.getMember().getName())
                .memberEmail(l.getMember().getEmail())
                .borrowedAt(l.getBorrowedAt())
                .dueDate(l.getDueDate())
                .returnedAt(l.getReturnedAt())
                .fineAmount(l.getFineAmount())
                .finePaid(l.isFinePaid())
                .status(l.getStatus().name())
                .overdue(l.isOverdue())
                .build();
    }
}
