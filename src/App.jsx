import { useMemo, useState, useCallback } from “react”;
import Papa from “papaparse”;

const INITIAL_ASSETS = [
{ id: 1, name: “SOLANA”, ticker: “SOL”, objective: “X10”, color: “#14F195”, investPerMonth: {} },
{ id: 2, name: “ETHEREUM”, ticker: “ETH”, objective: “X4”, color: “#627EEA”, investPerMonth: {} },
{ id: 3, name: “BITCOIN”, ticker: “BTC”, objective: “X2”, color: “#F7931A”, investPerMonth: {} },
{ id: 4, name: “XRP”, ticker: “XRP”, color: “#23292F”, investPerMonth: {} },
{ id: 5, name: “DOGECOIN”, ticker: “DOGE”, color: “#C2A633”, investPerMonth: {} },
{ id: 6, name: “SHIBA INU”, ticker: “SHIB”, color: “#E3420A”, investPerMonth: {} },
{ id: 7, name: “PEPE”, ticker: “PEPE”, color: “#4D8C3B”, investPerMonth: {} },
{ id: 8, name: “SUI”, ticker: “SUI”, color: “#4DA2FF”, investPerMonth: {} },
{ id: 9, name: “CARDANO”, ticker: “ADA”, color: “#0033AD”, investPerMonth: {} },
{ id: 10, name: “CENTRIFUGE”, ticker: “CFG”, color: “#FFC012”, investPerMonth: {} },
{ id: 11, name: “CHAINLINK”, ticker: “LINK”, color: “#2A5ADA”, investPerMonth: {} },
{ id: 12, name: “POLKADOT”, ticker: “DOT”, color: “#E6007A”, investPerMonth: {} },
{ id: 13, name: “BNB”, ticker: “BNB”, color: “#F3BA2F”, investPerMonth: {} },
];

const MONTHS = [“JAN”, “FÉV”, “MARS”, “AVR”, “MAI”, “JUIN”, “JUIL”, “AOÛT”, “SEPT”, “OCT”, “NOV”, “DÉC”];

const FULL_MONTHS = [
“JANVIER”, “FÉVRIER”, “MARS”, “AVRIL”, “MAI”, “JUIN”,
“JUILLET”, “AOÛT”, “SEPTEMBRE”, “OCTOBRE”, “NOVEMBRE”, “DÉCEMBRE”,
];

const formatEUR = (val) => {
if (val === null || val === undefined || val === “”) return “—”;
const n = parseFloat(val);
if (Number.isNaN(n)) return “—”;
return new Intl.NumberFormat(“fr-FR”, { style: “currency”, currency: “EUR”, minimumFractionDigits: 2 }).format(n);
};

function toNumber(val) {
if (val == null) return 0;
const s = String(val).trim().replace(/\s/g, “”).replace(”,”, “.”);
const n = parseFloat(s);
return Number.isNaN(n) ? 0 : n;
}

function normalizeMonth(value) {
if (value == null) return null;
const v = String(value).trim().toUpperCase();
const n = parseInt(v, 10);
if (!Number.isNaN(n) && n >= 0 && n <= 11) return n;
if (!Number.isNaN(n) && n >= 1 && n <= 12) return n - 1;
const map = {
JAN: 0, JANVIER: 0, FEV: 1, “FÉV”: 1, FEVRIER: 1, “FÉVRIER”: 1,
MAR: 2, MARS: 2, AVR: 3, AVRIL: 3, MAI: 4, JUN: 5, JUIN: 5,
JUL: 6, JUIL: 6, JUILLET: 6, AOU: 7, “AOÛ”: 7, AOUT: 7, “AOÛT”: 7,
SEP: 8, SEPT: 8, SEPTEMBRE: 8, OCT: 9, OCTOBRE: 9,
NOV: 10, NOVEMBRE: 10, DEC: 11, “DÉC”: 11, DECEMBRE: 11, “DÉCEMBRE”: 11,
};
return map[v] ?? null;
}

function makeEntryId() {
return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// ✅ FIX : CSV import AJOUTE aux entrées existantes au lieu de les REMPLACER
function importCsvFile(file, assets, setEntries) {
return new Promise((resolve, reject) => {
Papa.parse(file, {
header: true,
skipEmptyLines: true,
complete: (results) => {
try {
const rows = results.data;
const get = (r, keys) => {
for (const k of keys) {
if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== “”) return r[k];
}
return “”;
};
const entriesFromFile = rows
.map((r) => {
const ticker = String(get(r, [“Ticker”, “ticker”, “TICKER”])).trim().toUpperCase();
const name = String(get(r, [“Actif”, “Nom”, “name”, “NAME”])).trim().toUpperCase();
const asset = assets.find((a) => a.ticker.toUpperCase() === ticker || a.name.toUpperCase() === name);
if (!asset) return null;
const month = normalizeMonth(get(r, [“Mois”, “mois”, “Month”, “month”]));
const year = parseInt(get(r, [“Année”, “Annee”, “Year”, “year”]), 10);
if (month === null || Number.isNaN(year)) return null;
return {
id: makeEntryId(),
assetId: asset.id,
month, year,
investment: toNumber(get(r, [“Investissement”, “Montant”, “investment”])),
buyPrice: toNumber(get(r, [“PrixAchat”, “Prix d’achat”, “buyPrice”])),
quantity: toNumber(get(r, [“Quantité”, “Quantite”, “quantity”])),
stopLoss: toNumber(get(r, [“StopLoss”, “Stop-Loss”, “stopLoss”])),
takeProfit: toNumber(get(r, [“TakeProfit”, “Take-Profit”, “takeProfit”])),
};
})
.filter(Boolean);

```
      // ✅ FIX PRINCIPAL : on AJOUTE au lieu de REMPLACER
      setEntries((prev) => [...prev, ...entriesFromFile]);

      resolve({ imported: entriesFromFile.length, totalRows: rows.length });
    } catch (e) { reject(e); }
  },
  error: (err) => reject(err),
});
```

});
}

// ==================== ICONS ====================
const PlusIcon = () => (
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
<line x1="8" y1="2" x2="8" y2="14" /><line x1="2" y1="8" x2="14" y2="8" />
</svg>
);
const TrashIcon = () => (
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
</svg>
);
const ChevronIcon = ({ dir }) => (
<svg width=“16” height=“16” viewBox=“0 0 16 16” fill=“none” stroke=“currentColor” strokeWidth=“2” style={{ transform: dir === “left” ? “rotate(180deg)” : “none” }}>
<polyline points="6 3 11 8 6 13" />
</svg>
);
const ChartIcon = () => (
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
</svg>
);
const WalletIcon = () => (
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
<path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" /><path d="M18 12a2 2 0 100 4h4v-4h-4z" />
</svg>
);

// ==================== MODAL ====================
function Modal({ isOpen, onClose, title, children }) {
if (!isOpen) return null;
return (
<div style={{ position: “fixed”, inset: 0, zIndex: 1000, display: “flex”, alignItems: “center”, justifyContent: “center” }}>
<div onClick={onClose} style={{ position: “absolute”, inset: 0, background: “rgba(0,0,0,0.7)”, backdropFilter: “blur(8px)” }} />
<div style={{
position: “relative”, zIndex: 1, background: “#1a1a2e”, border: “1px solid rgba(255,255,255,0.1)”,
borderRadius: 16, padding: 28, minWidth: 380, maxWidth: 520,
boxShadow: “0 24px 80px rgba(0,0,0,0.5)”, animation: “modalIn 0.25s ease”,
}}>
<h3 style={{ fontFamily: “‘Bebas Neue’, sans-serif”, fontSize: 22, color: “#fff”, letterSpacing: 2, marginBottom: 20 }}>{title}</h3>
{children}
</div>
</div>
);
}

// ==================== ADD INVESTMENT MODAL ====================
// ✅ FIX : Ajout d’un champ ANNÉE modifiable (au lieu de forcer l’année affichée)
function AddInvestmentModal({ isOpen, onClose, assets, year, onAdd }) {
const [assetId, setAssetId] = useState(””);
const [month, setMonth] = useState(new Date().getMonth());
const [entryYear, setEntryYear] = useState(year);
const [investment, setInvestment] = useState(””);
const [buyPrice, setBuyPrice] = useState(””);
const [quantity, setQuantity] = useState(””);
const [stopLoss, setStopLoss] = useState(””);
const [takeProfit, setTakeProfit] = useState(””);

// ✅ Sync l’année quand le modal s’ouvre ou que l’année du dashboard change
const prevYearRef = useState(year)[0];
if (isOpen && entryYear !== year && prevYearRef !== year) {
setEntryYear(year);
}

const resetForm = () => {
setAssetId(””); setInvestment(””); setBuyPrice(””);
setQuantity(””); setStopLoss(””); setTakeProfit(””);
};

const handleSubmit = () => {
if (!assetId || !investment) return;
onAdd({
id: makeEntryId(),
assetId: parseInt(assetId, 10),
month,
year: entryYear, // ✅ Utilise l’année du formulaire, pas celle du dashboard
investment: parseFloat(investment) || 0,
buyPrice: parseFloat(buyPrice) || 0,
quantity: parseFloat(quantity) || 0,
stopLoss: parseFloat(stopLoss) || 0,
takeProfit: parseFloat(takeProfit) || 0,
});
resetForm();
onClose();
};

const inputStyle = {
width: “100%”, padding: “10px 14px”, background: “rgba(255,255,255,0.06)”,
border: “1px solid rgba(255,255,255,0.12)”, borderRadius: 8, color: “#fff”,
fontSize: 14, fontFamily: “‘DM Sans’, sans-serif”, outline: “none”,
transition: “border 0.2s”, boxSizing: “border-box”,
};
const labelStyle = {
display: “block”, fontSize: 11, fontWeight: 600, color: “rgba(255,255,255,0.5)”,
letterSpacing: 1.5, textTransform: “uppercase”, marginBottom: 6, fontFamily: “‘DM Sans’, sans-serif”,
};

return (
<Modal isOpen={isOpen} onClose={onClose} title="NOUVEL INVESTISSEMENT">
<div style={{ display: “grid”, gap: 14 }}>
{/* ✅ Ligne 1 : Actif + Mois + Année */}
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr 1fr”, gap: 12 }}>
<div>
<label style={labelStyle}>Actif</label>
<select value={assetId} onChange={(e) => setAssetId(e.target.value)} style={{ …inputStyle, cursor: “pointer”, appearance: “auto” }}>
<option value="">Choisir…</option>
{assets.map((a) => <option key={a.id} value={a.id} style={{ background: “#1a1a2e” }}>{a.name} ({a.ticker})</option>)}
</select>
</div>
<div>
<label style={labelStyle}>Mois</label>
<select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))} style={{ …inputStyle, cursor: “pointer”, appearance: “auto” }}>
{MONTHS.map((m, i) => <option key={i} value={i} style={{ background: “#1a1a2e” }}>{m}</option>)}
</select>
</div>
<div>
<label style={labelStyle}>Année</label>
<input type=“number” value={entryYear} onChange={(e) => setEntryYear(parseInt(e.target.value, 10) || year)} style={inputStyle} />
</div>
</div>

```
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <label style={labelStyle}>Investissement (€)</label>
        <input type="number" value={investment} onChange={(e) => setInvestment(e.target.value)} placeholder="100.00" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Prix d'achat (€)</label>
        <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="0.00" style={inputStyle} step="any" />
      </div>
    </div>

    <div>
      <label style={labelStyle}>Quantité (nb de jetons)</label>
      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" style={inputStyle} step="any" />
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <label style={labelStyle}>Stop-Loss (€)</label>
        <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="0.00" style={inputStyle} step="any" />
      </div>
      <div>
        <label style={labelStyle}>Take-Profit (€)</label>
        <input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} placeholder="0.00" style={inputStyle} step="any" />
      </div>
    </div>

    <button onClick={handleSubmit} style={{
      marginTop: 8, padding: "12px 0", width: "100%",
      background: "linear-gradient(135deg, #00d2ff, #3a7bd5)",
      border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700,
      letterSpacing: 1.5, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
    }}
      onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,210,255,0.3)"; }}
      onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >Ajouter l'investissement</button>
  </div>
</Modal>
```

);
}

// ==================== ADD ASSET MODAL ====================
function AddAssetModal({ isOpen, onClose, onAdd }) {
const [name, setName] = useState(””);
const [ticker, setTicker] = useState(””);
const [objective, setObjective] = useState(””);
const [color, setColor] = useState(”#00d2ff”);

const handleSubmit = () => {
if (!name || !ticker) return;
onAdd({ name: name.toUpperCase(), ticker: ticker.toUpperCase(), objective, color });
setName(””); setTicker(””); setObjective(””); setColor(”#00d2ff”);
onClose();
};

const inputStyle = {
width: “100%”, padding: “10px 14px”, background: “rgba(255,255,255,0.06)”,
border: “1px solid rgba(255,255,255,0.12)”, borderRadius: 8, color: “#fff”,
fontSize: 14, fontFamily: “‘DM Sans’, sans-serif”, outline: “none”, boxSizing: “border-box”,
};
const labelStyle = {
display: “block”, fontSize: 11, fontWeight: 600, color: “rgba(255,255,255,0.5)”,
letterSpacing: 1.5, textTransform: “uppercase”, marginBottom: 6, fontFamily: “‘DM Sans’, sans-serif”,
};

return (
<Modal isOpen={isOpen} onClose={onClose} title="AJOUTER UN ACTIF">
<div style={{ display: “grid”, gap: 14 }}>
<div style={{ display: “grid”, gridTemplateColumns: “2fr 1fr”, gap: 12 }}>
<div><label style={labelStyle}>Nom</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder=“Ex: Avalanche” style={inputStyle} /></div>
<div><label style={labelStyle}>Ticker</label><input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder=“AVAX” style={inputStyle} /></div>
</div>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: 12 }}>
<div><label style={labelStyle}>Objectif</label><input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder=“X5” style={inputStyle} /></div>
<div>
<label style={labelStyle}>Couleur</label>
<div style={{ display: “flex”, gap: 8, alignItems: “center” }}>
<input type=“color” value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 40, height: 38, border: “none”, borderRadius: 8, cursor: “pointer”, background: “transparent” }} />
<span style={{ color: “rgba(255,255,255,0.4)”, fontSize: 13 }}>{color}</span>
</div>
</div>
</div>
<button onClick={handleSubmit} style={{
marginTop: 8, padding: “12px 0”, width: “100%”,
background: “linear-gradient(135deg, #14F195, #3a7bd5)”,
border: “none”, borderRadius: 10, color: “#fff”, fontSize: 14, fontWeight: 700,
letterSpacing: 1.5, cursor: “pointer”, fontFamily: “‘DM Sans’, sans-serif”, textTransform: “uppercase”,
}}>Ajouter l’actif</button>
</div>
</Modal>
);
}

// ==================== ASSET CARD ====================
function AssetCard({ asset, onDelete }) {
const [expanded, setExpanded] = useState(false);
const totalInvested = asset.totalInvestedCum;
const totalQuantity = asset.totalQtyCum;
const avgBuyPrice = asset.avgBuyPriceCum;
const lastEntry = asset.entriesCum[asset.entriesCum.length - 1];
const lastStopLoss = lastEntry?.stopLoss || 0;
const lastTakeProfit = lastEntry?.takeProfit || 0;

return (
<div style={{
background: “rgba(255,255,255,0.03)”, border: `1px solid ${asset.color}22`,
borderRadius: 14, overflow: “hidden”, transition: “all 0.3s ease”, animation: “fadeSlideUp 0.4s ease both”,
}}
onMouseOver={(e) => (e.currentTarget.style.borderColor = asset.color + “55”)}
onMouseOut={(e) => (e.currentTarget.style.borderColor = asset.color + “22”)}
>
<div onClick={() => setExpanded(!expanded)} style={{
display: “flex”, alignItems: “center”, gap: 14, padding: “16px 20px”, cursor: “pointer”,
background: expanded ? “rgba(255,255,255,0.02)” : “transparent”,
}}>
<div style={{
width: 42, height: 42, borderRadius: 12,
background: `linear-gradient(135deg, ${asset.color}33, ${asset.color}11)`,
border: `1px solid ${asset.color}44`, display: “flex”, alignItems: “center”, justifyContent: “center”,
fontFamily: “‘Bebas Neue’, sans-serif”, fontSize: 15, color: asset.color, letterSpacing: 1, flexShrink: 0,
}}>{asset.ticker}</div>
<div style={{ flex: 1 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 8 }}>
<span style={{ fontFamily: “‘Bebas Neue’, sans-serif”, fontSize: 17, color: “#fff”, letterSpacing: 1.5 }}>{asset.name}</span>
{asset.objective && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: “2px 8px”, borderRadius: 6, background: asset.color + “22”, color: asset.color, fontFamily: “‘DM Sans’, sans-serif” }}>{asset.objective}</span>}
</div>
<div style={{ fontSize: 12, color: “rgba(255,255,255,0.4)”, fontFamily: “‘DM Sans’, sans-serif”, marginTop: 2 }}>
{asset.entriesCum.length} investissement{asset.entriesCum.length > 1 ? “s” : “”} • {formatEUR(totalInvested)}
</div>
</div>
<div style={{ textAlign: “right” }}>
<div style={{ fontFamily: “‘Bebas Neue’, sans-serif”, fontSize: 20, color: “#fff” }}>{formatEUR(totalInvested)}</div>
<div style={{ fontSize: 11, color: “rgba(255,255,255,0.35)”, fontFamily: “‘DM Sans’, sans-serif” }}>
{totalQuantity > 0 ? `${totalQuantity.toLocaleString("fr-FR")} jetons` : “—”}
</div>
</div>
<div style={{ transform: expanded ? “rotate(90deg)” : “none”, transition: “transform 0.2s”, color: “rgba(255,255,255,0.3)” }}>
<ChevronIcon dir="right" />
</div>
</div>

```
  {expanded && (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "PRU moyen", value: avgBuyPrice > 0 ? formatEUR(avgBuyPrice) : "—" },
          { label: "Quantité", value: totalQuantity > 0 ? totalQuantity.toLocaleString("fr-FR") : "—" },
          { label: "Stop-Loss", value: lastStopLoss > 0 ? formatEUR(lastStopLoss) : "—", color: "#ff4757" },
          { label: "Take-Profit", value: lastTakeProfit > 0 ? formatEUR(lastTakeProfit) : "—", color: "#2ed573" },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: s.color || "#fff" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
        HISTORIQUE (CUMUL JUSQU'À CETTE ANNÉE)
      </div>
      {asset.entriesCum.length === 0 ? (
        <div style={{ padding: 16, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
          Aucun investissement enregistré
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {asset.entriesCum.map((e) => (
            <div key={e.id} style={{
              display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr 36px", gap: 8, alignItems: "center",
              padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
            }}>
              <span style={{ fontWeight: 700, color: asset.color, fontSize: 11, letterSpacing: 1 }}>{MONTHS[e.month]} {e.year}</span>
              <span style={{ color: "#fff" }}>{formatEUR(e.investment)}</span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{e.buyPrice > 0 ? `@ ${formatEUR(e.buyPrice)}` : "—"}</span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{e.quantity > 0 ? `${e.quantity.toLocaleString("fr-FR")} u.` : "—"}</span>
              <button onClick={() => onDelete(e.id)} style={{
                background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)",
                padding: 4, borderRadius: 6, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center",
              }}
                onMouseOver={(ev) => { ev.currentTarget.style.color = "#ff4757"; ev.currentTarget.style.background = "rgba(255,71,87,0.1)"; }}
                onMouseOut={(ev) => { ev.currentTarget.style.color = "rgba(255,255,255,0.2)"; ev.currentTarget.style.background = "none"; }}
                title="Supprimer"
              ><TrashIcon /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>
```

);
}

// ==================== MAIN APP ====================
export default function CryptoTracker() {
const [assets, setAssets] = useState(INITIAL_ASSETS);
const [entries, setEntries] = useState([]);
const [year, setYear] = useState(2025);
const [showAddInvestment, setShowAddInvestment] = useState(false);
const [showAddAsset, setShowAddAsset] = useState(false);
const [activeView, setActiveView] = useState(“dashboard”);
const [nextId, setNextId] = useState(14);

// ✅ DEBUG : log entries pour vérifier la persistance
// (retire cette ligne une fois le bug confirmé résolu)
console.log(`[CryptoTracker] year=${year}, total entries=${entries.length}, entries for ≤${year}:`, entries.filter(e => e.year <= year).length);

const assetData = useMemo(() => {
return assets
.map((asset) => {
// ✅ Cumul : toutes les entrées de l’actif jusqu’à l’année sélectionnée
const entriesCum = entries
.filter((e) => e.assetId === asset.id && e.year <= year)
.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

```
    // Entrées de l'année courante uniquement (pour l'histogramme)
    const entriesYear = entries
      .filter((e) => e.assetId === asset.id && e.year === year)
      .sort((a, b) => a.month - b.month);

    const monthlyData = Array(12).fill(0);
    entriesYear.forEach((e) => { monthlyData[e.month] += e.investment || 0; });

    const totalInvestedCum = entriesCum.reduce((s, e) => s + (e.investment || 0), 0);
    const totalQtyCum = entriesCum.reduce((s, e) => s + (e.quantity || 0), 0);
    const avgBuyPriceCum = entriesCum.length > 0
      ? entriesCum.reduce((s, e) => s + (e.buyPrice || 0) * (e.investment || 0), 0) / (totalInvestedCum || 1)
      : 0;

    return { ...asset, entriesCum, entriesYear, monthlyData, totalInvestedCum, totalQtyCum, avgBuyPriceCum };
  })
  .sort((a, b) => b.totalInvestedCum - a.totalInvestedCum);
```

}, [assets, entries, year]);

const totalInvested = assetData.reduce((s, a) => s + a.totalInvestedCum, 0);
const totalMonthly = Array(12).fill(0);
assetData.forEach((a) => a.monthlyData.forEach((v, i) => (totalMonthly[i] += v)));
const maxMonthly = Math.max(…totalMonthly, 1);
const activeAssets = assetData.filter((a) => a.totalInvestedCum > 0).length;

const handleAddInvestment = (data) => setEntries((prev) => […prev, data]);
const handleDeleteEntryById = (entryId) => setEntries((prev) => prev.filter((e) => e.id !== entryId));
const handleAddAsset = (data) => {
setAssets((prev) => […prev, { id: nextId, …data, investPerMonth: {} }]);
setNextId((prev) => prev + 1);
};

return (
<div style={{ minHeight: “100vh”, background: “#0d0d1a”, fontFamily: “‘DM Sans’, sans-serif”, color: “#fff”, position: “relative”, overflow: “hidden” }}>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } } select option { background: #1a1a2e; color: #fff; } input:focus, select:focus { border-color: rgba(0,210,255,0.5) !important; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }`}</style>

```
  <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, background: "radial-gradient(circle, rgba(0,210,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
  <div style={{ position: "fixed", bottom: -300, left: -200, width: 700, height: 700, background: "radial-gradient(circle, rgba(20,241,149,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

  {/* HEADER */}
  <header style={{
    padding: "24px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(13,13,26,0.8)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #00d2ff, #3a7bd5)",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,210,255,0.2)",
        }}><WalletIcon /></div>
        <div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 4, margin: 0, lineHeight: 1,
            background: "linear-gradient(90deg, #fff, rgba(255,255,255,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>INVESTISSEMENT CRYPTO</h1>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginTop: 2 }}>PORTFOLIO TRACKER</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "6px 4px" }}>
          <button onClick={() => setYear((y) => y - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center" }}><ChevronIcon dir="left" /></button>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: "#fff", minWidth: 60, textAlign: "center" }}>{year}</span>
          <button onClick={() => setYear((y) => y + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center" }}><ChevronIcon dir="right" /></button>
        </div>

        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
          {[{ key: "dashboard", label: "Dashboard" }, { key: "table", label: "Tableau" }].map((v) => (
            <button key={v.key} onClick={() => setActiveView(v.key)} style={{
              padding: "8px 16px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              letterSpacing: 0.5, fontFamily: "'DM Sans', sans-serif",
              background: activeView === v.key ? "rgba(0,210,255,0.15)" : "transparent",
              color: activeView === v.key ? "#00d2ff" : "rgba(255,255,255,0.4)", transition: "all 0.2s",
            }}>{v.label}</button>
          ))}
        </div>

        <button onClick={() => setShowAddAsset(true)} style={{
          padding: "8px 14px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", cursor: "pointer",
          fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif",
        }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "#14F195"; e.currentTarget.style.color = "#14F195"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
        ><PlusIcon /> Actif</button>

        <button onClick={() => setShowAddInvestment(true)} style={{
          padding: "8px 18px", background: "linear-gradient(135deg, #00d2ff, #3a7bd5)",
          border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700,
          letterSpacing: 1, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 4px 16px rgba(0,210,255,0.2)",
        }}
          onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,210,255,0.35)"; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,210,255,0.2)"; }}
        ><PlusIcon /> Investir</button>
      </div>
    </div>
  </header>

  <main style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
    {/* KPIs */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
      {[
        { label: "TOTAL INVESTI", value: formatEUR(totalInvested), sub: `cumul ≤ ${year}`, gradient: "linear-gradient(135deg, #00d2ff22, #3a7bd522)", accent: "#00d2ff" },
        { label: "ACTIFS EN PORTEFEUILLE", value: activeAssets.toString(), sub: `sur ${assets.length} suivis`, gradient: "linear-gradient(135deg, #14F19522, #0d996622)", accent: "#14F195" },
        { label: "INVESTISSEMENTS", value: entries.filter((e) => e.year <= year).length.toString(), sub: "cumul", gradient: "linear-gradient(135deg, #F7931A22, #c9711522)", accent: "#F7931A" },
        { label: "MOIS ACTIFS", value: totalMonthly.filter((v) => v > 0).length.toString(), sub: `sur 12 en ${year}`, gradient: "linear-gradient(135deg, #E6007A22, #a3005522)", accent: "#E6007A" },
      ].map((kpi, i) => (
        <div key={i} style={{ background: kpi.gradient, border: `1px solid ${kpi.accent}22`, borderRadius: 16, padding: "20px 22px", animation: `fadeSlideUp 0.4s ease ${i * 0.08}s both` }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: kpi.accent, letterSpacing: 2, marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>{kpi.label}</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#fff", lineHeight: 1, marginBottom: 4 }}>{kpi.value}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>{kpi.sub}</div>
        </div>
      ))}
    </div>

    {activeView === "dashboard" ? (
      <>
        {/* Monthly chart */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 28, animation: "fadeSlideUp 0.5s ease 0.3s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 2, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
              <ChartIcon /> RÉPARTITION MENSUELLE {year}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 8 }}>
            {totalMonthly.map((val, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 8 }}>
                  <div style={{
                    width: "100%", maxWidth: 40,
                    height: maxMonthly > 0 ? Math.max(4, (val / maxMonthly) * 80) : 4,
                    background: val > 0 ? "linear-gradient(to top, #00d2ff44, #00d2ff)" : "rgba(255,255,255,0.04)",
                    borderRadius: 6, transition: "height 0.5s ease",
                  }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: val > 0 ? "#00d2ff" : "rgba(255,255,255,0.2)", letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" }}>{MONTHS[i]}</div>
                <div style={{ fontSize: 11, color: val > 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{val > 0 ? formatEUR(val) : "—"}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>
          PORTEFEUILLE — {assets.length} ACTIFS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {assetData.map((asset, i) => (
            <div key={asset.id} style={{ animation: `fadeSlideUp 0.4s ease ${0.4 + i * 0.05}s both` }}>
              <AssetCard asset={asset} onDelete={handleDeleteEntryById} />
            </div>
          ))}
        </div>
      </>
    ) : (
      /* TABLE */
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", animation: "fadeSlideUp 0.4s ease both" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: "14px 20px", textAlign: "left", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: 2, position: "sticky", left: 0, zIndex: 2, backgroundColor: "#12121f" }}>ACTIF</th>
                {MONTHS.map((m, i) => (
                  <th key={i} style={{ padding: "14px 12px", textAlign: "center", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: 2, minWidth: 80 }}>{m}</th>
                ))}
                <th style={{ padding: "14px 16px", textAlign: "center", background: "rgba(0,210,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#00d2ff", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>TOTAL (cumul ≤ {year})</th>
              </tr>
            </thead>
            <tbody>
              {assetData.map((asset) => (
                <tr key={asset.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px 20px", position: "sticky", left: 0, zIndex: 1, backgroundColor: "#0d0d1a", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: asset.color, boxShadow: `0 0 8px ${asset.color}66` }} />
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 1.5, color: "#fff" }}>{asset.name}</span>
                      {asset.objective && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: asset.color + "22", color: asset.color }}>{asset.objective}</span>}
                    </div>
                  </td>
                  {asset.monthlyData.map((val, mi) => (
                    <td key={mi} style={{ padding: "12px 12px", textAlign: "center", color: val > 0 ? "#fff" : "rgba(255,255,255,0.12)", fontSize: 12, background: val > 0 ? `${asset.color}08` : "transparent" }}>{val > 0 ? formatEUR(val) : "—"}</td>
                  ))}
                  <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: asset.totalInvestedCum > 0 ? "#fff" : "rgba(255,255,255,0.12)", background: "rgba(0,210,255,0.04)", fontFamily: "'Bebas Neue', sans-serif", fontSize: 15 }}>{asset.totalInvestedCum > 0 ? formatEUR(asset.totalInvestedCum) : "—"}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid rgba(0,210,255,0.2)", background: "rgba(0,210,255,0.04)" }}>
                <td style={{ padding: "14px 20px", fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 2, color: "#00d2ff", position: "sticky", left: 0, zIndex: 1, backgroundColor: "#0f1020" }}>TOTAL</td>
                {totalMonthly.map((val, i) => (
                  <td key={i} style={{ padding: "14px 12px", textAlign: "center", fontWeight: 700, color: val > 0 ? "#00d2ff" : "rgba(255,255,255,0.12)", fontSize: 12 }}>{val > 0 ? formatEUR(val) : "—"}</td>
                ))}
                <td style={{ padding: "14px 16px", textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#00d2ff", fontWeight: 700 }}>{formatEUR(totalInvested)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )}
  </main>

  <AddInvestmentModal isOpen={showAddInvestment} onClose={() => setShowAddInvestment(false)} assets={assets} year={year} onAdd={handleAddInvestment} />
  <AddAssetModal isOpen={showAddAsset} onClose={() => setShowAddAsset(false)} onAdd={handleAddAsset} />
</div>
```

);
}
