import { useState, useEffect, useRef } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Copy,
  Check,
  X,
  Camera,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const token = {
  bg: "#0A0B0D",
  bgElevated: "#131519",
  card: "#16181D",
  cardAlt: "#1C1F25",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.12)",
  textPrimary: "#F3F2ED",
  textSecondary: "#8B8D95",
  textTertiary: "#5C5E66",
  gold: "#C9A15C",
  goldSoft: "rgba(201,161,92,0.14)",
  green: "#4ADE80",
  greenSoft: "rgba(74,222,128,0.12)",
  red: "#F0665E",
  redSoft: "rgba(240,102,94,0.12)",
};

const perfSeries = [
  { time: "10:00", value: 200.0 },
  { time: "12:00", value: 205.4 },
  { time: "14:00", value: 202.8 },
  { time: "16:00", value: 214.6 },
  { time: "18:00", value: 230.09 },
];

const trades = [
  {
    day: "Today",
    items: [
      { id: 1, pair: "BTC/USDT", pl: 3.25, pct: 1.62, time: "18:42" },
      { id: 2, pair: "ETH/USDT", pl: 1.8, pct: 0.94, time: "16:10" },
      { id: 3, pair: "BTC/USDT", pl: -0.75, pct: -0.31, time: "13:55" },
      { id: 4, pair: "SOL/USDT", pl: 2.4, pct: 1.18, time: "11:20" },
    ],
  },
  {
    day: "Yesterday",
    items: [
      { id: 5, pair: "BTC/USDT", pl: 4.1, pct: 2.05, time: "19:02" },
      { id: 6, pair: "ETH/USDT", pl: 1.2, pct: 0.63, time: "10:47" },
    ],
  },
];

function money(n, opts = {}) {
  const sign = n > 0 && opts.signed ? "+" : n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Telegram WebApp hookup — UI/presentation only.
// This tells Telegram the app is ready and lets it expand to full height.
// It does NOT authenticate the user or talk to any backend; there is none.
// Safe no-op when opened in a normal browser (e.g. during development).
// ---------------------------------------------------------------------------
function useTelegramWebApp() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.("#0A0B0D");
    tg.setBackgroundColor?.("#000000");
  }, []);
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function DemoBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${className}`}
      style={{
        background: token.goldSoft,
        color: token.gold,
        border: `1px solid rgba(201,161,92,0.25)`,
      }}
    >
      Prototype
    </span>
  );
}

function StatCard({ label, value, positive, negative }) {
  const color = positive ? token.green : negative ? token.red : token.textPrimary;
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1.5"
      style={{ background: token.card, border: `1px solid ${token.border}` }}
    >
      <span className="text-xs" style={{ color: token.textSecondary }}>
        {label}
      </span>
      <span className="text-lg font-semibold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-4 active:scale-[0.97] transition-transform"
      style={{
        background: token.cardAlt,
        border: `1px solid ${token.border}`,
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: token.goldSoft }}
      >
        <Icon size={16} style={{ color: token.gold }} strokeWidth={2} />
      </div>
      <span className="text-xs font-medium" style={{ color: token.textPrimary }}>
        {label}
      </span>
    </button>
  );
}

function Sheet({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onTransitionEnd={() => {
        if (!open) setMounted(false);
      }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.6)",
          opacity: open ? 1 : 0,
        }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[440px] rounded-t-3xl p-5 pb-8 transition-transform duration-300 ease-out"
        style={{
          background: token.bgElevated,
          border: `1px solid ${token.borderStrong}`,
          borderBottom: "none",
          transform: open ? "translateY(0)" : "translateY(100%)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div
          className="mx-auto mb-4 h-1 w-9 rounded-full"
          style={{ background: token.borderStrong }}
        />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: token.textPrimary }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: token.card }}
          >
            <X size={15} style={{ color: token.textSecondary }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm" style={{ color: token.textSecondary }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: token.textPrimary }}>
        {value}
      </span>
    </div>
  );
}

function Notice({ children }) {
  return (
    <div
      className="rounded-xl px-3.5 py-3 text-xs leading-relaxed"
      style={{
        background: token.goldSoft,
        color: token.gold,
        border: "1px solid rgba(201,161,92,0.2)",
      }}
    >
      {children}
    </div>
  );
}

function DepositSheet({ open, onClose, onToast }) {
  const [submitted, setSubmitted] = useState(false);
  const placeholderAddress = "0xDEMO00PLACEHOLDER00ADDRESS00NOTREAL";

  const handleClose = () => {
    onClose();
    setTimeout(() => setSubmitted(false), 300);
  };

  const copyAddress = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(placeholderAddress).catch(() => {});
    }
    onToast("Address copied (placeholder — demo only)");
  };

  return (
    <Sheet open={open} onClose={handleClose} title={submitted ? "Deposit submitted" : "Deposit"}>
      {!submitted ? (
        <div className="flex flex-col gap-4">
          <Notice>
            This is a design prototype. No real deposit addresses are shown and no
            funds can be sent here.
          </Notice>

          <div
            className="rounded-2xl px-4"
            style={{ background: token.card, border: `1px solid ${token.border}` }}
          >
            <Row label="Asset" value="USDT" />
            <div style={{ borderTop: `1px solid ${token.border}` }} />
            <Row label="Network" value="BSC (BEP-20)" />
            <div style={{ borderTop: `1px solid ${token.border}` }} />
            <Row label="Minimum deposit" value="$5.00" />
          </div>

          <div>
            <span className="text-xs" style={{ color: token.textSecondary }}>
              Deposit address (placeholder)
            </span>
            <div
              className="mt-2 flex items-center gap-2 rounded-2xl p-3"
              style={{ background: token.card, border: `1px solid ${token.border}` }}
            >
              <span
                className="flex-1 text-xs font-mono truncate"
                style={{ color: token.textPrimary }}
              >
                {placeholderAddress}
              </span>
              <button
                onClick={copyAddress}
                className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center"
                style={{ background: token.cardAlt }}
              >
                <Copy size={13} style={{ color: token.gold }} />
              </button>
            </div>
          </div>

          <div className="flex justify-center py-2">
            <div
              className="w-36 h-36 rounded-2xl flex items-center justify-center text-center px-4"
              style={{
                background: token.card,
                border: `1px dashed ${token.borderStrong}`,
              }}
            >
              <span className="text-[11px]" style={{ color: token.textTertiary }}>
                QR code placeholder — shown here for layout only
              </span>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed" style={{ color: token.textTertiary }}>
            In the live product, this screen will let a user send a screenshot of
            their transaction for manual verification.
          </p>

          <button
            onClick={() => setSubmitted(true)}
            className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 font-medium text-sm"
            style={{ background: token.gold, color: "#191308" }}
          >
            <Camera size={15} />
            Send screenshot (demo)
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: token.greenSoft }}
          >
            <Check size={24} style={{ color: token.green }} />
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: token.textPrimary }}>
              Your request has been received
            </p>
            <p className="text-xs leading-relaxed" style={{ color: token.textSecondary }}>
              In the finished product this would sit here as pending, awaiting manual
              verification. No real deposit was processed.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-full rounded-xl py-3 text-sm font-medium"
            style={{ background: token.card, color: token.textPrimary, border: `1px solid ${token.border}` }}
          >
            Close
          </button>
        </div>
      )}
    </Sheet>
  );
}

function WithdrawSheet({ open, onClose, onToast }) {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const availableBalance = 230.09;

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setAmount("");
      setAddress("");
      setError("");
    }, 300);
  };

  const handleSubmit = () => {
    const numeric = parseFloat(amount);
    if (!amount || isNaN(numeric) || numeric <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (numeric > availableBalance) {
      setError("Amount exceeds available balance.");
      return;
    }
    if (!address.trim()) {
      setError("Enter a wallet address.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <Sheet open={open} onClose={handleClose} title={submitted ? "Request submitted" : "Withdraw"}>
      {!submitted ? (
        <div className="flex flex-col gap-4">
          <Notice>
            Design prototype only — nothing entered here is sent or stored.
          </Notice>

          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: token.card, border: `1px solid ${token.border}` }}
          >
            <span className="text-xs" style={{ color: token.textSecondary }}>
              Available balance
            </span>
            <span className="text-base font-semibold tabular-nums" style={{ color: token.textPrimary }}>
              {money(availableBalance)}
            </span>
          </div>

          <div>
            <label className="text-xs" style={{ color: token.textSecondary }}>
              Amount (USDT)
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: token.card,
                border: `1px solid ${token.border}`,
                color: token.textPrimary,
              }}
            />
          </div>

          <div>
            <label className="text-xs" style={{ color: token.textSecondary }}>
              USDT wallet address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste address"
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none font-mono"
              style={{
                background: token.card,
                border: `1px solid ${token.border}`,
                color: token.textPrimary,
              }}
            />
          </div>

          <div
            className="rounded-2xl px-4"
            style={{ background: token.card, border: `1px solid ${token.border}` }}
          >
            <Row label="Network" value="BSC (BEP-20)" />
          </div>

          {error && (
            <p className="text-xs" style={{ color: token.red }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full rounded-xl py-3.5 font-medium text-sm"
            style={{ background: token.gold, color: "#191308" }}
          >
            Submit request
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: token.greenSoft }}
          >
            <Check size={24} style={{ color: token.green }} />
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: token.textPrimary }}>
              Withdrawal request submitted
            </p>
            <p className="text-xs leading-relaxed" style={{ color: token.textSecondary }}>
              This is a placeholder confirmation for the design review. No withdrawal
              was actually processed.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-full rounded-xl py-3 text-sm font-medium"
            style={{ background: token.card, color: token.textPrimary, border: `1px solid ${token.border}` }}
          >
            Close
          </button>
        </div>
      )}
    </Sheet>
  );
}

function HistorySheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="Trading history">
      <div className="flex flex-col gap-5">
        <Notice>Sample records shown for layout purposes only.</Notice>
        {trades.map((group) => (
          <div key={group.day}>
            <span className="text-xs font-medium" style={{ color: token.textTertiary }}>
              {group.day}
            </span>
            <div className="mt-2 flex flex-col gap-2">
              {group.items.map((t) => {
                const pos = t.pl > 0;
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl px-3.5 py-3"
                    style={{ background: token.card, border: `1px solid ${token.border}` }}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium" style={{ color: token.textPrimary }}>
                        {t.pair}
                      </span>
                      <span className="text-[11px]" style={{ color: token.textTertiary }}>
                        {t.time}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: pos ? token.green : token.red }}
                      >
                        {money(t.pl, { signed: true })}
                      </span>
                      <span
                        className="text-[11px] tabular-nums"
                        style={{ color: pos ? token.green : token.red }}
                      >
                        {pos ? "+" : ""}
                        {t.pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-lg px-2.5 py-1.5 text-xs"
      style={{ background: token.cardAlt, border: `1px solid ${token.borderStrong}` }}
    >
      <div style={{ color: token.textTertiary }}>{label}</div>
      <div className="font-medium tabular-nums" style={{ color: token.textPrimary }}>
        {money(payload[0].value)}
      </div>
    </div>
  );
}

export default function App() {
  useTelegramWebApp();

  const [activeSheet, setActiveSheet] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  return (
    <div
      className="min-h-screen w-full flex items-start justify-center py-8 px-4"
      style={{ background: "#000000" }}
    >
      <div
        className="w-full max-w-[420px] rounded-[28px] overflow-hidden"
        style={{ background: token.bg, border: `1px solid ${token.border}` }}
      >
        <div className="px-5 pt-6 pb-8">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: token.goldSoft }}
              >
                <div className="w-3 h-3 rounded-sm rotate-45" style={{ background: token.gold }} />
              </div>
              <span className="text-sm font-semibold tracking-wide" style={{ color: token.textPrimary }}>
                Dashboard
              </span>
            </div>
            <DemoBadge />
          </div>

          <div className="mb-6">
            <span className="text-xs" style={{ color: token.textSecondary }}>
              Total balance
            </span>
            <div className="flex items-end gap-3 mt-1.5">
              <span className="text-[40px] leading-none font-semibold tabular-nums" style={{ color: token.textPrimary }}>
                $230.09
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-sm font-medium tabular-nums" style={{ color: token.green }}>
                +$4.23 today
              </span>
              <span
                className="text-xs rounded-md px-1.5 py-0.5 font-medium tabular-nums"
                style={{ background: token.greenSoft, color: token.green }}
              >
                +2.15%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: token.green }} />
            <span className="text-xs" style={{ color: token.textSecondary }}>
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard label="Capital" value="$200.00" />
            <StatCard label="Today's profit" value="+$4.23" positive />
            <StatCard label="Total profit" value="+$30.09" positive />
            <StatCard label="Performance" value="+2.15%" positive />
          </div>

          <div
            className="rounded-2xl p-4 mb-6"
            style={{ background: token.card, border: `1px solid ${token.border}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: token.textSecondary }}>
                Performance today
              </span>
            </div>
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perfSeries} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={token.gold} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={token.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: token.textTertiary, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: token.borderStrong }} />
                  <Area type="monotone" dataKey="value" stroke={token.gold} strokeWidth={2} fill="url(#goldFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex gap-3">
            <ActionButton icon={ArrowDownToLine} label="Deposit" onClick={() => setActiveSheet("deposit")} />
            <ActionButton icon={ArrowUpFromLine} label="Withdraw" onClick={() => setActiveSheet("withdraw")} />
            <ActionButton icon={Clock} label="History" onClick={() => setActiveSheet("history")} />
          </div>

          <p className="text-center text-[10px] leading-relaxed mt-6" style={{ color: token.textTertiary }}>
            Design prototype for review — not connected to any real account, wallet,
            or trading system.
          </p>
        </div>
      </div>

      <DepositSheet open={activeSheet === "deposit"} onClose={() => setActiveSheet(null)} onToast={showToast} />
      <WithdrawSheet open={activeSheet === "withdraw"} onClose={() => setActiveSheet(null)} onToast={showToast} />
      <HistorySheet open={activeSheet === "history"} onClose={() => setActiveSheet(null)} />

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-full px-4 py-2 text-xs font-medium flex items-center gap-1.5"
          style={{ background: token.cardAlt, color: token.textPrimary, border: `1px solid ${token.borderStrong}` }}
        >
          <Check size={12} style={{ color: token.green }} />
          {toast}
        </div>
      )}
    </div>
  );
}
