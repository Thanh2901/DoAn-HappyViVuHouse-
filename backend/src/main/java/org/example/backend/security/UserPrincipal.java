package org.example.backend.security;

import org.example.backend.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class UserPrincipal implements UserDetails {
    private final Long id;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private Map<String, Object> attributes;

    public UserPrincipal(Long id, String email, String password, List<GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities; // Trả về danh sách quyền thực tế
    }

    @Override
    public String getPassword() {
        return password; // Trả về mật khẩu thực tế
    }

    @Override
    public String getUsername() {
        return email; // Trả về email làm username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Giả sử tài khoản không hết hạn
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Kiểm tra này đã được thực hiện trong CustomUserDetailsService
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Giả sử thông tin xác thực không hết hạn
    }

    @Override
    public boolean isEnabled() {
        return true; // Giả sử tài khoản luôn bật
    }
}