package org.example.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Auth auth = new Auth();

    public AppProperties() {
    }

    public Auth getAuth() {
        return auth;
    }

    public static class Auth {
        private String tokenSecret;
        private long tokenExpirationMsec;

        public Auth() {
        }

        public Auth(String tokenSecret, long tokenExpirationMsec) {
            this.tokenSecret = tokenSecret;
            this.tokenExpirationMsec = tokenExpirationMsec;
        }

        public String getTokenSecret() {
            return tokenSecret;
        }

        public void setTokenSecret(String tokenSecret) {
            this.tokenSecret = tokenSecret;
        }

        public long getTokenExpirationMsec() {
            return tokenExpirationMsec;
        }

        public void setTokenExpirationMsec(long tokenExpirationMsec) {
            this.tokenExpirationMsec = tokenExpirationMsec;
        }
    }
}
