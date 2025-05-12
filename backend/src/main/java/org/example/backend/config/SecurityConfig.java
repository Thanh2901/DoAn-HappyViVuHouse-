package org.example.backend.config;

//import com.cntt.rentalmanagement.secruity.CustomUserDetailsService;
//import com.cntt.rentalmanagement.secruity.RestAuthenticationEntryPoint;
//import com.cntt.rentalmanagement.secruity.TokenAuthenticationFilter;
//import com.cntt.rentalmanagement.secruity.oauth2.CustomOAuth2UserService;
//import com.cntt.rentalmanagement.secruity.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;
//import com.cntt.rentalmanagement.secruity.oauth2.OAuth2AuthenticationFailureHandler;
//import com.cntt.rentalmanagement.secruity.oauth2.OAuth2AuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.example.backend.security.CustomUserDetailsService;
import org.example.backend.security.TokenAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(
        securedEnabled = true,
        jsr250Enabled = true,
        prePostEnabled = true
)
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
//    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
//    private final CustomOAuth2UserService customOAuth2UserService;
//    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
//    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    private final TokenAuthenticationFilter tokenAuthenticationFilter;
//    private final HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    private static final String[] WHITELIST = {
            "/",
            "/send",
            "/ws/**",
            "/room/**",
            "/error",
            "/favicon.ico",
            "/static/**",
            "/auth/**",
            "/electric",
            "/oauth2/**",
            "/export-bill/**",
            "/customer/room/**",
            "/account/send-mail/contact",
            "/account/customer/**",
            "/room/{userId}/rentaler", // Tách riêng, không dùng /** sau {userId}
            "/account/{id}",           // Tách riêng, không dùng /** sau {id}
            "/request/customer",
            "/view-file/**",
            "/document/**",
            "/image/**",
            // Thêm các đường dẫn Swagger sau đây
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/webjars/**"
    };

    @Value("${app.cors.allowedOrigins}")
    private String[] allowedOrigins;

    @Bean
    public SecurityFilterChain configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .exceptionHandling(exceptionHandling ->
//                        exceptionHandling.authenticationEntryPoint(restAuthenticationEntryPoint))
                .authorizeHttpRequests(authorizeRequests -> authorizeRequests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(WHITELIST).permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(provider())
                .addFilterBefore(tokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
//                .oauth2Login(oauth2 -> oauth2
//                        .authorizationEndpoint(authEndpoint -> authEndpoint
//                                .baseUri("/oauth2/authorize")
//                                .authorizationRequestRepository(cookieAuthorizationRequestRepository))
//                        .redirectionEndpoint(redirect -> redirect
//                                .baseUri("/oauth2/callback/*"))
//                        .userInfoEndpoint(userInfo -> userInfo
//                                .userService(customOAuth2UserService))
//                        .successHandler(oAuth2AuthenticationSuccessHandler)
//                        .failureHandler(oAuth2AuthenticationFailureHandler));
        return httpSecurity.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // Hardcode để test
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With")); // Hỗ trợ header Authorization
        configuration.setExposedHeaders(Arrays.asList("Authorization")); // Trả về header Authorization nếu cần
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider provider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
}