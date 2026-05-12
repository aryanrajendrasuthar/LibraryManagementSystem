package com.library.service;

import com.library.repository.BookRepository;
import com.library.repository.LoanRepository;
import com.library.repository.MemberRepository;
import com.library.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookRepository bookRepository;
    private final LoanRepository loanRepository;
    private final MemberRepository memberRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBooks", bookRepository.count());
        stats.put("totalMembers", memberRepository.count());
        stats.put("activeLoans", loanRepository.countActiveLoans());
        stats.put("overdueLoans", loanRepository.countOverdueLoans());

        // Books by category
        List<Object[]> catData = bookRepository.countByEachCategory();
        Map<String, Long> byCategory = catData.stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
        stats.put("booksByCategory", byCategory);

        // Loans per month (last 12)
        List<Object[]> loanData = loanRepository.countLoansPerMonth();
        Map<String, Long> loansPerMonth = loanData.stream()
                .limit(12)
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1],
                        (a, b) -> a, LinkedHashMap::new));
        stats.put("loansPerMonth", loansPerMonth);

        return stats;
    }
}
