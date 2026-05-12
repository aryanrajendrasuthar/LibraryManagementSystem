package com.library.controller;

import com.library.dto.MemberResponse;
import com.library.entity.Member;
import com.library.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/me")
    public MemberResponse getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return memberService.getCurrentMember(userDetails.getUsername());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public Page<MemberResponse> getMembers(@RequestParam(required = false) String query,
                                            @PageableDefault(size = 20) Pageable pageable) {
        return memberService.searchMembers(query != null ? query : "", pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public MemberResponse getMember(@PathVariable Long id) {
        return memberService.getMember(id);
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public MemberResponse updateRole(@PathVariable Long id, @RequestParam Member.Role role) {
        return memberService.updateRole(id, role);
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public MemberResponse toggleActive(@PathVariable Long id) {
        return memberService.toggleActive(id);
    }
}
