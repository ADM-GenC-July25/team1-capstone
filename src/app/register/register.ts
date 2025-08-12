import { Component, Input, OnInit } from '@angular/core';
import { Address, User } from '../models';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  @Input()
  Person: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl(''),
    dateOfBirth: new FormControl(''),
    isActive: new FormControl(true),
    createdAt: new FormControl(new Date()),
    updatedAt: new FormControl(new Date()),
    shippingAddress: new FormGroup({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
      country: new FormControl('USA', Validators.required),
      isDefault: new FormControl(false)
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

  constructor(private authService: AuthService, private themeService: ThemeService) { }

  ngOnInit(): void {
  }
  onSubmit() {
    if (this.Person.valid && (this.Person.get('shippingAddress') as FormGroup)?.valid) {
      const formData = this.Person.value;

      // Construct shipping address object from form values
      const shippingAddress: Address = {
        type: 'shipping',
        addressLine1: this.Person.get('shippingAddress')?.get('addressLine1')?.value || '',
        addressLine2: this.Person.get('shippingAddress')?.get('addressLine2')?.value || '',
        city: this.Person.get('shippingAddress')?.get('city')?.value || '',
        state: this.Person.get('shippingAddress')?.get('state')?.value || '',
        postalCode: this.Person.get('shippingAddress')?.get('postalCode')?.value || '',
        country: this.Person.get('shippingAddress')?.get('country')?.value || 'USA',
        isDefault: this.Person.get('shippingAddress')?.get('isDefault')?.value || false
      };

      console.log('Saving user profile:', formData);
      console.log('Saving shipping address:', shippingAddress);

      // Here you would typically call a service to save the user data
      // this.userService.updateProfile(formData).subscribe(...)
      // this.addressService.saveAddress(shippingAddress).subscribe(...)

      // For now, just update the session storage with the new data
      const currentUser = this.Person.value;
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        console.log('Profile updated successfully!');
      }
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

}
