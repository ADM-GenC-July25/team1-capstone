import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { ProductService, CreateProductRequest } from '../services/product.service';
import { CategoryService, Category } from '../services/category.service';

@Component({
  selector: 'app-new-product-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './new-product-page.html',
  styleUrl: './new-product-page.css'
})
export class NewProductPage implements OnInit {
  productForm!: FormGroup;
  isLoading = signal(false);
  submitError = signal<string>('');
  submitSuccess = signal<string>('');
  imagePreview = signal<string>('');
  imageError = signal<boolean>(false);
  categories: Category[] = [];
  selectedCategories: number[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private themeService: ThemeService,
    private productService: ProductService,
    private categoryService: CategoryService
  ) { }

  // Theme service integration
  get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  ngOnInit() {
    this.initializeForm();
    this.loadCategories();
  }

  private loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.submitError.set('Failed to load categories');
      }
    });
  }

  private initializeForm() {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      inventory: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      price: ['', [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      daysToDeliver: ['', [Validators.required, Validators.min(1), Validators.max(365), Validators.pattern(/^\d+$/)]],
      imageLink: ['', [Validators.pattern(/^https?:\/\/.+/)]]
    });

    // Watch for imageLink changes to update preview
    this.productForm.get('imageLink')?.valueChanges.subscribe(url => {
      this.updateImagePreview(url);
    });
  }

  private updateImagePreview(url: string) {
    this.imageError.set(false);
    this.imagePreview.set('');

    if (url && url.trim()) {
      // Test if the image can be loaded
      const img = new Image();
      img.onload = () => {
        this.imagePreview.set(url);
        this.imageError.set(false);
      };
      img.onerror = () => {
        this.imagePreview.set('');
        this.imageError.set(true);
      };
      img.src = url;
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isLoading.set(true);
      this.submitError.set('');
      this.submitSuccess.set('');

      const productData: CreateProductRequest = {
        productName: this.productForm.value.name,
        inventory: parseInt(this.productForm.value.inventory),
        price: parseFloat(this.productForm.value.price),
        description: this.productForm.value.description,
        daysToDeliver: parseInt(this.productForm.value.daysToDeliver),
        imageLink: this.productForm.value.imageLink || undefined,
        categoryIds: this.selectedCategories.length > 0 ? this.selectedCategories : undefined
      };

      console.log('Attempting to create product with token:', sessionStorage.getItem('authToken'));
      console.log('Current user:', sessionStorage.getItem('currentUser'));
      
      this.productService.createProduct(productData).subscribe({
        next: (createdProduct) => {
          this.isLoading.set(false);
          this.submitSuccess.set('Product created successfully!');
          console.log('Product created:', createdProduct);

          // Refresh the products list to include the new product
          this.productService.refreshProducts();

          // Reset form after successful submission
          setTimeout(() => {
            this.resetForm();
            // Optionally navigate to the product page or product list
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Full error details:', error);
          this.submitError.set(error.message || 'Failed to create product. Please try again.');
        }
      });

    } else {
      this.markFormGroupTouched();
      this.submitError.set('Please fill in all required fields correctly.');
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    this.router.navigate(['/']); // Navigate back to main page
  }

  // Helper methods for template
  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} is too short`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} is too long`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be greater than 0`;
      if (field.errors['max']) return `${this.getFieldLabel(fieldName)} is too large`;
      if (field.errors['pattern']) return `${this.getFieldLabel(fieldName)} format is invalid`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Product Name',
      inventory: 'Inventory',
      price: 'Price',
      description: 'Description',
      daysToDeliver: 'Days to Deliver',
      imageLink: 'Image Link'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  // Category selection methods
  onCategoryChange(categoryId: number, isChecked: boolean) {
    if (isChecked) {
      if (!this.selectedCategories.includes(categoryId)) {
        this.selectedCategories.push(categoryId);
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  // Reset selected categories when form is reset
  resetForm() {
    this.productForm.reset();
    this.selectedCategories = [];
    this.imagePreview.set('');
    this.imageError.set(false);
    this.submitError.set('');
    this.submitSuccess.set('');
  }
}
