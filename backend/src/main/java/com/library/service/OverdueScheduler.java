package com.library.service;

import com.library.entity.Loan;
import com.library.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OverdueScheduler {

    private final LoanRepository loanRepository;
    private final EmailService emailService;

    // Runs every day at 8 AM
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendOverdueReminders() {
        List<Loan> overdueLoans = loanRepository.findOverdueLoans(LocalDateTime.now());
        log.info("Found {} overdue loans", overdueLoans.size());
        overdueLoans.forEach(loan -> {
            long days = ChronoUnit.DAYS.between(loan.getDueDate(), LocalDateTime.now());
            emailService.sendOverdueReminderEmail(
                    loan.getMember().getEmail(),
                    loan.getMember().getName(),
                    loan.getBook().getTitle(),
                    days
            );
        });
    }
}
