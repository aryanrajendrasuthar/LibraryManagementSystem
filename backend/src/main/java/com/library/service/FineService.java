package com.library.service;

import com.library.entity.Loan;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class FineService {

    @Value("${app.fine.daily-rate}")
    private double dailyRate;

    public BigDecimal calculateFine(Loan loan) {
        if (loan.getReturnedAt() == null && !loan.isOverdue()) return BigDecimal.ZERO;
        LocalDateTime end = loan.getReturnedAt() != null ? loan.getReturnedAt() : LocalDateTime.now();
        long overdueDays = ChronoUnit.DAYS.between(loan.getDueDate(), end);
        if (overdueDays <= 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(dailyRate * overdueDays).setScale(2, RoundingMode.HALF_UP);
    }
}
