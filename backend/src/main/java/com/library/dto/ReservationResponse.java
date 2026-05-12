package com.library.dto;

import com.library.entity.Reservation;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ReservationResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private String bookCoverUrl;
    private Long memberId;
    private String memberName;
    private LocalDateTime reservedAt;
    private String status;

    public static ReservationResponse from(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .bookId(r.getBook().getId())
                .bookTitle(r.getBook().getTitle())
                .bookIsbn(r.getBook().getIsbn())
                .bookCoverUrl(r.getBook().getCoverUrl())
                .memberId(r.getMember().getId())
                .memberName(r.getMember().getName())
                .reservedAt(r.getReservedAt())
                .status(r.getStatus().name())
                .build();
    }
}
