package com.library.repository;

import com.library.entity.Reservation;
import com.library.entity.Reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByMemberIdOrderByReservedAtDesc(Long memberId);

    boolean existsByBookIdAndMemberIdAndStatus(Long bookId, Long memberId, ReservationStatus status);

    Optional<Reservation> findByBookIdAndMemberIdAndStatus(Long bookId, Long memberId, ReservationStatus status);

    // Oldest pending reservation for a book (FIFO queue)
    @Query("""
        SELECT r FROM Reservation r
        WHERE r.book.id = :bookId AND r.status = 'PENDING'
        ORDER BY r.reservedAt ASC
        LIMIT 1
        """)
    Optional<Reservation> findNextInQueue(@Param("bookId") Long bookId);

    List<Reservation> findByBookIdAndStatus(Long bookId, ReservationStatus status);

    long countByBookIdAndStatus(Long bookId, ReservationStatus status);
}
