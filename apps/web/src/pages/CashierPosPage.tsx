import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { computeSaleTotals, type Discount, type Sale } from "@pos/shared";
import { useAuth } from "../context/AuthContext";
import { useCartStore } from "../store/cart";
import { fetchProducts } from "../lib/products";
import { checkout } from "../lib/sales";
import { formatLkr } from "../lib/format";
import { Receipt } from "../components/Receipt";

type DiscountType = "none" | "amount" | "percent";

export default function CashierPosPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { lines, discount, addProduct, updateQty, removeLine, setDiscount, clear } =
    useCartStore();

  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [discountValue, setDiscountValue] = useState("0");
  const [cashTendered, setCashTendered] = useState("");
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
      setCashTendered("");
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

  const cashTenderedNumber = Number(cashTendered);
  const hasSufficientCash = cashTendered !== "" && cashTenderedNumber >= totals.total;
  const changeDue = hasSufficientCash ? cashTenderedNumber - totals.total : 0;

  function handleCheckout() {
    setLastSale(null);
    checkoutMutation.mutate({
      items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
      discount,
      paymentMethod: "cash",
      cashTendered: cashTenderedNumber,
    });
  }

  return (
    <main>
      <h1>POS</h1>
      <p>
        Welcome, {user?.fullName}. <Link to="/sales">My sales</Link>{" "}
        <button onClick={logout}>Log out</button>
      </p>

      <section>
        <h2>Products</h2>
        {isLoading ? (
          <p>Loading products...</p>
        ) : (
          <div>
            {products?.map((product) => (
              <button key={product.id} onClick={() => addProduct(product)}>
                {product.name} — {formatLkr(product.priceLkr)}
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
                  <td>{formatLkr(line.unitPrice)}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) => updateQty(line.productId, Number(e.target.value))}
                    />
                  </td>
                  <td>{formatLkr(line.unitPrice * line.qty)}</td>
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
          <dd>{formatLkr(totals.subtotal)}</dd>
          <dt>Tax</dt>
          <dd>{formatLkr(totals.tax)}</dd>
          <dt>Discount</dt>
          <dd>{formatLkr(totals.discount)}</dd>
          <dt>Total</dt>
          <dd>{formatLkr(totals.total)}</dd>
        </dl>

        <div>
          <label>
            Payment method:
            <select value="cash" disabled>
              <option value="cash">Cash</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Cash tendered:
            <input
              type="number"
              min={0}
              step="0.01"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
            />
          </label>
        </div>
        <p>Change due: {formatLkr(changeDue)}</p>

        {error && <p role="alert">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={lines.length === 0 || !hasSufficientCash || checkoutMutation.isPending}
        >
          {checkoutMutation.isPending ? "Processing..." : "Checkout"}
        </button>
      </section>

      {lastSale && <Receipt sale={lastSale} />}
    </main>
  );
}
