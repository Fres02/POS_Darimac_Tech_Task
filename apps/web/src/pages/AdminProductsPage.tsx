import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@pos/shared";
import { createProduct, deactivateProduct, fetchProducts, updateProduct } from "../lib/products";

type ProductFormState = {
  name: string;
  sku: string;
  priceLkr: string;
  taxRate: string;
  stockQty: string;
};

const EMPTY_FORM: ProductFormState = { name: "", sku: "", priceLkr: "", taxRate: "0", stockQty: "" };

function toInput(form: ProductFormState) {
  return {
    name: form.name.trim(),
    sku: form.sku.trim() || undefined,
    priceLkr: Number(form.priceLkr),
    taxRate: Number(form.taxRate),
    active: true,
    stockQty: form.stockQty.trim() ? Number(form.stockQty) : undefined,
  };
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => fetchProducts(search || undefined),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      setCreateForm(EMPTY_FORM);
      setError(null);
      invalidate();
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReturnType<typeof toInput> }) =>
      updateProduct(id, input),
    onSuccess: () => {
      setEditingId(null);
      setError(null);
      invalidate();
    },
    onError: (err: Error) => setError(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: invalidate,
  });

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate(toInput(createForm));
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      sku: product.sku ?? "",
      priceLkr: String(product.priceLkr),
      taxRate: String(product.taxRate),
      stockQty: product.stockQty !== undefined ? String(product.stockQty) : "",
    });
  }

  function handleEditSave(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, input: toInput(editForm) });
  }

  return (
    <main>
      <p>
        <Link to="/admin">&larr; Back to dashboard</Link>
      </p>
      <h1>Products</h1>

      <input
        type="search"
        placeholder="Search by name or SKU"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p role="alert">{error}</p>}

      {isLoading ? (
        <p>Loading products...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price (LKR)</th>
              <th>Tax rate</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) =>
              editingId === product.id ? (
                <tr key={product.id}>
                  <td colSpan={7}>
                    <form onSubmit={handleEditSave}>
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                      />
                      <input
                        value={editForm.sku}
                        onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                        placeholder="SKU"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.priceLkr}
                        onChange={(e) => setEditForm({ ...editForm, priceLkr: e.target.value })}
                        required
                      />
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        max="1"
                        value={editForm.taxRate}
                        onChange={(e) => setEditForm({ ...editForm, taxRate: e.target.value })}
                        required
                      />
                      <input
                        type="number"
                        value={editForm.stockQty}
                        onChange={(e) => setEditForm({ ...editForm, stockQty: e.target.value })}
                        placeholder="Stock"
                      />
                      <button type="submit" disabled={updateMutation.isPending}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku ?? "—"}</td>
                  <td>{product.priceLkr.toFixed(2)}</td>
                  <td>{(product.taxRate * 100).toFixed(1)}%</td>
                  <td>{product.stockQty ?? "—"}</td>
                  <td>{product.active ? "Active" : "Inactive"}</td>
                  <td>
                    <button onClick={() => startEdit(product)}>Edit</button>
                    {product.active && (
                      <button
                        onClick={() => deactivateMutation.mutate(product.id)}
                        disabled={deactivateMutation.isPending}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}

      <h2>Add product</h2>
      <form onSubmit={handleCreate}>
        <input
          placeholder="Name"
          value={createForm.name}
          onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
          required
        />
        <input
          placeholder="SKU (optional)"
          value={createForm.sku}
          onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price (LKR)"
          value={createForm.priceLkr}
          onChange={(e) => setCreateForm({ ...createForm, priceLkr: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.001"
          min="0"
          max="1"
          placeholder="Tax rate (0-1)"
          value={createForm.taxRate}
          onChange={(e) => setCreateForm({ ...createForm, taxRate: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Stock qty (optional)"
          value={createForm.stockQty}
          onChange={(e) => setCreateForm({ ...createForm, stockQty: e.target.value })}
        />
        <button type="submit" disabled={createMutation.isPending}>
          Add
        </button>
      </form>
    </main>
  );
}
