import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { ProductService, Product } from '../services/product.service';
import { CategoryService, Category } from '../services/category.service';

@Component({
  selector: 'app-edit-product-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-product-page.html',
  styleUrl: './edit-product-page.css'
})
export class EditProductPage implements OnInit {
  productForm!: FormGroup;
  isLoading = signal(false);
  submitError = signal<string>('');
  submitSuccess = signal<string>('');
  imagePreview = signal<string>('');
  imageError = signal<boolean>(false);
  categories: Category[] = [];
  selectedCategories: number[] = [];
  productId!: number;
  product: Product | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private productService: ProductService,
    private categoryService: CategoryService
  ) { }

  get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct();
    this.loadCategories();
    this.loadProductCategories();
  }

  private loadProduct() {
    this.product = this.productService.getProductById(this.productId) || null;
    if (this.product) {
      this.initializeForm();
    } else {
      this.router.navigate(['/']);
    }
  }

  private loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  private loadProductCategories() {
    this.productService.getCategoriesForProduct(this.productId).subscribe({
      next: (categories) => {
        this.selectedCategories = categories.map(cat => cat.categoryId);
      },
      error: (error) => {
        console.error('Error loading product categories:', error);
        // Not critical, continue with empty selection
        this.selectedCategories = [];
      }
    });
  }

  private initializeForm() {
    if (!this.product) return;

    this.productForm = this.formBuilder.group({
      name: [this.product.productName, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      inventory: [this.product.inventory, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      price: [this.product.price, [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      description: [this.product.description, [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      daysToDeliver: [this.product.daysToDeliver, [Validators.required, Validators.min(1), Validators.max(365), Validators.pattern(/^\d+$/)]],
      imageLink: [this.product.imageLink, [Validators.pattern(/^https?:\/\/.+/)]]
    });

    this.imagePreview.set(this.product.imageLink);

    this.productForm.get('imageLink')?.valueChanges.subscribe(url => {
      this.updateImagePreview(url);
    });
  }

  private updateImagePreview(url: string) {
    this.imageError.set(false);
    this.imagePreview.set('');

    if (url && url.trim()) {
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

      const productData: Partial<Product> = {
        productName: this.productForm.value.name,
        inventory: parseInt(this.productForm.value.inventory),
        price: parseFloat(this.productForm.value.price),
        description: this.productForm.value.description,
        daysToDeliver: parseInt(this.productForm.value.daysToDeliver),
        imageLink: this.productForm.value.imageLink || undefined
      };

      // Update product first
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: (updatedProduct) => {
          // Then update categories
          this.productService.updateProductCategories(this.productId, this.selectedCategories).subscribe({
            next: () => {
              this.isLoading.set(false);
              this.submitSuccess.set('Product updated successfully!');
              this.productService.refreshProducts();

              setTimeout(() => {
                this.router.navigate(['/']);
              }, 2000);
            },
            error: (categoryError) => {
              this.isLoading.set(false);
              // Product updated but categories failed
              this.submitSuccess.set('Product updated, but category update failed.');
              console.error('Error updating categories:', categoryError);
              this.productService.refreshProducts();

              setTimeout(() => {
                this.router.navigate(['/']);
              }, 2000);
            }
          });
        },
        error: (error) => {
          this.isLoading.set(false);
          this.submitError.set(error.message || 'Failed to update product. Please try again.');
          console.error('Error updating product:', error);
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
    this.router.navigate(['/']);
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.isLoading.set(true);
      this.submitError.set('');

      console.log('Attempting to delete product ID:', this.productId);

      this.productService.deleteProduct(this.productId).subscribe({
        next: () => {
          console.log('Product deleted successfully');
          this.isLoading.set(false);
          this.productService.refreshProducts();
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Delete error details:', error);
          this.isLoading.set(false);
          this.submitError.set(error.message || 'Failed to delete product. Please try again.');
        }
      });
    }
  }

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
}