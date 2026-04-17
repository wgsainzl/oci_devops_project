package com.springboot.MyTodoList.web.auth.oci;

import com.springboot.MyTodoList.web.features.user.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class OciIdentityService {

    private final UserService userService;
    @Value("${oci.domain.url}")
    private String domainUrl;

    @Value("${oci.client.id}")
    private String clientId;

    @Value("${oci.client.secret}")
    private String clientSecret;

    @Value("${oci.group.id}")
    private String groupId;

    private final WebClient webClient = WebClient.builder().build();

    public OciIdentityService(UserService userService) {
        this.userService = userService;
    }

    // 1. Get OAuth Token
    private String getAdminToken() {
        return webClient.post()
                .uri(domainUrl + "/oauth2/v1/token")
                .headers(h -> h.setBasicAuth(clientId, clientSecret))
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue("grant_type=client_credentials&scope=urn:opc:idm:__myscopes__")
                .retrieve()
                .bodyToMono(Map.class)
                .map(res -> res.get("access_token").toString())
                .block();
    }


    // 2. Main Invite Flow
    public void inviteUser(String email, String firstName, String lastName) {
        String ociUserId = inviteOracleUser(email, firstName, lastName);
    }


    public String inviteOracleUser(String email, String firstName, String lastName) {
        String token = getAdminToken();

        // Step A: Create User
        Map<String, Object> userPayload = Map.of(
                "schemas", List.of("urn:ietf:params:scim:schemas:core:2.0:User"),
                "userName", email,
                "name", Map.of("givenName", firstName, "familyName", lastName),
                "emails", List.of(Map.of("value", email, "type", "home", "primary", true)),
                "displayName", firstName + " " + lastName
        );

        var userResponse = webClient.post()
                .uri(domainUrl + "/admin/v1/Users")
                .headers(h -> h.setBearerAuth(token))
                .header("Content-Type", "application/scim+json")
                .bodyValue(userPayload)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        String userId = Objects.requireNonNull(userResponse).get("id").toString();

        // Step B: Add to Group
        Map<String, Object> patchPayload = Map.of(
                "schemas", List.of("urn:ietf:params:scim:api:messages:2.0:PatchOp"),
                "Operations", List.of(Map.of(
                        "op", "add",
                        "path", "members",
                        "value", List.of(Map.of("value", userId))
                ))
        );

        webClient.patch()
                .uri(domainUrl + "/admin/v1/Groups/" + groupId)
                .headers(h -> h.setBearerAuth(token))
                .header("Content-Type", "application/scim+json")
                .bodyValue(patchPayload)
                .retrieve()
                .toBodilessEntity()
                .block();

        return userId;
    }
}
