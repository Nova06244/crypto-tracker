import { useMemo, useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://doqtfqpcyohjwjbschcw.supabase.co";
const SUPABASE_KEY = "sb_publishable_wUDXcznZmwrqBZdov_HbvQ_LIupIrbF";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MONTHS = ["JAN", "FEV", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOUT", "SEPT", "OCT", "NOV", "DEC"];

const STOCK_TICKERS = {
  UEC: "UEC", // Uranium Energy Corp
  
};

const COINGECKO_IDS = {
  SOL: "solana", ETH: "ethereum", BTC: "bitcoin", XRP: "ripple",
  DOGE: "dogecoin", SHIB: "shiba-inu", PEPE: "pepe", SUI: "sui",
  ADA: "cardano", CFG: "centrifuge", LINK: "chainlink", DOT: "polkadot",
  BNB: "binancecoin", AVAX: "avalanche-2", MATIC: "matic-network",
  UNI: "uniswap", ATOM: "cosmos", LTC: "litecoin", TON: "the-open-network",

  // ✅ AJOUTS
  SEI: "sei ",                 
  XLM: "stellar",            
  BGB: "bitget-token",       
  ONDO: "ondo ",               
  SPX: "spx6900",            
  VELO: "velo",                // Velo (Protocol)  (https://www.coingecko.com/en/coins/velo?utm_source=chatgpt.com)
 };

const DEFAULT_ASSETS = [
  { name: "SOLANA", ticker: "SOL", objective: "", color: "#14F195" },
  { name: "ETHEREUM", ticker: "ETH", objective: "", color: "#627EEA" },
  { name: "BITCOIN", ticker: "BTC", objective: "", color: "#F7931A" },
  { name: "XRP", ticker: "XRP", objective: "", color: "#23292F" },
  { name: "DOGECOIN", ticker: "DOGE", objective: "", color: "#C2A633" },
  { name: "SHIBA INU", ticker: "SHIB", objective: "", color: "#E3420A" },
  { name: "PEPE", ticker: "PEPE", objective: "", color: "#4D8C3B" },
  { name: "SUI", ticker: "SUI", objective: "", color: "#4DA2FF" },
  { name: "CARDANO", ticker: "ADA", objective: "", color: "#0033AD" },
  { name: "CENTRIFUGE", ticker: "CFG", objective: "", color: "#FFC012" },
  { name: "CHAINLINK", ticker: "LINK", objective: "", color: "#2A5ADA" },
  { name: "POLKADOT", ticker: "DOT", objective: "", color: "#E6007A" },
  { name: "BNB", ticker: "BNB", objective: "", color: "#F3BA2F" },
];

function fmt(val) {
  if (val == null || val === "") return "\u2014";
  const n = parseFloat(val);
  if (isNaN(n)) return "\u2014";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);
}

function fmtPct(val) {
  if (val == null || isNaN(val)) return "\u2014";
  const sign = val >= 0 ? "+" : "";
  return sign + val.toFixed(2) + "%";
}

function fmtPrice(val) {
  if (val == null || isNaN(val)) return "\u2014";
  if (val < 0.01) return val.toFixed(8) + " EUR";
  if (val < 1) return val.toFixed(4) + " EUR";
  return fmt(val);
}

const inputStyle = {
  width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff",
  fontSize: 14, fontFamily: "DM Sans,sans-serif", outline: "none", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)",
  letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6,
};

function SvgPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="2" x2="8" y2="14" /><line x1="2" y1="8" x2="14" y2="8" />
    </svg>
  );
}
function SvgTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}
function SvgLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: "rotate(180deg)" }}>
      <polyline points="6 3 11 8 6 13" />
    </svg>
  );
}
function SvgRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 3 11 8 6 13" />
    </svg>
  );
}
function SvgChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function SvgWallet() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12V7H5a2 2 0 010-4h14v4" />
      <path d="M3 5v14a2 2 0 002 2h16v-5" />
      <path d="M18 12a2 2 0 100 4h4v-4h-4z" />
    </svg>
  );
}
function SvgHistory() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="12 8 12 12 14 14" />
      <path d="M3.05 11a9 9 0 1 0 .5-4M3 3v5h5" />
    </svg>
  );
}
function SvgTrend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function SvgRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
function SvgSpinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite", display: "inline" }}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
function SvgDash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "relative", zIndex: 1, background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", animation: "modalIn 0.25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 22, color: "#fff", letterSpacing: 2, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InvestForm({ isOpen, onClose, assets, year, onAdd }) {
  const [assetId, setAssetId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth());
  const [entryYear, setEntryYear] = useState(year);
  const [investment, setInvestment] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (isOpen) setEntryYear(year); }, [isOpen, year]);

  async function handleSubmit() {
    if (!assetId || !investment) return;
    setSaving(true);
    const { data, error } = await supabase.from("investments").insert({
      asset_id: parseInt(assetId, 10), month, year: entryYear,
      investment: parseFloat(investment) || 0, buy_price: parseFloat(buyPrice) || 0,
      quantity: parseFloat(quantity) || 0, stop_loss: 0, take_profit: 0, type: "invest",
    }).select().single();
    setSaving(false);
    if (!error && data) {
      onAdd({ id: data.id, assetId: data.asset_id, month: data.month, year: data.year, investment: parseFloat(data.investment), buyPrice: parseFloat(data.buy_price), quantity: parseFloat(data.quantity), type: data.type });
      setAssetId(""); setInvestment(""); setBuyPrice(""); setQuantity(""); onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="NOUVEL INVESTISSEMENT">
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Actif</label>
            <select value={assetId} onChange={e => setAssetId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Choisir...</option>
              {assets.map(a => <option key={a.id} value={a.id} style={{ background: "#1a1a2e" }}>{a.name} ({a.ticker})</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Mois</label>
            <select value={month} onChange={e => setMonth(parseInt(e.target.value, 10))} style={{ ...inputStyle, cursor: "pointer" }}>
              {MONTHS.map((m, i) => <option key={i} value={i} style={{ background: "#1a1a2e" }}>{m}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Annee</label>
            <input type="number" value={entryYear} onChange={e => setEntryYear(parseInt(e.target.value, 10) || 2025)} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Investissement EUR</label><input type="number" value={investment} onChange={e => setInvestment(e.target.value)} placeholder="100.00" style={inputStyle} /></div>
          <div><label style={labelStyle}>Prix achat EUR</label><input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="0.00" style={inputStyle} step="any" /></div>
        </div>
        <div><label style={labelStyle}>Quantite obtenue</label><input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" style={inputStyle} step="any" /></div>
        <button onClick={handleSubmit} disabled={saving} style={{ marginTop: 4, padding: "12px 0", width: "100%", background: saving ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#00d2ff,#3a7bd5)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {saving && <SvgSpinner />}{saving ? "Enregistrement..." : "Ajouter"}
        </button>
      </div>
    </Modal>
  );
}

function HistoryForm({ isOpen, onClose, assets, onAdd }) {
  const [assetId, setAssetId] = useState("");
  const [month, setMonth] = useState(0);
  const [entryYear, setEntryYear] = useState(2024);
  const [investment, setInvestment] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!assetId || !investment) return;
    setSaving(true);
    const { data, error } = await supabase.from("investments").insert({
      asset_id: parseInt(assetId, 10), month, year: entryYear,
      investment: parseFloat(investment) || 0, buy_price: parseFloat(buyPrice) || 0,
      quantity: parseFloat(quantity) || 0, stop_loss: 0, take_profit: 0, type: "history",
    }).select().single();
    setSaving(false);
    if (!error && data) {
      onAdd({ id: data.id, assetId: data.asset_id, month: data.month, year: data.year, investment: parseFloat(data.investment), buyPrice: parseFloat(data.buy_price), quantity: parseFloat(data.quantity), type: data.type });
      setAssetId(""); setInvestment(""); setBuyPrice(""); setQuantity(""); onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AJOUT HISTORIQUE">
      <div style={{ background: "rgba(247,147,26,0.08)", border: "1px solid rgba(247,147,26,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "rgba(247,147,26,0.9)" }}>
        Saisie d un investissement deja realise
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Actif</label>
            <select value={assetId} onChange={e => setAssetId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Choisir...</option>
              {assets.map(a => <option key={a.id} value={a.id} style={{ background: "#1a1a2e" }}>{a.name} ({a.ticker})</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Mois</label>
            <select value={month} onChange={e => setMonth(parseInt(e.target.value, 10))} style={{ ...inputStyle, cursor: "pointer" }}>
              {MONTHS.map((m, i) => <option key={i} value={i} style={{ background: "#1a1a2e" }}>{m}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Annee</label>
            <input type="number" value={entryYear} onChange={e => setEntryYear(parseInt(e.target.value, 10) || 2024)} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Investissement EUR</label><input type="number" value={investment} onChange={e => setInvestment(e.target.value)} placeholder="100.00" style={inputStyle} /></div>
          <div><label style={labelStyle}>Prix achat moyen EUR</label><input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="0.00" style={inputStyle} step="any" /></div>
        </div>
        <div><label style={labelStyle}>Quantite obtenue</label><input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" style={inputStyle} step="any" /></div>
        <button onClick={handleSubmit} disabled={saving} style={{ marginTop: 4, padding: "12px 0", width: "100%", background: saving ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#f7931a,#e67e22)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {saving && <SvgSpinner />}{saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </Modal>
  );
}

function AddAssetModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [objective, setObjective] = useState("");
  const [color, setColor] = useState("#00d2ff");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name || !ticker) return;
    setSaving(true);
    const { data, error } = await supabase.from("assets").insert({ name: name.toUpperCase(), ticker: ticker.toUpperCase(), objective, color }).select().single();
    setSaving(false);
    if (!error && data) { onAdd({ id: data.id, name: data.name, ticker: data.ticker, objective: data.objective || "", color: data.color }); setName(""); setTicker(""); setObjective(""); setColor("#00d2ff"); onClose(); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AJOUTER UN ACTIF">
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Nom</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Avalanche" style={inputStyle} /></div>
          <div><label style={labelStyle}>Ticker</label><input value={ticker} onChange={e => setTicker(e.target.value)} placeholder="AVAX" style={inputStyle} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Objectif</label><input value={objective} onChange={e => setObjective(e.target.value)} placeholder="X5" style={inputStyle} /></div>
          <div><label style={labelStyle}>Couleur</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 40, height: 38, border: "none", borderRadius: 8, cursor: "pointer" }} />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{color}</span>
            </div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving} style={{ marginTop: 4, padding: "12px 0", width: "100%", background: "linear-gradient(135deg,#14F195,#3a7bd5)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          {saving ? "Enregistrement..." : "Ajouter l actif"}
        </button>
      </div>
    </Modal>
  );
}

function EntryRow({ entry, onDelete }) {
  const isHistory = entry.type === "history";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr 36px", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 8, background: isHistory ? "rgba(247,147,26,0.06)" : "rgba(0,210,255,0.04)", border: "1px solid " + (isHistory ? "rgba(247,147,26,0.15)" : "rgba(0,210,255,0.12)"), fontSize: 13 }}>
      <span style={{ fontWeight: 700, color: isHistory ? "#f7931a" : "#00d2ff", fontSize: 11, letterSpacing: 1 }}>{MONTHS[entry.month]} {entry.year}</span>
      <span style={{ color: "#fff" }}>{fmt(entry.investment)}</span>
      <span style={{ color: "rgba(255,255,255,0.5)" }}>{entry.buyPrice > 0 ? "@ " + fmtPrice(entry.buyPrice) : "\u2014"}</span>
      <span style={{ color: "rgba(255,255,255,0.5)" }}>{entry.quantity > 0 ? entry.quantity.toLocaleString("fr-FR") + " u." : "\u2014"}</span>
      <button onClick={() => onDelete(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseOver={ev => { ev.currentTarget.style.color = "#ff4757"; ev.currentTarget.style.background = "rgba(255,71,87,0.1)"; }}
        onMouseOut={ev => { ev.currentTarget.style.color = "rgba(255,255,255,0.2)"; ev.currentTarget.style.background = "none"; }}>
        <SvgTrash />
      </button>
    </div>
  );
}

function AssetCard({ asset, year, onDelete, prices }) {
  const [expanded, setExpanded] = useState(false);
  const historyEntries = asset.entriesCum.filter(e => e.type === "history");
  const investEntries = asset.entriesCum.filter(e => e.type === "invest");
  const price = prices[asset.ticker];
  const currentValue = price && asset.qtyCum > 0 ? price * asset.qtyCum : null;
  const pnl = currentValue != null ? currentValue - asset.totalCum : null;
  const pnlPct = pnl != null && asset.totalCum > 0 ? (pnl / asset.totalCum) * 100 : null;
  const isGain = pnl != null && pnl >= 0;

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid " + asset.color + "22", borderRadius: 14, overflow: "hidden", transition: "border-color 0.3s" }}
      onMouseOver={e => e.currentTarget.style.borderColor = asset.color + "55"}
      onMouseOut={e => e.currentTarget.style.borderColor = asset.color + "22"}>
      <div onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer" }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg," + asset.color + "33," + asset.color + "11)", border: "1px solid " + asset.color + "44", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Bebas Neue,sans-serif", fontSize: 15, color: asset.color, letterSpacing: 1, flexShrink: 0 }}>{asset.ticker}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 17, color: "#fff", letterSpacing: 1.5 }}>{asset.name}</span>
            {asset.objective && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: asset.color + "22", color: asset.color }}>{asset.objective}</span>}
            {pnlPct != null && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: isGain ? "rgba(46,213,115,0.15)" : "rgba(255,71,87,0.15)", color: isGain ? "#2ed573" : "#ff4757" }}>{fmtPct(pnlPct)}</span>}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2, display: "flex", gap: 10 }}>
            <span>{investEntries.length + historyEntries.length} entree(s)</span>
            {price && <span style={{ color: "rgba(255,255,255,0.6)" }}>{fmtPrice(price)}</span>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, color: "#fff" }}>{fmt(asset.totalCum)}</div>
          {currentValue != null && <div style={{ fontSize: 12, color: isGain ? "#2ed573" : "#ff4757", marginTop: 2 }}>Val. act. {fmt(currentValue)}</div>}
          {pnl != null && <div style={{ fontSize: 11, color: isGain ? "#2ed573" : "#ff4757" }}>{isGain ? "+" : ""}{fmt(pnl)}</div>}
        </div>
        <div style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s", color: "rgba(255,255,255,0.3)" }}><SvgRight /></div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", animation: "fadeIn 0.3s" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "PRU moyen", value: asset.avgBuyCum > 0 ? fmtPrice(asset.avgBuyCum) : "\u2014" },
              { label: "Quantite", value: asset.qtyCum > 0 ? asset.qtyCum.toLocaleString("fr-FR") : "\u2014" },
              { label: "Prix actuel", value: price ? fmtPrice(price) : "N/A" },
              { label: "PnL", value: pnl != null ? fmt(pnl) : "\u2014", color: pnl != null ? (isGain ? "#2ed573" : "#ff4757") : "#fff" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 15, color: s.color || "#fff", wordBreak: "break-all" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {historyEntries.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#f7931a", letterSpacing: 1.5, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f7931a", display: "inline-block", marginRight: 6 }} />
                HISTORIQUE
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {historyEntries.map(e => <EntryRow key={e.id} entry={e} onDelete={onDelete} />)}
              </div>
            </div>
          )}
          {investEntries.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#00d2ff", letterSpacing: 1.5, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d2ff", display: "inline-block", marginRight: 6 }} />
                INVESTISSEMENTS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {investEntries.map(e => <EntryRow key={e.id} entry={e} onDelete={onDelete} />)}
              </div>
            </div>
          )}
          {asset.entriesCum.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Aucune entree</div>}
        </div>
      )}
    </div>
  );
}

function MarketView({ assetData, prices, pricesLoading, lastUpdated, onRefresh }) {
  const activeAssets = assetData.filter(a => a.totalCum > 0 || a.qtyCum > 0);
  const totalInvested = activeAssets.reduce((s, a) => s + a.totalCum, 0);
  const totalCurrentValue = activeAssets.reduce((s, a) => {
    const price = prices[a.ticker];
    return s + (price && a.qtyCum > 0 ? price * a.qtyCum : a.totalCum);
  }, 0);
  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          { label: "TOTAL INVESTI", value: fmt(totalInvested), accent: "#00d2ff", gradient: "linear-gradient(135deg,#00d2ff22,#3a7bd522)" },
          { label: "VALEUR ACTUELLE", value: fmt(totalCurrentValue), accent: "#14F195", gradient: "linear-gradient(135deg,#14F19522,#0d996622)" },
          { label: "PNL TOTAL", value: fmt(totalPnl), sub: fmtPct(totalPnlPct), accent: totalPnl >= 0 ? "#2ed573" : "#ff4757", gradient: totalPnl >= 0 ? "linear-gradient(135deg,#2ed57322,#17a85922)" : "linear-gradient(135deg,#ff475722,#c0392b22)" },
        ].map((k, i) => (
          <div key={i} style={{ background: k.gradient, border: "1px solid " + k.accent + "22", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: k.accent, letterSpacing: 2, marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 28, color: "#fff", lineHeight: 1, marginBottom: 4 }}>{k.value}</div>
            {k.sub && <div style={{ fontSize: 13, fontWeight: 700, color: k.accent }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>PRIX EN TEMPS REEL - COINGECKO</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastUpdated && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>MAJ: {lastUpdated}</span>}
          <button onClick={onRefresh} disabled={pricesLoading} style={{ padding: "6px 12px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            {pricesLoading ? <SvgSpinner /> : <SvgRefresh />} Actualiser
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {activeAssets.map(asset => {
          const price = prices[asset.ticker];
          const currentValue = price && asset.qtyCum > 0 ? price * asset.qtyCum : null;
          const pnl = currentValue != null ? currentValue - asset.totalCum : null;
          const pnlPct = pnl != null && asset.totalCum > 0 ? (pnl / asset.totalCum) * 100 : null;
          const isGain = pnl != null && pnl >= 0;

          return (
            <div key={asset.id} style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr 1fr 1fr 1fr", gap: 12, alignItems: "center", padding: "14px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid " + asset.color + "22", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: asset.color + "22", border: "1px solid " + asset.color + "44", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Bebas Neue,sans-serif", fontSize: 12, color: asset.color }}>{asset.ticker}</div>
                <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 15, color: "#fff", letterSpacing: 1 }}>{asset.name}</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>PRIX</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{price ? fmtPrice(price) : <span style={{ color: "rgba(255,255,255,0.2)" }}>N/A</span>}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>QUANTITE</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{asset.qtyCum > 0 ? asset.qtyCum.toLocaleString("fr-FR") : "\u2014"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>INVESTI</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{fmt(asset.totalCum)}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>VALEUR ACT.</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{currentValue != null ? fmt(currentValue) : "\u2014"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>PNL</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: pnl != null ? (isGain ? "#2ed573" : "#ff4757") : "rgba(255,255,255,0.3)" }}>
                  {pnl != null ? fmt(pnl) : "\u2014"}
                </div>
                {pnlPct != null && <div style={{ fontSize: 11, color: isGain ? "#2ed573" : "#ff4757" }}>{fmtPct(pnlPct)}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsView({ assetData, entries, prices }) {
  const activeAssets = assetData.filter(a => a.totalCum > 0);
  const totalInvested = activeAssets.reduce((s, a) => s + a.totalCum, 0);

  const monthlyTotals = Array(12).fill(0);
  entries.forEach(e => { if (e.year === new Date().getFullYear()) monthlyTotals[e.month] += e.investment || 0; });
  const maxMonthly = Math.max(...monthlyTotals, 1);

  const assetsWithPnl = activeAssets.map(a => {
    const price = prices[a.ticker];
    const currentValue = price && a.qtyCum > 0 ? price * a.qtyCum : null;
    const pnl = currentValue != null ? currentValue - a.totalCum : null;
    const pnlPct = pnl != null && a.totalCum > 0 ? (pnl / a.totalCum) * 100 : null;
    return { ...a, currentValue, pnl, pnlPct };
  }).filter(a => a.pnlPct != null).sort((a, b) => b.pnlPct - a.pnlPct);

  const bestAsset = assetsWithPnl[0];
  const worstAsset = assetsWithPnl[assetsWithPnl.length - 1];

  return (
    <div style={{ animation: "fadeIn 0.3s" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {bestAsset && (
          <div style={{ background: "rgba(46,213,115,0.08)", border: "1px solid rgba(46,213,115,0.2)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#2ed573", letterSpacing: 2, marginBottom: 8 }}>MEILLEUR ACTIF</div>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, color: "#fff", marginBottom: 4 }}>{bestAsset.name}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2ed573" }}>{fmtPct(bestAsset.pnlPct)} ({fmt(bestAsset.pnl)})</div>
          </div>
        )}
        {worstAsset && worstAsset.ticker !== (bestAsset && bestAsset.ticker) && (
          <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#ff4757", letterSpacing: 2, marginBottom: 8 }}>ACTIF EN BAISSE</div>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, color: "#fff", marginBottom: 4 }}>{worstAsset.name}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ff4757" }}>{fmtPct(worstAsset.pnlPct)} ({fmt(worstAsset.pnl)})</div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 16 }}>REPARTITION DU PORTEFEUILLE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeAssets.slice(0, 10).map(asset => {
              const pct = totalInvested > 0 ? (asset.totalCum / totalInvested) * 100 : 0;
              return (
                <div key={asset.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{asset.name}</span>
                    <span style={{ fontSize: 12, color: asset.color, fontWeight: 700 }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg," + asset.color + "88," + asset.color + ")", borderRadius: 3, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 16 }}>PERFORMANCE PAR ACTIF (PNL%)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {assetsWithPnl.slice(0, 10).map(asset => {
              const maxPct = Math.max(...assetsWithPnl.map(a => Math.abs(a.pnlPct || 0)), 1);
              const barWidth = Math.abs(asset.pnlPct || 0) / maxPct * 100;
              const isGain = (asset.pnlPct || 0) >= 0;
              return (
                <div key={asset.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 60, fontSize: 11, fontWeight: 700, color: asset.color, flexShrink: 0 }}>{asset.ticker}</span>
                  <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: barWidth + "%", background: isGain ? "linear-gradient(90deg,#2ed57388,#2ed573)" : "linear-gradient(90deg,#ff475788,#ff4757)", borderRadius: 4 }} />
                  </div>
                  <span style={{ width: 65, fontSize: 11, fontWeight: 700, color: isGain ? "#2ed573" : "#ff4757", textAlign: "right", flexShrink: 0 }}>{fmtPct(asset.pnlPct)}</span>
                </div>
              );
            })}
            {assetsWithPnl.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13, padding: 20 }}>Prix non disponibles</div>}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 16 }}>EVOLUTION MENSUELLE {new Date().getFullYear()}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 8 }}>
            {monthlyTotals.map((val, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ height: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 8, position: "relative" }}>
                  <div style={{ width: "80%", height: Math.max(4, (val / maxMonthly) * 100), background: val > 0 ? "linear-gradient(to top," + (i === new Date().getMonth() ? "#14F195" : "#00d2ff") + "44," + (i === new Date().getMonth() ? "#14F195" : "#00d2ff") + ")" : "rgba(255,255,255,0.04)", borderRadius: "4px 4px 0 0", transition: "height 0.6s ease" }} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color: val > 0 ? (i === new Date().getMonth() ? "#14F195" : "#00d2ff") : "rgba(255,255,255,0.2)" }}>{MONTHS[i]}</div>
                <div style={{ fontSize: 10, color: val > 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)", marginTop: 2 }}>{val > 0 ? fmt(val) : "\u2014"}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 16 }}>INVESTI vs VALEUR ACTUELLE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeAssets.map(asset => {
              const price = prices[asset.ticker];
              const currentValue = price && asset.qtyCum > 0 ? price * asset.qtyCum : null;
              const maxVal = Math.max(asset.totalCum, currentValue || 0, 1);
              const investedWidth = (asset.totalCum / maxVal) * 100;
              const currentWidth = currentValue != null ? (currentValue / maxVal) * 100 : 0;
              const isGain = currentValue != null && currentValue >= asset.totalCum;

              return (
                <div key={asset.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: asset.color }}>{asset.name}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                      {fmt(asset.totalCum)} investi
                      {currentValue != null && <span style={{ color: isGain ? "#2ed573" : "#ff4757" }}> / {fmt(currentValue)} actuel</span>}
                    </span>
                  </div>
                  <div style={{ position: "relative", height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 5 }}>
                    <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: investedWidth + "%", background: "rgba(255,255,255,0.2)", borderRadius: 5 }} />
                    {currentWidth > 0 && <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: currentWidth + "%", background: isGain ? "linear-gradient(90deg,#2ed57366,#2ed573)" : "linear-gradient(90deg,#ff475766,#ff4757)", borderRadius: 5, opacity: 0.8 }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CryptoTracker() {
  const [assets, setAssets] = useState([]);
  const [entries, setEntries] = useState([]);
  const [prices, setPrices] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showInvest, setShowInvest] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAsset, setShowAsset] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  function showToast(msg, type) {
    setToast({ msg, type: type || "info" });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchPrices(assetList) {
  const list = assetList || assets;

  const tickers = list.map(a =>
    (a.ticker || "").trim().toUpperCase()
  );

  // ---------- CRYPTO ----------
  const cryptoIds = tickers
  .map(t => COINGECKO_IDS[t])
  .filter(Boolean)
  .map(id => id.trim());

  let cryptoPrices = {};

  if (cryptoIds.length > 0) {
    try {
      const url =
        "https://api.coingecko.com/api/v3/simple/price?ids=" +
        cryptoIds.join(",") +
        "&vs_currencies=eur";

      const res = await fetch(url);
      const data = await res.json();

      tickers.forEach(t => {
        const id = COINGECKO_IDS[t];
        if (id && data[id]?.eur) {
          cryptoPrices[t] = data[id].eur;
        }
      });
    } catch (e) {
      console.warn("Crypto fetch failed:", e);
    }
  }

  // ---------- STOCKS ----------
  const stockTickers = tickers.filter(t => STOCK_TICKERS[t]);

  let stockPrices = {};
  if (stockTickers.length > 0) {
    stockPrices = await fetchStockPrices(stockTickers);
  }

  // ---------- MERGE ----------
  const newPrices = {
    ...cryptoPrices,
    ...stockPrices,
  };

  console.log("PRICES LOADED:", newPrices);
    
  const now = new Date();
  setLastUpdated(
    now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0")
  );
}
  
  async function fetchStockPrices(tickers) {
  const TWELVEDATA_API_KEY = "967a2fc9b6dc4e5e82f7630acac1a241";
  const results = {};

  await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const res = await fetch(
          `https://api.twelvedata.com/price?symbol=${ticker}&apikey=${TWELVEDATA_API_KEY}`
        );
        const data = await res.json();

        if (data?.price) {
          results[ticker] = parseFloat(data.price);
        } else {
          console.warn("No stock price:", ticker, data);
        }
      } catch (e) {
        console.warn("Stock price error:", ticker, e);
      }
    })
  );

  return results;
}
  async function loadAll() {
    setLoading(true);
    const { data: assetsData } = await supabase.from("assets").select("*").order("id");
    const { data: invData } = await supabase.from("investments").select("*").order("year").order("month");

    let loadedAssets = [];
    if (assetsData && assetsData.length > 0) {
      loadedAssets = assetsData.map(a => ({ id: a.id, name: a.name, ticker: a.ticker, objective: a.objective || "", color: a.color || "#00d2ff" }));
      setAssets(loadedAssets);
    } else {
      const { data: seeded } = await supabase.from("assets").insert(DEFAULT_ASSETS).select();
      if (seeded) { loadedAssets = seeded.map(a => ({ id: a.id, name: a.name, ticker: a.ticker, objective: a.objective || "", color: a.color || "#00d2ff" })); setAssets(loadedAssets); }
    }

    if (invData) {
      setEntries(invData.map(e => ({ id: e.id, assetId: e.asset_id, month: e.month, year: e.year, investment: parseFloat(e.investment) || 0, buyPrice: parseFloat(e.buy_price) || 0, quantity: parseFloat(e.quantity) || 0, type: e.type || "invest" })));
    }
    setLoading(false);
    await fetchPrices(loadedAssets);
  }

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (assets.length === 0) return;
    const interval = setInterval(() => fetchPrices(), 60000);
    return () => clearInterval(interval);
  }, [assets]);

  async function handleDeleteEntry(id) {
    await supabase.from("investments").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }
  function handleAddEntry(entry) { setEntries(prev => [...prev, entry]); }
  function handleAddAsset(asset) { setAssets(prev => [...prev, asset]); }

  const assetData = useMemo(() => {
    return assets.map(asset => {
      const entriesCum = entries.filter(e => e.assetId === asset.id && e.year <= year).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
      const entriesYear = entries.filter(e => e.assetId === asset.id && e.year === year);
      const monthlyData = Array(12).fill(0);
      entriesYear.forEach(e => { monthlyData[e.month] += e.investment || 0; });
      const totalCum = entriesCum.reduce((s, e) => s + (e.investment || 0), 0);
      const qtyCum = entriesCum.reduce((s, e) => s + (e.quantity || 0), 0);
      const avgBuyCum = totalCum > 0 ? entriesCum.reduce((s, e) => s + (e.buyPrice || 0) * (e.investment || 0), 0) / totalCum : 0;
      return { ...asset, entriesCum, monthlyData, totalCum, qtyCum, avgBuyCum };
    }).sort((a, b) => b.totalCum - a.totalCum);
  }, [assets, entries, year]);

  const totalInvested = assetData.reduce((s, a) => s + a.totalCum, 0);
  const totalMonthly = Array(12).fill(0);
  assetData.forEach(a => a.monthlyData.forEach((v, i) => { totalMonthly[i] += v; }));
  const maxMonthly = Math.max(...totalMonthly, 1);
  const totalCurrentValue = assetData.reduce((s, a) => {
  const p = prices[a.ticker];
  return s + (p && a.qtyCum > 0 ? p * a.qtyCum : a.totalCum);
}, 0);
  const totalPnl = totalCurrentValue > 0 ? totalCurrentValue - totalInvested : null;

  const VIEWS = [
    { k: "dashboard", l: "Dashboard", icon: <SvgDash /> },
    { k: "market", l: "Marche", icon: <SvgTrend /> },
    { k: "stats", l: "Stats", icon: <SvgChart /> },
    { k: "table", l: "Tableau", icon: null },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, color: "#fff", fontFamily: "DM Sans,sans-serif" }}>
        <SvgSpinner />
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Chargement depuis Supabase...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", fontFamily: "DM Sans,sans-serif", color: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        select option { background:#1a1a2e; color:#fff; }
        input:focus, select:focus { border-color:rgba(0,210,255,0.5)!important; outline:none; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 2000, padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: toast.type === "success" ? "#2ed573" : "#00d2ff", color: "#000", animation: "toastIn 0.3s ease", whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}

      <header style={{ padding: "20px 32px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,13,26,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#00d2ff,#3a7bd5)", display: "flex", alignItems: "center", justifyContent: "center" }}><SvgWallet /></div>
            <div>
              <h1 style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 26, letterSpacing: 4, margin: 0, lineHeight: 1, color: "#fff" }}>CRYPTO TRACKER</h1>
              <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>INVESTI: {fmt(totalInvested)}</span>
                {totalPnl != null && <span style={{ fontSize: 11, fontWeight: 700, color: totalPnl >= 0 ? "#2ed573" : "#ff4757" }}>PNL: {totalPnl >= 0 ? "+" : ""}{fmt(totalPnl)}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "5px 4px" }}>
              <button onClick={() => setYear(y => y - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px 8px", display: "flex", alignItems: "center" }}><SvgLeft /></button>
              <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, letterSpacing: 2, color: "#fff", minWidth: 56, textAlign: "center" }}>{year}</span>
              <button onClick={() => setYear(y => y + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px 8px", display: "flex", alignItems: "center" }}><SvgRight /></button>
            </div>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
              {VIEWS.map(v => (
                <button key={v.k} onClick={() => setActiveView(v.k)} style={{ padding: "7px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: activeView === v.k ? "rgba(0,210,255,0.15)" : "transparent", color: activeView === v.k ? "#00d2ff" : "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 5 }}>
                  {v.icon && <span style={{ opacity: 0.7 }}>{v.icon}</span>}{v.l}
                </button>
              ))}
            </div>
            <button onClick={() => setShowHistory(true)} style={{ padding: "7px 12px", border: "1px solid rgba(247,147,26,0.3)", borderRadius: 10, background: "rgba(247,147,26,0.08)", color: "#f7931a", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <SvgHistory /> Historique
            </button>
            <button onClick={() => setShowAsset(true)} style={{ padding: "7px 12px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <SvgPlus /> Actif
            </button>
            <button onClick={() => setShowInvest(true)} style={{ padding: "7px 16px", background: "linear-gradient(135deg,#00d2ff,#3a7bd5)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, boxShadow: "0 4px 16px rgba(0,210,255,0.2)" }}>
              <SvgPlus /> Investir
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
        {activeView === "dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "TOTAL INVESTI", value: fmt(totalInvested), sub: "cumul <= " + year, accent: "#00d2ff", gradient: "linear-gradient(135deg,#00d2ff22,#3a7bd522)" },
                { label: "VALEUR PORTEFEUILLE", value: totalCurrentValue > 0 ? fmt(totalCurrentValue) : fmt(totalInvested), sub: totalCurrentValue > 0 ? "temps reel" : "prix non charges", accent: "#14F195", gradient: "linear-gradient(135deg,#14F19522,#0d996622)" },
                { label: "PNL GLOBAL", value: totalPnl != null ? fmt(totalPnl) : "\u2014", sub: totalPnl != null ? (totalPnl >= 0 ? "benefice" : "perte") : "prix non disponibles", accent: totalPnl != null ? (totalPnl >= 0 ? "#2ed573" : "#ff4757") : "#666", gradient: totalPnl != null ? (totalPnl >= 0 ? "linear-gradient(135deg,#2ed57322,#17a85922)" : "linear-gradient(135deg,#ff475722,#c0392b22)") : "linear-gradient(135deg,#66666622,#33333322)" },
                { label: "ACTIFS ACTIFS", value: String(assetData.filter(a => a.totalCum > 0).length), sub: "sur " + assets.length + " suivis", accent: "#f7931a", gradient: "linear-gradient(135deg,#f7931a22,#c9711522)" },
              ].map((kpi, i) => (
                <div key={i} style={{ background: kpi.gradient, border: "1px solid " + kpi.accent + "22", borderRadius: 16, padding: "18px 20px", animation: "fadeSlideUp 0.4s ease " + (i * 0.08) + "s both" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: kpi.accent, letterSpacing: 2, marginBottom: 8 }}>{kpi.label}</div>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 28, color: "#fff", lineHeight: 1, marginBottom: 4 }}>{kpi.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "18px 22px", marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><SvgChart /> REPARTITION MENSUELLE {year}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 6 }}>
                {totalMonthly.map((val, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ height: 70, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 6 }}>
                      <div style={{ width: "80%", height: Math.max(4, (val / maxMonthly) * 70), background: val > 0 ? "linear-gradient(to top,#00d2ff44,#00d2ff)" : "rgba(255,255,255,0.04)", borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: val > 0 ? "#00d2ff" : "rgba(255,255,255,0.2)" }}>{MONTHS[i]}</div>
                    <div style={{ fontSize: 10, color: val > 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)", marginTop: 1 }}>{val > 0 ? fmt(val) : "\u2014"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 12 }}>PORTEFEUILLE - {assets.length} ACTIFS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assetData.map((asset, i) => (
                <div key={asset.id} style={{ animation: "fadeSlideUp 0.4s ease " + (0.3 + i * 0.04) + "s both" }}>
                  <AssetCard asset={asset} year={year} onDelete={handleDeleteEntry} prices={prices} />
                </div>
              ))}
            </div>
          </>
        )}

        {activeView === "market" && <MarketView assetData={assetData} prices={prices} pricesLoading={pricesLoading} lastUpdated={lastUpdated} onRefresh={() => fetchPrices()} />}
        {activeView === "stats" && <StatsView assetData={assetData} entries={entries} prices={prices} />}

        {activeView === "table" && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "14px 20px", textAlign: "left", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: 2, position: "sticky", left: 0, backgroundColor: "#12121f" }}>ACTIF</th>
                    {MONTHS.map((m, i) => <th key={i} style={{ padding: "14px 10px", textAlign: "center", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, minWidth: 75 }}>{m}</th>)}
                    <th style={{ padding: "14px 14px", textAlign: "center", background: "rgba(0,210,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#00d2ff", fontSize: 10, fontWeight: 700 }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {assetData.map(asset => (
                    <tr key={asset.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "12px 20px", position: "sticky", left: 0, backgroundColor: "#0d0d1a", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: asset.color }} />
                          <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 14, letterSpacing: 1.5, color: "#fff" }}>{asset.name}</span>
                          {asset.objective && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: asset.color + "22", color: asset.color }}>{asset.objective}</span>}
                        </div>
                      </td>
                      {asset.monthlyData.map((val, mi) => (
                        <td key={mi} style={{ padding: "12px 10px", textAlign: "center", color: val > 0 ? "#fff" : "rgba(255,255,255,0.12)", fontSize: 12, background: val > 0 ? asset.color + "08" : "transparent" }}>{val > 0 ? fmt(val) : "\u2014"}</td>
                      ))}
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: asset.totalCum > 0 ? "#fff" : "rgba(255,255,255,0.12)", background: "rgba(0,210,255,0.04)", fontFamily: "Bebas Neue,sans-serif", fontSize: 15 }}>{asset.totalCum > 0 ? fmt(asset.totalCum) : "\u2014"}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "2px solid rgba(0,210,255,0.2)", background: "rgba(0,210,255,0.04)" }}>
                    <td style={{ padding: "14px 20px", fontWeight: 700, fontFamily: "Bebas Neue,sans-serif", fontSize: 15, letterSpacing: 2, color: "#00d2ff", position: "sticky", left: 0, backgroundColor: "#0f1020" }}>TOTAL</td>
                    {totalMonthly.map((val, i) => <td key={i} style={{ padding: "14px 10px", textAlign: "center", fontWeight: 700, color: val > 0 ? "#00d2ff" : "rgba(255,255,255,0.12)", fontSize: 12 }}>{val > 0 ? fmt(val) : "\u2014"}</td>)}
                    <td style={{ padding: "14px 14px", textAlign: "center", fontFamily: "Bebas Neue,sans-serif", fontSize: 18, color: "#00d2ff", fontWeight: 700 }}>{fmt(totalInvested)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <InvestForm isOpen={showInvest} onClose={() => setShowInvest(false)} assets={assets} year={year} onAdd={handleAddEntry} />
      <HistoryForm isOpen={showHistory} onClose={() => setShowHistory(false)} assets={assets} onAdd={handleAddEntry} />
      <AddAssetModal isOpen={showAsset} onClose={() => setShowAsset(false)} onAdd={handleAddAsset} />
    </div>
  );
}
