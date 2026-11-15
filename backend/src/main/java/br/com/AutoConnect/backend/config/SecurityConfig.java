package br.com.AutoConnect.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import br.com.AutoConnect.backend.security.JwtAuthFilter;
import br.com.AutoConnect.backend.security.JwtService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtService jwtService;

    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sessao -> sessao
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(erro -> erro
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"mensagem\":\"Acesso negado.\"}");
                }))
            .authorizeHttpRequests(regras -> regras
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/fotos/arquivo/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/ordens-servico/veiculos").hasAnyRole("CONSULTOR_TECNICO", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.POST, "/api/ordens-servico/*/aprovar", "/api/ordens-servico/*/recusar").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.GET, "/api/ordens-servico/**").hasAnyRole("CLIENTE", "CONSULTOR_TECNICO", "ADMINISTRADOR")
                .requestMatchers("/api/ordens-servico/**").hasAnyRole("CONSULTOR_TECNICO", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.PATCH, "/api/veiculos/*/estado").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/api/veiculos/disponiveis").hasAnyRole("CLIENTE", "CONSULTOR_VENDAS", "ADMINISTRADOR")
                .requestMatchers("/api/veiculos/**").hasAnyRole("ADMINISTRADOR", "CONSULTOR_VENDAS")
                .requestMatchers(HttpMethod.GET, "/api/clientes").hasAnyRole("CONSULTOR_VENDAS", "CONSULTOR_TECNICO", "ADMINISTRADOR")
                .requestMatchers("/api/test-drives/**").hasAnyRole("CLIENTE", "CONSULTOR_VENDAS", "ADMINISTRADOR")
                .anyRequest().authenticated())
            .addFilterBefore(new JwtAuthFilter(jwtService),
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5174", "http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource fonte = new UrlBasedCorsConfigurationSource();
        fonte.registerCorsConfiguration("/**", config);
        return fonte;
    }
}