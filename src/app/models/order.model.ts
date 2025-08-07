import { Product } from "./product.model";


export interface Order {
    id: string;
    userId: string;
    orderNumber: string;
    status: string;
    items: Product[];
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;

    // Addresses
    shippingAddress: string;
    billingAddress: string;

    // Payment
    paymentMethod: string;
    paymentStatus: string;

    // Shipping
    shippingMethod: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    shippedAt?: Date;
    deliveredAt?: Date;

    // Additional info
    notes?: string;

    get canCancel(): boolean;
    get canReturn(): boolean;
}
