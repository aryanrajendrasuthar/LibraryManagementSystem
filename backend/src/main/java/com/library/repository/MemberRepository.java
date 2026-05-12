package com.library.repository;

import com.library.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);

    Optional<Member> findByMembershipId(String membershipId);

    boolean existsByEmail(String email);

    @Query("SELECT m FROM Member m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Member> searchMembers(String query, Pageable pageable);
}
