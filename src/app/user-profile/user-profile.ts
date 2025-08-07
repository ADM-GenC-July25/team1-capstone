import { Component, Input, NgModule, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../models';
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
    phone: new FormControl(''),
    dateOfBirth: new FormControl(''),
    isActive: new FormControl(true),
    createdAt: new FormControl(new Date()),
    updatedAt: new FormControl(new Date()),
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
    }
  }

  onSubmit() {
    if (this.Person.valid) {
      const formData = this.Person.value;
      console.log('Saving user profile:', formData);

      // Here you would typically call a service to save the user data
      // this.userService.updateProfile(formData).subscribe(...)

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
    }
  }

  onCancel() {
    // Reset form to original values
    this.ngOnInit();
  }
}
