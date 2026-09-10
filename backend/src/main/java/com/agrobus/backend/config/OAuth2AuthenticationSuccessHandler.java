package com.agrobus.backend.config;

import com.agrobus.backend.dto.AuthResponse;
import com.agrobus.backend.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)
                || !(oauthToken.getPrincipal() instanceof OAuth2User googleUser)) {
            redirectWithError(request, response, "invalid_oauth_response");
            return;
        }

        try {
            AuthResponse authResponse = userService.authenticateGoogle(googleUser);
            String redirect = UriComponentsBuilder.fromUriString(frontendUrl)
                    .path("/oauth/callback")
                    .fragment("token=" + authResponse.getToken()
                            + "&email=" + encode(authResponse.getEmail())
                            + "&fullName=" + encode(authResponse.getFullName())
                            + "&role=" + encode(authResponse.getRole())
                            + "&userId=" + authResponse.getUserId()
                            + "&pictureUrl=" + encode(authResponse.getPictureUrl()))
                    .build()
                    .toUriString();
            clearAuthenticationAttributes(request);
            getRedirectStrategy().sendRedirect(request, response, redirect);
        } catch (IllegalArgumentException ex) {
            redirectWithError(request, response, "missing_verified_email");
        } catch (IllegalStateException ex) {
            redirectWithError(request, response, "account_conflict_or_disabled");
        }  catch (RuntimeException ex) {
    ex.printStackTrace();
    redirectWithError(request, response, "oauth_login_failed");
        }
    }

    private void redirectWithError(HttpServletRequest request, HttpServletResponse response, String error)
            throws IOException {
        getRedirectStrategy().sendRedirect(request, response,
                UriComponentsBuilder.fromUriString(frontendUrl)
                        .path("/oauth/callback")
                        .queryParam("error", error)
                        .build()
                        .toUriString());
    }

    private String encode(String value) {
        return UriComponentsBuilder.fromUriString("http://localhost")
                .queryParam("value", value)
                .build()
                .getQueryParams()
                .getFirst("value");
    }
}
