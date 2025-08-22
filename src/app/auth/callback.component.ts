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
        this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated, userData, accessToken }) => {
            if (isAuthenticated) {
                console.log('Authentication successful:', userData);

                // Handle any pending profile creation
                this.authService.handlePostAuthProfile();

                // Redirect to main application
                this.router.navigate(['/']);
            } else {
                console.log('Authentication failed');
                // Redirect to login page
                this.router.navigate(['/login']);
            }
        });
    }
}
