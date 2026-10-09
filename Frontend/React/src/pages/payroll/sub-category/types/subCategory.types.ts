export type SubCategoryStatus = 'Active' | 'Inactive';

export interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
  status: SubCategoryStatus;
}

export interface SubCategoryApiRecord {
  id?: number;
  sub_category_id?: number;

  category_id?: number;

  name?: string;
  sub_category_name?: string;

  status?: SubCategoryStatus;
  is_active?: boolean;
}

export interface CreateSubCategoryRequest {
  categoryId: number;
  subCategoryName: string;
}