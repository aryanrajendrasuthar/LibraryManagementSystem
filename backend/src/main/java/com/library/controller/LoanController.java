package com.library.controller;

import com.library.dto.LoanResponse;
import com.library.service.BorrowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final BorrowingService borrowingService;

    @PostMapping("/borrow/{bookId}")
    @ResponseStatus(HttpStatus.CREATED)
    public LoanResponse borrowBook(@PathVariable Long bookId,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        return borrowingService.borrowBook(bookId, userDetails.getUsername());
    }

    @PatchMapping("/{loanId}/return")
    public LoanResponse returnBook(@PathVariable Long loanId,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        return borrowingService.returnBook(loanId, userDetails.getUsername());
    }

    @GetMapping("/my")
    public Page<LoanResponse> getMyLoans(@AuthenticationPrincipal UserDetails userDetails,
                                          @PageableDefault(size = 10) Pageable pageable) {
        return borrowingService.getMemberLoans(userDetails.getUsername(), pageable);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public Page<LoanResponse> getAllLoans(@PageableDefault(size = 20) Pageable pageable) {
        return borrowingService.getAllLoans(pageable);
    }

    @PatchMapping("/{loanId}/admin-return")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public LoanResponse adminReturn(@PathVariable Long loanId) {
        return borrowingService.returnBookByAdmin(loanId);
    }
}
