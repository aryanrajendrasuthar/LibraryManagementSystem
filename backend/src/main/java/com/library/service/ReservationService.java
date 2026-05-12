package com.library.service;

import com.library.dto.ReservationResponse;
import com.library.entity.Book;
import com.library.entity.Member;
import com.library.entity.Reservation;
import com.library.entity.Reservation.ReservationStatus;
import com.library.exception.BusinessException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.MemberRepository;
import com.library.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final EmailService emailService;

    @Transactional
    public ReservationResponse reserveBook(Long bookId, String memberEmail) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (book.isAvailable()) {
            throw new BusinessException("Book is currently available — please borrow it directly");
        }
        if (reservationRepository.existsByBookIdAndMemberIdAndStatus(bookId, member.getId(), ReservationStatus.PENDING)) {
            throw new BusinessException("You already have a pending reservation for this book");
        }

        Reservation reservation = Reservation.builder()
                .book(book)
                .member(member)
                .status(ReservationStatus.PENDING)
                .build();
        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    @Transactional
    public void cancelReservation(Long reservationId, String memberEmail) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        if (!reservation.getMember().getEmail().equals(memberEmail)) {
            throw new BusinessException("You can only cancel your own reservations");
        }
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    @Transactional
    public void fulfillNextReservation(Long bookId) {
        reservationRepository.findNextInQueue(bookId).ifPresent(reservation -> {
            reservation.setStatus(ReservationStatus.FULFILLED);
            reservationRepository.save(reservation);
            emailService.sendReservationFulfilledEmail(
                    reservation.getMember().getEmail(),
                    reservation.getMember().getName(),
                    reservation.getBook().getTitle()
            );
        });
    }

    public List<ReservationResponse> getMemberReservations(String memberEmail) {
        Member member = memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        return reservationRepository.findByMemberIdOrderByReservedAtDesc(member.getId())
                .stream().map(ReservationResponse::from).toList();
    }

    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream().map(ReservationResponse::from).toList();
    }
}
