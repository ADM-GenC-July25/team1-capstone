export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed properties that might be useful in the frontend
  get fullName(): string;
}

export interface UserProfile extends User {
  // Additional profile-specific fields that might not be needed everywhere
  bio?: string;
  preferences: UserPreferences;
  addresses: Address[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  newsletter: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  currency: string;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

// For authentication/session management
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  refreshToken?: string;
  roles: string[];
  permissions: string[];
}

// For user registration
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  agreeToTerms: boolean;
}

// For user login
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}
