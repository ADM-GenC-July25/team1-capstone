import { Component, Input, NgModule, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, Address } from '../models';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

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
  });

  // Separate form for shipping address
  shippingAddressForm = new FormGroup({
    addressLine1: new FormControl('', Validators.required),
    addressLine2: new FormControl(''),
    city: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    postalCode: new FormControl('', Validators.required),
    country: new FormControl('USA', Validators.required),
    isDefault: new FormControl(false)
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

  constructor(private authService: AuthService) { }
  ngOnInit() {
    // Load current user data into the form
    const user = this.currentUser();
    if (user) {
      this.Person.patchValue({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: '', // These would come from a more complete user profile
        dateOfBirth: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Pre-fill shipping address with default values
      this.shippingAddressForm.patchValue({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
        isDefault: false
      });
    }
  }

  onSubmit() {
    if (this.Person.valid && this.shippingAddressForm.valid) {
      const formData = this.Person.value;

      // Construct shipping address object from form values
      const shippingAddress: Address = {
        type: 'shipping',
        addressLine1: this.shippingAddressForm.get('addressLine1')?.value || '',
        addressLine2: this.shippingAddressForm.get('addressLine2')?.value || '',
        city: this.shippingAddressForm.get('city')?.value || '',
        state: this.shippingAddressForm.get('state')?.value || '',
        postalCode: this.shippingAddressForm.get('postalCode')?.value || '',
        country: this.shippingAddressForm.get('country')?.value || 'USA',
        isDefault: this.shippingAddressForm.get('isDefault')?.value || false
      };

      console.log('Saving user profile:', formData);
      console.log('Saving shipping address:', shippingAddress);

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
          email: formData.email
        };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        console.log('Profile updated successfully!');
      }
    } else {
      console.log('Form validation failed');
      this.markFormGroupTouched(this.Person);
      this.markFormGroupTouched(this.shippingAddressForm);
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
