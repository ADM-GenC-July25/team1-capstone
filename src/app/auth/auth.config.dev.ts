import { PassedInitialConfig } from 'angular-auth-oidc-client';

// Development configuration for testing without AWS Cognito
export const authConfigDev: PassedInitialConfig = {
    config: {
        // Mock/test configuration - disable OIDC for development
        authority: 'https://demo.duendesoftware.com', // Demo identity server
        redirectUrl: window.location.origin + '/callback',
        postLogoutRedirectUri: window.location.origin + '/login',
        clientId: 'interactive.public',
        scope: 'openid profile email',
        responseType: 'code',
        silentRenew: false,
        useRefreshToken: false,
        maxIdTokenIatOffsetAllowedInSeconds: 600,
        issValidationOff: true, // Disable for development
        autoUserInfo: false,
        secureRoutes: [],
        customParamsAuthRequest: {},
        customParamsRefreshTokenRequest: {}
    }
};

// Production configuration for AWS Cognito
export const authConfigProd: PassedInitialConfig = {
    config: {
        // REPLACE WITH YOUR ACTUAL COGNITO DOMAIN
        authority: 'https://your-domain.auth.us-west-2.amazoncognito.com',
        redirectUrl: window.location.origin + '/callback',
        postLogoutRedirectUri: window.location.origin + '/login',
        clientId: '3nte1afuliiln27dspmofnaqkc', // Your actual client ID
        scope: 'phone openid email profile',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        maxIdTokenIatOffsetAllowedInSeconds: 600,
        issValidationOff: false,
        autoUserInfo: true,
        secureRoutes: ['http://localhost:8080'],
        customParamsAuthRequest: {},
        customParamsRefreshTokenRequest: {}
    }
};

// Use development config for now, switch to production when Cognito is properly configured
export const authConfig = authConfigDev;
