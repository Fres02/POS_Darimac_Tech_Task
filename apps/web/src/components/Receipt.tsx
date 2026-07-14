import type { Sale } from "@pos/shared";
import { formatColomboDateTime, formatLkr } from "../lib/format";

export function Receipt({ sale, cashierName }: { sale: Sale; cashierName: string }) {
  return (
    <div id="receipt">
      <h2>Receipt</h2>
      <p>Sale #{sale.id}</p>
      <p>{formatColomboDateTime(sale.createdAt)}</p>
      <p>Cashier: {cashierName}</p>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit price</th>
            <th>Line total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id}>
              <td>{item.nameSnapshot}</td>
              <td>{item.qty}</td>
              <td>{formatLkr(item.unitPriceSnapshot)}</td>
              <td>{formatLkr(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl>
        <dt>Subtotal</dt>
        <dd>{formatLkr(sale.subtotal)}</dd>
        <dt>Tax</dt>
        <dd>{formatLkr(sale.tax)}</dd>
        <dt>Discount</dt>
        <dd>{formatLkr(sale.discount)}</dd>
        <dt>Total</dt>
        <dd>{formatLkr(sale.total)}</dd>
        <dt>Payment method</dt>
        <dd>{sale.paymentMethod}</dd>
        <dt>Cash tendered</dt>
        <dd>{formatLkr(sale.cashTendered)}</dd>
        <dt>Change</dt>
        <dd>{formatLkr(sale.change)}</dd>
      </dl>

      <button className="no-print" onClick={() => window.print()}>
        Print receipt
      </button>
    </div>
  );
}
