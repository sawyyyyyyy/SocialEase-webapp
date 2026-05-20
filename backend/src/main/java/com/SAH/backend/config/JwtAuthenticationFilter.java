package com.SAH.backend.config;

import com.SAH.backend.service.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String path = request.getServletPath();
        log.debug("Filtering {} {}, authHeader={}", request.getMethod(), path,
                authHeader != null ? "present" : "null");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            log.debug("Token extracted, length={}", token.length());

            boolean valid = jwtTokenProvider.validateToken(token);
            log.debug("Token valid: {}", valid);

            if (valid) {
                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                log.debug("User ID from token: {}", userId);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userId.toString(), null, new ArrayList<>());
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("Authentication set for user {}", userId);
            }
        } else {
            log.debug("No Bearer token found in Authorization header");
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        log.debug("shouldNotFilter check for path={}", path);
        boolean skip = path.startsWith("/auth/");
        log.debug("shouldNotFilter result: {}", skip);
        return skip;
    }
}
