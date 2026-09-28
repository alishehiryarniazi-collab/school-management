// Opens a clean, print-ready fee challan/receipt in a new window and triggers
// the browser's print dialog. Kept as plain HTML so the printout has its own
// isolated, professional layout (school header + logo).
import type { Challan, SchoolProfile } from '../types'

function rs(n: number) {
  return 'Rs. ' + Math.round(n).toLocaleString('en-PK')
}
function fmtDate(iso?: string | null) {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—'
}
const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'
  )

export function printChallan(challan: Challan, profile: SchoolProfile) {
  const s = challan.student
  const remaining = challan.total - challan.paidAmount
  const isPaid = challan.status === 'paid'

  const rows = challan.items
    .map(
      (i) =>
        `<tr><td>${esc(i.label)}</td><td class="r">${rs(i.amount)}</td></tr>`
    )
    .join('')

  const logo = profile.logoUrl
    ? `<img src="${profile.logoUrl}" alt="logo" style="width:56px;height:56px;object-fit:contain" />`
    : ''

  const html = `<!doctype html><html><head><meta charset="utf-8" />
<title>${esc(profile.name)} — Fee Challan</title>
<style>
  * { box-sizing: border-box; font-family: Arial, sans-serif; }
  body { margin: 0; padding: 24px; color: #1e293b; }
  .voucher { max-width: 520px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; }
  .head { display:flex; gap:12px; align-items:center; border-bottom:2px solid #4f46e5; padding-bottom:12px; }
  .head h1 { margin:0; font-size:20px; color:#4f46e5; }
  .head p { margin:2px 0 0; font-size:12px; color:#64748b; }
  .title { text-align:center; font-weight:bold; margin:14px 0 6px; font-size:15px; }
  .meta { display:flex; flex-wrap:wrap; gap:6px 24px; font-size:13px; margin-bottom:10px; }
  .meta div { min-width:45%; }
  .meta b { color:#0f172a; }
  table { width:100%; border-collapse:collapse; margin-top:8px; font-size:13px; }
  th,td { border:1px solid #e2e8f0; padding:7px 10px; text-align:left; }
  th { background:#f1f5f9; }
  td.r, th.r { text-align:right; }
  .tot td { font-weight:bold; background:#f8fafc; }
  .status { display:inline-block; padding:2px 10px; border-radius:999px; font-size:12px; font-weight:bold; }
  .paid { background:#dcfce7; color:#16a34a; }
  .due { background:#fee2e2; color:#dc2626; }
  .foot { display:flex; justify-content:space-between; margin-top:26px; font-size:12px; color:#64748b; }
  @media print { body { padding: 0; } .voucher { border:none; } }
</style></head>
<body>
  <div class="voucher">
    <div class="head">
      ${logo}
      <div>
        <h1>${esc(profile.name)}</h1>
        <p>${esc(profile.tagline ?? '')}</p>
        <p>${esc(profile.address ?? '')}${profile.phone ? ' • ' + esc(profile.phone) : ''}</p>
      </div>
    </div>

    <div class="title">FEE ${isPaid ? 'RECEIPT' : 'CHALLAN'} — ${esc(challan.title)}</div>

    <div class="meta">
      <div><b>Student:</b> ${esc(s?.user.fullName ?? '')}</div>
      <div><b>Class:</b> ${esc(s?.section.class.name ?? '')} — ${esc(s?.section.name ?? '')}</div>
      <div><b>Roll No:</b> ${s?.rollNo ?? ''}</div>
      <div><b>Issue Date:</b> ${fmtDate(challan.issueDate)}</div>
      <div><b>Due Date:</b> ${fmtDate(challan.dueDate)}</div>
      ${challan.receiptNo ? `<div><b>Receipt #:</b> ${esc(challan.receiptNo)}</div>` : ''}
    </div>

    <table>
      <thead><tr><th>Description</th><th class="r">Amount</th></tr></thead>
      <tbody>
        ${rows}
        ${challan.fine ? `<tr><td>Fine</td><td class="r">${rs(challan.fine)}</td></tr>` : ''}
        ${challan.discount ? `<tr><td>Discount</td><td class="r">- ${rs(challan.discount)}</td></tr>` : ''}
        <tr class="tot"><td>Total Payable</td><td class="r">${rs(challan.total)}</td></tr>
        <tr><td>Paid</td><td class="r">${rs(challan.paidAmount)}</td></tr>
        <tr class="tot"><td>Balance Due</td><td class="r">${rs(remaining)}</td></tr>
      </tbody>
    </table>

    <div style="margin-top:10px">
      Status:
      <span class="status ${isPaid ? 'paid' : 'due'}">${isPaid ? 'PAID' : challan.status === 'partial' ? 'PARTIAL' : 'UNPAID'}</span>
    </div>

    <div class="foot">
      <span>Computer generated ${isPaid ? 'receipt' : 'challan'}.</span>
      <span>Signature: ____________</span>
    </div>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
</body></html>`

  const w = window.open('', '_blank', 'width=640,height=800')
  if (!w) {
    alert('Please allow pop-ups to print the challan.')
    return
  }
  w.document.write(html)
  w.document.close()
}
