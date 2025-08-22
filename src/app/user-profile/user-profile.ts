import { Component, Input, NgModule, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, Address } from '../models';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  @Input()
  Person: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    dateOfBirth: new FormControl('', Validators.required),
    address: new FormGroup({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
      country: new FormControl('USA', Validators.required)
    })
  });

  loginError = signal<string>('');
  isLoading = signal(false);
  userData = signal<User | null>(null); // Store the user data

  // Get user display information from AuthService
  get currentUser() {
    return this.authService.user;
  }

  get userDisplayName() {
    return this.authService.userDisplayName;
  }

  get userInitials() {
    return this.authService.userInitials;
  }

  // Theme service integration
  get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  constructor(private authService: AuthService, private themeService: ThemeService, private http: HttpClient) { }

  ngOnInit() {
    // Load current user data into the form
    this.isLoading.set(true);

    this.http.get<any>('http://localhost:8080/auth/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        // Handle successful response
        if (response) {
          console.log('Profile data received:', response);

          const user: User = {
            id: response.id || '',
            email: response.email || '',
            firstName: response.firstName || '',
            lastName: response.lastName || '',
            phone: response.phoneNumber || '',
            dateOfBirth: response.dateOfBirth || '',
            isActive: response.isActive !== undefined ? response.isActive : true,
            createdAt: response.createdAt ? new Date(response.createdAt) : new Date(),
            updatedAt: response.updatedAt ? new Date(response.updatedAt) : new Date()
          };

          // Store user data in signal
          this.userData.set(user);

          // Populate the form with user data
          this.Person.patchValue({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            address: {
              addressLine1: response.addressLineOne || '',
              addressLine2: response.addressLine2 || '',
              city: response.city || '',
              state: response.state || '',
              postalCode: response.zipCode || '',
              country: response.country || 'USA'
            }
          });

        } else {
          this.loginError.set('Invalid response from server');
        }
      },
      error: (error) => {
        this.isLoading.set(false);

        // Handle errors
        if (error.status === 401) {
          this.loginError.set('Unauthorized - please log in again');
        } else if (error.status === 400) {
          this.loginError.set('Bad request - please check your data');
        } else if (error.status === 0) {
          this.loginError.set('Unable to connect to server. Please check your connection.');
        } else {
          this.loginError.set('Failed to load profile. Please try again later.');
        }

        console.error('Profile load error:', error);
      }
    });
  }

  onSubmit() {
    if (this.Person.valid) {
      const formData = this.Person.value;

      console.log('Saving user profile:', formData);

      // Create updated user object from form data with individual address fields
      const updatedUser = {
        id: formData.id,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone, // Backend expects phoneNumber
        dateOfBirth: formData.dateOfBirth,
        // Individual address fields
        addressLineOne: formData.address.addressLine1,
        addressLine2: formData.address.addressLine2,
        city: formData.address.city,
        state: formData.address.state,
        zipCode: formData.address.postalCode,
        country: formData.address.country
      };

      // Update the stored user data (keep original User format for local storage)
      const userForStorage: User = {
        id: formData.id,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.userData.set(userForStorage);

      // Send the update to the backend with individual address fields
      this.isLoading.set(true);
      this.http.put('http://localhost:8080/auth/update', updatedUser, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      }).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          console.log('Profile updated successfully!', response);

          // Update session storage with the latest data
          const currentUser = this.currentUser();
          if (currentUser) {
            const updatedAuthUser = {
              ...currentUser,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email
            };
            sessionStorage.setItem('currentUser', JSON.stringify(updatedAuthUser));
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Profile update error:', error);

          if (error.status === 401) {
            this.loginError.set('Unauthorized - please log in again');
          } else if (error.status === 400) {
            this.loginError.set('Bad request - please check your data');
          } else {
            this.loginError.set('Failed to update profile. Please try again.');
          }
        }
      });
    } else {
      console.log('Form validation failed');
      this.markFormGroupTouched(this.Person);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  onCancel() {
    // Reset form to original values from server
    const user = this.userData();
    if (user) {
      this.Person.patchValue({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        address: {
          addressLine1: '', // Reset address fields - they would need to be stored separately if you want to restore them
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'USA'
        }
      });
    }
  }
}