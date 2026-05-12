package com.library.repository;

import com.library.entity.Loan;
import com.library.entity.Loan.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    Page<Loan> findByMemberIdOrderByBorrowedAtDesc(Long memberId, Pageable pageable);

    List<Loan> findByMemberIdAndStatus(Long memberId, LoanStatus status);

    Optional<Loan> findByBookIdAndMemberIdAndStatus(Long bookId, Long memberId, LoanStatus status);

    boolean existsByBookIdAndMemberIdAndStatus(Long bookId, Long memberId, LoanStatus status);

    // Count ACTIVE + OVERDUE — both consume borrowing limit
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.member.id = :memberId AND l.status IN ('ACTIVE', 'OVERDUE')")
    long countActiveLoansByMember(@Param("memberId") Long memberId);

    // Only ACTIVE loans past due date — picked up by scheduler to mark OVERDUE
    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :now")
    List<Loan> findOverdueLoans(@Param("now") LocalDateTime now);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate BETWEEN :start AND :end")
    List<Loan> findLoansDueSoon(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    Page<Loan> findAllByOrderByBorrowedAtDesc(Pageable pageable);

    @Query("SELECT FUNCTION('TO_CHAR', l.borrowedAt, 'YYYY-MM') as month, COUNT(l) FROM Loan l GROUP BY FUNCTION('TO_CHAR', l.borrowedAt, 'YYYY-MM') ORDER BY month DESC")
    List<Object[]> countLoansPerMonth();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status IN ('ACTIVE', 'OVERDUE')")
    long countActiveLoans();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'OVERDUE'")
    long countOverdueLoans();
}
