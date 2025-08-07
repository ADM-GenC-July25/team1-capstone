export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    brand: string;
    thumbnailImage: string;
    stockQuantity: number;
    isInStock: boolean;
    isActive: boolean;
    isFeatured: boolean;
    isOnSale: boolean;
    rating: number;
    reviewCount: number;
    tags: string[];
    attributes: ProductAttribute[];
    variants?: ProductVariant[];
    specifications: Record<string, string>;
    seoData?: SEOData;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive: boolean;
    sortOrder: number;
}

export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface ProductAttribute {
    name: string;
    value: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
    isFilterable: boolean;
    isRequired: boolean;
}

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    stockQuantity: number;
    attributes: Record<string, string>; // e.g., { "Color": "Red", "Size": "L" }
    images?: ProductImage[];
    isDefault: boolean;
}

export interface SEOData {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
}

// For product lists/grids
export interface ProductSummary {
    id: string;
    name: string;
    shortDescription?: string;
    price: number;
    originalPrice?: number;
    thumbnailImage: string;
    rating: number;
    reviewCount: number;
    isOnSale: boolean;
    isFeatured: boolean;
    isInStock: boolean;
    category: {
        id: string;
        name: string;
        slug: string;
    };

    get discountPercentage(): number;
}

// For search/filtering
export interface ProductFilter {
    categories?: string[];
    brands?: string[];
    priceRange?: {
        min: number;
        max: number;
    };
    rating?: number;
    inStock?: boolean;
    onSale?: boolean;
    attributes?: Record<string, string[]>;
}

export interface ProductSearchRequest {
    query?: string;
    filters?: ProductFilter;
    sortBy?: 'name' | 'price' | 'rating' | 'newest' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    page: number;
    pageSize: number;
}

export interface ProductSearchResponse {
    products: ProductSummary[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    filters: {
        availableCategories: ProductCategory[];
        availableBrands: { name: string; count: number }[];
        priceRange: { min: number; max: number };
        availableAttributes: Record<string, string[]>;
    };
}
