export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress?: Address;
  PaymentMethods?: PaymentMethod[];
  // Computed properties that might be useful in the frontend

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
  type: 'shipping' | 'billing';
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
  username: string;
  phone?: string;
  dateOfBirth?: Date;
  token: string;
  refreshToken?: string;
  roles: string[];
  permissions: string[];
  address?: Address;
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
export interface PaymentMethod {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expirationDate: Date;
  isDefault: boolean;
}