import { PassedInitialConfig } from 'angular-auth-oidc-client';

// Minimal configuration that won't try to connect to external services
export const authConfig: PassedInitialConfig = {
    config: {
        // Use a placeholder that won't cause DNS issues
        authority: 'https://localhost:4200', // Local placeholder
        redirectUrl: window.location.origin + '/callback',
        postLogoutRedirectUri: window.location.origin + '/login',
        clientId: 'local-dev-client',
        scope: 'openid profile email',
        responseType: 'code',
        silentRenew: false, // Disable for local dev
        useRefreshToken: false, // Disable for local dev
        maxIdTokenIatOffsetAllowedInSeconds: 600,
        issValidationOff: true, // IMPORTANT: Disable validation for local dev
        autoUserInfo: false, // Disable for local dev
        secureRoutes: [], // No secure routes for local dev
        customParamsAuthRequest: {},
        customParamsRefreshTokenRequest: {}
    }
};
