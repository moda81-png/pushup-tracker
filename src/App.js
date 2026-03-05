import { useState, useEffect } from "react";

const STORAGE_KEY = "pushup_data_v1";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { days: {}, allTimeSets: [] };
  } catch {
    return { days: {}, allTimeSets: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getStreak(days) {
  let streak = 0;
  let d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (days[key] && days[key].sets.length > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getLast7Days(days) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const total = days[key] ? days[key].sets.reduce((a, b) => a + b, 0) : 0;
    result.push({ key, label, total });
  }
  return result;
}

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("today");
  const [saved, setSaved] = useState(false);

  const today = getToday();
  const todayData = data.days[today] || { sets: [] };
  const todaySets = todayData.sets;
  const todayTotal = todaySets.reduce((a, b) => a + b, 0);
  const allSets = data.allTimeSets || [];
  const allTimeTotal = allSets.reduce((a, b) => a + b, 0);
  const record = allSets.length > 0 ? Math.max(...allSets) : 0;
  const streak = getStreak(data.days);
  const chartData = getLast7Days(data.days);
  const maxChart = Math.max(...chartData.map((d) => d.total), 1);

  function logSet() {
    if (!selected) return;
    const updated = { ...data };
    if (!updated.days[today]) updated.days[today] = { sets: [] };
    updated.days[today] = { sets: [...updated.days[today].sets, selected] };
    updated.allTimeSets = [...(updated.allTimeSets || []), selected];
    setData(updated);
    saveData(updated);
    setSelected(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  function deleteLastSet() {
    const updated = { ...data };
    if (!updated.days[today] || updated.days[today].sets.length === 0) return;
    const removed = updated.days[today].sets[updated.days[today].sets.length - 1];
    updated.days[today] = { sets: updated.days[today].sets.slice(0, -1) };
    const idx = (updated.allTimeSets || []).lastIndexOf(removed);
    if (idx !== -1) updated.allTimeSets = [...updated.allTimeSets.slice(0, idx), ...updated.allTimeSets.slice(idx + 1)];
    setData(updated);
    saveData(updated);
  }

  const nums = Array.from({ length: 20 }, (_, i) => i + 1);

  const historyDays = Object.entries(data.days)
    .filter(([, v]) => v.sets.length > 0)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14);

  const styles = {
    app: {
      minHeight: "100vh",
      minHeight: "100dvh",
      background: "#fafaf8",
      fontFamily: "'Georgia', serif",
      color: "#1a1a1a",
      maxWidth: 430,
      margin: "0 auto",
      paddingBottom: 90,
      position: "relative",
    },
    header: {
      padding: "env(safe-area-inset-top, 44px) 24px 16px",
      borderBottom: "1px solid #e8e6e0",
      background: "#fafaf8",
      position: "sticky",
      top: 0,
      zIndex: 10,
    },
    nav: {
      display: "flex",
      borderBottom: "1px solid #e8e6e0",
      background: "#fff",
      position: "sticky",
      top: 88,
      zIndex: 9,
    },
    content: {
      padding: "24px 20px",
    },
  };

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", marginBottom: 2 }}>
          Daily Tracker
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
          Push-ups
        </h1>
        <div style={{ display: "flex", gap: 20 }}>
          <StatPill label="Today" value={todayTotal} accent="#1a1a1a" />
          <StatPill label="Sets" value={todaySets.length} accent="#888" />
          <StatPill label="🔥 Streak" value={`${streak}d`} accent="#e05a00" />
          <StatPill label="Record" value={record} accent="#2563eb" />
        </div>
      </div>

      {/* Nav */}
      <div style={styles.nav}>
        {["today", "history", "stats"].map((v) => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: "13px 0", fontSize: 11,
            letterSpacing: "0.14em", textTransform: "uppercase",
            fontFamily: "inherit", background: "none", border: "none", cursor: "pointer",
            color: view === v ? "#1a1a1a" : "#bbb",
            borderBottom: view === v ? "2px solid #1a1a1a" : "2px solid transparent",
            fontWeight: view === v ? 700 : 400,
            transition: "all 0.15s",
            WebkitTapHighlightColor: "transparent",
          }}>{v}</button>
        ))}
      </div>

      {/* TODAY */}
      {view === "today" && (
        <div style={styles.content}>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", marginBottom: 14 }}>
            Select reps
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 9, marginBottom: 18 }}>
            {nums.map((n) => (
              <button key={n} onClick={() => setSelected(n === selected ? null : n)} style={{
                padding: "15px 0", fontSize: 16, fontFamily: "inherit", fontWeight: 600,
                borderRadius: 12,
                border: selected === n ? "2px solid #1a1a1a" : "2px solid #e8e6e0",
                background: selected === n ? "#1a1a1a" : "#fff",
                color: selected === n ? "#fff" : "#1a1a1a",
                cursor: "pointer",
                transition: "all 0.12s",
                boxShadow: selected === n ? "0 2px 10px rgba(0,0,0,0.15)" : "none",
                WebkitTapHighlightColor: "transparent",
              }}>{n}</button>
            ))}
          </div>

          <button onClick={logSet} disabled={!selected} style={{
            width: "100%", padding: "17px", fontSize: 14,
            fontFamily: "inherit", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: selected ? "#1a1a1a" : "#ebe9e4",
            color: selected ? "#fff" : "#bbb",
            border: "none", borderRadius: 14, cursor: selected ? "pointer" : "default",
            transition: "all 0.15s",
            WebkitTapHighlightColor: "transparent",
          }}>
            {saved ? "✓  Saved!" : selected ? `Save  ${selected} reps` : "Select a number"}
          </button>

          {todaySets.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Today's sets</span>
                <button onClick={deleteLastSet} style={{
                  fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                  background: "none", border: "1px solid #e0e0e0", borderRadius: 6,
                  padding: "3px 8px", cursor: "pointer", color: "#999", fontFamily: "inherit",
                  WebkitTapHighlightColor: "transparent",
                }}>Undo last</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {todaySets.map((s, i) => (
                  <div key={i} style={{
                    padding: "6px 14px", background: "#f0ede8", borderRadius: 20,
                    fontSize: 14, fontWeight: 600,
                  }}>{s}</div>
                ))}
              </div>
              <div style={{ padding: "14px 18px", background: "#f7f5f2", borderRadius: 12, display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: "#888" }}>Total today</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{todayTotal}</span>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 7 }}>
                  Progress to 100
                </div>
                <div style={{ height: 8, background: "#ebe9e4", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(todayTotal, 100)}%`,
                    background: todayTotal >= 100 ? "#16a34a" : "#1a1a1a",
                    borderRadius: 99,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: "#bbb", marginTop: 5 }}>
                  {todayTotal >= 100 ? "🎉 Goal reached today!" : `${Math.max(0, 100 - todayTotal)} to go`}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY */}
      {view === "history" && (
        <div style={styles.content}>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", marginBottom: 16 }}>
            Recent 14 days
          </div>
          {historyDays.length === 0 && (
            <div style={{ color: "#ccc", fontSize: 14, textAlign: "center", marginTop: 60 }}>
              No data yet —<br />log your first set!
            </div>
          )}
          {historyDays.map(([date, val]) => {
            const total = val.sets.reduce((a, b) => a + b, 0);
            const label = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
            const isToday = date === today;
            return (
              <div key={date} style={{
                padding: "14px 16px", marginBottom: 10,
                background: "#fff", borderRadius: 12,
                border: isToday ? "1.5px solid #1a1a1a" : "1px solid #e8e6e0",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: isToday ? "#1a1a1a" : "#666", fontWeight: isToday ? 700 : 400 }}>
                    {isToday ? "Today" : label}
                  </span>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#bbb" }}>{val.sets.length} sets</span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{total}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {val.sets.map((s, i) => (
                    <span key={i} style={{ fontSize: 11, background: "#f0ede8", borderRadius: 12, padding: "2px 9px", fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STATS */}
      {view === "stats" && (
        <div style={styles.content}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <BigStat label="All-time total" value={allTimeTotal.toLocaleString()} />
            <BigStat label="Personal record" value={record} sub="reps in one set" />
            <BigStat label="Current streak" value={`${streak}d`} sub={streak > 0 ? "keep it up!" : "start today"} />
            <BigStat label="Avg per set" value={allSets.length ? Math.round(allTimeTotal / allSets.length) : "—"} sub="all time" />
          </div>

          <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", marginBottom: 14 }}>
            Last 7 days
          </div>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e0", padding: "20px 16px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
              {chartData.map((d) => (
                <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 10, color: "#bbb", fontWeight: 600, minHeight: 14 }}>{d.total > 0 ? d.total : ""}</div>
                  <div style={{
                    width: "100%", borderRadius: 6,
                    background: d.key === today ? "#1a1a1a" : "#e0ddd7",
                    height: `${Math.max((d.total / maxChart) * 76, d.total > 0 ? 4 : 2)}px`,
                    transition: "height 0.4s ease",
                  }} />
                  <div style={{ fontSize: 10, color: d.key === today ? "#1a1a1a" : "#aaa", fontWeight: d.key === today ? 700 : 400 }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e6e0", padding: "18px 16px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", marginBottom: 12 }}>
              Ultimate goal: 100 reps in one set
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#666" }}>Best single set</span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{record} / 100</span>
            </div>
            <div style={{ height: 8, background: "#ebe9e4", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.min(record, 100)}%`,
                background: record >= 100 ? "#16a34a" : "#2563eb",
                borderRadius: 99, transition: "width 0.5s",
              }} />
            </div>
            {record >= 100
              ? <div style={{ marginTop: 10, fontSize: 14, color: "#16a34a", fontWeight: 700 }}>🏆 Goal achieved!</div>
              : <div style={{ marginTop: 8, fontSize: 12, color: "#bbb" }}>{100 - record} reps away from the goal</div>
            }
          </div>
        </div>
      )}

      {/* Bottom safe area for iPhone home bar */}
      <div style={{ height: "env(safe-area-inset-bottom, 20px)" }} />
    </div>
  );
}

function StatPill({ label, value, accent }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, color: "#bbb", marginTop: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function BigStat({ label, value, sub }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8e6e0", padding: "16px" }}>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: "#999", marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "#ccc", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
