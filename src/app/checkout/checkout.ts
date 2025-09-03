import { Component, OnInit, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ThemeService } from '../services/theme.service';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['../app.css', './checkout.css']
})
export class Checkout implements OnInit {
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  currentStep = 1;
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

  // Saved payment methods (mock data - replace with actual user service)
  savedPaymentMethods: SavedPaymentMethod[] = [
    {
      id: 1,
      name: 'Personal Visa',
      cardNumber: '4532',
      expiryMonth: '12',
      expiryYear: '2027',
      cardName: 'John Doe'
    },
    {
      id: 2,
      name: 'Business Card',
      cardNumber: '5555',
      expiryMonth: '08',
      expiryYear: '2026',
      cardName: 'John Doe'
    }
  ];

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
    private themeService: ThemeService
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
      address: ['', Validators.required],
      apartment: [''], // Optional field
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      savedPaymentMethodId: [''],
      cardNumber: ['', Validators.required],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
      cvv: ['', Validators.required],
      cardName: ['', Validators.required],
      billingAddress: ['', Validators.required],
      billingCity: ['', Validators.required],
      billingState: ['', Validators.required],
      billingZip: ['', Validators.required]
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
  }
  refreshCart() {
    this.cartService.refreshCart();
  }
  

  nextStep() {
    if (this.currentStep === 1) {
      this.shippingFormSubmitted = true;
      if (this.shippingForm.valid) {
        this.currentStep = 2;
        this.shippingFormSubmitted = false;
      }
    } else if (this.currentStep === 2) {
      this.paymentFormSubmitted = true;
      if (this.paymentForm.valid) {
        this.currentStep = 3;
        this.paymentFormSubmitted = false;
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.shippingFormSubmitted = false;
      this.paymentFormSubmitted = false;
    }
  }

  placeOrder() {
    this.paymentFormSubmitted = true;
    if (this.shippingForm.valid && this.paymentForm.valid) {
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

      // TODO: Save payment method to user profile if savePaymentMethod is true
      if (this.savePaymentMethod) {
        console.log('Saving payment method to user profile...');
        // Implement save payment method logic here
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
      // Copy shipping address to billing address (including apartment)
      const apartment = this.shippingForm.get('apartment')?.value;
      const fullAddress = apartment ?
        `${this.shippingForm.get('address')?.value}, ${apartment}` :
        this.shippingForm.get('address')?.value;

      this.paymentForm.patchValue({
        billingAddress: fullAddress,
        billingCity: this.shippingForm.get('city')?.value,
        billingState: this.shippingForm.get('state')?.value,
        billingZip: this.shippingForm.get('zipCode')?.value
      });

      // Disable billing address fields
      this.paymentForm.get('billingAddress')?.disable();
      this.paymentForm.get('billingCity')?.disable();
      this.paymentForm.get('billingState')?.disable();
      this.paymentForm.get('billingZip')?.disable();
    } else {
      // Enable billing address fields
      this.paymentForm.get('billingAddress')?.enable();
      this.paymentForm.get('billingCity')?.enable();
      this.paymentForm.get('billingState')?.enable();
      this.paymentForm.get('billingZip')?.enable();

      // Clear billing address fields
      this.paymentForm.patchValue({
        billingAddress: '',
        billingCity: '',
        billingState: '',
        billingZip: ''
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
}