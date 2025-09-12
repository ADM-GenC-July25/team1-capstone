import { Component, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { PaymentService, PaymentMethodRequest } from '../services/payment.service';

@Component({
  selector: 'app-add-payment-method',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-payment-method.html',
  styleUrl: './add-payment-method.css'
})
export class AddPaymentMethod implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() paymentMethodAdded = new EventEmitter<void>();

  paymentForm!: FormGroup;
  isLoading = signal(false);
  submitError = signal<string>('');
  submitSuccess = signal<string>('');
  selectedPaymentType = signal<string>('credit-card');

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private themeService: ThemeService,
    private paymentService: PaymentService
  ) { }

  // Theme service integration
  get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.paymentForm = this.formBuilder.group({
      paymentType: ['credit-card', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear()), Validators.max(new Date().getFullYear() + 20)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      billingAddress: this.formBuilder.group({
        addressLine1: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
        addressLine2: ['', [Validators.maxLength(100)]],
        city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
        country: ['United States', [Validators.required]]
      }),
      isDefault: [false]
    });

    // Watch for payment type changes
    this.paymentForm.get('paymentType')?.valueChanges.subscribe(type => {
      this.selectedPaymentType.set(type);
      this.updateValidationForPaymentType(type);
    });
  }

  private updateValidationForPaymentType(type: string) {
    const cardNumber = this.paymentForm.get('cardNumber');
    const cvv = this.paymentForm.get('cvv');

    if (type === 'credit-card' || type === 'debit-card') {
      cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
      cvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    } else {
      cardNumber?.clearValidators();
      cvv?.clearValidators();
    }

    cardNumber?.updateValueAndValidity();
    cvv?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      this.isLoading.set(true);
      this.submitError.set('');
      this.submitSuccess.set('');

      const paymentData: PaymentMethodRequest = {
        cardNumber: this.paymentForm.value.cardNumber,
        cardExpirationMonth: parseInt(this.paymentForm.value.expiryMonth),
        cardExpirationYear: parseInt(this.paymentForm.value.expiryYear),
        nameOnCard: this.paymentForm.value.cardholderName,
        addressLine1: this.paymentForm.value.billingAddress.addressLine1,
        addressLine2: this.paymentForm.value.billingAddress.addressLine2,
        city: this.paymentForm.value.billingAddress.city,
        state: this.paymentForm.value.billingAddress.state,
        zipCode: this.paymentForm.value.billingAddress.zipCode,
        country: this.paymentForm.value.billingAddress.country
      };

      this.paymentService.addPaymentMethod(paymentData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.submitSuccess.set('Payment method added successfully!');

          // Reset form after successful submission
          this.paymentForm.reset();
          this.initializeForm();

          // Emit events to parent component
          this.paymentMethodAdded.emit();

          // Close modal after a brief delay
          setTimeout(() => {
            this.closeModal.emit();
          }, 1500);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.submitError.set(`Failed to add payment method: ${error.message}`);
          console.error('Payment method submission error:', error);
        }
      });

    } else {
      this.markFormGroupTouched();
      this.submitError.set('Please fill in all required fields correctly.');
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.paymentForm.controls).forEach(key => {
      const control = this.paymentForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  private maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) return cardNumber;
    return '**** **** **** ' + cardNumber.slice(-4);
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    event.target.value = value;
    this.paymentForm.patchValue({ cardNumber: value.replace(/\s/g, '') });
  }

  formatExpiryDate(event: any, field: string) {
    let value = event.target.value.replace(/\D/g, '');
    if (field === 'expiryMonth') {
      value = value.substring(0, 2);
      if (parseInt(value) > 12) value = '12';
    } else if (field === 'expiryYear') {
      value = value.substring(0, 4);
    }
    event.target.value = value;
  }

  onCancel() {
    this.closeModal.emit();
  }

  // Helper methods for template
  getFieldError(fieldName: string): string {
    const field = this.paymentForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} is too short`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} is too long`;
      if (field.errors['pattern']) return `${this.getFieldLabel(fieldName)} format is invalid`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} is invalid`;
      if (field.errors['max']) return `${this.getFieldLabel(fieldName)} is invalid`;
    }
    return '';
  }

  getBillingFieldError(fieldName: string): string {
    const field = this.paymentForm.get(`billingAddress.${fieldName}`);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getBillingFieldLabel(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getBillingFieldLabel(fieldName)} is too short`;
      if (field.errors['maxlength']) return `${this.getBillingFieldLabel(fieldName)} is too long`;
      if (field.errors['pattern']) return `${this.getBillingFieldLabel(fieldName)} format is invalid`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      paymentType: 'Payment Type',
      cardNumber: 'Card Number',
      cardholderName: 'Cardholder Name',
      expiryMonth: 'Expiry Month',
      expiryYear: 'Expiry Year',
      cvv: 'CVV'
    };
    return labels[fieldName] || fieldName;
  }

  private getBillingFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      addressLine1: 'Address Line 1',
      addressLine2: 'Address Line 2',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      country: 'Country'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  isBillingFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(`billingAddress.${fieldName}`);
    return !!(field?.invalid && field.touched);
  }
}
