// Opens a clean, print-ready result card (report card) in a new window and
// triggers the print dialog (which can also "Save as PDF").
import type { ResultCard, SchoolProfile } from '../types'

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'
  )

export function printResultCard(card: ResultCard, profile: SchoolProfile) {
  const rows = card.subjects
    .map(
      (s) =>
        `<tr><td>${esc(s.subject)}</td><td class="c">${s.total}</td><td class="c">${s.obtained}</td><td class="c">${s.percent}%</td><td class="c">${esc(s.grade)}</td></tr>`
    )
    .join('')

  const logo = profile.logoUrl
    ? `<img src="${profile.logoUrl}" alt="logo" style="width:56px;height:56px;object-fit:contain" />`
    : ''

  const passColor = card.result === 'Pass' ? '#16a34a' : '#dc2626'

  const html = `<!doctype html><html><head><meta charset="utf-8" />
<title>${esc(profile.name)} — Result Card</title>
<style>
  * { box-sizing:border-box; font-family:Arial, sans-serif; }
  body { margin:0; padding:24px; color:#1e293b; }
  .card { max-width:640px; margin:0 auto; border:1px solid #cbd5e1; border-radius:10px; padding:22px; }
  .head { display:flex; gap:12px; align-items:center; border-bottom:2px solid #4f46e5; padding-bottom:12px; }
  .head h1 { margin:0; font-size:22px; color:#4f46e5; }
  .head p { margin:2px 0 0; font-size:12px; color:#64748b; }
  .title { text-align:center; font-weight:bold; margin:14px 0; font-size:16px; letter-spacing:.5px; }
  .meta { display:flex; flex-wrap:wrap; gap:6px 30px; font-size:13px; margin-bottom:12px; }
  .meta b { color:#0f172a; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th,td { border:1px solid #e2e8f0; padding:8px 10px; text-align:left; }
  th { background:#f1f5f9; }
  td.c, th.c { text-align:center; }
  .tot td { font-weight:bold; background:#f8fafc; }
  .summary { display:flex; flex-wrap:wrap; gap:10px 26px; margin-top:14px; font-size:14px; }
  .summary b { color:#0f172a; }
  .res { font-weight:bold; color:${passColor}; }
  .sign { display:flex; justify-content:space-between; margin-top:36px; font-size:12px; color:#64748b; }
  @media print { body { padding:0; } .card { border:none; } }
</style></head>
<body>
  <div class="card">
    <div class="head">
      ${logo}
      <div>
        <h1>${esc(profile.name)}</h1>
        <p>${esc(profile.tagline ?? '')}</p>
        <p>${esc(profile.address ?? '')}${profile.phone ? ' • ' + esc(profile.phone) : ''}</p>
      </div>
    </div>

    <div class="title">RESULT CARD — ${esc(card.examName)}</div>

    <div class="meta">
      <div><b>Name:</b> ${esc(card.name)}</div>
      <div><b>Class:</b> ${esc(card.section.class.name)} — ${esc(card.section.name)}</div>
      <div><b>Roll No:</b> ${card.rollNo}</div>
      <div><b>Father/Guardian:</b> ${esc(card.guardianName ?? '—')}</div>
    </div>

    <table>
      <thead>
        <tr><th>Subject</th><th class="c">Total</th><th class="c">Obtained</th><th class="c">%</th><th class="c">Grade</th></tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="tot"><td>Total</td><td class="c">${card.totalMax}</td><td class="c">${card.totalObtained}</td><td class="c">${card.percent}%</td><td class="c">${esc(card.grade)}</td></tr>
      </tbody>
    </table>

    <div class="summary">
      <span><b>Percentage:</b> ${card.percent}%</span>
      <span><b>Grade:</b> ${esc(card.grade)}</span>
      <span><b>Position:</b> ${card.position || '—'} of ${card.classSize}</span>
      <span class="res"><b>Result:</b> ${esc(card.result)}</span>
    </div>

    <div class="sign">
      <span>Class Teacher: ____________</span>
      <span>Principal: ____________</span>
    </div>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
</body></html>`

  const w = window.open('', '_blank', 'width=720,height=860')
  if (!w) {
    alert('Please allow pop-ups to print the result card.')
    return
  }
  w.document.write(html)
  w.document.close()
}
