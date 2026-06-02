export type ProductStatus = 'halal' | 'haram' | 'mushbooh' | 'HALAL' | 'HARAM' | 'MUSBOOH'; // Added uppercase as per API

export interface ScannedProduct {
  id: number;
  product_name?: string;
  ingredient_text: string;
  overall_status: ProductStatus;
  reasoning: string;
  ingredients_analysis: Array<{
    note: string;
    status: ProductStatus;
    component_name: string;
    component_type: string;
  }>;
  front_image: string;
  back_image: string;
  ingredients_image: string;
  ingredients_hash: string;
  barcode_image?: string;
  manufacturer_image?: string;
  additional_images?: string[];
  created_at: string;
  assigned_to_id?: string | null;
  /** Email of the assignee who reviewed this product (populated via JOIN) */
  reviewer_email?: string | null;
  /** Internal review-status enum updated by assignee */
  status?: 'pending' | 'halal' | 'haram' | 'mushbooh';
  /** Review attachments uploaded by assignee */
  review_attachments?: string[];
}

export interface AssigneeStats {
  total_reviewed: number;
  halal_count: number;
  haram_count: number;
  mushbooh_count: number;
  reviewed_products: Array<{
    id: number;
    product_name?: string;
    ingredient_text: string;
    overall_status: ProductStatus;
    status: 'halal' | 'haram' | 'mushbooh';
    reasoning: string;
    front_image: string;
    back_image?: string;
    ingredients_image?: string;
    created_at: string;
    barcode_image?: string;
    manufacturer_image?: string;
    additional_images?: string[];
  }>;
}

export interface Product {
  id: string;
  name: string;
  status: ProductStatus;
  ingredients: string;
  analysis: string;
  images: {
    front: string;
    back: string;
    ingredients: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  total: number;
  halal: number;
  haram: number;
  mushbooh: number;
}
