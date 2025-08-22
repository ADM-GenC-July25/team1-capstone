import { PassedInitialConfig } from 'angular-auth-oidc-client';

// CORS-friendly configuration for AWS Cognito
export const authConfig: PassedInitialConfig = {
    config: {
        // Your actual Cognito domain
        authority: 'https://us-west-2aisdobluq.auth.us-west-2.amazoncognito.com',
        redirectUrl: window.location.origin + '/callback',
        postLogoutRedirectUri: window.location.origin + '/login',
        clientId: '3nte1afuliiln27dspmofnaqkc',
        scope: 'phone openid email profile',
        responseType: 'code',
        silentRenew: false, // Disable to avoid CORS issues during development
        useRefreshToken: true,
        maxIdTokenIatOffsetAllowedInSeconds: 600,
        issValidationOff: false,
        autoUserInfo: true,
        secureRoutes: ['http://localhost:8080'],
        // Add CORS-friendly settings
        customParamsAuthRequest: {
            // Custom parameters for auth request
        },
        customParamsRefreshTokenRequest: {
            // Custom parameters for refresh token
        },
        // Additional settings to help with CORS
        triggerAuthorizationResultEvent: true,
        postLoginRoute: '/',
        forbiddenRoute: '/forbidden',
        unauthorizedRoute: '/login',
        logLevel: 1, // Enable debug logging
        historyCleanupOff: false,
        ignoreNonceAfterRefresh: false
    }
};
