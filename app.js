const starterHoldings = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', quantity: 18, costBasis: 164.21, price: 336.13, day: -0.26, color: '#d86b5b' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'Crypto', quantity: .42, costBasis: 38200, price: 80358, day: -1.09, color: '#c98952' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'Stock', quantity: 11, costBasis: 312.80, price: 493.78, day: -0.80, color: '#7da398' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market', type: 'ETF', quantity: 24, costBasis: 218.43, price: 375.43, day: .02, color: '#718f98' },
  { symbol: 'ETH', name: 'Ethereum', type: 'Crypto', quantity: 2.8, costBasis: 1840, price: 2574.40, day: -2.57, color: '#9791b7' },
];
let holdings = JSON.parse(localStorage.getItem('northstar-holdings') || 'null') || starterHoldings;
let lastSync = new Date();
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });
const totalValue = () => holdings.reduce((sum, h) => sum + h.quantity * h.price, 0);
const invested = () => holdings.reduce((sum, h) => sum + h.quantity * h.costBasis, 0);
const returnValue = h => h.quantity * (h.price - h.costBasis);
const esc = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
function formatChange(value) { return `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(2)}%`; }
function save() { localStorage.setItem('northstar-holdings', JSON.stringify(holdings)); }
function typeColor(type) { return ({ Stock:'#173941', ETF:'#618f87', Crypto:'#cc8854', Metal:'#b9a16d', Cash:'#8298a0' })[type] || '#173941'; }
function renderDashboard() {
  const total = totalValue(), cost = invested(), gain = total - cost;
  const daily = holdings.reduce((sum, h) => sum + h.quantity * h.price * (h.day / 100), 0);
  document.querySelector('#portfolioValue').textContent = compact.format(total);
  document.querySelector('#movementBadge').textContent = `${daily >= 0 ? '↗' : '↘'} ${money.format(Math.abs(daily))}`;
  document.querySelector('#movementBadge').className = `movement-badge ${daily >= 0 ? 'positive' : 'negative'}`;
  document.querySelector('#totalReturn').textContent = `${gain >= 0 ? '+' : '−'}${money.format(Math.abs(gain))}`;
  document.querySelector('#returnPercent').textContent = `(${gain >= 0 ? '+' : '−'}${Math.abs(gain / cost * 100 || 0).toFixed(2)}%)`;
  document.querySelector('#todayMovement').textContent = `${daily >= 0 ? '+' : '−'}${money.format(Math.abs(daily))}`;
  document.querySelector('#todayMovement').className = daily >= 0 ? 'positive' : 'negative';
  document.querySelector('#todayPercent').textContent = `${daily >= 0 ? '+' : '−'}${Math.abs(daily / (total - daily) * 100 || 0).toFixed(2)}% vs yesterday`;
  document.querySelector('#investedValue').textContent = compact.format(cost);
  document.querySelector('#positionCount').textContent = holdings.length;
  document.querySelector('#trackedCount').textContent = `${holdings.length} tracked`;
  document.querySelector('#syncedAt').textContent = `Last synced ${lastSync.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  renderAllocation(total); renderMovers(); renderRows();
}
function renderAllocation(total) {
  const groups = ['Stock', 'ETF', 'Crypto', 'Metal', 'Cash'].map(type => ({ type, value: holdings.filter(h => h.type === type).reduce((sum,h) => sum + h.quantity * h.price, 0) })).filter(group => group.value);
  const colors = groups.map(g => `${typeColor(g.type)} ${((groups.slice(0, groups.indexOf(g)).reduce((a,b)=>a+b.value,0)/total)*100).toFixed(1)}% ${((groups.slice(0, groups.indexOf(g)+1).reduce((a,b)=>a+b.value,0)/total)*100).toFixed(1)}%`);
  document.querySelector('#donut').style.background = `conic-gradient(${colors.join(',')})`;
  document.querySelector('#allocationLegend').innerHTML = groups.map(g => `<div class="allocation-row"><i style="background:${typeColor(g.type)}"></i><b>${g.type === 'ETF' ? 'Funds' : g.type + 's'}</b><div><b>${Math.round(g.value / total * 100)}%</b><small>${compact.format(g.value)}</small></div></div>`).join('');
}
function renderMovers() {
  document.querySelector('#movers').innerHTML = [...holdings].sort((a,b)=>Math.abs(b.day)-Math.abs(a.day)).slice(0,4).map(h => `<div class="mover"><span class="ticker-badge">${esc(h.symbol[0])}</span><div><b>${esc(h.symbol)}</b><small>${esc(h.name)}</small></div><div class="quote">${money.format(h.price)}<span class="${h.day >= 0 ? 'positive':'negative'}">${formatChange(h.day)}</span></div></div>`).join('') || '<p class="empty">Add a holding to see market pulse.</p>';
}
function renderRows() {
  const query = document.querySelector('#searchInput').value.toLowerCase();
  const filtered = holdings.filter(h => `${h.symbol} ${h.name} ${h.type}`.toLowerCase().includes(query));
  document.querySelector('#holdingRows').innerHTML = filtered.map((h, i) => { const value = h.quantity*h.price, gain=returnValue(h), rate=(gain/(h.quantity*h.costBasis)*100); return `<div class="holding-row"><div class="asset-cell"><span class="asset-icon" style="background:${h.color || typeColor(h.type)}">${esc(h.symbol[0])}</span><div><b>${esc(h.symbol)}</b><span class="type-tag">${esc(h.type)}</span><small>${esc(h.name)}</small></div></div><span class="mono">${money.format(h.price)}</span><span class="mono ${h.day >= 0 ? 'positive':'negative'}">${formatChange(h.day)}</span><span class="mono">${number.format(h.quantity)}<small style="color:var(--muted);display:block;font-size:9px">at ${money.format(h.costBasis)}</small></span><b class="mono">${money.format(value)}</b><span class="return-value ${gain >= 0 ? 'positive':'negative'}"><b>${gain >= 0 ? '+' : '−'}${money.format(Math.abs(gain))}</b><small>${gain >= 0 ? '+' : '−'}${Math.abs(rate).toFixed(2)}%</small></span><button class="row-menu" data-symbol="${esc(h.symbol)}" title="Delete ${esc(h.symbol)}">…</button></div>`; }).join('') || '<div class="holding-row"><div class="asset-cell"><small>No holdings match your search.</small></div></div>';
  document.querySelectorAll('.row-menu').forEach(button => button.addEventListener('click', () => { const symbol = button.dataset.symbol; if (confirm(`Remove ${symbol} from your tracker?`)) { holdings = holdings.filter(h => h.symbol !== symbol); save(); renderDashboard(); } }));
}
document.querySelector('#searchInput').addEventListener('input', renderRows);
document.querySelector('#refreshButton').addEventListener('click', () => { holdings = holdings.map(h => ({...h, price: +(h.price * (1 + ((Math.random()-.5)*.018))).toFixed(2), day: +(h.day + (Math.random()-.5)*.8).toFixed(2) })); lastSync = new Date(); save(); document.querySelector('#statusText').textContent = 'Updated locally'; renderDashboard(); });
const sheet = document.querySelector('#holdingSheet');
const holdingForm = document.querySelector('#holdingForm');
const openSheet = () => { sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); setTimeout(() => holdingForm.elements.symbol.focus(), 220); };
const closeSheet = () => { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); };
const updateDraft = () => { const quantity = +holdingForm.elements.quantity.value || 0; const price = +holdingForm.elements.price.value || 0; const cost = +holdingForm.elements.costBasis.value || 0; const value = quantity * price; const gain = quantity * (price - cost); const returnEl = document.querySelector('#draftReturn'); document.querySelector('#draftValue').textContent = money.format(value); returnEl.textContent = quantity ? `${gain >= 0 ? '+' : '−'}${money.format(Math.abs(gain))}` : '—'; returnEl.className = quantity ? (gain >= 0 ? 'positive' : 'negative') : ''; };
document.querySelector('#addButton').addEventListener('click', openSheet);
document.querySelectorAll('[data-close-sheet]').forEach(button => button.addEventListener('click', closeSheet));
document.querySelectorAll('.asset-type').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.asset-type').forEach(option => option.classList.remove('selected')); button.classList.add('selected'); holdingForm.elements.type.value = button.dataset.type; }));
['quantity', 'costBasis', 'price'].forEach(name => holdingForm.elements[name].addEventListener('input', updateDraft));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && sheet.classList.contains('open')) closeSheet(); });
holdingForm.addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(holdingForm)); const symbol = data.symbol.toUpperCase().trim(); if (holdings.some(h => h.symbol === symbol)) return alert('That symbol is already in your tracker.'); holdings.push({ symbol, name:data.name.trim(), type:data.type, quantity:+data.quantity, costBasis:+data.costBasis, price:+data.price, day:0, color:typeColor(data.type) }); lastSync=new Date(); save(); holdingForm.reset(); document.querySelectorAll('.asset-type').forEach(option => option.classList.toggle('selected', option.dataset.type === 'Stock')); holdingForm.elements.type.value = 'Stock'; updateDraft(); closeSheet(); renderDashboard(); });
document.querySelector('#exportButton').addEventListener('click', () => { const headers=['Symbol','Name','Type','Quantity','Average Cost','Price','Day Change %','Value','Return']; const rows=holdings.map(h=>[h.symbol,h.name,h.type,h.quantity,h.costBasis,h.price,h.day,h.quantity*h.price,returnValue(h)]); const csv=[headers,...rows].map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(',')).join('\n'); const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); const a=Object.assign(document.createElement('a'),{href:url,download:'northstar-holdings.csv'}); a.click(); URL.revokeObjectURL(url); });
document.querySelector('#dateLine').textContent = new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date());
renderDashboard();
