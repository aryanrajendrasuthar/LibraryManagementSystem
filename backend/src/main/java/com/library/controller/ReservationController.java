package com.library.controller;

import com.library.dto.ReservationResponse;
import com.library.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/books/{bookId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse reserve(@PathVariable Long bookId,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.reserveBook(bookId, userDetails.getUsername());
    }

    @PatchMapping("/{id}/cancel")
    public void cancel(@PathVariable Long id,
                       @AuthenticationPrincipal UserDetails userDetails) {
        reservationService.cancelReservation(id, userDetails.getUsername());
    }

    @GetMapping("/my")
    public List<ReservationResponse> getMyReservations(@AuthenticationPrincipal UserDetails userDetails) {
        return reservationService.getMemberReservations(userDetails.getUsername());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public List<ReservationResponse> getAllReservations() {
        return reservationService.getAllReservations();
    }
}
