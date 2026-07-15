import { useState, type KeyboardEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, ShoppingCart, PackageSearch, Search, XCircle } from "lucide-react";
import { computeSaleTotals, type Discount, type Sale } from "@pos/shared";
import { useCartStore } from "../store/cart";
import { fetchProductCategories, fetchProducts } from "../lib/products";
import { checkout } from "../lib/sales";
import { formatLkr, formatQty, unitSuffix } from "../lib/format";
import { Receipt } from "../components/Receipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DiscountType = "none" | "amount" | "percent";

function LineDiscountControl({
  discount,
  onChange,
}: {
  discount: Discount | undefined;
  onChange: (discount: Discount | undefined) => void;
}) {
  const type = discount?.type ?? "none";
  const value = discount?.value ?? 0;

  return (
    <div className="flex flex-col gap-1">
      <Select
        value={type}
        onValueChange={(v) => {
          if (v === "none") {
            onChange(undefined);
            return;
          }
          onChange({ type: v as "amount" | "percent", value } as Discount);
        }}
      >
        <SelectTrigger className="h-7 w-16 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="amount">LKR</SelectItem>
          <SelectItem value="percent">%</SelectItem>
        </SelectContent>
      </Select>
      {type !== "none" && (
        <Input
          type="number"
          min={0}
          value={value}
          autoComplete="off"
          className="h-7 w-16 text-xs"
          onChange={(e) => {
            const numeric = Number(e.target.value);
            if (Number.isNaN(numeric)) return;
            onChange({ type, value: numeric } as Discount);
          }}
        />
      )}
    </div>
  );
}

export default function CashierPosPage() {
  const queryClient = useQueryClient();
  const {
    lines,
    discount,
    addProduct,
    updateQty,
    removeLine,
    setDiscount,
    setLineDiscount,
    clear,
  } = useCartStore();

  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [discountValue, setDiscountValue] = useState("0");
  const [cashTendered, setCashTendered] = useState("");
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "pos", search, categoryFilter],
    queryFn: () =>
      fetchProducts(search || undefined, true, categoryFilter === "all" ? undefined : categoryFilter),
  });

  const { data: categories } = useQuery({
    queryKey: ["productCategories"],
    queryFn: fetchProductCategories,
  });

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: (sale) => {
      setLastSale(sale);
      toast.success(`Sale complete — ${formatLkr(sale.total)}`);
      clear();
      setDiscountType("none");
      setDiscountValue("0");
      setCashTendered("");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: Error) => toast.error(err.message),
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
    lines.map((l) => ({
      unitPriceSnapshot: l.unitPrice,
      qty: l.qty,
      taxRate: l.taxRate,
      discount: l.discount,
    })),
    discount,
  );

  const cashTenderedNumber = Number(cashTendered);
  const hasSufficientCash = cashTendered !== "" && cashTenderedNumber >= totals.total;
  const changeDue = hasSufficientCash ? cashTenderedNumber - totals.total : 0;

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    // Barcode scanners submit with Enter — if the code matches exactly one
    // product, add it straight to the cart instead of requiring a click.
    if (products && products.length === 1) {
      addProduct(products[0]);
      setSearch("");
    }
  }

  function handleCheckout() {
    setLastSale(null);
    checkoutMutation.mutate({
      items: lines.map((l) => ({ productId: l.productId, qty: l.qty, discount: l.discount })),
      discount,
      paymentMethod: "cash",
      cashTendered: cashTenderedNumber,
    });
  }

  function handleCancelSale() {
    clear();
    setDiscountType("none");
    setDiscountValue("0");
    setCashTendered("");
    toast.info("Sale cancelled");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="size-5" /> Products
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
                className="pl-9"
                autoFocus
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading products...</p>
          ) : products && products.length === 0 ? (
            <p className="text-muted-foreground">No products match "{search}".</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {products?.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addProduct(product)}
                  className="flex flex-col items-start gap-1 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/40 active:scale-[0.98]"
                >
                  <span className="font-medium">{product.name}</span>
                  {product.sku && (
                    <span className="text-xs text-muted-foreground">{product.sku}</span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatLkr(product.priceLkr)}
                    {unitSuffix(product.unitType)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" /> Cart
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {lines.length === 0 ? (
            <p className="text-muted-foreground">Cart is empty. Tap a product to add it.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, index) => {
                  const lineTotals = totals.lines[index];
                  return (
                    <TableRow key={line.productId}>
                      <TableCell>
                        <div className="font-medium">{line.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatLkr(line.unitPrice)}
                          {unitSuffix(line.unitType)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={line.unitType === "each" ? 1 : 0.001}
                          step={line.unitType === "each" ? 1 : 0.001}
                          value={line.qty}
                          onChange={(e) => updateQty(line.productId, Number(e.target.value))}
                          autoComplete="off"
                          className="w-16"
                        />
                        {line.unitType !== "each" && (
                          <div className="text-xs text-muted-foreground">
                            {formatQty(line.qty, line.unitType)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <LineDiscountControl
                          discount={line.discount}
                          onChange={(d) => setLineDiscount(line.productId, d)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {lineTotals.lineDiscount > 0 && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatLkr(lineTotals.gross)}
                          </div>
                        )}
                        {formatLkr(lineTotals.net)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeLine(line.productId)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <Separator />

          <div className="flex flex-col gap-2">
            <Label>Discount</Label>
            <div className="flex gap-2">
              <Select
                value={discountType}
                onValueChange={(value) => applyDiscount(value as DiscountType, discountValue)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="amount">Amount (LKR)</SelectItem>
                  <SelectItem value="percent">Percent (%)</SelectItem>
                </SelectContent>
              </Select>
              {discountType !== "none" && (
                <Input
                  type="number"
                  min={0}
                  value={discountValue}
                  onChange={(e) => applyDiscount(discountType, e.target.value)}
                  autoComplete="off"
                />
              )}
            </div>
          </div>

          <Separator />

          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatLkr(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatLkr(totals.tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>-{formatLkr(totals.discount)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatLkr(totals.total)}</dd>
            </div>
          </dl>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label>Payment method</Label>
            <Select value="cash" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Cash tendered</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Change due</span>
            <span className="font-medium">{formatLkr(changeDue)}</span>
          </div>

          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  disabled={lines.length === 0 || checkoutMutation.isPending}
                >
                  <XCircle /> Cancel sale
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this sale?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This clears the cart and any discounts. It cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep cart</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelSale}>Cancel sale</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              size="lg"
              className="flex-1"
              onClick={handleCheckout}
              disabled={lines.length === 0 || !hasSufficientCash || checkoutMutation.isPending}
            >
              {checkoutMutation.isPending ? "Processing..." : "Checkout"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastSale && (
        <Card className="lg:col-span-5">
          <CardContent className="pt-6">
            <Receipt sale={lastSale} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
