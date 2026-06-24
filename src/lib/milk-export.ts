import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getMonthData, formatDateHindi } from "./milk-storage";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function exportMonthExcel(year: number, month0: number) {
  const { rows, totalQty, totalAmount, daysCount, rate } = getMonthData(year, month0);
  const data = rows.map((r) => ({
    Date: r.date,
    "Quantity (L)": r.qty,
    "Rate (Rs/L)": rate,
    "Amount (Rs)": r.amount,
  }));
  data.push(
    { Date: "", "Quantity (L)": "" as never, "Rate (Rs/L)": "" as never, "Amount (Rs)": "" as never },
    { Date: "Days milk taken", "Quantity (L)": daysCount as never, "Rate (Rs/L)": "" as never, "Amount (Rs)": "" as never },
    { Date: "Total Quantity (L)", "Quantity (L)": totalQty as never, "Rate (Rs/L)": "" as never, "Amount (Rs)": "" as never },
    { Date: "Total Amount (Rs)", "Quantity (L)": "" as never, "Rate (Rs/L)": "" as never, "Amount (Rs)": totalAmount as never },
  );
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${MONTH_NAMES[month0]} ${year}`);
  XLSX.writeFile(wb, `milk-${year}-${String(month0 + 1).padStart(2, "0")}.xlsx`);
}

export function exportMonthPDF(year: number, month0: number) {
  const { rows, totalQty, totalAmount, daysCount, rate } = getMonthData(year, month0);
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Milk Record - ${MONTH_NAMES[month0]} ${year}`, 14, 18);
  doc.setFontSize(10);
  doc.text(`Rate: Rs. ${rate} / Litre`, 14, 26);

  autoTable(doc, {
    startY: 32,
    head: [["Date", "Quantity (L)", "Amount (Rs)"]],
    body: rows.map((r) => [formatDateAscii(r.date), r.qty.toString(), r.amount.toFixed(2)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [14, 165, 233] },
    foot: [
      ["Days milk taken", `${daysCount}`, ""],
      ["Total Quantity", `${totalQty} L`, ""],
      ["Total Amount", "", `Rs. ${totalAmount.toFixed(2)}`],
    ],
    footStyles: { fillColor: [240, 249, 255], textColor: 20, fontStyle: "bold" },
  });

  doc.save(`milk-${year}-${String(month0 + 1).padStart(2, "0")}.pdf`);
}

function formatDateAscii(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${String(d).padStart(2, "0")}-${MONTH_NAMES[m - 1].slice(0, 3)}-${y}`;
}

// Re-export for component usage
export { formatDateHindi };
