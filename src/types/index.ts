export interface Preorder {
  id: number;
  name: string;
  products: number;
  preorder_when: string;
  starts_at: string;
  ends_at: string | null;
  status: number; // 1 = active, 0 = inactive
  created_at: string;
  updated_at: string;
}

export type SortField = "name" | "created_at" | "starts_at" | "ends_at";
export type SortOrder = "asc" | "desc";
export type FilterTab = "all" | "active" | "inactive";

export interface PreordersResponse {
  data: Preorder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
