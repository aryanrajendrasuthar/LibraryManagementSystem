package com.library.service;

import com.library.dto.MemberResponse;
import com.library.entity.Member;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberResponse getCurrentMember(String email) {
        return MemberResponse.from(findByEmail(email));
    }

    public Page<MemberResponse> searchMembers(String query, Pageable pageable) {
        return memberRepository.searchMembers(query, pageable).map(MemberResponse::from);
    }

    public MemberResponse getMember(Long id) {
        return MemberResponse.from(memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + id)));
    }

    @Transactional
    public MemberResponse updateRole(Long id, Member.Role role) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + id));
        member.setRole(role);
        return MemberResponse.from(memberRepository.save(member));
    }

    @Transactional
    public MemberResponse toggleActive(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + id));
        member.setActive(!member.isActive());
        return MemberResponse.from(memberRepository.save(member));
    }

    private Member findByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
    }
}
