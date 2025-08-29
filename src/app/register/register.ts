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
  @Input()
  Person: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
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

        this.isLoading.set(true);

        // Prepare login request payload
        const registrationData = {
            email : this.Person.get('email')?.value || '',
            username: this.Person.get('username')?.value || '',
            password: this.Person.get('password')?.value || 'test',
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

        // Send login request to backend
        
          this.http.post<any>('http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/auth/register', registrationData, { observe: 'response' })
          .subscribe({

            next: (response:HttpResponse<any>) => {
              console.log(response.status)
              console.log(registrationData.password)
              console.log(registrationData.username)
              console.log(registrationData.email)
                this.isLoading.set(false);

                // Handle successful login
                if (response && (response.status == 201)) {
                    // Store authentication token if provided
                    this.router.navigate(['/login'])
                } else {
                    this.registrationError.set('Invalid response from server');
                }
            },
            error: (error) => {
                this.isLoading.set(false);

                // Handle login errors
                if (error.status === 401) {
                    this.registrationError.set('Invalid username or password');
                } else if (error.status === 400) {
                    this.registrationError.set('Please check your input and try again');
                } else if (error.status === 0) {
                    this.registrationError.set('Unable to connect to server. Please check your connection.');
                } else {
                    this.registrationError.set('Login failed. Please try again later.');
                }

                console.error('Login error:', error);
            }
        });
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
