
export interface Cart {
    id: string;
    userId?: string; // undefined for guest carts
    items: Product[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;

    get itemCount(): number;
    get isEmpty(): boolean;
}

export interface AddToCartRequest {
    productId: string;
    variantId?: string;
    quantity: number;
    selectedAttributes?: Record<string, string>;
}

export interface UpdateCartItemRequest {
    cartItemId: string;
    quantity: number;
}

// Import the ProductSummary interface
import { Product, ProductSummary } from './product.model';
