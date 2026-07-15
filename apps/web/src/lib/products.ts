import type { Product, CreateProductInput, UpdateProductInput } from "@pos/shared";
import { apiFetch } from "./api";

export async function fetchProducts(
  search?: string,
  activeOnly?: boolean,
  category?: string,
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (activeOnly) params.set("active", "true");
  if (category) params.set("category", category);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const { products } = await apiFetch<{ products: Product[] }>(`/api/products${qs}`);
  return products;
}

export async function fetchProductCategories(): Promise<string[]> {
  const { categories } = await apiFetch<{ categories: string[] }>("/api/products/categories");
  return categories;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { product } = await apiFetch<{ product: Product }>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return product;
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const { product } = await apiFetch<{ product: Product }>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return product;
}

export async function deactivateProduct(id: string): Promise<Product> {
  const { product } = await apiFetch<{ product: Product }>(`/api/products/${id}`, {
    method: "DELETE",
  });
  return product;
}
