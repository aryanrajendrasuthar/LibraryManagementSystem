package com.library.service;

import com.library.dto.LoanResponse;
import com.library.entity.Book;
import com.library.entity.Loan;
import com.library.entity.Loan.LoanStatus;
import com.library.entity.Member;
import com.library.exception.BusinessException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.LoanRepository;
import com.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BorrowingService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final FineService fineService;
    private final ReservationService reservationService;
    private final EmailService emailService;

    @Value("${app.loan.duration-days}")
    private int loanDurationDays;

    @Transactional
    public LoanResponse borrowBook(Long bookId, String memberEmail) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (!book.isAvailable()) {
            throw new BusinessException("No copies available for borrowing");
        }
        if (loanRepository.existsByBookIdAndMemberIdAndStatus(bookId, member.getId(), LoanStatus.ACTIVE) ||
                loanRepository.existsByBookIdAndMemberIdAndStatus(bookId, member.getId(), LoanStatus.OVERDUE)) {
            throw new BusinessException("You already have an active loan for this book");
        }
        long activeLoans = loanRepository.countActiveLoansByMember(member.getId());
        if (activeLoans >= member.getBorrowingLimit()) {
            throw new BusinessException("Borrowing limit reached (" + member.getBorrowingLimit() + " books)");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        LocalDateTime now = LocalDateTime.now();
        Loan loan = Loan.builder()
                .book(book)
                .member(member)
                .borrowedAt(now)
                .dueDate(now.plusDays(loanDurationDays))
                .status(LoanStatus.ACTIVE)
                .build();
        loan = loanRepository.save(loan);
        emailService.sendBorrowConfirmationEmail(member.getEmail(), member.getName(), book.getTitle(), loan.getDueDate());
        return LoanResponse.from(loan);
    }

    @Transactional
    public LoanResponse returnBook(Long loanId, String memberEmail) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));

        if (!loan.getMember().getEmail().equals(memberEmail)) {
            throw new BusinessException("Unauthorized to return this loan");
        }
        if (loan.getStatus() == LoanStatus.RETURNED) {
            throw new BusinessException("Book already returned");
        }

        loan.setReturnedAt(LocalDateTime.now());
        loan.setFineAmount(fineService.calculateFine(loan));
        loan.setStatus(LoanStatus.RETURNED);
        loanRepository.save(loan);

        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        // Auto-fulfill next reservation in queue
        reservationService.fulfillNextReservation(book.getId());

        return LoanResponse.from(loan);
    }

    public Page<LoanResponse> getMemberLoans(String memberEmail, Pageable pageable) {
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        return loanRepository.findByMemberIdOrderByBorrowedAtDesc(member.getId(), pageable)
                .map(LoanResponse::from);
    }

    public Page<LoanResponse> getAllLoans(Pageable pageable) {
        return loanRepository.findAllByOrderByBorrowedAtDesc(pageable).map(LoanResponse::from);
    }

    @Transactional
    public LoanResponse returnBookByAdmin(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
        if (loan.getStatus() == LoanStatus.RETURNED) {
            throw new BusinessException("Book already returned");
        }
        loan.setReturnedAt(LocalDateTime.now());
        loan.setFineAmount(fineService.calculateFine(loan));
        loan.setStatus(LoanStatus.RETURNED);
        loanRepository.save(loan);
        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);
        reservationService.fulfillNextReservation(book.getId());
        return LoanResponse.from(loan);
    }
}
