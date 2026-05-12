package com.library.service;

import com.library.dto.AuthRequest;
import com.library.dto.AuthResponse;
import com.library.dto.RegisterRequest;
import com.library.entity.Member;
import com.library.exception.BusinessException;
import com.library.repository.MemberRepository;
import com.library.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (memberRepository.existsByEmail(req.getEmail())) {
            throw new BusinessException("Email already registered");
        }
        String membershipId = "MEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Member member = Member.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .membershipId(membershipId)
                .role(Member.Role.MEMBER)
                .build();
        memberRepository.save(member);
        String token = jwtUtils.generateToken(member.getEmail());
        return buildResponse(member, token);
    }

    public AuthResponse login(AuthRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        Member member = memberRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BusinessException("Invalid credentials"));
        String token = jwtUtils.generateToken(member.getEmail());
        return buildResponse(member, token);
    }

    private AuthResponse buildResponse(Member m, String token) {
        return AuthResponse.builder()
                .token(token)
                .email(m.getEmail())
                .name(m.getName())
                .role(m.getRole().name())
                .membershipId(m.getMembershipId())
                .build();
    }
}
