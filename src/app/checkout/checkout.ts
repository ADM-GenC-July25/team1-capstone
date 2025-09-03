import { Component, OnInit, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CartService } from '../services/cart.service';
import { ThemeService } from '../services/theme.service';
import { UserService } from '../services/user.service';
import { PaymentMethodService } from '../services/payment-method.service';
import { OrderService } from '../services/order.service';

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
  fullData?: any; // Store the complete payment method data from backend
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
  isPlacingOrder = false;

  // User profile data
  userProfile: any = null;

  // Order placement error state
  orderError: string | null = null;

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
    private paymentMethodService: PaymentMethodService,
    private orderService: OrderService
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

        // Mark all fields as touched and update validity
        this.shippingForm.markAllAsTouched();
        this.shippingForm.updateValueAndValidity();

        // Force validation after a small delay to ensure all values are set
        setTimeout(() => {
          // Clear any existing errors since we're using saved profile data
          Object.keys(this.shippingForm.controls).forEach(key => {
            const control = this.shippingForm.get(key);
            if (control && control.value) {
              control.setErrors(null);
            }
          });

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
        // Fallback: mark shipping form as valid for checkout since we have a fallback address
        this.userProfile = {
          firstName: 'John',
          lastName: 'Doe',
          addressLineOne: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        };
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
          cardName: pm.nameOnCard,
          // Store full payment method data for later use
          fullData: pm
        }));
        console.log('Loaded payment methods:', this.savedPaymentMethods);
        this.isLoadingPaymentMethods = false;
      },
      error: (error) => {
        console.error('Error loading payment methods:', error);
        // Check if it's an authentication error
        if (error.message.includes('authentication')) {
          this.orderError = 'Please log in to view your saved payment methods.';
        }
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
    this.orderError = null; // Clear any previous errors

    // Ensure user profile is loaded before proceeding
    if (!this.isReadyToPlaceOrder) {
      this.orderError = 'Please wait while we load your profile information.';
      return;
    }

    // Check form validity (disabled fields don't affect validity)
    const isPaymentValid = this.sameAsShipping ?
      this.isPaymentFormValidWithDisabledFields() :
      this.paymentForm.valid;

    // Since we always use the user profile address for shipping, we should ensure
    // the shipping form is valid or bypass shipping validation if using profile data
    const isShippingValid = this.userProfile ? true : this.shippingForm.valid;

    console.log('Form validation:', {
      shippingValid: isShippingValid,
      shippingStatus: this.shippingForm.status,
      shippingErrors: this.getFormErrors(this.shippingForm),
      shippingValues: this.shippingForm.value,
      paymentValid: isPaymentValid,
      sameAsShipping: this.sameAsShipping,
      paymentFormStatus: this.paymentForm.status,
      paymentFormErrors: this.getFormErrors(this.paymentForm),
      userProfile: this.userProfile,
      isReadyToPlaceOrder: this.isReadyToPlaceOrder
    });

    if (!isPaymentValid) {
      console.log('Payment form validation failed');
      this.orderError = 'Please complete all required payment fields.';
      return;
    }

    // Prevent multiple submissions
    if (this.isPlacingOrder) {
      return;
    }

    this.isPlacingOrder = true;

    // Determine if we're using a saved payment method or creating a new one
    const selectedPaymentId = this.paymentForm.get('savedPaymentMethodId')?.value;
    const isUsingSavedPaymentMethod = !!selectedPaymentId;

    // Save payment method to backend if requested and it's a completely new payment method
    if (this.savePaymentMethod && !isUsingSavedPaymentMethod) {
      // Validate we have all required data for saving a new payment method
      if (!this.actualCardNumber || this.actualCardNumber.length < 13) {
        this.orderError = 'Please enter a valid card number to save the payment method.';
        this.isPlacingOrder = false;
        return;
      }

      const paymentMethodData = {
        cardNumber: this.actualCardNumber,
        cardExpirationMonth: parseInt(this.paymentForm.value.expiryMonth),
        cardExpirationYear: parseInt(this.paymentForm.value.expiryYear),
        nameOnCard: this.paymentForm.value.cardName,
        // Include billing address if provided
        addressLine1: this.sameAsShipping ? this.userProfile?.addressLineOne : this.paymentForm.value.billingAddressLineOne,
        addressLine2: this.sameAsShipping ? (this.userProfile?.addressLineTwo || '') : (this.paymentForm.value.billingAddressLineTwo || ''),
        city: this.sameAsShipping ? this.userProfile?.city : this.paymentForm.value.billingCity,
        state: this.sameAsShipping ? this.userProfile?.state : this.paymentForm.value.billingState,
        zipCode: this.sameAsShipping ? this.userProfile?.zipCode : this.paymentForm.value.billingZip,
        country: this.sameAsShipping ? this.userProfile?.country : this.paymentForm.value.billingCountry
      };

      console.log('Saving new payment method:', paymentMethodData);

      this.paymentMethodService.addPaymentMethod(paymentMethodData).subscribe({
        next: (savedPaymentMethod) => {
          console.log('Payment method saved successfully:', savedPaymentMethod);
          // Refresh the saved payment methods list
          this.loadPaymentMethods();
          this.proceedWithOrderPlacement();
        },
        error: (error) => {
          console.error('Error saving payment method:', error);

          // Check if it's an authentication error
          if (error.message.includes('authentication') || error.message.includes('log in')) {
            this.orderError = 'Authentication failed. Please log in again and try placing your order.';
            this.isPlacingOrder = false;
            return;
          }

          // Continue with order placement even if payment method save fails
          this.orderError = 'Payment method could not be saved, but order will still be placed.';
          this.proceedWithOrderPlacement();
        }
      });
    } else {
      if (isUsingSavedPaymentMethod) {
        console.log('Using saved payment method for order:', selectedPaymentId);
      } else {
        console.log('Proceeding with new payment method without saving');
      }
      this.proceedWithOrderPlacement();
    }
  }

  private proceedWithOrderPlacement() {
    // Place the order using the OrderService
    this.orderService.placeOrder().subscribe({
      next: (response) => {
        console.log('Order placed successfully:', response);

        // Clear cart after successful order (the backend already clears it, but update UI)
        this.cartService.clearCart();

        // Show success message
        alert(`Order placed successfully! Transaction ID: ${response.transactionId}, Total: $${response.price.toFixed(2)}`);

        // Navigate to home page or order confirmation page
        this.router.navigate(['/']);

        this.isPlacingOrder = false;
      },
      error: (error) => {
        console.error('Error placing order:', error);

        // Check if it's an authentication error
        if (error.message.includes('authentication') || error.message.includes('log in')) {
          this.orderError = 'Authentication failed. Please log in again and try placing your order.';
        } else if (error.message.includes('stock') || error.message.includes('inventory')) {
          this.orderError = 'Some items in your cart are out of stock. Please check your cart and try again.';
        } else {
          this.orderError = error.message || 'An unexpected error occurred. Please try again.';
        }

        this.isPlacingOrder = false;

        // Refresh cart to sync with backend state
        this.cartService.refreshCart();
      }
    });
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
      if (selectedPayment && selectedPayment.fullData) {
        const fullData = selectedPayment.fullData;

        // Use the full card number for display (masking it appropriately)
        this.actualCardNumber = fullData.cardNumber;

        // Populate payment form fields
        this.paymentForm.patchValue({
          cardNumber: `**** **** **** ${selectedPayment.cardNumber}`,
          expiryMonth: selectedPayment.expiryMonth,
          expiryYear: selectedPayment.expiryYear,
          cardName: selectedPayment.cardName
        });

        // Auto-populate billing address if available from saved payment method
        if (fullData.addressLine1) {
          this.paymentForm.patchValue({
            billingAddressLineOne: fullData.addressLine1,
            billingAddressLineTwo: fullData.addressLine2 || '',
            billingCity: fullData.city,
            billingState: fullData.state,
            billingZip: fullData.zipCode,
            billingCountry: fullData.country
          });

          // If billing address is populated from saved payment method, uncheck "same as shipping"
          if (this.sameAsShipping) {
            this.sameAsShipping = false;
            // Re-enable billing address fields
            this.paymentForm.get('billingAddressLineOne')?.enable();
            this.paymentForm.get('billingAddressLineTwo')?.enable();
            this.paymentForm.get('billingCity')?.enable();
            this.paymentForm.get('billingState')?.enable();
            this.paymentForm.get('billingZip')?.enable();
            this.paymentForm.get('billingCountry')?.enable();
          }
        } else {
          // If no billing address in saved payment method, use shipping address
          this.sameAsShipping = true;
          this.toggleSameAsShipping();
        }

        // Don't save this payment method again since it's already saved
        this.savePaymentMethod = false;

        console.log('Selected saved payment method:', {
          id: selectedId,
          billingAddress: {
            addressLine1: fullData.addressLine1,
            city: fullData.city,
            state: fullData.state
          }
        });
      }
    } else {
      // Clear fields when "Enter new payment method" is selected
      this.actualCardNumber = '';
      this.paymentForm.patchValue({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cardName: '',
        billingAddressLineOne: '',
        billingAddressLineTwo: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        billingCountry: ''
      });

      // Reset billing address to match shipping if needed
      if (this.sameAsShipping) {
        this.toggleSameAsShipping();
        this.toggleSameAsShipping(); // Toggle twice to refresh
      }

      // Reset save payment method option to false
      this.savePaymentMethod = false;

      console.log('Cleared payment method form for new entry');
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

  // Helper method to check if we're ready to place order
  get isReadyToPlaceOrder(): boolean {
    return !this.isLoadingProfile && !this.isLoadingPaymentMethods && this.userProfile !== null;
  }
}