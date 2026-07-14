import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { computeSaleTotals, type Discount, type Sale } from "@pos/shared";
import { useAuth } from "../context/AuthContext";
import { useCartStore } from "../store/cart";
import { fetchProducts } from "../lib/products";
import { checkout } from "../lib/sales";

type DiscountType = "none" | "amount" | "percent";

export default function CashierPosPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { lines, discount, addProduct, updateQty, removeLine, setDiscount, clear } =
    useCartStore();

  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [discountValue, setDiscountValue] = useState("0");
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "pos"],
    queryFn: () => fetchProducts(undefined, true),
  });

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: (sale) => {
      setLastSale(sale);
      setError(null);
      clear();
      setDiscountType("none");
      setDiscountValue("0");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  function applyDiscount(type: DiscountType, value: string) {
    setDiscountType(type);
    setDiscountValue(value);
    if (type === "none") {
      setDiscount(undefined);
      return;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    setDiscount({ type, value: numeric } as Discount);
  }

  const totals = computeSaleTotals(
    lines.map((l) => ({ unitPriceSnapshot: l.unitPrice, qty: l.qty, taxRate: l.taxRate })),
    discount,
  );

  function handleCheckout() {
    setLastSale(null);
    checkoutMutation.mutate({
      items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
      discount,
    });
  }

  return (
    <main>
      <h1>POS</h1>
      <p>
        Welcome, {user?.fullName}. <button onClick={logout}>Log out</button>
      </p>

      <section>
        <h2>Products</h2>
        {isLoading ? (
          <p>Loading products...</p>
        ) : (
          <div>
            {products?.map((product) => (
              <button key={product.id} onClick={() => addProduct(product)}>
                {product.name} — LKR {product.priceLkr.toFixed(2)}
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Cart</h2>
        {lines.length === 0 ? (
          <p>Cart is empty.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Unit price</th>
                <th>Qty</th>
                <th>Line total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.productId}>
                  <td>{line.name}</td>
                  <td>{line.unitPrice.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) => updateQty(line.productId, Number(e.target.value))}
                    />
                  </td>
                  <td>{(line.unitPrice * line.qty).toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeLine(line.productId)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div>
          <label>
            Discount:
            <select
              value={discountType}
              onChange={(e) => applyDiscount(e.target.value as DiscountType, discountValue)}
            >
              <option value="none">None</option>
              <option value="amount">Amount (LKR)</option>
              <option value="percent">Percent (%)</option>
            </select>
          </label>
          {discountType !== "none" && (
            <input
              type="number"
              min={0}
              value={discountValue}
              onChange={(e) => applyDiscount(discountType, e.target.value)}
            />
          )}
        </div>

        <dl>
          <dt>Subtotal</dt>
          <dd>LKR {totals.subtotal.toFixed(2)}</dd>
          <dt>Tax</dt>
          <dd>LKR {totals.tax.toFixed(2)}</dd>
          <dt>Discount</dt>
          <dd>LKR {totals.discount.toFixed(2)}</dd>
          <dt>Total</dt>
          <dd>LKR {totals.total.toFixed(2)}</dd>
        </dl>

        {error && <p role="alert">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={lines.length === 0 || checkoutMutation.isPending}
        >
          {checkoutMutation.isPending ? "Processing..." : "Checkout"}
        </button>
      </section>

      {lastSale && (
        <section>
          <h2>Sale complete</h2>
          <p>
            Sale {lastSale.id.slice(0, 8)} — total LKR {lastSale.total.toFixed(2)}
          </p>
        </section>
      )}
    </main>
  );
}
