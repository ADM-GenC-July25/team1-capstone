import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
    // Your actual Cognito domain - IMPORTANT: This must match your configured domain in AWS
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
    // Additional settings to help with configuration issues
    triggerAuthorizationResultEvent: true,
    logLevel: 0, // Enable ALL logging (most verbose)
    customParamsAuthRequest: {},
    customParamsRefreshTokenRequest: {},
    // Additional debugging settings
    renewTimeBeforeTokenExpiresInSeconds: 30,
    ignoreNonceAfterRefresh: true,
    // Help with callback processing
    historyCleanupOff: false,
    autoCleanStateAfterAuthentication: true
  }
}
