import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Pencil, Ban, Plus } from "lucide-react";
import type { Product } from "@pos/shared";
import { createProduct, deactivateProduct, fetchProducts, updateProduct } from "../lib/products";
import { formatLkr } from "../lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => fetchProducts(search || undefined),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      setCreateForm(EMPTY_FORM);
      toast.success(`Added "${product.name}"`);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReturnType<typeof toInput> }) =>
      updateProduct(id, input),
    onSuccess: (product) => {
      setEditingId(null);
      toast.success(`Updated "${product.name}"`);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: (product) => {
      toast.success(`Deactivated "${product.name}"`);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Manage the catalog cashiers sell from.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading products...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) =>
                  editingId === product.id ? (
                    <TableRow key={product.id}>
                      <TableCell colSpan={7}>
                        <form onSubmit={handleEditSave} className="flex flex-wrap items-end gap-2 py-1">
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Name"
                            className="w-40"
                            required
                          />
                          <Input
                            value={editForm.sku}
                            onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                            placeholder="SKU"
                            className="w-28"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={editForm.priceLkr}
                            onChange={(e) => setEditForm({ ...editForm, priceLkr: e.target.value })}
                            placeholder="Price"
                            className="w-24"
                            required
                          />
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            max="1"
                            value={editForm.taxRate}
                            onChange={(e) => setEditForm({ ...editForm, taxRate: e.target.value })}
                            placeholder="Tax"
                            className="w-20"
                            required
                          />
                          <Input
                            type="number"
                            value={editForm.stockQty}
                            onChange={(e) => setEditForm({ ...editForm, stockQty: e.target.value })}
                            placeholder="Stock"
                            className="w-20"
                          />
                          <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.sku ?? "—"}</TableCell>
                      <TableCell>{formatLkr(product.priceLkr)}</TableCell>
                      <TableCell>{(product.taxRate * 100).toFixed(1)}%</TableCell>
                      <TableCell>{product.stockQty ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={product.active ? "secondary" : "outline"}>
                          {product.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(product)}>
                          <Pencil className="size-4" />
                        </Button>
                        {product.active && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deactivateMutation.mutate(product.id)}
                            disabled={deactivateMutation.isPending}
                          >
                            <Ban className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-2">
              <Label>Name</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>SKU (optional)</Label>
              <Input
                value={createForm.sku}
                onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Price (LKR)</Label>
              <Input
                type="number"
                step="0.01"
                value={createForm.priceLkr}
                onChange={(e) => setCreateForm({ ...createForm, priceLkr: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tax rate (0-1)</Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={createForm.taxRate}
                onChange={(e) => setCreateForm({ ...createForm, taxRate: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Stock qty (optional)</Label>
              <Input
                type="number"
                value={createForm.stockQty}
                onChange={(e) => setCreateForm({ ...createForm, stockQty: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="sm:col-span-2 lg:col-span-5">
              <Plus /> Add product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
