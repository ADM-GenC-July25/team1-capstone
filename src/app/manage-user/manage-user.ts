import { Component, OnInit, signal } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AuthUser } from '../models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-user.html',
  styleUrl: './manage-user.css'
})
export class ManageUser implements OnInit {
  users = signal<AuthUser[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  editingUser = signal<AuthUser | null>(null);

  userForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]),
    role: new FormControl('customer', [Validators.required])
  });

  availableRoles = ['user', 'admin', 'manager'];

  get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadUsers();

    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadUsers() {
    this.isLoading.set(true);
    this.http.get<[]>('http://978323-api-gateway.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }).subscribe({
      next: (users) => {
        console.log(users);
        let arr: AuthUser[] = [];
        users.forEach(element => {
          arr.push({
            id: element['userId'],
            email: element['email'],
            firstName: element['firstName'],
            lastName: element['lastName'],
            username: element['username'],
            roles: [String(element['accessLevel']).toLowerCase()],
            token: '',
            permissions: []
          });
        });
        this.users.set(arr);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load users. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading users:', error);
      }
    });
  }

  editUser(user: AuthUser) {
    this.editingUser.set(user);
    this.userForm.patchValue({
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.roles[0]
    });
    // Clear password as it's not sent from server
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  cancelEdit() {
    this.editingUser.set(null);
    this.userForm.reset();
    // Restore password validation for new user creation
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isLoading.set(true);
      const userData = this.userForm.value;
      
      if (this.editingUser()) {
        // Update existing user
        this.http.put(`http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/auth/users/${this.editingUser()?.id}`, userData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }).subscribe({
          next: () => {
            this.successMessage.set('User updated successfully!');
            this.userForm.reset();
            this.editingUser.set(null);
            this.loadUsers();
            this.isLoading.set(false);
          },
          error: (error) => {
            this.errorMessage.set('Failed to update user. Please try again.');
            this.isLoading.set(false);
            console.error('Error updating user:', error);
          }
        });
      } else {
        // Create new user
        this.http.post('http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/auth/create-user', userData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }).subscribe({
          next: () => {
            this.successMessage.set('User created successfully!');
            this.userForm.reset();
            this.loadUsers();
            this.isLoading.set(false);
          },
          error: (error) => {
            this.errorMessage.set('Failed to create user. Please try again.');
            this.isLoading.set(false);
            console.error('Error creating user:', error);
          }
        });
      }
    }
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.isLoading.set(true);
      this.http.get(`http://978323-api-gateway.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/users/delete/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      }).subscribe({
        next: () => {
          this.successMessage.set('User deleted successfully!');
          this.loadUsers();
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set('Failed to delete user. Please try again.');
          this.isLoading.set(false);
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  updateUserRole(userId: string, newRole: string) {
    this.isLoading.set(true);
    this.http.put(`http://978358-test-with-taryn-env.eba-ykmz27pv.us-west-2.elasticbeanstalk.com/api/auth/users/${userId}/role`, { role: newRole }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }).subscribe({
      next: () => {
        this.successMessage.set('User role updated successfully!');
        this.loadUsers();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to update user role. Please try again.');
        this.isLoading.set(false);
        console.error('Error updating user role:', error);
      }
    });
  }
}
