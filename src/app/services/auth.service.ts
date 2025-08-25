import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthUser } from '../models';
import { OidcClientNotification, OidcSecurityService, OpenIdConfiguration, UserDataResult } from 'angular-auth-oidc-client';
import { Observable, filter, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private oidcSecurityService = inject(OidcSecurityService);
    private currentUser = signal<AuthUser | null>(null);
    private isAuthenticatedSignal = signal<boolean>(false);

    constructor() {
        // Initialize authentication state
        this.initializeAuthState();
    }

    private initializeAuthState(): void {
        console.log('🔄 Initializing authentication state...');

        // Subscribe to authentication state changes
        this.oidcSecurityService.checkAuth().subscribe({
            next: ({ isAuthenticated, userData, accessToken, errorMessage }) => {
                console.log('✅ Auth check completed successfully');
                console.log('Auth check result:', {
                    isAuthenticated,
                    userData: userData ? 'Present' : 'Null',
                    accessToken: accessToken ? 'Present (length: ' + accessToken.length + ')' : 'Null',
                    errorMessage
                });

                this.isAuthenticatedSignal.set(isAuthenticated);

                if (isAuthenticated && userData) {
                    console.log('✅ User is authenticated, processing user data...');
                    console.log('Raw user data:', userData);

                    try {
                        const user: AuthUser = {
                            id: userData.sub || userData.username || '',
                            email: userData.email || '',
                            username: userData.preferred_username || userData.email || userData.sub || '',
                            firstName: userData.given_name || '',
                            lastName: userData.family_name || '',
                            token: accessToken || '',
                            roles: userData.groups || ['user'],
                            permissions: []
                        };

                        console.log('✅ User object created successfully:', {
                            id: user.id,
                            email: user.email,
                            username: user.username,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            hasToken: !!user.token
                        });

                        this.currentUser.set(user);

                        // Handle any pending profile data from registration
                        this.handlePostAuthProfile();

                        console.log('✅ Authentication state initialized successfully');

                    } catch (userProcessingError) {
                        console.error('❌ Error processing user data:', userProcessingError);
                        this.currentUser.set(null);
                        this.isAuthenticatedSignal.set(false);
                    }
                } else {
                    console.log('❌ User not authenticated or no user data');
                    this.currentUser.set(null);

                    if (errorMessage) {
                        console.error('Authentication error details:', errorMessage);

                        // Check for CORS-related errors
                        if (errorMessage.toLowerCase().includes('cors') ||
                            errorMessage.toLowerCase().includes('network') ||
                            errorMessage.toLowerCase().includes('fetch')) {
                            console.error('🚨 CORS Error Detected! Check your Cognito callback URLs.');
                            console.error('Required callback URLs in Cognito:');
                            console.error('- http://localhost:4200/callback');
                            console.error('- http://localhost:4200/');
                        }

                        // Check for specific OAuth/Token errors
                        if (errorMessage.toLowerCase().includes('token') ||
                            errorMessage.toLowerCase().includes('invalid_grant') ||
                            errorMessage.toLowerCase().includes('code')) {
                            console.error('🚨 OAuth Token Error Detected!');
                            console.error('This might indicate:');
                            console.error('1. Authorization code was used more than once');
                            console.error('2. Callback URL mismatch');
                            console.error('3. Client ID mismatch');
                            console.error('4. Timeout in token exchange');
                        }
                    } else if (!isAuthenticated) {
                        console.log('ℹ️ No authentication error - user simply not authenticated yet');
                    }
                }
            },
            error: (error) => {
                console.error('❌ OIDC initialization error:', error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });

                // Enhanced CORS error detection
                if (error.message && (
                    error.message.includes('CORS') ||
                    error.message.includes('Network') ||
                    error.message.includes('Failed to fetch') ||
                    error.name === 'TypeError'
                )) {
                    console.error('🚨 CORS/Network Error detected during auth initialization!');
                    console.error('This usually means:');
                    console.error('1. Callback URLs not configured in AWS Cognito');
                    console.error('2. Incorrect Cognito domain');
                    console.error('3. Network connectivity issues');
                    console.error('4. Token exchange endpoint not accessible');
                    console.warn('⚡ This might be a callback handling issue - not falling back to mock auth');
                } else if (error.message && error.message.includes('token')) {
                    console.error('🚨 Token-related error during initialization!');
                    console.error('This might indicate:');
                    console.error('1. Invalid authorization code from Cognito');
                    console.error('2. Client configuration mismatch');
                    console.error('3. Token endpoint issues');
                } else {
                    console.error('🚨 Unknown error during OIDC initialization');
                }

                this.isAuthenticatedSignal.set(false);
                this.currentUser.set(null);

                // Don't automatically fall back to mock login during callback processing
                // as this might be a legitimate callback error that needs to be handled
                console.warn('🔄 Authentication failed - user will need to try logging in again');
            }
        });
    }

    // Getter signals for components to access
    get isAuthenticated() {
        return this.isAuthenticatedSignal.asReadonly();
    }

    get user() {
        return this.currentUser.asReadonly();
    }

    // Computed signal for user's display name
    get userDisplayName() {
        return computed(() => {
            const user = this.currentUser();
            if (user) {
                return user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username || user.email;
            }
            return null;
        });
    }

    // Computed signal for user's initials (for avatars)
    get userInitials() {
        return computed(() => {
            const user = this.currentUser();
            if (user && user.firstName && user.lastName) {
                return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
            } else if (user && user.username) {
                return user.username.charAt(0).toUpperCase();
            } else if (user && user.email) {
                return user.email.charAt(0).toUpperCase();
            }
            return 'U';
        });
    }

    // Get current user's email
    get userEmail() {
        return computed(() => {
            const user = this.currentUser();
            return user?.email || null;
        });
    }

    // Get access token for API calls
    getAccessToken(): Observable<string> {
        return this.oidcSecurityService.getAccessToken();
    }

    // Login method - redirects to Cognito
    login(): void {
        console.log('Initiating Cognito login...');
        console.log('Authority URL: https://us-west-2aisdobluq.auth.us-west-2.amazoncognito.com');
        console.log('Current origin:', window.location.origin);
        console.log('Expected callback URL:', window.location.origin + '/callback');

        try {
            // Check if OIDC is properly configured before attempting login
            this.oidcSecurityService.getConfiguration().subscribe({
                next: (config) => {
                    console.log('OIDC Configuration received:', config);

                    if (config && config.authority && config.authority.includes('amazoncognito.com')) {
                        console.log('✅ Real Cognito configuration detected. Redirecting to AWS Cognito...');
                        console.log('🔍 Configuration details:', {
                            authority: config.authority,
                            clientId: config.clientId,
                            redirectUrl: config.redirectUrl,
                            scope: config.scope,
                            responseType: 'code'
                        });

                        // Add a small delay to ensure the browser is ready
                        setTimeout(() => {
                            try {
                                console.log('🚀 Attempting authorization redirect...');

                                // Try to get the authorization URL first to see if that's where the CORS error occurs
                                this.oidcSecurityService.getAuthorizeUrl().subscribe(
                                    (authUrl: string | null) => {
                                        console.log('🔍 Authorization URL generated:', authUrl);

                                        // Critical debugging: Check if URL is blank/empty
                                        if (!authUrl || authUrl.trim() === '') {
                                            console.warn('⚠️ OIDC library failed to generate authorization URL');
                                            console.log('🔧 Attempting manual authorization URL construction...');

                                            // Manually construct the authorization URL
                                            const manualAuthUrl = this.constructManualAuthUrl(config);

                                            if (manualAuthUrl) {
                                                console.log('✅ Manual authorization URL constructed:', manualAuthUrl);
                                                console.log('🔄 Redirecting to manually constructed URL...');
                                                window.location.href = manualAuthUrl;
                                                return;
                                            } else {
                                                console.error('❌ Failed to construct manual authorization URL');
                                                this.showBlankUrlError();
                                                this.mockLogin();
                                                return;
                                            }
                                        }

                                        console.log('✅ Valid authorization URL received:', authUrl);
                                        console.log('🔄 Redirecting to Cognito...');

                                        // Use window.location for the redirect
                                        window.location.href = authUrl;
                                    },
                                    (authUrlError: any) => {
                                        console.error('❌ Error getting authorization URL:', authUrlError);
                                        console.error('This suggests a network/CORS issue or OAuth configuration problem');
                                        console.log('🔧 Trying manual authorization URL construction as fallback...');

                                        // Try manual construction as fallback
                                        const manualAuthUrl = this.constructManualAuthUrl(config);

                                        if (manualAuthUrl) {
                                            console.log('✅ Manual authorization URL constructed as fallback:', manualAuthUrl);
                                            console.log('🔄 Redirecting to manually constructed URL...');
                                            window.location.href = manualAuthUrl;
                                            return;
                                        }

                                        // Try the standard authorize method as last resort
                                        try {
                                            console.log('🔄 Trying standard authorize() method...');
                                            this.oidcSecurityService.authorize();
                                        } catch (fallbackError) {
                                            console.error('❌ Standard authorize also failed:', fallbackError);
                                            this.showDetailedAuthError(fallbackError);
                                            this.mockLogin();
                                        }
                                    }
                                );
                            } catch (authError) {
                                console.error('❌ Authorization error:', authError);
                                if (authError instanceof TypeError ||
                                    (authError as any).message?.includes('fetch') ||
                                    (authError as any).message?.includes('CORS')) {
                                    console.error('🚨 CORS/Network error during authorization!');
                                    console.error('This suggests a callback URL configuration issue in AWS Cognito.');
                                    console.error('Expected callback URL in Cognito:', window.location.origin + '/callback');
                                    console.error('Current origin:', window.location.origin);
                                    this.showCallbackUrlError();
                                    this.mockLogin();
                                } else {
                                    throw authError;
                                }
                            }
                        }, 100);
                    } else {
                        console.warn('⚠️ OIDC not properly configured or using test config. Using mock login for development.');
                        this.mockLogin();
                    }
                },
                error: (error) => {
                    console.error('❌ OIDC configuration error:', error);

                    if (error.name === 'TypeError' ||
                        error.message?.includes('fetch') ||
                        error.message?.includes('CORS') ||
                        error.message?.includes('Network')) {
                        console.error('🚨 CORS/Network error detected!');
                        console.error('This indicates a CORS policy issue with AWS Cognito.');
                        console.error('Action needed: Configure callback URLs in AWS Cognito console.');
                    }

                    console.warn('Using mock login for development.');
                    this.mockLogin();
                }
            });
        } catch (error) {
            console.error('❌ Error during login initialization:', error);
            this.mockLogin();
        }
    }

    // Direct manual login - bypasses OIDC library completely
    directManualLogin(): void {
        console.log('🚀 Starting direct manual Cognito login...');

        try {
            // Hardcoded values for your specific Cognito setup
            const authority = 'https://us-west-2aisdobluq.auth.us-west-2.amazoncognito.com';
            const clientId = '3nte1afuliiln27dspmofnaqkc';
            const redirectUri = window.location.origin + '/callback';
            const scopes = 'openid email phone profile';

            // Generate a random state parameter for security
            const state = 'state-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            // Generate a random nonce for security
            const nonce = 'nonce-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            // Construct the authorization URL manually
            const authUrl = new URL(`${authority}/oauth2/authorize`);
            authUrl.searchParams.set('response_type', 'code');
            authUrl.searchParams.set('client_id', clientId);
            authUrl.searchParams.set('redirect_uri', redirectUri);
            authUrl.searchParams.set('scope', scopes);
            authUrl.searchParams.set('state', state);
            authUrl.searchParams.set('nonce', nonce);

            const finalUrl = authUrl.toString();

            // Store state in session storage for validation on callback
            sessionStorage.setItem('oidc_state', state);
            sessionStorage.setItem('oidc_nonce', nonce);

            console.log('✅ Direct manual authorization URL:', finalUrl);
            console.log('🔄 Redirecting to Cognito...');

            // Redirect to Cognito
            window.location.href = finalUrl;

        } catch (error) {
            console.error('❌ Error in direct manual login:', error);
            this.mockLogin();
        }
    }

    // Mock login for development when Cognito is not available
    private mockLogin(): void {
        console.log('Using mock authentication for development');

        // Create a mock user for development
        const mockUser: AuthUser = {
            id: 'dev-user-123',
            email: 'dev@example.com',
            username: 'DevUser',
            firstName: 'Development',
            lastName: 'User',
            token: 'mock-token-123',
            roles: ['user'],
            permissions: []
        };

        this.currentUser.set(mockUser);
        this.isAuthenticatedSignal.set(true);

        console.log('Mock user logged in:', mockUser);
    }

    // Logout method
    logout(): void {
        this.oidcSecurityService.logoff().subscribe((result) => {
            console.log('Logout result:', result);
            this.currentUser.set(null);
            this.isAuthenticatedSignal.set(false);
        });
    }

    // Force logout with local cleanup
    forceLogout(): void {
        this.oidcSecurityService.logoffLocal();
        this.currentUser.set(null);
        this.isAuthenticatedSignal.set(false);

        // Clear any additional local storage
        localStorage.removeItem('authToken');
        sessionStorage.clear();

        // Preserve dark mode setting
        const darkMode = localStorage.getItem('darkMode');
        localStorage.clear();
        if (darkMode) localStorage.setItem('darkMode', darkMode);
    }

    // Check authentication status
    checkAuthStatus(): void {
        this.oidcSecurityService.checkAuth().subscribe();
    }

    // Get user data from OIDC
    getUserData(): Observable<UserDataResult> {
        return this.oidcSecurityService.getUserData();
    }

    // Check if user has specific role
    hasRole(role: string): boolean {
        const user = this.currentUser();
        return user?.roles?.includes(role) || false;
    }

    // Handle post-authentication profile creation
    handlePostAuthProfile(): void {
        const pendingProfile = sessionStorage.getItem('pendingProfile');
        if (pendingProfile) {
            try {
                const profileData = JSON.parse(pendingProfile);
                // Send profile data to backend
                // This would typically be an HTTP call to save the user profile
                console.log('Creating user profile after Cognito auth:', profileData);

                // Clear the pending profile data
                sessionStorage.removeItem('pendingProfile');

                // Optionally redirect to a success page or user profile
            } catch (error) {
                console.error('Error handling post-auth profile:', error);
            }
        }
    }

    // Template method for backward compatibility (now redirects to Cognito)
    loginCompat(username: string, password: string): boolean {
        console.warn('Direct username/password login is deprecated. Redirecting to Cognito...');
        this.login();
        return false; // Always returns false since it's a redirect
    }

    // Show detailed callback URL error information
    private showCallbackUrlError(): void {
        console.error('🔧 CALLBACK URL CONFIGURATION ISSUE');
        console.error('====================================');
        console.error('Your AWS Cognito App Client must have these EXACT callback URLs:');
        console.error(`✅ ${window.location.origin}/callback`);
        console.error(`✅ ${window.location.origin}/`);
        console.error('');
        console.error('Steps to fix:');
        console.error('1. Go to AWS Cognito Console');
        console.error('2. Find your User Pool: us-west-2_AiSDoBLuq');
        console.error('3. Go to App integration → App clients');
        console.error('4. Edit your client: 3nte1afuliiln27dspmofnaqkc');
        console.error('5. Add the callback URLs above');
        console.error('6. Save changes');
    }

    // Show detailed authorization error information
    private showDetailedAuthError(error: any): void {
        console.error('🔧 AUTHORIZATION ERROR DETAILS');
        console.error('===============================');
        console.error('Error type:', error.name || 'Unknown');
        console.error('Error message:', error.message || 'No message');
        console.error('');
        console.error('This error suggests one of these issues:');
        console.error('1. OAuth flows not properly configured in Cognito');
        console.error('2. Callback URLs missing or incorrect');
        console.error('3. OAuth scopes not properly configured');
        console.error('4. Browser blocking the redirect (popup blocker)');
        console.error('');
        console.error('Check your Cognito App Client configuration:');
        console.error('- Authorization code grant: ENABLED');
        console.error('- OAuth scopes: openid, email, phone, profile');
        console.error('- Callback URLs: http://localhost:4200/callback');
    }

    // Show specific error for blank authorization URL
    private showBlankUrlError(): void {
        console.error('🚨 BLANK AUTHORIZATION URL - COGNITO OAUTH NOT CONFIGURED!');
        console.error('=========================================================');
        console.error('');
        console.error('The authorization URL is blank, which means your Cognito App Client');
        console.error('is missing critical OAuth configuration.');
        console.error('');
        console.error('🔧 IMMEDIATE FIX REQUIRED:');
        console.error('1. Go to AWS Cognito Console');
        console.error('2. Navigate to your User Pool: us-west-2_AiSDoBLuq');
        console.error('3. Go to: App integration → App clients and analytics');
        console.error('4. Click on: 3nte1afuliiln27dspmofnaqkc');
        console.error('5. Click "Edit"');
        console.error('');
        console.error('🎯 MOST LIKELY MISSING:');
        console.error('   In "Identity providers" section:');
        console.error('   ✅ Check "Cognito user pool" (CRITICAL!)');
        console.error('');
        console.error('🎯 ALSO VERIFY:');
        console.error('   OAuth 2.0 grant types:');
        console.error('   ✅ "Authorization code grant" - CHECKED');
        console.error('   ❌ "Implicit grant" - UNCHECKED');
        console.error('');
        console.error('   OpenID Connect scopes:');
        console.error('   ✅ email, openid, phone, profile - ALL CHECKED');
        console.error('');
        console.error('💡 TIP: The "Cognito user pool" identity provider is often missed!');
        console.error('');
    }

    // Manually construct authorization URL when OIDC library fails
    private constructManualAuthUrl(config: OpenIdConfiguration): string | null {
        try {
            console.log('🔧 Constructing manual authorization URL...');

            // Your Cognito domain and settings
            const authority = config.authority || 'https://us-west-2aisdobluq.auth.us-west-2.amazoncognito.com';
            const clientId = config.clientId || '3nte1afuliiln27dspmofnaqkc';
            const redirectUri = config.redirectUrl || window.location.origin + '/callback';
            const scopes = config.scope || 'openid email phone profile';

            // Generate a random state parameter for security
            const state = 'state-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            // Generate a random nonce for security
            const nonce = 'nonce-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            // Construct the authorization URL manually
            const authUrl = new URL(`${authority}/oauth2/authorize`);
            authUrl.searchParams.set('response_type', 'code');
            authUrl.searchParams.set('client_id', clientId);
            authUrl.searchParams.set('redirect_uri', redirectUri);
            authUrl.searchParams.set('scope', scopes);
            authUrl.searchParams.set('state', state);
            authUrl.searchParams.set('nonce', nonce);

            const finalUrl = authUrl.toString();

            // Store state in session storage for validation on callback
            sessionStorage.setItem('oidc_state', state);
            sessionStorage.setItem('oidc_nonce', nonce);

            console.log('✅ Manual authorization URL constructed successfully');
            console.log('Parameters used:', {
                authority,
                clientId,
                redirectUri,
                scopes,
                state: state.substring(0, 10) + '...',
                nonce: nonce.substring(0, 10) + '...'
            });

            return finalUrl;

        } catch (error) {
            console.error('❌ Error constructing manual authorization URL:', error);
            return null;
        }
    }
}