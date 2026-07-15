import type { CSSProperties } from "react";
import type { DailyReportTotals } from "@pos/shared";

const currencyFormatter = new Intl.NumberFormat("si-LK", { style: "currency", currency: "LKR" });
function money(amount: number): string {
  return currencyFormatter.format(amount);
}

const th: CSSProperties = {
  textAlign: "left",
  padding: "6px 10px",
  borderBottom: "2px solid #333",
  fontSize: 13,
};
const td: CSSProperties = {
  padding: "6px 10px",
  borderBottom: "1px solid #ddd",
  fontSize: 13,
};

export function DailyReportEmail({
  reportDate,
  totals,
}: {
  reportDate: string;
  totals: DailyReportTotals;
}) {
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", color: "#111", margin: 0, padding: 24 }}>
        <h1 style={{ fontSize: 20 }}>Daily Sales Report — {reportDate}</h1>

        <table style={{ marginBottom: 24 }}>
          <tbody>
            <tr>
              <td style={{ padding: "4px 12px 4px 0", fontWeight: "bold" }}>Total revenue</td>
              <td>{money(totals.totalRevenue)}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px 12px 4px 0", fontWeight: "bold" }}>Transactions</td>
              <td>{totals.transactionCount}</td>
            </tr>
          </tbody>
        </table>

        <h2 style={{ fontSize: 16 }}>Per-cashier breakdown</h2>
        <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: 24 }}>
          <thead>
            <tr>
              <th style={th}>Cashier</th>
              <th style={th}>Transactions</th>
              <th style={th}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {totals.perCashier.length === 0 ? (
              <tr>
                <td style={td} colSpan={3}>
                  No sales recorded.
                </td>
              </tr>
            ) : (
              totals.perCashier.map((row) => (
                <tr key={row.cashierId}>
                  <td style={td}>{row.cashierName}</td>
                  <td style={td}>{row.transactionCount}</td>
                  <td style={td}>{money(row.revenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <h2 style={{ fontSize: 16 }}>Top items</h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={th}>Item</th>
              <th style={th}>Qty sold</th>
              <th style={th}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {totals.topItems.length === 0 ? (
              <tr>
                <td style={td} colSpan={3}>
                  No sales recorded.
                </td>
              </tr>
            ) : (
              totals.topItems.map((row) => (
                <tr key={row.productId}>
                  <td style={td}>{row.name}</td>
                  <td style={td}>{row.qtySold}</td>
                  <td style={td}>{money(row.revenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </body>
    </html>
  );
}
