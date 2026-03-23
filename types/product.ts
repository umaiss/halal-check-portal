export type ProductStatus = 'halal' | 'haram' | 'mushbooh' | 'HALAL' | 'HARAM' | 'MUSBOOH' | 'MUSBOOH'; // Added uppercase as per API

export interface ScannedProduct {
  id: number;
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
  created_at: string;
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
