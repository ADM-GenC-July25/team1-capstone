import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-callback',
    standalone: true,
    template: `
    <div class="callback-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Processing authentication...</p>
      </div>
    </div>
  `,
    styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    .loading-spinner {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #4f46e5;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    p {
      color: #6b7280;
      margin: 0;
    }
  `]
})
export class CallbackComponent implements OnInit {
    private authService = inject(AuthService);

    constructor(
        private oidcSecurityService: OidcSecurityService,
        private router: Router
    ) { }

    ngOnInit(): void {
        console.log('🔄 Callback component initialized');
        console.log('Current URL:', window.location.href);
        console.log('URL params:', window.location.search);

        // Add a small delay to ensure the URL is fully processed
        setTimeout(() => {
            console.log('🔍 Processing authentication callback...');

            this.oidcSecurityService.checkAuth().subscribe({
                next: ({ isAuthenticated, userData, accessToken, errorMessage }) => {
                    console.log('✅ Callback auth check completed');
                    console.log('Callback result:', {
                        isAuthenticated,
                        userData: userData ? 'Present' : 'Null',
                        accessToken: accessToken ? 'Present' : 'Null',
                        errorMessage
                    });

                    if (isAuthenticated) {
                        console.log('✅ Authentication successful in callback!');
                        console.log('User data received:', userData);

                        // Handle any pending profile creation
                        try {
                            this.authService.handlePostAuthProfile();
                            console.log('✅ Post-auth profile handling completed');
                        } catch (profileError) {
                            console.warn('⚠️ Error handling post-auth profile:', profileError);
                        }

                        // Give the auth service a moment to update its state
                        setTimeout(() => {
                            console.log('🔄 Redirecting to main application...');
                            this.router.navigate(['/']);
                        }, 500);

                    } else {
                        console.error('❌ Authentication failed in callback');

                        if (errorMessage) {
                            console.error('Callback error details:', errorMessage);

                            // Check for specific error types
                            if (errorMessage.includes('invalid_grant') || errorMessage.includes('code')) {
                                console.error('🚨 Authorization code issue - code may have been used already or expired');
                            }
                            if (errorMessage.includes('token')) {
                                console.error('🚨 Token exchange failed - check client configuration');
                            }
                        }

                        // Redirect to login page with error indication
                        console.log('🔄 Redirecting to login page...');
                        this.router.navigate(['/login'], {
                            queryParams: { error: 'auth_callback_failed' }
                        });
                    }
                },
                error: (error) => {
                    console.error('❌ Error during callback auth check:', error);
                    console.error('Error details:', {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    });

                    // Redirect to login with error
                    this.router.navigate(['/login'], {
                        queryParams: { error: 'auth_callback_error' }
                    });
                }
            });
        }, 100);
    }
}
