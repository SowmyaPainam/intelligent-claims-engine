const fs = require('fs');

const contentLines = [
  'BT',
  '/F1 16 Tf',
  '72 740 Td (INVOICE) Tj',
  '/F1 10 Tf',
  '0 -30 Td (Invoice Number: INV-2026-00457) Tj',
  '0 -15 Td (Invoice Date: 10/05/2026) Tj',
  '0 -30 Td (Bill To: John Doe) Tj',
  '0 -15 Td (Customer Email: john.doe@example.com) Tj',
  '0 -30 Td (Vendor: TechFix Electronics Pvt Ltd) Tj',
  '0 -30 Td (Description: Laptop Screen Replacement - Water Damage Repair) Tj',
  '0 -15 Td (Product: LAPTOP-001) Tj',
  '0 -30 Td (Subtotal: INR 24,000.00) Tj',
  '0 -15 Td (Tax: INR 1,000.00) Tj',
  '0 -15 Td (Total Amount Due: INR 25,000.00) Tj',
  'ET'
].join('\n');

const streamLength = Buffer.byteLength(contentLines, 'utf8');

const objects = [];
objects.push('<< /Type /Catalog /Pages 2 0 R >>');
objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>');
objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
objects.push(`<< /Length ${streamLength} >>\nstream\n${contentLines}\nendstream`);

let pdf = '%PDF-1.4\n';
const offsets = [0];

objects.forEach((body, idx) => {
  const objNum = idx + 1;
  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += `${objNum} 0 obj\n${body}\nendobj\n`;
});

const xrefOffset = Buffer.byteLength(pdf, 'utf8');
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';
for (let i = 1; i <= objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

fs.writeFileSync('sample-invoice-v2.pdf', pdf, 'binary');
console.log('Wrote sample-invoice-v2.pdf, stream length:', streamLength);