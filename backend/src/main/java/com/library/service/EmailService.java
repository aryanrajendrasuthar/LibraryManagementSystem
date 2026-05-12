package com.library.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Async
    public void sendBorrowConfirmationEmail(String to, String name, String bookTitle, LocalDateTime dueDate) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject("Book Borrowed Successfully - " + bookTitle);
            msg.setText(String.format(
                "Dear %s,\n\nYou have successfully borrowed \"%s\".\nPlease return it by: %s.\n\nThank you,\nLibrary Management System",
                name, bookTitle, dueDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))
            ));
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Failed to send borrow confirmation email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendOverdueReminderEmail(String to, String name, String bookTitle, long overdueDays) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject("Overdue Book Reminder - " + bookTitle);
            msg.setText(String.format(
                "Dear %s,\n\nThe book \"%s\" is %d day(s) overdue.\nA fine of $%.2f/day is being accrued.\nPlease return it as soon as possible.\n\nThank you,\nLibrary Management System",
                name, bookTitle, overdueDays, 0.25
            ));
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Failed to send overdue reminder email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendReservationFulfilledEmail(String to, String name, String bookTitle) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject("Book Available for Pickup - " + bookTitle);
            msg.setText(String.format(
                "Dear %s,\n\nGreat news! The book \"%s\" that you reserved is now available.\nPlease visit the library to borrow it within 48 hours, or your reservation will expire.\n\nThank you,\nLibrary Management System",
                name, bookTitle
            ));
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Failed to send reservation fulfilled email to {}: {}", to, e.getMessage());
        }
    }
}
