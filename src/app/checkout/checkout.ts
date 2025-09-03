import { Component, OnInit, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CartService } from '../services/cart.service';
import { ThemeService } from '../services/theme.service';
import { UserService } from '../services/user.service';
import { PaymentMethodService } from '../services/payment-method.service';

interface CartItem {
  id: number; // cartId from backend
  name: string;
  price: number;
  image: string;
  quantity: number;
  rating: number;
  productId: number;
}

interface SavedAddress {
  id: number;
  name: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
}

interface SavedPaymentMethod {
  id: number;
  name: string;
  cardNumber: string; // Last 4 digits only
  expiryMonth: string;
  expiryYear: string;
  cardName: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './checkout.html',
  styleUrls: ['../app.css', './checkout.css']
})
export class Checkout implements OnInit {
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  currentStep = 2; // Skip shipping, start at payment
  shippingFormSubmitted = false;
  paymentFormSubmitted = false;

  // Card masking properties
  actualCardNumber = '';
  actualCvv = '';
  isCardNumberFocused = false;
  isCvvFocused = false;

  // Billing address toggle
  sameAsShipping = false;

  // Save payment method toggle
  savePaymentMethod = false;
  
  // Loading states
  isLoadingProfile = false;
  isLoadingPaymentMethods = false;
  
  // User profile data
  userProfile: any = null;

  // Month and year options
  months = [
    { value: '01', label: '01 - January' },
    { value: '02', label: '02 - February' },
    { value: '03', label: '03 - March' },
    { value: '04', label: '04 - April' },
    { value: '05', label: '05 - May' },
    { value: '06', label: '06 - June' },
    { value: '07', label: '07 - July' },
    { value: '08', label: '08 - August' },
    { value: '09', label: '09 - September' },
    { value: '10', label: '10 - October' },
    { value: '11', label: '11 - November' },
    { value: '12', label: '12 - December' }
  ];

  years: { value: string, label: string }[] = [];

  // Saved addresses (mock data - replace with actual user service)
  savedAddresses: SavedAddress[] = [
    {
      id: 1,
      name: 'Home',
      address: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    {
      id: 2,
      name: 'Work',
      address: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002'
    }
  ];

  // Saved payment methods from backend
  savedPaymentMethods: SavedPaymentMethod[] = [];

  cartItems: CartItem[] = [];
  orderSummary = computed(() => {
    const items = this.cartService.cartItems();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = 9.99; // Fixed standard shipping
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      shipping,
      tax,
      total
    };
  });

  // Loading and error states from cart service
  get isCartLoading() {
    return this.cartService.isLoading();
  }

  get cartError() {
    return this.cartService.error();
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartService,
    private themeService: ThemeService,
    private userService: UserService,
    private paymentMethodService: PaymentMethodService
  ) {
    // Generate years (current year + 20 years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 20; i++) {
      const year = currentYear + i;
      this.years.push({ value: year.toString(), label: year.toString() });
    }

    this.shippingForm = this.fb.group({
      savedAddressId: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      addressLineOne: ['', Validators.required],
      addressLineTwo: [''], // Optional field
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      savedPaymentMethodId: [''],
      cardNumber: ['', Validators.required],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
      cvv: ['', Validators.required],
      cardName: ['', Validators.required],
      billingAddressLineOne: ['', Validators.required],
      billingAddressLineTwo: [''],
      billingCity: ['', Validators.required],
      billingState: ['', Validators.required],
      billingZip: ['', Validators.required],
      billingCountry: ['', Validators.required]
    });

    // Effect to update cartItems when cart service data changes
    effect(() => {
      this.cartItems = this.cartService.cartItems();
    });
  }

  protected get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  ngOnInit() {
    // Get cart items from cart service
    this.cartItems = this.cartService.cartItems();

    // Redirect to cart if no items and not loading
    if (this.cartItems.length === 0 && !this.isCartLoading) {
      this.router.navigate(['/cart']);
      return;
    }
    
    // Load user profile and auto-populate shipping data
    this.loadUserProfile();
    // Load saved payment methods
    this.loadPaymentMethods();
  }
  
  loadUserProfile() {
    this.isLoadingProfile = true;
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        // Auto-populate shipping form with user profile data (always use saved address)
        this.shippingForm.patchValue({
          firstName: profile.firstName || 'John',
          lastName: profile.lastName || 'Doe',
          addressLineOne: profile.addressLineOne || '123 Main St',
          addressLineTwo: profile.addressLineTwo || '',
          city: profile.city || 'New York',
          state: profile.state || 'NY',
          zipCode: profile.zipCode || '10001',
          country: profile.country || 'United States'
        });
        
        console.log('Profile data loaded:', profile);
        console.log('Form populated with:', this.shippingForm.value);
        // Mark shipping form as valid since we're using saved data
        this.shippingForm.markAllAsTouched();
        
        // Update validators to make form valid
        setTimeout(() => {
          this.shippingForm.updateValueAndValidity();
          console.log('Shipping form after profile load:', {
            valid: this.shippingForm.valid,
            status: this.shippingForm.status,
            errors: this.getFormErrors(this.shippingForm),
            values: this.shippingForm.value
          });
        }, 100);
        this.isLoadingProfile = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoadingProfile = false;
      }
    });
  }
  
  loadPaymentMethods() {
    this.isLoadingPaymentMethods = true;
    this.paymentMethodService.getUserPaymentMethods().subscribe({
      next: (paymentMethods) => {
        this.savedPaymentMethods = paymentMethods.map(pm => ({
          id: pm.paymentId,
          name: `Card ending in ${pm.cardNumber.slice(-4)}`,
          cardNumber: pm.cardNumber.slice(-4),
          expiryMonth: pm.cardExpirationMonth.toString().padStart(2, '0'),
          expiryYear: pm.cardExpirationYear.toString(),
          cardName: pm.nameOnCard
        }));
        this.isLoadingPaymentMethods = false;
      },
      error: (error) => {
        console.error('Error loading payment methods:', error);
        this.isLoadingPaymentMethods = false;
      }
    });
  }
  refreshCart() {
    this.cartService.refreshCart();
  }
  

  nextStep() {
    // Skip step 1 (shipping) since we always use saved address
    if (this.currentStep === 2) {
      this.paymentFormSubmitted = true;
      if (this.paymentForm.valid) {
        this.currentStep = 3;
        this.paymentFormSubmitted = false;
      }
    }
  }

  previousStep() {
    // Only allow going back to payment (step 2), skip shipping step
    if (this.currentStep > 2) {
      this.currentStep = 2;
      this.paymentFormSubmitted = false;
    }
  }

  placeOrder() {
    this.paymentFormSubmitted = true;
    
    // Check form validity (disabled fields don't affect validity)
    const isPaymentValid = this.sameAsShipping ? 
      this.isPaymentFormValidWithDisabledFields() : 
      this.paymentForm.valid;
    
    console.log('Form validation:', {
      shippingValid: this.shippingForm.valid,
      shippingStatus: this.shippingForm.status,
      shippingErrors: this.getFormErrors(this.shippingForm),
      shippingValues: this.shippingForm.value,
      paymentValid: isPaymentValid,
      sameAsShipping: this.sameAsShipping,
      paymentFormStatus: this.paymentForm.status,
      paymentFormErrors: this.getFormErrors(this.paymentForm)
    });
    
    if (this.shippingForm.valid && isPaymentValid) {
      console.log('Order placed:', {
        shipping: this.shippingForm.value,
        payment: {
          ...this.paymentForm.value,
          cardNumber: this.actualCardNumber,
          cvv: this.actualCvv
        },
        items: this.cartItems,
        summary: this.orderSummary,
        savePaymentMethod: this.savePaymentMethod
      });

      // Save payment method to backend if requested
      if (this.savePaymentMethod) {
        const paymentMethodData = {
          cardNumber: this.actualCardNumber,
          cardExpirationMonth: parseInt(this.paymentForm.value.expiryMonth),
          cardExpirationYear: parseInt(this.paymentForm.value.expiryYear),
          nameOnCard: this.paymentForm.value.cardName
        };

        this.paymentMethodService.addPaymentMethod(paymentMethodData).subscribe({
          next: () => console.log('Payment method saved successfully'),
          error: (error) => console.error('Error saving payment method:', error)
        });
      }

      // Clear cart after successful order
      this.cartService.clearCart();

      // Navigate to order confirmation or success page
      alert('Order placed successfully!');
      this.router.navigate(['/']);
    }
  }

  updateQuantity(itemId: number, quantity: number) {
    this.cartService.updateQuantity(itemId, quantity);
    // The computed signal will automatically update the order summary
  }

  removeItem(itemId: number) {
    this.cartService.removeItem(itemId);

    // Redirect to cart if no items left - check after the service call completes
    setTimeout(() => {
      if (this.cartService.cartItems().length === 0) {
        this.router.navigate(['/cart']);
      }
    }, 100);
  }

  // Saved address selection
  onSavedAddressChange() {
    const selectedId = this.shippingForm.get('savedAddressId')?.value;
    if (selectedId) {
      const selectedAddress = this.savedAddresses.find(addr => addr.id == selectedId);
      if (selectedAddress) {
        this.shippingForm.patchValue({
          address: selectedAddress.address,
          apartment: selectedAddress.apartment || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode
        });
      }
    }
  }

  // Saved payment method selection
  onSavedPaymentMethodChange() {
    const selectedId = this.paymentForm.get('savedPaymentMethodId')?.value;
    if (selectedId) {
      const selectedPayment = this.savedPaymentMethods.find(pm => pm.id == selectedId);
      if (selectedPayment) {
        this.actualCardNumber = `****${selectedPayment.cardNumber}`;
        this.paymentForm.patchValue({
          cardNumber: `**** **** **** ${selectedPayment.cardNumber}`,
          expiryMonth: selectedPayment.expiryMonth,
          expiryYear: selectedPayment.expiryYear,
          cardName: selectedPayment.cardName
        });
      }
    } else {
      // Clear fields when "Enter new payment method" is selected
      this.actualCardNumber = '';
      this.paymentForm.patchValue({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cardName: ''
      });
    }
  }

  // Card number masking methods
  onCardNumberFocus() {
    this.isCardNumberFocused = true;
    this.paymentForm.patchValue({ cardNumber: this.actualCardNumber });
  }

  onCardNumberBlur() {
    this.isCardNumberFocused = false;
    const cardNumber = this.paymentForm.get('cardNumber')?.value || '';
    this.actualCardNumber = cardNumber;

    if (cardNumber.length > 4) {
      const masked = '**** **** **** ' + cardNumber.slice(-4);
      this.paymentForm.patchValue({ cardNumber: masked });
    }
  }

  onCardNumberInput(event: any) {
    if (this.isCardNumberFocused) {
      this.actualCardNumber = event.target.value;
    }
  }

  // CVV masking methods
  onCvvFocus() {
    this.isCvvFocused = true;
    this.paymentForm.patchValue({ cvv: this.actualCvv });
  }

  onCvvBlur() {
    this.isCvvFocused = false;
    const cvv = this.paymentForm.get('cvv')?.value || '';
    this.actualCvv = cvv;

    if (cvv.length > 0) {
      const masked = '*'.repeat(cvv.length);
      this.paymentForm.patchValue({ cvv: masked });
    }
  }

  onCvvInput(event: any) {
    if (this.isCvvFocused) {
      this.actualCvv = event.target.value;
    }
  }

  // Billing address toggle
  toggleSameAsShipping() {
    this.sameAsShipping = !this.sameAsShipping;

    if (this.sameAsShipping) {
      // Use address from user profile (same as shipping)
      if (this.userProfile) {
        this.paymentForm.patchValue({
          billingAddressLineOne: this.userProfile.addressLineOne,
          billingAddressLineTwo: this.userProfile.addressLineTwo || '',
          billingCity: this.userProfile.city,
          billingState: this.userProfile.state,
          billingZip: this.userProfile.zipCode,
          billingCountry: this.userProfile.country
        });
      }

      // Disable billing address fields
      this.paymentForm.get('billingAddressLineOne')?.disable();
      this.paymentForm.get('billingAddressLineTwo')?.disable();
      this.paymentForm.get('billingCity')?.disable();
      this.paymentForm.get('billingState')?.disable();
      this.paymentForm.get('billingZip')?.disable();
      this.paymentForm.get('billingCountry')?.disable();
    } else {
      // Enable billing address fields
      this.paymentForm.get('billingAddressLineOne')?.enable();
      this.paymentForm.get('billingAddressLineTwo')?.enable();
      this.paymentForm.get('billingCity')?.enable();
      this.paymentForm.get('billingState')?.enable();
      this.paymentForm.get('billingZip')?.enable();
      this.paymentForm.get('billingCountry')?.enable();

      // Clear billing address fields
      this.paymentForm.patchValue({
        billingAddressLineOne: '',
        billingAddressLineTwo: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        billingCountry: ''
      });
    }
  }

  // Save payment method toggle
  toggleSavePaymentMethod() {
    this.savePaymentMethod = !this.savePaymentMethod;
  }

  // Helper methods for validation
  isFieldInvalid(form: FormGroup, fieldName: string, submitted: boolean): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || submitted));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
  
  // Check if payment form is valid when billing fields are disabled
  isPaymentFormValidWithDisabledFields(): boolean {
    const requiredFields = ['cardNumber', 'expiryMonth', 'expiryYear', 'cvv', 'cardName'];
    return requiredFields.every(field => {
      const control = this.paymentForm.get(field);
      return control && control.valid;
    });
  }
  
  // Get form errors for debugging
  getFormErrors(form: FormGroup): any {
    const errors: any = {};
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}