import { Printer } from "lucide-react";
import type { Sale } from "@pos/shared";
import { formatColomboDateTime, formatLkr } from "../lib/format";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function Receipt({ sale }: { sale: Sale }) {
  return (
    <div id="receipt" className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="flex size-9 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
          <img src="/logo.png" alt="LankaPOS" className="size-full object-contain" />
        </span>
        <span className="font-semibold">LankaPOS</span>
        <span className="text-xs text-muted-foreground">Sale #{sale.id}</span>
        <span className="text-xs text-muted-foreground">{formatColomboDateTime(sale.createdAt)}</span>
        <span className="text-xs text-muted-foreground">Cashier: {sale.cashierName}</span>
      </div>

      <Separator className="border-dashed" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sale.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.nameSnapshot}</TableCell>
              <TableCell className="text-right">{item.qty}</TableCell>
              <TableCell className="text-right">{formatLkr(item.unitPriceSnapshot)}</TableCell>
              <TableCell className="text-right">{formatLkr(item.lineTotal)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Separator className="border-dashed" />

      <dl className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatLkr(sale.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd>{formatLkr(sale.tax)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Discount</dt>
          <dd>-{formatLkr(sale.discount)}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatLkr(sale.total)}</dd>
        </div>
        <Separator className="my-1 border-dashed" />
        <div className="flex justify-between">
          <dt className="text-muted-foreground capitalize">{sale.paymentMethod} tendered</dt>
          <dd>{formatLkr(sale.cashTendered)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Change</dt>
          <dd>{formatLkr(sale.change)}</dd>
        </div>
      </dl>

      <Button className="no-print" variant="outline" onClick={() => window.print()}>
        <Printer /> Print receipt
      </Button>
    </div>
  );
}
