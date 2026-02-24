import { useMemo, useState, useEffect, useCallback, useRef } from “react”;

// ==================== CONSTANTS ====================
const INITIAL_ASSETS = [
{ id: 1, name: “SOLANA”, ticker: “SOL”, objective: “X10”, color: “#14F195” },
{ id: 2, name: “ETHEREUM”, ticker: “ETH”, objective: “X4”, color: “#627EEA” },
{ id: 3, name: “BITCOIN”, ticker: “BTC”, objective: “X2”, color: “#F7931A” },
{ id: 4, name: “XRP”, ticker: “XRP”, objective: “”, color: “#23292F” },
{ id: 5, name: “DOGECOIN”, ticker: “DOGE”, objective: “”, color: “#C2A633” },
{ id: 6, name: “SHIBA INU”, ticker: “SHIB”, objective: “”, color: “#E3420A” },
{ id: 7, name: “PEPE”, ticker: “PEPE”, objective: “”, color: “#4D8C3B” },
{ id: 8, name: “SUI”, ticker: “SUI”, objective: “”, color: “#4DA2FF” },
{ id: 9, name: “CARDANO”, ticker: “ADA”, objective: “”, color: “#0033AD” },
{ id: 10, name: “CENTRIFUGE”, ticker: “CFG”, objective: “”, color: “#FFC012” },
{ id: 11, name: “CHAINLINK”, ticker: “LINK”, objective: “”, color: “#2A5ADA” },
{ id: 12, name: “POLKADOT”, ticker: “DOT”, objective: “”, color: “#E6007A” },
{ id: 13, name: “BNB”, ticker: “BNB”, objective: “”, color: “#F3BA2F” },
];

const MONTHS = [“JAN”, “FEV”, “MARS”, “AVR”, “MAI”, “JUIN”, “JUIL”, “AOUT”, “SEPT”, “OCT”, “NOV”, “DEC”];

const fmt = (val) => {
if (val == null || val === “”) return “\u2014”;
const n = parseFloat(val);
if (isNaN(n)) return “\u2014”;
return new Intl.NumberFormat(“fr-FR”, { style: “currency”, currency: “EUR”, minimumFractionDigits: 2 }).format(n);
};

function toNum(val) {
if (val == null) return 0;
const s = String(val).trim().replace(/\s/g, “”).replace(”,”, “.”);
const n = parseFloat(s);
return isNaN(n) ? 0 : n;
}

function normalizeMonth(value) {
if (value == null) return null;
const v = String(value).trim().toUpperCase();
const n = parseInt(v, 10);
if (!isNaN(n) && n >= 1 && n <= 12) return n - 1;
if (!isNaN(n) && n >= 0 && n <= 11) return n;
const map = {
JAN: 0, JANVIER: 0, FEV: 1, “FEV”: 1, FEVRIER: 1, “FEVRIER”: 1,
MAR: 2, MARS: 2, AVR: 3, AVRIL: 3, MAI: 4, JUN: 5, JUIN: 5,
JUL: 6, JUIL: 6, JUILLET: 6, AOU: 7, “AOU”: 7, AOUT: 7, “AOUT”: 7,
SEP: 8, SEPT: 8, SEPTEMBRE: 8, OCT: 9, OCTOBRE: 9,
NOV: 10, NOVEMBRE: 10, DEC: 11, “DEC”: 11, DECEMBRE: 11, “DECEMBRE”: 11,
};
return map[v] ?? null;
}

function uid() { return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

// ==================== PERSISTENCE ====================
const STORAGE_KEY = “crypto-tracker-data”;

async function saveData(assets, entries) {
try {
const data = JSON.stringify({ assets, entries, savedAt: Date.now() });
await window.storage.set(STORAGE_KEY, data);
} catch (e) { console.warn(“Save failed:”, e); }
}

async function loadData() {
try {
const result = await window.storage.get(STORAGE_KEY);
if (result && result.value) {
const parsed = JSON.parse(result.value);
return parsed;
}
} catch (e) { console.warn(“Load failed:”, e); }
return null;
}

// ==================== CSV PARSER (no dependency) ====================
function parseCSV(text) {
const lines = text.split(/\r?\n/).filter(l => l.trim());
if (lines.length < 2) return [];

const sep = lines[0].includes(”;”) ? “;” : “,”;

const headerLine = lines[0];
const headers = headerLine.split(sep).map(h => h.trim().replace(/^[”’]|[”’]$/g, “”));

const rows = [];
for (let i = 1; i < lines.length; i++) {
const vals = lines[i].split(sep).map(v => v.trim().replace(/^[”’]|[”’]$/g, “”));
if (vals.length < 2) continue;
const row = {};
headers.forEach((h, idx) => { row[h] = vals[idx] || “”; });
rows.push(row);
}
return rows;
}

function getField(row, keys) {
for (const k of keys) {
if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== “”) return row[k];
}
return “”;
}

// ==================== ICONS ====================
const Icons = {
Plus: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>,
Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
Chevron: ({ dir }) => <svg width=“16” height=“16” viewBox=“0 0 16 16” fill=“none” stroke=“currentColor” strokeWidth=“2” style={{ transform: dir === “left” ? “rotate(180deg)” : “none” }}><polyline points="6 3 11 8 6 13"/></svg>,
Chart: () => <svg width=“18” height=“18” viewBox=“0 0 24 24” fill=“none” stroke=“currentColor” strokeWidth=“2” style={{ display: “inline”, verticalAlign: “middle”, marginRight: 6 }}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
Wallet: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4h4v-4h-4z"/></svg>,
Upload: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
Alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

// ==================== STYLES ====================
const inputStyle = {
width: “100%”, padding: “10px 14px”, background: “rgba(255,255,255,0.06)”,
border: “1px solid rgba(255,255,255,0.12)”, borderRadius: 8, color: “#fff”,
fontSize: 14, fontFamily: “‘DM Sans’,sans-serif”, outline: “none”, boxSizing: “border-box”,
};
const labelStyle = {
display: “block”, fontSize: 11, fontWeight: 600, color: “rgba(255,255,255,0.5)”,
letterSpacing: 1.5, textTransform: “uppercase”, marginBottom: 6, fontFamily: “‘DM Sans’,sans-serif”,
};

// ==================== MODAL ====================
function Modal({ isOpen, onClose, title, children }) {
if (!isOpen) return null;
return (
<div style={{ position: “fixed”, inset: 0, zIndex: 1000, display: “flex”, alignItems: “center”, justifyContent: “center”, padding: 16 }}>
<div onClick={onClose} style={{ position: “absolute”, inset: 0, background: “rgba(0,0,0,0.7)”, backdropFilter: “blur(8px)” }}/>
<div style={{ position: “relative”, zIndex: 1, background: “#1a1a2e”, border: “1px solid rgba(255,255,255,0.1)”, borderRadius: 16, padding: 24, width: “100%”, maxWidth: 560, maxHeight: “85vh”, overflowY: “auto”, boxShadow: “0 24px 80px rgba(0,0,0,0.5)”, animation: “modalIn 0.25s ease” }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 20 }}>
<h3 style={{ fontFamily: “‘Bebas Neue’,sans-serif”, fontSize: 22, color: “#fff”, letterSpacing: 2, margin: 0 }}>{title}</h3>
<button onClick={onClose} style={{ background: “none”, border: “none”, color: “rgba(255,255,255,0.4)”, fontSize: 24, cursor: “pointer”, lineHeight: 1 }}>×</button>
</div>
{children}
</div>
</div>
);
}

// ==================== ADD INVESTMENT MODAL ====================
function AddInvestmentModal({ isOpen, onClose, assets, year, onAdd }) {
const [assetId, setAssetId] = useState(””);
const [month, setMonth] = useState(new Date().getMonth());
const [entryYear, setEntryYear] = useState(year);
const [investment, setInvestment] = useState(””);
const [buyPrice, setBuyPrice] = useState(””);
const [quantity, setQuantity] = useState(””);
const [stopLoss, setStopLoss] = useState(””);
const [takeProfit, setTakeProfit] = useState(””);

useEffect(() => { if (isOpen) setEntryYear(year); }, [isOpen, year]);

const handleSubmit = () => {
if (!assetId || !investment) return;
onAdd({
id: uid(), assetId: parseInt(assetId, 10), month, year: entryYear,
investment: parseFloat(investment) || 0, buyPrice: parseFloat(buyPrice) || 0,
quantity: parseFloat(quantity) || 0, stopLoss: parseFloat(stopLoss) || 0,
takeProfit: parseFloat(takeProfit) || 0,
});
setAssetId(””); setInvestment(””); setBuyPrice(””); setQuantity(””); setStopLoss(””); setTakeProfit(””);
onClose();
};

return (
<Modal isOpen={isOpen} onClose={onClose} title="NOUVEL INVESTISSEMENT">
<div style={{ display: “grid”, gap: 14 }}>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr 1fr”, gap: 12 }}>
<div><label style={labelStyle}>Actif</label>
<select value={assetId} onChange={e => setAssetId(e.target.value)} style={{ …inputStyle, cursor: “pointer”, appearance: “auto” }}>
<option value="">Choisir…</option>
{assets.map(a => <option key={a.id} value={a.id} style={{ background: “#1a1a2e” }}>{a.name} ({a.ticker})</option>)}
</select>
</div>
<div><label style={labelStyle}>Mois</label>
<select value={month} onChange={e => setMonth(parseInt(e.target.value, 10))} style={{ …inputStyle, cursor: “pointer”, appearance: “auto” }}>
{MONTHS.map((m, i) => <option key={i} value={i} style={{ background: “#1a1a2e” }}>{m}</option>)}
</select>
</div>
<div><label style={labelStyle}>Année</label>
<input type=“number” value={entryYear} onChange={e => setEntryYear(parseInt(e.target.value, 10) || 2025)} style={inputStyle}/>
</div>
</div>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: 12 }}>
<div><label style={labelStyle}>Investissement (€)</label><input type=“number” value={investment} onChange={e => setInvestment(e.target.value)} placeholder=“100.00” style={inputStyle}/></div>
<div><label style={labelStyle}>Prix d'achat (€)</label><input type=“number” value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder=“0.00” style={inputStyle} step=“any”/></div>
</div>
<div><label style={labelStyle}>Quantité (jetons)</label><input type=“number” value={quantity} onChange={e => setQuantity(e.target.value)} placeholder=“0” style={inputStyle} step=“any”/></div>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: 12 }}>
<div><label style={labelStyle}>Stop-Loss (€)</label><input type=“number” value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder=“0.00” style={inputStyle} step=“any”/></div>
<div><label style={labelStyle}>Take-Profit (€)</label><input type=“number” value={takeProfit} onChange={e => setTakeProfit(e.target.value)} placeholder=“0.00” style={inputStyle} step=“any”/></div>
</div>
<button onClick={handleSubmit} style={{ marginTop: 8, padding: “12px 0”, width: “100%”, background: “linear-gradient(135deg,#00d2ff,#3a7bd5)”, border: “none”, borderRadius: 10, color: “#fff”, fontSize: 14, fontWeight: 700, letterSpacing: 1.5, cursor: “pointer”, fontFamily: “‘DM Sans’,sans-serif”, textTransform: “uppercase” }}>
Ajouter l'investissement
</button>
</div>
</Modal>
);
}

// ==================== ADD ASSET MODAL ====================
function AddAssetModal({ isOpen, onClose, onAdd }) {
const [name, setName] = useState(””); const [ticker, setTicker] = useState(””);
const [objective, setObjective] = useState(””); const [color, setColor] = useState(”#00d2ff”);
const handleSubmit = () => {
if (!name || !ticker) return;
onAdd({ name: name.toUpperCase(), ticker: ticker.toUpperCase(), objective, color });
setName(””); setTicker(””); setObjective(””); setColor(”#00d2ff”); onClose();
};
return (
<Modal isOpen={isOpen} onClose={onClose} title="AJOUTER UN ACTIF">
<div style={{ display: “grid”, gap: 14 }}>
<div style={{ display: “grid”, gridTemplateColumns: “2fr 1fr”, gap: 12 }}>
<div><label style={labelStyle}>Nom</label><input value={name} onChange={e => setName(e.target.value)} placeholder=“Avalanche” style={inputStyle}/></div>
<div><label style={labelStyle}>Ticker</label><input value={ticker} onChange={e => setTicker(e.target.value)} placeholder=“AVAX” style={inputStyle}/></div>
</div>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: 12 }}>
<div><label style={labelStyle}>Objectif</label><input value={objective} onChange={e => setObjective(e.target.value)} placeholder=“X5” style={inputStyle}/></div>
<div><label style={labelStyle}>Couleur</label>
<div style={{ display: “flex”, gap: 8, alignItems: “center” }}>
<input type=“color” value={color} onChange={e => setColor(e.target.value)} style={{ width: 40, height: 38, border: “none”, borderRadius: 8, cursor: “pointer”, background: “transparent” }}/>
<span style={{ color: “rgba(255,255,255,0.4)”, fontSize: 13 }}>{color}</span>
</div>
</div>
</div>
<button onClick={handleSubmit} style={{ marginTop: 8, padding: “12px 0”, width: “100%”, background: “linear-gradient(135deg,#14F195,#3a7bd5)”, border: “none”, borderRadius: 10, color: “#fff”, fontSize: 14, fontWeight: 700, letterSpacing: 1.5, cursor: “pointer”, fontFamily: “‘DM Sans’,sans-serif”, textTransform: “uppercase” }}>
Ajouter l'actif
</button>
</div>
</Modal>
);
}

// ==================== CSV IMPORT MODAL ====================
function ImportCSVModal({ isOpen, onClose, assets, onImport }) {
const [csvText, setCsvText] = useState(””);
const [preview, setPreview] = useState(null);
const [result, setResult] = useState(null);
const fileRef = useRef();

const handleFile = (e) => {
const file = e.target.files?.[0];
if (!file) return;
const reader = new FileReader();
reader.onload = (ev) => {
const text = ev.target.result;
setCsvText(text);
previewCSV(text);
};
reader.readAsText(file, “utf-8”);
};

const previewCSV = (text) => {
const rows = parseCSV(text);
if (rows.length === 0) { setPreview({ rows: [], matched: 0, errors: [“Aucune ligne trouvee”] }); return; }

```
let matched = 0; let errors = [];
const entries = rows.map((r, idx) => {
  const ticker = String(getField(r, ["Ticker", "ticker", "TICKER", "Symbol", "symbol"])).trim().toUpperCase();
  const name = String(getField(r, ["Actif", "Nom", "name", "NAME", "Name", "Asset"])).trim().toUpperCase();
  const asset = assets.find(a => a.ticker === ticker || a.name === name);
  if (!asset) { errors.push(`Ligne ${idx + 2}: actif "${ticker || name}" non trouve`); return null; }
  const month = normalizeMonth(getField(r, ["Mois", "mois", "Month", "month"]));
  const year = parseInt(getField(r, ["Annee", "Annee", "Year", "year"]), 10);
  if (month === null) { errors.push(`Ligne ${idx + 2}: mois invalide`); return null; }
  if (isNaN(year)) { errors.push(`Ligne ${idx + 2}: annee invalide`); return null; }
  matched++;
  return {
    id: uid(), assetId: asset.id, month, year,
    investment: toNum(getField(r, ["Investissement", "Montant", "investment", "Investment", "Amount"])),
    buyPrice: toNum(getField(r, ["PrixAchat", "Prix achat", "buyPrice", "BuyPrice", "Prix"])),
    quantity: toNum(getField(r, ["Quantite", "Quantite", "quantity", "Quantity", "Qty"])),
    stopLoss: toNum(getField(r, ["StopLoss", "Stop-Loss", "stopLoss", "Stop Loss"])),
    takeProfit: toNum(getField(r, ["TakeProfit", "Take-Profit", "takeProfit", "Take Profit"])),
  };
}).filter(Boolean);

setPreview({ rows: entries, matched, errors, totalRows: rows.length });
```

};

const handleImport = () => {
if (!preview?.rows.length) return;
onImport(preview.rows);
setResult({ count: preview.rows.length });
setCsvText(””); setPreview(null);
};

const handleClose = () => { setCsvText(””); setPreview(null); setResult(null); onClose(); };

return (
<Modal isOpen={isOpen} onClose={handleClose} title="IMPORTER UN CSV">
{result ? (
<div style={{ textAlign: “center”, padding: “20px 0” }}>
<div style={{ width: 60, height: 60, borderRadius: “50%”, background: “rgba(46,213,115,0.15)”, display: “flex”, alignItems: “center”, justifyContent: “center”, margin: “0 auto 16px”, color: “#2ed573” }}><Icons.Check/></div>
<div style={{ fontFamily: “‘Bebas Neue’,sans-serif”, fontSize: 24, color: “#2ed573”, marginBottom: 8 }}>{result.count} INVESTISSEMENTS IMPORTES</div>
<div style={{ fontSize: 13, color: “rgba(255,255,255,0.5)” }}>Les donnees ont ete ajoutees a ton portefeuille</div>
<button onClick={handleClose} style={{ marginTop: 20, padding: “10px 30px”, background: “rgba(255,255,255,0.1)”, border: “none”, borderRadius: 8, color: “#fff”, cursor: “pointer”, fontSize: 13, fontWeight: 600 }}>Fermer</button>
</div>
) : (
<div style={{ display: “grid”, gap: 16 }}>
<div style={{ background: “rgba(255,255,255,0.03)”, borderRadius: 10, padding: 14, fontSize: 12, color: “rgba(255,255,255,0.5)”, lineHeight: 1.6 }}>
<div style={{ fontWeight: 700, color: “rgba(255,255,255,0.7)”, marginBottom: 6 }}>Format attendu du CSV :</div>
<div style={{ fontFamily: “‘Courier New’,monospace”, fontSize: 10, background: “rgba(0,0,0,0.3)”, borderRadius: 6, padding: 10, overflowX: “auto”, color: “#00d2ff”, marginBottom: 8 }}>
Ticker;Mois;Annee;Investissement;PrixAchat;Quantite;StopLoss;TakeProfit<br/>
SOL;2;2025;100;150.5;0.66;120;300<br/>
BTC;2;2025;200;92000;0.002;80000;150000
</div>
<div>Separateur : <b>;</b> ou <b>,</b> (detection auto). Les colonnes Ticker/Actif et Mois/Annee sont obligatoires.</div>
</div>

```
      <div>
        <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{ display: "none" }}/>
        <button onClick={() => fileRef.current?.click()} style={{
          width: "100%", padding: "16px", border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 12,
          background: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600,
          fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(0,210,255,0.4)"; e.currentTarget.style.color = "#00d2ff"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
        ><Icons.Upload/> Choisir un fichier CSV</button>
      </div>

      <div>
        <label style={labelStyle}>Ou colle ton CSV ici :</label>
        <textarea value={csvText} onChange={e => { setCsvText(e.target.value); if (e.target.value.trim()) previewCSV(e.target.value); else setPreview(null); }}
          placeholder="Ticker;Mois;Annee;Investissement;PrixAchat;Quantite" rows={5}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "'Courier New',monospace", fontSize: 11 }}/>
      </div>

      {preview && (
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14 }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: "#2ed573", fontWeight: 700 }}>{preview.matched}</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}> lignes reconnues</span>
            </div>
            {preview.errors.length > 0 && (
              <div style={{ fontSize: 12 }}>
                <span style={{ color: "#ffa502", fontWeight: 700 }}>{preview.errors.length}</span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}> erreurs</span>
              </div>
            )}
          </div>
          {preview.errors.length > 0 && (
            <div style={{ maxHeight: 80, overflowY: "auto", marginBottom: 10 }}>
              {preview.errors.slice(0, 5).map((err, i) => (
                <div key={i} style={{ fontSize: 10, color: "#ffa502", display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                  <Icons.Alert/> {err}
                </div>
              ))}
              {preview.errors.length > 5 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>...et {preview.errors.length - 5} autres</div>}
            </div>
          )}
          {preview.rows.length > 0 && (
            <div style={{ maxHeight: 120, overflowY: "auto", fontSize: 11 }}>
              {preview.rows.slice(0, 5).map((e, i) => {
                const asset = assets.find(a => a.id === e.assetId);
                return (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
                    <span style={{ color: asset?.color || "#fff", fontWeight: 700, minWidth: 40 }}>{asset?.ticker}</span>
                    <span>{MONTHS[e.month]} {e.year}</span>
                    <span style={{ color: "#fff" }}>{fmt(e.investment)}</span>
                    <span>{e.quantity > 0 ? `${e.quantity} u.` : ""}</span>
                  </div>
                );
              })}
              {preview.rows.length > 5 && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>...et {preview.rows.length - 5} autres lignes</div>}
            </div>
          )}
        </div>
      )}

      <button onClick={handleImport} disabled={!preview?.rows.length} style={{
        padding: "12px 0", width: "100%",
        background: preview?.rows.length ? "linear-gradient(135deg,#2ed573,#17a859)" : "rgba(255,255,255,0.05)",
        border: "none", borderRadius: 10, color: preview?.rows.length ? "#fff" : "rgba(255,255,255,0.2)",
        fontSize: 14, fontWeight: 700, letterSpacing: 1.5, cursor: preview?.rows.length ? "pointer" : "not-allowed",
        fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase",
      }}>
        {preview?.rows.length ? `Importer ${preview.rows.length} investissements` : "Importer"}
      </button>
    </div>
  )}
</Modal>
```

);
}

// ==================== ASSET CARD ====================
function AssetCard({ asset, year, onDelete }) {
const [expanded, setExpanded] = useState(false);
const totalInv = asset.totalCum;
const totalQty = asset.qtyCum;
const avgBuy = asset.avgBuyCum;
const last = asset.entriesCum[asset.entriesCum.length - 1];

return (
<div style={{ background: “rgba(255,255,255,0.03)”, border: `1px solid ${asset.color}22`, borderRadius: 14, overflow: “hidden”, transition: “all 0.3s” }}
onMouseOver={e => e.currentTarget.style.borderColor = asset.color + “55”}
onMouseOut={e => e.currentTarget.style.borderColor = asset.color + “22”}>
<div onClick={() => setExpanded(!expanded)} style={{ display: “flex”, alignItems: “center”, gap: 14, padding: “16px 20px”, cursor: “pointer”, background: expanded ? “rgba(255,255,255,0.02)” : “transparent” }}>
<div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,${asset.color}33,${asset.color}11)`, border: `1px solid ${asset.color}44`, display: “flex”, alignItems: “center”, justifyContent: “center”, fontFamily: “‘Bebas Neue’,sans-serif”, fontSize: 15, color: asset.color, letterSpacing: 1, flexShrink: 0 }}>{asset.ticker}</div>
<div style={{ flex: 1 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 8 }}>
<span style={{ fontFamily: “‘Bebas Neue’,sans-serif”, fontSize: 17, color: “#fff”, letterSpacing: 1.5 }}>{asset.name}</span>
{asset.objective && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: “2px 8px”, borderRadius: 6, background: asset.color + “22”, color: asset.color }}>{asset.objective}</span>}
</div>
<div style={{ fontSize: 12, color: “rgba(255,255,255,0.4)”, marginTop: 2 }}>{asset.entriesCum.length} invest. • {fmt(totalInv)}</div>
</div>
<div style={{ textAlign: “right” }}>
<div style={{ fontFamily: “‘Bebas Neue’,sans-serif”, fontSize: 20, color: “#fff” }}>{fmt(totalInv)}</div>
<div style={{ fontSize: 11, color: “rgba(255,255,255,0.35)” }}>{totalQty > 0 ? `${totalQty.toLocaleString("fr-FR")} jetons` : “\u2014”}</div>
</div>
<div style={{ transform: expanded ? “rotate(90deg)” : “none”, transition: “transform 0.2s”, color: “rgba(255,255,255,0.3)” }}><Icons.Chevron dir=“right”/></div>
</div>
{expanded && (
<div style={{ borderTop: “1px solid rgba(255,255,255,0.06)”, padding: “16px 20px”, animation: “fadeIn 0.3s” }}>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(4,1fr)”, gap: 10, marginBottom: 16 }}>
{[
{ label: “PRU moyen”, value: avgBuy > 0 ? fmt(avgBuy) : “\u2014” },
{ label: “Quantite”, value: totalQty > 0 ? totalQty.toLocaleString(“fr-FR”) : “\u2014” },
{ label: “Stop-Loss”, value: last?.stopLoss > 0 ? fmt(last.stopLoss) : “\u2014”, color: “#ff4757” },
{ label: “Take-Profit”, value: last?.takeProfit > 0 ? fmt(last.takeProfit) : “\u2014”, color: “#2ed573” },
].map((s, i) => (
<div key={i} style={{ background: “rgba(255,255,255,0.03)”, borderRadius: 10, padding: “10px 12px”, textAlign: “center” }}>
<div style={{ fontSize: 10, fontWeight: 600, color: “rgba(255,255,255,0.4)”, letterSpacing: 1, textTransform: “uppercase”, marginBottom: 4 }}>{s.label}</div>
<div style={{ fontFamily: “‘Bebas Neue’,sans-serif”, fontSize: 16, color: s.color || “#fff” }}>{s.value}</div>
</div>
))}
</div>
<div style={{ fontSize: 11, fontWeight: 600, color: “rgba(255,255,255,0.3)”, letterSpacing: 1.5, marginBottom: 8 }}>HISTORIQUE (cumul ≤ {year})</div>
{asset.entriesCum.length === 0 ? (
<div style={{ padding: 16, textAlign: “center”, color: “rgba(255,255,255,0.25)”, fontSize: 13 }}>Aucun investissement</div>
) : (
<div style={{ display: “flex”, flexDirection: “column”, gap: 6 }}>
{asset.entriesCum.map(e => (
<div key={e.id} style={{ display: “grid”, gridTemplateColumns: “90px 1fr 1fr 1fr 36px”, gap: 8, alignItems: “center”, padding: “8px 12px”, borderRadius: 8, background: “rgba(255,255,255,0.02)”, fontSize: 13 }}>
<span style={{ fontWeight: 700, color: asset.color, fontSize: 11, letterSpacing: 1 }}>{MONTHS[e.month]} {e.year}</span>
<span style={{ color: “#fff” }}>{fmt(e.investment)}</span>
<span style={{ color: “rgba(255,255,255,0.5)” }}>{e.buyPrice > 0 ? `@ ${fmt(e.buyPrice)}` : “\u2014”}</span>
<span style={{ color: “rgba(255,255,255,0.5)” }}>{e.quantity > 0 ? `${e.quantity.toLocaleString("fr-FR")} u.` : “\u2014”}</span>
<button onClick={() => onDelete(e.id)} style={{ background: “none”, border: “none”, cursor: “pointer”, color: “rgba(255,255,255,0.2)”, padding: 4, borderRadius: 6, display: “flex”, alignItems: “center”, justifyContent: “center” }}
onMouseOver={ev => { ev.currentTarget.style.color = “#ff4757”; ev.currentTarget.style.background = “rgba(255,71,87,0.1)”; }}
onMouseOut={ev => { ev.currentTarget.style.color = “rgba(255,255,255,0.2)”; ev.currentTarget.style.background = “none”; }}
><Icons.Trash/></button>
</div>
))}
</div>
)}
</div>
)}
</div>
);
}

// ==================== MAIN APP ====================
export default function CryptoTracker() {
const [assets, setAssets] = useState(INITIAL_ASSETS);
const [entries, setEntries] = useState([]);
const [year, setYear] = useState(2025);
const [showAddInv, setShowAddInv] = useState(false);
const [showAddAsset, setShowAddAsset] = useState(false);
const [showImport, setShowImport] = useState(false);
const [activeView, setActiveView] = useState(“dashboard”);
const [nextId, setNextId] = useState(14);
const [loaded, setLoaded] = useState(false);
const [toast, setToast] = useState(null);

const showToast = (msg, type = “info”) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

useEffect(() => {
(async () => {
const saved = await loadData();
if (saved) {
if (saved.assets?.length) setAssets(saved.assets);
if (saved.entries?.length) setEntries(saved.entries);
showToast(`${saved.entries?.length || 0} investissements charges`, “success”);
}
setLoaded(true);
})();
}, []);

useEffect(() => {
if (loaded) { saveData(assets, entries); }
}, [assets, entries, loaded]);

const assetData = useMemo(() => {
return assets.map(asset => {
const entriesCum = entries.filter(e => e.assetId === asset.id && e.year <= year)
.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
const entriesYear = entries.filter(e => e.assetId === asset.id && e.year === year)
.sort((a, b) => a.month - b.month);
const monthlyData = Array(12).fill(0);
entriesYear.forEach(e => { monthlyData[e.month] += e.investment || 0; });
const totalCum = entriesCum.reduce((s, e) => s + (e.investment || 0), 0);
const qtyCum = entriesCum.reduce((s, e) => s + (e.quantity || 0), 0);
const avgBuyCum = entriesCum.length > 0
? entriesCum.reduce((s, e) => s + (e.buyPrice || 0) * (e.investment || 0), 0) / (totalCum || 1) : 0;
return { …asset, entriesCum, entriesYear, monthlyData, totalCum, qtyCum, avgBuyCum };
}).sort((a, b) => b.totalCum - a.totalCum);
}, [assets, entries, year]);

const totalInvested = assetData.reduce((s, a) => s + a.totalCum, 0);
const totalMonthly = Array(12).fill(0);
assetData.forEach(a => a.monthlyData.forEach((v, i) => { totalMonthly[i] += v; }));
const maxMonthly = Math.max(…totalMonthly, 1);
const activeCount = assetData.filter(a => a.totalCum > 0).length;

const handleAddInv = (data) => setEntries(prev => […prev, data]);
const handleDeleteEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id));
const handleAddAsset = (data) => { setAssets(prev => […prev, { id: nextId, …data }]); setNextId(n => n + 1); };
const handleImportCSV = (newEntries) => {
setEntries(prev => […prev, …newEntries]);
showToast(`${newEntries.length} investissements importes !`, “success”);
};

return (
<div style={{ minHeight: “100vh”, background: “#0d0d1a”, fontFamily: “‘DM Sans’,sans-serif”, color: “#fff”, position: “relative”, overflow: “hidden” }}>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}} @keyframes toastIn{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}} select option{background:#1a1a2e;color:#fff} input:focus,select:focus{border-color:rgba(0,210,255,0.5)!important} textarea:focus{border-color:rgba(0,210,255,0.5)!important} ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}`}</style>
<div style={{ position: “fixed”, top: -200, right: -200, width: 600, height: 600, background: “radial-gradient(circle,rgba(0,210,255,0.06) 0%,transparent 70%)”, pointerEvents: “none” }}/>
<div style={{ position: “fixed”, bottom: -300, left: -200, width: 700, height: 700, background: “radial-gradient(circle,rgba(20,241,149,0.04) 0%,transparent 70%)”, pointerEvents: “none” }}/>

```
  {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 2000, padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: toast.type === "success" ? "#2ed573" : "#00d2ff", color: "#000", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", animation: "toastIn 0.3s ease" }}>{toast.msg}</div>}

  <header style={{ padding: "24px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,13,26,0.8)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#00d2ff,#3a7bd5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,210,255,0.2)" }}><Icons.Wallet/></div>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 4, margin: 0, lineHeight: 1, background: "linear-gradient(90deg,#fff,rgba(255,255,255,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>INVESTISSEMENT CRYPTO</h1>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginTop: 2 }}>PORTFOLIO TRACKER</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "6px 4px" }}>
          <button onClick={() => setYear(y => y - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center" }}><Icons.Chevron dir="left"/></button>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 2, color: "#fff", minWidth: 60, textAlign: "center" }}>{year}</span>
          <button onClick={() => setYear(y => y + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center" }}><Icons.Chevron dir="right"/></button>
        </div>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
          {[{ k: "dashboard", l: "Dashboard" }, { k: "table", l: "Tableau" }].map(v => (
            <button key={v.k} onClick={() => setActiveView(v.k)} style={{ padding: "8px 16px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, fontFamily: "'DM Sans',sans-serif", background: activeView === v.k ? "rgba(0,210,255,0.15)" : "transparent", color: activeView === v.k ? "#00d2ff" : "rgba(255,255,255,0.4)", transition: "all 0.2s" }}>{v.l}</button>
          ))}
        </div>
        <button onClick={() => setShowImport(true)} style={{ padding: "8px 14px", border: "1px solid rgba(46,213,115,0.3)", borderRadius: 10, background: "rgba(46,213,115,0.08)", color: "#2ed573", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans',sans-serif" }}><Icons.Upload/> CSV</button>
        <button onClick={() => setShowAddAsset(true)} style={{ padding: "8px 14px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans',sans-serif" }}><Icons.Plus/> Actif</button>
        <button onClick={() => setShowAddInv(true)} style={{ padding: "8px 18px", background: "linear-gradient(135deg,#00d2ff,#3a7bd5)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 16px rgba(0,210,255,0.2)" }}><Icons.Plus/> Investir</button>
      </div>
    </div>
  </header>

  <main style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
      {[
        { label: "TOTAL INVESTI", value: fmt(totalInvested), sub: `cumul <= ${year}`, accent: "#00d2ff", gradient: "linear-gradient(135deg,#00d2ff22,#3a7bd522)" },
        { label: "ACTIFS EN PORTEFEUILLE", value: activeCount.toString(), sub: `sur ${assets.length} suivis`, accent: "#14F195", gradient: "linear-gradient(135deg,#14F19522,#0d996622)" },
        { label: "INVESTISSEMENTS", value: entries.filter(e => e.year <= year).length.toString(), sub: "cumul", accent: "#F7931A", gradient: "linear-gradient(135deg,#F7931A22,#c9711522)" },
        { label: "MOIS ACTIFS", value: totalMonthly.filter(v => v > 0).length.toString(), sub: `sur 12 en ${year}`, accent: "#E6007A", gradient: "linear-gradient(135deg,#E6007A22,#a3005522)" },
      ].map((kpi, i) => (
        <div key={i} style={{ background: kpi.gradient, border: `1px solid ${kpi.accent}22`, borderRadius: 16, padding: "20px 22px", animation: `fadeSlideUp 0.4s ease ${i * 0.08}s both` }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: kpi.accent, letterSpacing: 2, marginBottom: 10 }}>{kpi.label}</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "#fff", lineHeight: 1, marginBottom: 4 }}>{kpi.value}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{kpi.sub}</div>
        </div>
      ))}
    </div>

    {activeView === "dashboard" ? (
      <>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Icons.Chart/> REPARTITION MENSUELLE {year}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 8 }}>
            {totalMonthly.map((val, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 8 }}>
                  <div style={{ width: "100%", maxWidth: 40, height: maxMonthly > 0 ? Math.max(4, (val / maxMonthly) * 80) : 4, background: val > 0 ? "linear-gradient(to top,#00d2ff44,#00d2ff)" : "rgba(255,255,255,0.04)", borderRadius: 6, transition: "height 0.5s ease" }}/>
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: val > 0 ? "#00d2ff" : "rgba(255,255,255,0.2)", letterSpacing: 1 }}>{MONTHS[i]}</div>
                <div style={{ fontSize: 11, color: val > 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)", marginTop: 2 }}>{val > 0 ? fmt(val) : "\u2014"}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 14 }}>PORTEFEUILLE &mdash; {assets.length} ACTIFS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {assetData.map((asset, i) => (
            <div key={asset.id} style={{ animation: `fadeSlideUp 0.4s ease ${0.4 + i * 0.05}s both` }}>
              <AssetCard asset={asset} year={year} onDelete={handleDeleteEntry}/>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>
              <th style={{ padding: "14px 20px", textAlign: "left", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: 2, position: "sticky", left: 0, zIndex: 2, backgroundColor: "#12121f" }}>ACTIF</th>
              {MONTHS.map((m, i) => <th key={i} style={{ padding: "14px 12px", textAlign: "center", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: 2, minWidth: 80 }}>{m}</th>)}
              <th style={{ padding: "14px 16px", textAlign: "center", background: "rgba(0,210,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#00d2ff", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>TOTAL &le; {year}</th>
            </tr></thead>
            <tbody>
              {assetData.map(asset => (
                <tr key={asset.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px 20px", position: "sticky", left: 0, zIndex: 1, backgroundColor: "#0d0d1a", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: asset.color, boxShadow: `0 0 8px ${asset.color}66` }}/>
                      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: 1.5, color: "#fff" }}>{asset.name}</span>
                      {asset.objective && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: asset.color + "22", color: asset.color }}>{asset.objective}</span>}
                    </div>
                  </td>
                  {asset.monthlyData.map((val, mi) => (
                    <td key={mi} style={{ padding: "12px 12px", textAlign: "center", color: val > 0 ? "#fff" : "rgba(255,255,255,0.12)", fontSize: 12, background: val > 0 ? `${asset.color}08` : "transparent" }}>{val > 0 ? fmt(val) : "\u2014"}</td>
                  ))}
                  <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: asset.totalCum > 0 ? "#fff" : "rgba(255,255,255,0.12)", background: "rgba(0,210,255,0.04)", fontFamily: "'Bebas Neue',sans-serif", fontSize: 15 }}>{asset.totalCum > 0 ? fmt(asset.totalCum) : "\u2014"}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid rgba(0,210,255,0.2)", background: "rgba(0,210,255,0.04)" }}>
                <td style={{ padding: "14px 20px", fontWeight: 700, fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 2, color: "#00d2ff", position: "sticky", left: 0, zIndex: 1, backgroundColor: "#0f1020" }}>TOTAL</td>
                {totalMonthly.map((val, i) => <td key={i} style={{ padding: "14px 12px", textAlign: "center", fontWeight: 700, color: val > 0 ? "#00d2ff" : "rgba(255,255,255,0.12)", fontSize: 12 }}>{val > 0 ? fmt(val) : "\u2014"}</td>)}
                <td style={{ padding: "14px 16px", textAlign: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#00d2ff", fontWeight: 700 }}>{fmt(totalInvested)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )}
  </main>

  <AddInvestmentModal isOpen={showAddInv} onClose={() => setShowAddInv(false)} assets={assets} year={year} onAdd={handleAddInv}/>
  <AddAssetModal isOpen={showAddAsset} onClose={() => setShowAddAsset(false)} onAdd={handleAddAsset}/>
  <ImportCSVModal isOpen={showImport} onClose={() => setShowImport(false)} assets={assets} onImport={handleImportCSV}/>
</div>
```

);
}
