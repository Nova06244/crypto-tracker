import { useMemo, useState, useEffect, useRef } from "react";

const INITIAL_ASSETS = [
  { id: 1, name: "SOLANA", ticker: "SOL", objective: "X10", color: "#14F195" },
  { id: 2, name: "ETHEREUM", ticker: "ETH", objective: "X4", color: "#627EEA" },
  { id: 3, name: "BITCOIN", ticker: "BTC", objective: "X2", color: "#F7931A" },
  { id: 4, name: "XRP", ticker: "XRP", objective: "", color: "#23292F" },
  { id: 5, name: "DOGECOIN", ticker: "DOGE", objective: "", color: "#C2A633" },
  { id: 6, name: "SHIBA INU", ticker: "SHIB", objective: "", color: "#E3420A" },
  { id: 7, name: "PEPE", ticker: "PEPE", objective: "", color: "#4D8C3B" },
  { id: 8, name: "SUI", ticker: "SUI", objective: "", color: "#4DA2FF" },
  { id: 9, name: "CARDANO", ticker: "ADA", objective: "", color: "#0033AD" },
  { id: 10, name: "CENTRIFUGE", ticker: "CFG", objective: "", color: "#FFC012" },
  { id: 11, name: "CHAINLINK", ticker: "LINK", objective: "", color: "#2A5ADA" },
  { id: 12, name: "POLKADOT", ticker: "DOT", objective: "", color: "#E6007A" },
  { id: 13, name: "BNB", ticker: "BNB", objective: "", color: "#F3BA2F" },
];

const MONTHS = ["JAN", "FEV", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOUT", "SEPT", "OCT", "NOV", "DEC"];
const STORAGE_KEY = "crypto-tracker-data";

const fmt = function(val) {
  if (val == null || val === "") return "\u2014";
  const n = parseFloat(val);
  if (isNaN(n)) return "\u2014";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);
};

function toNum(val) {
  if (val == null) return 0;
  const s = String(val).trim().replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function uid() { return Date.now() + "_" + Math.random().toString(36).slice(2, 8); }

async function saveData(assets, entries) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify({ assets, entries, savedAt: Date.now() }));
  } catch (e) { console.warn("Save failed:", e); }
}

async function loadData() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    if (result && result.value) return JSON.parse(result.value);
  } catch (e) { console.warn("Load failed:", e); }
  return null;
}

const IconPlus = function() {
  return React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("line", { x1: 8, y1: 2, x2: 8, y2: 14 }),
    React.createElement("line", { x1: 2, y1: 8, x2: 14, y2: 8 })
  );
};

const IconTrash = function() {
  return React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("polyline", { points: "3 6 5 6 21 6" }),
    React.createElement("path", { d: "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" })
  );
};

const IconChevron = function(props) {
  return React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 2, style: { transform: props.dir === "left" ? "rotate(180deg)" : "none" } },
    React.createElement("polyline", { points: "6 3 11 8 6 13" })
  );
};

const IconChart = function() {
  return React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, style: { display: "inline", verticalAlign: "middle", marginRight: 6 } },
    React.createElement("line", { x1: 18, y1: 20, x2: 18, y2: 10 }),
    React.createElement("line", { x1: 12, y1: 20, x2: 12, y2: 4 }),
    React.createElement("line", { x1: 6, y1: 20, x2: 6, y2: 14 })
  );
};

const IconWallet = function() {
  return React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 },
    React.createElement("path", { d: "M21 12V7H5a2 2 0 010-4h14v4" }),
    React.createElement("path", { d: "M3 5v14a2 2 0 002 2h16v-5" }),
    React.createElement("path", { d: "M18 12a2 2 0 100 4h4v-4h-4z" })
  );
};

const IconHistory = function() {
  return React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("polyline", { points: "12 8 12 12 14 14" }),
    React.createElement("path", { d: "M3.05 11a9 9 0 1 0 .5-4M3 3v5h5" })
  );
};

const inputStyle = {
  width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff",
  fontSize: 14, fontFamily: "DM Sans,sans-serif", outline: "none", boxSizing: "border-box",
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)",
  letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: "DM Sans,sans-serif",
};

function Modal(props) {
  if (!props.isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={props.onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "relative", zIndex: 1, background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", animation: "modalIn 0.25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 22, color: "#fff", letterSpacing: 2, margin: 0 }}>{props.title}</h3>
          <button onClick={props.onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>x</button>
        </div>
        {props.children}
      </div>
    </div>
  );
}

function InvestForm(props) {
  const [assetId, setAssetId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth());
  const [entryYear, setEntryYear] = useState(props.year);
  const [investment, setInvestment] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(function() { if (props.isOpen) setEntryYear(props.year); }, [props.isOpen, props.year]);

  const handleSubmit = function() {
    if (!assetId || !investment) return;
    props.onAdd({ id: uid(), type: "invest", assetId: parseInt(assetId, 10), month: month, year: entryYear, investment: parseFloat(investment) || 0, buyPrice: parseFloat(buyPrice) || 0, quantity: parseFloat(quantity) || 0 });
    setAssetId(""); setInvestment(""); setBuyPrice(""); setQuantity("");
    props.onClose();
  };

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="NOUVEL INVESTISSEMENT">
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Actif</label>
            <select value={assetId} onChange={function(e) { setAssetId(e.target.value); }} style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}>
              <option value="">Choisir...</option>
              {props.assets.map(function(a) { return <option key={a.id} value={a.id} style={{ background: "#1a1a2e" }}>{a.name} ({a.ticker})</option>; })}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Mois</label>
            <select value={month} onChange={function(e) { setMonth(parseInt(e.target.value, 10)); }} style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}>
              {MONTHS.map(function(m, i) { return <option key={i} value={i} style={{ background: "#1a1a2e" }}>{m}</option>; })}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Annee</label>
            <input type="number" value={entryYear} onChange={function(e) { setEntryYear(parseInt(e.target.value, 10) || 2025); }} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Investissement (EUR)</label><input type="number" value={investment} onChange={function(e) { setInvestment(e.target.value); }} placeholder="100.00" style={inputStyle} /></div>
          <div><label style={labelStyle}>Prix achat (EUR)</label><input type="number" value={buyPrice} onChange={function(e) { setBuyPrice(e.target.value); }} placeholder="0.00" style={inputStyle} step="any" /></div>
        </div>
        <div><label style={labelStyle}>Quantite obtenue</label><input type="number" value={quantity} onChange={function(e) { setQuantity(e.target.value); }} placeholder="0" style={inputStyle} step="any" /></div>
        <button onClick={handleSubmit} style={{ marginTop: 4, padding: "12px 0", width: "100%", background: "linear-gradient(135deg,#00d2ff,#3a7bd5)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer", fontFamily: "DM Sans,sans-serif", textTransform: "uppercase" }}>
          Ajouter
        </button>
      </div>
    </Modal>
  );
}

function HistoryForm(props) {
  const [assetId, setAssetId] = useState("");
  const [month, setMonth] = useState(0);
  const [entryYear, setEntryYear] = useState(2024);
  const [investment, setInvestment] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = function() {
    if (!assetId || !investment) return;
    props.onAdd({ id: uid(), type: "history", assetId: parseInt(assetId, 10), month: month, year: entryYear, investment: parseFloat(investment) || 0, buyPrice: parseFloat(buyPrice) || 0, quantity: parseFloat(quantity) || 0 });
    setAssetId(""); setInvestment(""); setBuyPrice(""); setQuantity("");
    props.onClose();
  };

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="AJOUT HISTORIQUE">
      <div style={{ background: "rgba(247,147,26,0.08)", border: "1px solid rgba(247,147,26,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "rgba(247,147,26,0.9)" }}>
        Saisie d'un investissement deja realise pour rattraper ton historique
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Actif</label>
            <select value={assetId} onChange={function(e) { setAssetId(e.target.value); }} style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}>
              <option value="">Choisir...</option>
              {props.assets.map(function(a) { return <option key={a.id} value={a.id} style={{ background: "#1a1a2e" }}>{a.name} ({a.ticker})</option>; })}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Mois</label>
            <select value={month} onChange={function(e) { setMonth(parseInt(e.target.value, 10)); }} style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}>
              {MONTHS.map(function(m, i) { return <option key={i} value={i} style={{ background: "#1a1a2e" }}>{m}</option>; })}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Annee</label>
            <input type="number" value={entryYear} onChange={function(e) { setEntryYear(parseInt(e.target.value, 10) || 2024); }} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Investissement (EUR)</label><input type="number" value={investment} onChange={function(e) { setInvestment(e.target.value); }} placeholder="100.00" style={inputStyle} /></div>
          <div><label style={labelStyle}>Prix achat moyen (EUR)</label><input type="number" value={buyPrice} onChange={function(e) { setBuyPrice(e.target.value); }} placeholder="0.00" style={inputStyle} step="any" /></div>
        </div>
        <div><label style={labelStyle}>Quantite obtenue</label><input type="number" value={quantity} onChange={function(e) { setQuantity(e.target.value); }} placeholder="0" style={inputStyle} step="any" /></div>
        <button onClick={handleSubmit} style={{ marginTop: 4, padding: "12px 0", width: "100%", background: "linear-gradient(135deg,#f7931a,#e67e22)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer", fontFamily: "DM Sans,sans-serif", textTransform: "uppercase" }}>
          Enregistrer l'historique
        </button>
      </div>
    </Modal>
  );
}

function AddAssetModal(props) {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [objective, setObjective] = useState("");
  const [color, setColor] = useState("#00d2ff");

  const handleSubmit = function() {
    if (!name || !ticker) return;
    props.onAdd({ name: name.toUpperCase(), ticker: ticker.toUpperCase(), objective: objective, color: color });
    setName(""); setTicker(""); setObjective(""); setColor("#00d2ff");
    props.onClose();
  };

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="AJOUTER UN ACTIF">
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Nom</label><input value={name} onChange={function(e) { setName(e.target.value); }} placeholder="Avalanche" style={inputStyle} /></div>
          <div><label style={labelStyle}>Ticker</label><input value={ticker} onChange={function(e) { setTicker(e.target.value); }} placeholder="AVAX" style={inputStyle} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={labelStyle}>Objectif</label><input value={objective} onChange={function(e) { setObjective(e.target.value); }} placeholder="X5" style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Couleur</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="color" value={color} onChange={function(e) { setColor(e.target.value); }} style={{ width: 40, height: 38, border: "none", borderRadius: 8, cursor: "pointer", background: "transparent" }} />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{color}</span>
            </div>
          </div>
        </div>
        <button onClick={handleSubmit} style={{ marginTop: 4, padding: "12px 0", width: "100%", background: "linear-gradient(135deg,#14F195,#3a7bd5)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer", fontFamily: "DM Sans,sans-serif", textTransform: "uppercase" }}>
          Ajouter l'actif
        </button>
      </div>
    </Modal>
  );
}

function EntryRow(props) {
  const e = props.entry;
  const asset = props.asset;
  const isHistory = e.type === "history";
  const borderColor = isHistory ? "rgba(247,147,26,0.15)" : "rgba(0,210,255,0.12)";
  const bg = isHistory ? "rgba(247,147,26,0.06)" : "rgba(0,210,255,0.04)";
  const labelColor = isHistory ? "#f7931a" : "#00d2ff";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr 36px", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 8, background: bg, border: "1px solid " + borderColor, fontSize: 13 }}>
      <span style={{ fontWeight: 700, color: labelColor, fontSize: 11, letterSpacing: 1 }}>{MONTHS[e.month]} {e.year}</span>
      <span style={{ color: "#fff" }}>{fmt(e.investment)}</span>
      <span style={{ color: "rgba(255,255,255,0.5)" }}>{e.buyPrice > 0 ? "@ " + fmt(e.buyPrice) : "\u2014"}</span>
      <span style={{ color: "rgba(255,255,255,0.5)" }}>{e.quantity > 0 ? e.quantity.toLocaleString("fr-FR") + " u." : "\u2014"}</span>
      <button onClick={function() { props.onDelete(e.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseOver={function(ev) { ev.currentTarget.style.color = "#ff4757"; ev.currentTarget.style.background = "rgba(255,71,87,0.1)"; }}
        onMouseOut={function(ev) { ev.currentTarget.style.color = "rgba(255,255,255,0.2)"; ev.currentTarget.style.background = "none"; }}>
        <IconTrash />
      </button>
    </div>
  );
}

function AssetCard(props) {
  const [expanded, setExpanded] = useState(false);
  const asset = props.asset;
  const totalInv = asset.totalCum;
  const totalQty = asset.qtyCum;
  const avgBuy = asset.avgBuyCum;
  const historyEntries = asset.entriesCum.filter(function(e) { return e.type === "history"; });
  const investEntries = asset.entriesCum.filter(function(e) { return e.type === "invest"; });

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid " + asset.color + "22", borderRadius: 14, overflow: "hidden", transition: "all 0.3s" }}
      onMouseOver={function(e) { e.currentTarget.style.borderColor = asset.color + "55"; }}
      onMouseOut={function(e) { e.currentTarget.style.borderColor = asset.color + "22"; }}>
      <div onClick={function() { setExpanded(!expanded); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer", background: expanded ? "rgba(255,255,255,0.02)" : "transparent" }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg," + asset.color + "33," + asset.color + "11)", border: "1px solid " + asset.color + "44", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Bebas Neue,sans-serif", fontSize: 15, color: asset.color, letterSpacing: 1, flexShrink: 0 }}>{asset.ticker}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 17, color: "#fff", letterSpacing: 1.5 }}>{asset.name}</span>
            {asset.objective && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "2px 8px", borderRadius: 6, background: asset.color + "22", color: asset.color }}>{asset.objective}</span>}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2, display: "flex", gap: 10 }}>
            <span>{investEntries.length} invest.</span>
            {historyEntries.length > 0 && <span style={{ color: "#f7931a" }}>{historyEntries.length} historique</span>}
            <span>{fmt(totalInv)}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, color: "#fff" }}>{fmt(totalInv)}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{totalQty > 0 ? totalQty.toLocaleString("fr-FR") + " jetons" : "\u2014"}</div>
        </div>
        <div style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s", color: "rgba(255,255,255,0.3)" }}><IconChevron dir="right" /></div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", animation: "fadeIn 0.3s" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "PRU moyen", value: avgBuy > 0 ? fmt(avgBuy) : "\u2014" },
              { label: "Quantite totale", value: totalQty > 0 ? totalQty.toLocaleString("fr-FR") : "\u2014" },
              { label: "Total investi", value: fmt(totalInv) },
            ].map(function(s, i) {
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 16, color: "#fff" }}>{s.value}</div>
                </div>
              );
            })}
          </div>

          {historyEntries.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#f7931a", letterSpacing: 1.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f7931a", display: "inline-block" }} />
                HISTORIQUE
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {historyEntries.map(function(e) { return <EntryRow key={e.id} entry={e} asset={asset} onDelete={props.onDelete} />; })}
              </div>
            </div>
          )}

          {investEntries.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#00d2ff", letterSpacing: 1.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d2ff", display: "inline-block" }} />
                INVESTISSEMENTS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {investEntries.map(function(e) { return <EntryRow key={e.id} entry={e} asset={asset} onDelete={props.onDelete} />; })}
              </div>
            </div>
          )}

          {asset.entriesCum.length === 0 && (
            <div style={{ padding: 16, textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Aucune entree</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CryptoTracker() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [entries, setEntries] = useState([]);
  const [year, setYear] = useState(2025);
  const [showAddInv, setShowAddInv] = useState(false);
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [nextId, setNextId] = useState(14);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = function(msg, type) {
    setToast({ msg: msg, type: type || "info" });
    setTimeout(function() { setToast(null); }, 3000);
  };

  useEffect(function() {
    (async function() {
      const saved = await loadData();
      if (saved) {
        if (saved.assets && saved.assets.length) setAssets(saved.assets);
        if (saved.entries && saved.entries.length) setEntries(saved.entries);
        showToast((saved.entries ? saved.entries.length : 0) + " entrees chargees", "success");
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(function() {
    if (loaded) saveData(assets, entries);
  }, [assets, entries, loaded]);

  const assetData = useMemo(function() {
    return assets.map(function(asset) {
      const entriesCum = entries.filter(function(e) { return e.assetId === asset.id && e.year <= year; })
        .sort(function(a, b) { return a.year !== b.year ? a.year - b.year : a.month - b.month; });
      const entriesYear = entries.filter(function(e) { return e.assetId === asset.id && e.year === year; })
        .sort(function(a, b) { return a.month - b.month; });
      const monthlyData = Array(12).fill(0);
      entriesYear.forEach(function(e) { monthlyData[e.month] += e.investment || 0; });
      const totalCum = entriesCum.reduce(function(s, e) { return s + (e.investment || 0); }, 0);
      const qtyCum = entriesCum.reduce(function(s, e) { return s + (e.quantity || 0); }, 0);
      const avgBuyCum = entriesCum.length > 0
        ? entriesCum.reduce(function(s, e) { return s + (e.buyPrice || 0) * (e.investment || 0); }, 0) / (totalCum || 1) : 0;
      return Object.assign({}, asset, { entriesCum: entriesCum, entriesYear: entriesYear, monthlyData: monthlyData, totalCum: totalCum, qtyCum: qtyCum, avgBuyCum: avgBuyCum });
    }).sort(function(a, b) { return b.totalCum - a.totalCum; });
  }, [assets, entries, year]);

  const totalInvested = assetData.reduce(function(s, a) { return s + a.totalCum; }, 0);
  const totalMonthly = Array(12).fill(0);
  assetData.forEach(function(a) { a.monthlyData.forEach(function(v, i) { totalMonthly[i] += v; }); });
  const maxMonthly = Math.max.apply(null, totalMonthly.concat([1]));
  const activeCount = assetData.filter(function(a) { return a.totalCum > 0; }).length;

  const handleAddEntry = function(data) { setEntries(function(prev) { return prev.concat([data]); }); };
  const handleDeleteEntry = function(id) { setEntries(function(prev) { return prev.filter(function(e) { return e.id !== id; }); }); };
  const handleAddAsset = function(data) {
    setAssets(function(prev) { return prev.concat([Object.assign({ id: nextId }, data)]); });
    setNextId(function(n) { return n + 1; });
  };

  const kpis = [
    { label: "TOTAL INVESTI", value: fmt(totalInvested), sub: "cumul <= " + year, accent: "#00d2ff", gradient: "linear-gradient(135deg,#00d2ff22,#3a7bd522)" },
    { label: "ACTIFS ACTIFS", value: String(activeCount), sub: "sur " + assets.length + " suivis", accent: "#14F195", gradient: "linear-gradient(135deg,#14F19522,#0d996622)" },
    { label: "INVESTISSEMENTS", value: String(entries.filter(function(e) { return e.type === "invest"; }).length), sub: "nouveaux", accent: "#00d2ff", gradient: "linear-gradient(135deg,#00d2ff22,#3a7bd522)" },
    { label: "HISTORIQUE", value: String(entries.filter(function(e) { return e.type === "history"; }).length), sub: "entrees passees", accent: "#f7931a", gradient: "linear-gradient(135deg,#f7931a22,#c9711522)" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", fontFamily: "DM Sans,sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        select option { background:#1a1a2e; color:#fff; }
        input:focus, select:focus { border-color:rgba(0,210,255,0.5)!important; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
      `}</style>
      <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, background: "radial-gradient(circle,rgba(0,210,255,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -300, left: -200, width: 700, height: 700, background: "radial-gradient(circle,rgba(20,241,149,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />

      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 2000, padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: toast.type === "success" ? "#2ed573" : "#00d2ff", color: "#000", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", animation: "toastIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      <header style={{ padding: "24px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,13,26,0.8)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#00d2ff,#3a7bd5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,210,255,0.2)" }}><IconWallet /></div>
            <div>
              <h1 style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 28, letterSpacing: 4, margin: 0, lineHeight: 1, background: "linear-gradient(90deg,#fff,rgba(255,255,255,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>INVESTISSEMENT CRYPTO</h1>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginTop: 2 }}>PORTFOLIO TRACKER</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "6px 4px" }}>
              <button onClick={function() { setYear(function(y) { return y - 1; }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center" }}><IconChevron dir="left" /></button>
              <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, letterSpacing: 2, color: "#fff", minWidth: 60, textAlign: "center" }}>{year}</span>
              <button onClick={function() { setYear(function(y) { return y + 1; }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center" }}><IconChevron dir="right" /></button>
            </div>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
              {[{ k: "dashboard", l: "Dashboard" }, { k: "table", l: "Tableau" }].map(function(v) {
                return <button key={v.k} onClick={function() { setActiveView(v.k); }} style={{ padding: "8px 16px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "DM Sans,sans-serif", background: activeView === v.k ? "rgba(0,210,255,0.15)" : "transparent", color: activeView === v.k ? "#00d2ff" : "rgba(255,255,255,0.4)", transition: "all 0.2s" }}>{v.l}</button>;
              })}
            </div>
            <button onClick={function() { setShowAddHistory(true); }} style={{ padding: "8px 14px", border: "1px solid rgba(247,147,26,0.3)", borderRadius: 10, background: "rgba(247,147,26,0.08)", color: "#f7931a", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "DM Sans,sans-serif" }}><IconHistory /> Historique</button>
            <button onClick={function() { setShowAddAsset(true); }} style={{ padding: "8px 14px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "DM Sans,sans-serif" }}><IconPlus /> Actif</button>
            <button onClick={function() { setShowAddInv(true); }} style={{ padding: "8px 18px", background: "linear-gradient(135deg,#00d2ff,#3a7bd5)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6, fontFamily: "DM Sans,sans-serif", boxShadow: "0 4px 16px rgba(0,210,255,0.2)" }}><IconPlus /> Investir</button>
          </div>
        </div>
      </header>

      <main style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {kpis.map(function(kpi, i) {
            return (
              <div key={i} style={{ background: kpi.gradient, border: "1px solid " + kpi.accent + "22", borderRadius: 16, padding: "20px 22px", animation: "fadeSlideUp 0.4s ease " + (i * 0.08) + "s both" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: kpi.accent, letterSpacing: 2, marginBottom: 10 }}>{kpi.label}</div>
                <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 32, color: "#fff", lineHeight: 1, marginBottom: 4 }}>{kpi.value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{kpi.sub}</div>
              </div>
            );
          })}
        </div>

        {activeView === "dashboard" ? (
          <>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px", marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><IconChart /> REPARTITION MENSUELLE {year}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 8 }}>
                {totalMonthly.map(function(val, i) {
                  return (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 8 }}>
                        <div style={{ width: "100%", maxWidth: 40, height: maxMonthly > 0 ? Math.max(4, (val / maxMonthly) * 80) : 4, background: val > 0 ? "linear-gradient(to top,#00d2ff44,#00d2ff)" : "rgba(255,255,255,0.04)", borderRadius: 6, transition: "height 0.5s ease" }} />
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: val > 0 ? "#00d2ff" : "rgba(255,255,255,0.2)", letterSpacing: 1 }}>{MONTHS[i]}</div>
                      <div style={{ fontSize: 11, color: val > 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)", marginTop: 2 }}>{val > 0 ? fmt(val) : "\u2014"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 14 }}>PORTEFEUILLE - {assets.length} ACTIFS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assetData.map(function(asset, i) {
                return (
                  <div key={asset.id} style={{ animation: "fadeSlideUp 0.4s ease " + (0.4 + i * 0.05) + "s both" }}>
                    <AssetCard asset={asset} year={year} onDelete={handleDeleteEntry} />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "14px 20px", textAlign: "left", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: 2, position: "sticky", left: 0, zIndex: 2, backgroundColor: "#12121f" }}>ACTIF</th>
                    {MONTHS.map(function(m, i) { return <th key={i} style={{ padding: "14px 12px", textAlign: "center", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: 2, minWidth: 80 }}>{m}</th>; })}
                    <th style={{ padding: "14px 16px", textAlign: "center", background: "rgba(0,210,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#00d2ff", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>TOTAL &lt;= {year}</th>
                  </tr>
                </thead>
                <tbody>
                  {assetData.map(function(asset) {
                    return (
                      <tr key={asset.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "12px 20px", position: "sticky", left: 0, zIndex: 1, backgroundColor: "#0d0d1a", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: asset.color, boxShadow: "0 0 8px " + asset.color + "66" }} />
                            <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 14, letterSpacing: 1.5, color: "#fff" }}>{asset.name}</span>
                            {asset.objective && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: asset.color + "22", color: asset.color }}>{asset.objective}</span>}
                          </div>
                        </td>
                        {asset.monthlyData.map(function(val, mi) {
                          return <td key={mi} style={{ padding: "12px 12px", textAlign: "center", color: val > 0 ? "#fff" : "rgba(255,255,255,0.12)", fontSize: 12, background: val > 0 ? asset.color + "08" : "transparent" }}>{val > 0 ? fmt(val) : "\u2014"}</td>;
                        })}
                        <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: asset.totalCum > 0 ? "#fff" : "rgba(255,255,255,0.12)", background: "rgba(0,210,255,0.04)", fontFamily: "Bebas Neue,sans-serif", fontSize: 15 }}>{asset.totalCum > 0 ? fmt(asset.totalCum) : "\u2014"}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: "2px solid rgba(0,210,255,0.2)", background: "rgba(0,210,255,0.04)" }}>
                    <td style={{ padding: "14px 20px", fontWeight: 700, fontFamily: "Bebas Neue,sans-serif", fontSize: 15, letterSpacing: 2, color: "#00d2ff", position: "sticky", left: 0, zIndex: 1, backgroundColor: "#0f1020" }}>TOTAL</td>
                    {totalMonthly.map(function(val, i) { return <td key={i} style={{ padding: "14px 12px", textAlign: "center", fontWeight: 700, color: val > 0 ? "#00d2ff" : "rgba(255,255,255,0.12)", fontSize: 12 }}>{val > 0 ? fmt(val) : "\u2014"}</td>; })}
                    <td style={{ padding: "14px 16px", textAlign: "center", fontFamily: "Bebas Neue,sans-serif", fontSize: 18, color: "#00d2ff", fontWeight: 700 }}>{fmt(totalInvested)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <InvestForm isOpen={showAddInv} onClose={function() { setShowAddInv(false); }} assets={assets} year={year} onAdd={handleAddEntry} />
      <HistoryForm isOpen={showAddHistory} onClose={function() { setShowAddHistory(false); }} assets={assets} onAdd={handleAddEntry} />
      <AddAssetModal isOpen={showAddAsset} onClose={function() { setShowAddAsset(false); }} onAdd={handleAddAsset} />
    </div>
  );
}
