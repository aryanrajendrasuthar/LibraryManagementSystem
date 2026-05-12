package com.library.dto;

import com.library.entity.Member;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class MemberResponse {
    private Long id;
    private String name;
    private String email;
    private String membershipId;
    private String role;
    private int borrowingLimit;
    private boolean active;
    private LocalDateTime createdAt;

    public static MemberResponse from(Member m) {
        return MemberResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .email(m.getEmail())
                .membershipId(m.getMembershipId())
                .role(m.getRole().name())
                .borrowingLimit(m.getBorrowingLimit())
                .active(m.isActive())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
