import { Component, Input, NgModule, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, Address } from '../models';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

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
    id: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    dateOfBirth: new FormControl('', Validators.required),
    isActive: new FormControl(true),
    createdAt: new FormControl(new Date()),
    updatedAt: new FormControl(new Date()),
    address: new FormGroup({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
      country: new FormControl('USA', Validators.required)
    })
  });

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

  constructor(private authService: AuthService, private themeService: ThemeService) { }
  ngOnInit() {
    // Load current user data into the form
    const user = this.currentUser();
    if (user) {
      this.Person.patchValue({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone, // These would come from a more complete user profile
        dateOfBirth: user.dateOfBirth,
        address: user.address ? {
          addressLine1: user.address.addressLine1,
          addressLine2: user.address.addressLine2,
          city: user.address.city,
          state: user.address.state,
          postalCode: user.address.postalCode,
          country: user.address.country
        } : {}
      });
    }
  }

      // Pre-fill shipping address with default values

  onSubmit() {
    if (this.Person.valid) {
      const formData = this.Person.value;

      // Construct shipping address object from form values

      console.log('Saving user profile:', formData);

      // Here you would typically call a service to save the user data
      // this.userService.updateProfile(formData).subscribe(...)
      // this.addressService.saveAddress(shippingAddress).subscribe(...)

      // For now, just update the session storage with the new data
      const currentUser = this.currentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          phone: formData.phone,
          address: {
            ...currentUser.address,
            addressLine1: formData.address.addressLine1,
            addressLine2: formData.address.addressLine2,
            city: formData.address.city,
            state: formData.address.state,
            postalCode: formData.address.postalCode,
            country: formData.address.country
          }
        };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        console.log('Profile updated successfully!');
      }
    } else {
      console.log('Form validation failed');
      this.markFormGroupTouched(this.Person);
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
}
