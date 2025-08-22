import { Component, Input, OnInit, signal } from '@angular/core';
import { Address, User } from '../models';
import { EmailValidator, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  isLoading = signal(false);
  registrationError = signal<string>('');
  registrationSuccess = signal<string>('');

  @Input()
  Person: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl(''),
    dateOfBirth: new FormControl(''),
    shippingAddress: new FormGroup({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
      country: new FormControl('USA', Validators.required)
    }),
  });

  // Get user display information from AuthService
  get currentUser() {
    return this.authService.user;
  }

  get userDisplayName() {
    return this.authService.userDisplayName;
  }

  userInitials() {
    return this.authService.userInitials();
  }

  // Theme service integration
  get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  constructor(private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private http: HttpClient) { }

  ngOnInit(): void {
    // Clear any previous messages
    this.registrationError.set('');
    this.registrationSuccess.set('');
  }

  onSubmit() {
    if (this.Person.valid && (this.Person.get('shippingAddress') as FormGroup)?.valid) {
      this.isLoading.set(true);
      this.registrationError.set('');
      this.registrationSuccess.set('');

      console.log('=== Registration Process Started ===');
      console.log('Form data:', this.Person.value);

      // For Cognito integration, redirect to Cognito sign-up
      this.registrationSuccess.set('Preparing registration with AWS Cognito...');

      // Save user profile data to backend after successful Cognito registration
      const profileData = {
        email: this.Person.get('email')?.value || '',
        firstName: this.Person.get('firstName')?.value || '',
        lastName: this.Person.get('lastName')?.value || '',
        phoneNumber: this.Person.get('phone')?.value || '',
        addressLineOne: this.Person.get('shippingAddress')?.get('addressLine1')?.value || '',
        addressLine2: this.Person.get('shippingAddress')?.get('addressLine2')?.value || '',
        city: this.Person.get('shippingAddress')?.get('city')?.value || '',
        state: this.Person.get('shippingAddress')?.get('state')?.value || '',
        zipCode: this.Person.get('shippingAddress')?.get('postalCode')?.value || '',
        country: this.Person.get('shippingAddress')?.get('country')?.value || 'USA',
        dateOfBirth: this.Person.get('dateOfBirth')?.value || '',
      };

      console.log('Profile data to save:', profileData);

      // Store profile data temporarily
      sessionStorage.setItem('pendingProfile', JSON.stringify(profileData));

      setTimeout(() => {
        this.isLoading.set(false);
        this.registrationSuccess.set('Redirecting to authentication...');

        console.log('=== Attempting Cognito Login ===');
        try {
          // Redirect to Cognito login page
          this.authService.login();
        } catch (error) {
          console.error('Error during Cognito redirect:', error);
          this.registrationError.set('Failed to redirect to authentication. Please check console for details.');
        }
      }, 2000);
    } else {
      console.log('Form validation failed');
      this.markFormGroupTouched(this.Person);
      this.markFormGroupTouched(this.Person.get('shippingAddress') as FormGroup);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    // Reset form to original values
    this.ngOnInit();
  }

  // Test method to try direct manual Cognito login
  testDirectLogin() {
    console.log('🧪 Testing direct manual Cognito login...');
    console.log('This bypasses the OIDC library completely and constructs the URL manually.');
    
    try {
      this.authService.directManualLogin();
    } catch (error) {
      console.error('❌ Direct manual login failed:', error);
      this.registrationError.set('Direct manual login failed. Check console for details.');
    }
  }

}
