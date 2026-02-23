import React, { useMemo, useState } from "react";

const INITIAL_ASSETS = [
  { id: 1, name: "SOLANA", ticker: "SOL", objective: "X10", color: "#14F195" },
  { id: 2, name: "ETHEREUM", ticker: "ETH", objective: "X4", color: "#627EEA" },
  { id: 3, name: "BITCOIN", ticker: "BTC", objective: "X2", color: "#F7931A" },
  { id: 4, name: "XRP", ticker: "XRP", color: "#23292F" },
  { id: 5, name: "DOGECOIN", ticker: "DOGE", color: "#C2A633" },
  { id: 6, name: "SHIBA INU", ticker: "SHIB", color: "#E3420A" },
  { id: 7, name: "PEPE", ticker: "PEPE", color: "#4D8C3B" },
  { id: 8, name: "SUI", ticker: "SUI", color: "#4DA2FF" },
  { id: 9, name: "CARDANO", ticker: "ADA", color: "#0033AD" },
  { id: 10, name: "CENTRIFUGE", ticker: "CFG", color: "#FFC012" },
  { id: 11, name: "CHAINLINK", ticker: "LINK", color: "#2A5ADA" },
  { id: 12, name: "POLKADOT", ticker: "DOT", color: "#E6007A" },
  { id: 13, name: "BNB", ticker: "BNB", color: "#F3BA2F" },
];

const MONTHS = ["JAN", "FÉV", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];

const formatEUR = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const n = parseFloat(val);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);
};

// Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="2" x2="8" y2="14" />
    <line x1="2" y1="8" x2="14" y2="8" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const ChevronIcon = ({ dir }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}
  >
    <polyline points="6 3 11 8 6 13" />
  </svg>
);

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 28,
          minWidth: 380,
          maxWidth: 520,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        <h3
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22,
            color: "#fff",
            letterSpacing: 2,
            marginBottom: 20,
          }}
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

function AddInvestmentModal({ isOpen, onClose, assets, year, onAdd }) {
  const [assetId, setAssetId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth());
  const [investment, setInvestment] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
    fontFamily: "'DM Sans', sans-serif",
  };

  const handleSubmit = () => {
    if (!assetId || !investment) return;
    onAdd({
      assetId: Number(assetId),
      month,
      year,
      investment: parseFloat(investment) || 0,
      buyPrice: 0,
      quantity: 0,
      stopLoss: 0,
      takeProfit: 0,
    });
    setAssetId("");
    setInvestment("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="NOUVEL INVESTISSEMENT">
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Actif</label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
            >
              <option value="">Choisir…</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id} style={{ background: "#1a1a2e" }}>
                  {a.name} ({a.ticker})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Mois</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i} style={{ background: "#1a1a2e" }}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Investissement (€)</label>
          <input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            placeholder="100.00"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            marginTop: 8,
            padding: "12px 0",
            width: "100%",
            background: "linear-gradient(135deg, #00d2ff, #3a7bd5)",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.5,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            textTransform: "uppercase",
          }}
        >
          Ajouter l'investissement
        </button>
      </div>
    </Modal>
  );
}

function AssetCard({ asset, entries, year, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const totalInvested = entries.reduce((s, e) => s + (e.investment || 0), 0);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${asset.color}22`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${asset.color}33, ${asset.color}11)`,
            border: `1px solid ${asset.color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 15,
            color: asset.color,
            letterSpacing: 1,
            flexShrink: 0,
          }}
        >
          {asset.ticker}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 17,
                color: "#fff",
                letterSpacing: 1.5,
              }}
            >
              {asset.name}
            </span>
            {asset.objective && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: asset.color + "22",
                  color: asset.color,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {asset.objective}
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'DM Sans', sans-serif",
              marginTop: 2,
            }}
          >
            {entries.length} investissement{entries.length > 1 ? "s" : ""} • {formatEUR(totalInvested)}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#fff" }}>
            {formatEUR(totalInvested)}
          </div>
        </div>

        <div style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s", color: "rgba(255,255,255,0.3)" }}>
          <ChevronIcon dir="right" />
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px" }}>
          {entries.length === 0 ? (
            <div style={{ padding: 12, color: "rgba(255,255,255,0.25)" }}>Aucun investissement enregistré</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {entries.map((e, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr 36px",
                    gap: 8,
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.02)",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span style={{ fontWeight: 700, color: asset.color, fontSize: 11, letterSpacing: 1 }}>
                    {MONTHS[e.month]} {e.year}
                  </span>
                  <span style={{ color: "#fff" }}>{formatEUR(e.investment)}</span>
                  <button
                    onClick={() => onDelete(asset.id, i)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.25)",
                      padding: 4,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Supprimer"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [entries, setEntries] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const assetData = useMemo(() => {
    return assets
      .map((asset) => {
        const assetEntries = entries
          .filter((e) => e.assetId === asset.id && e.year === year)
          .sort((a, b) => a.month - b.month);

        const monthlyData = Array(12).fill(0);
        assetEntries.forEach((e) => {
          monthlyData[e.month] += e.investment || 0;
        });

        const totalInvested = assetEntries.reduce((s, e) => s + (e.investment || 0), 0);
        return { ...asset, entries: assetEntries, monthlyData, totalInvested };
      })
      .sort((a, b) => b.totalInvested - a.totalInvested);
  }, [assets, entries, year]);

  const totalInvested = assetData.reduce((s, a) => s + a.totalInvested, 0);

  const handleAddInvestment = (data) => setEntries((prev) => [...prev, data]);

  const handleDeleteEntry = (assetId, entryIndex) => {
    const assetEntries = entries.filter((e) => e.assetId === assetId && e.year === year).sort((a, b) => a.month - b.month);
    const entryToDelete = assetEntries[entryIndex];
    if (!entryToDelete) return;

    setEntries((prev) => {
      const idx = prev.indexOf(entryToDelete);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d1a",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
      }}
    >
      <header
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky",
          top: 0,
          background: "rgba(13,13,26,0.85)",
          backdropFilter: "blur(16px)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, fontSize: 22 }}>
          INVESTISSEMENT CRYPTO
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.35)" }}>
            PORTFOLIO TRACKER
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setYear((y) => y - 1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
            <ChevronIcon dir="left" />
          </button>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2 }}>{year}</span>
          <button onClick={() => setYear((y) => y + 1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
            <ChevronIcon dir="right" />
          </button>

          <button
            onClick={() => setActiveView((v) => (v === "dashboard" ? "table" : "dashboard"))}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.75)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {activeView === "dashboard" ? "Tableau" : "Dashboard"}
          </button>

          <button
            onClick={() => setShowAddInvestment(true)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #00d2ff, #3a7bd5)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <PlusIcon /> Investir
          </button>
        </div>
      </header>

      <main style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 18, color: "rgba(255,255,255,0.6)" }}>
          Total investi : <strong style={{ color: "#fff" }}>{formatEUR(totalInvested)}</strong>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {assetData.map((asset) => (
            <AssetCard key={asset.id} asset={asset} entries={asset.entries} year={year} onDelete={handleDeleteEntry} />
          ))}
        </div>
      </main>

      <AddInvestmentModal
        isOpen={showAddInvestment}
        onClose={() => setShowAddInvestment(false)}
        assets={assets}
        year={year}
        onAdd={handleAddInvestment}
      />
    </div>
  );
}
