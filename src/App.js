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
const C = {
bg: "#0f0f0f",
surface: "#1a1a1a",
surface2: "#242424",
border: "#2e2e2e",
accent: "#e8ff47",
accentDim: "#b8cc30",
text: "#f0f0f0",
textDim: "#666",
textMid: "#999",
orange: "#ff6b2b",
blue: "#4da6ff",
green: "#39d98a",
};
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
return (
<div style={{
minHeight: "100dvh",
background: C.bg,
fontFamily: "'Helvetica Neue', 'Arial Black', sans-serif",
color: C.text,
maxWidth: 430,
margin: "0 auto",
paddingBottom: 90,
}}>
{/* Header */}
<div style={{
padding: "env(safe-area-inset-top, 44px) 24px 20px",
borderBottom: `1px solid ${C.border}`,
background: C.bg,
position: "sticky", top: 0, zIndex: 10,
}}>
<h1 style={{
fontSize: 38, fontWeight: 900, margin: "0 0 18px",
letterSpacing: "-1.5px", textAlign: "center",
textTransform: "uppercase",
background: `linear-gradient(135deg, ${C.accent} 0%, ${C.orange} 100%)`,
WebkitBackgroundClip: "text",
WebkitTextFillColor: "transparent",
}}>
Push-ups

</h1>
<div style={{ display: "flex", gap: 0, justifyContent: "center" }}>
<StatPill label="Today" value={todayTotal} accent={C.accent} />
<Divider />
<StatPill label="Sets" value={todaySets.length} accent={C.textMid} />
<Divider />
<StatPill label=" Streak" value={`${streak}d`} accent={C.orange} />
<Divider />
<StatPill label="Record" value={record} accent={C.blue} />
</div>
</div>
{/* Nav */}
<div style={{
display: "flex",
borderBottom: `1px solid ${C.border}`,
background: C.surface,
position: "sticky", top: 108, zIndex: 9,
}}>
{["today", "history", "stats"].map((v) => (
<button key={v} onClick={() => setView(v)} style={{
flex: 1, padding: "14px 0", fontSize: 11,
letterSpacing: "0.18em", textTransform: "uppercase",
fontFamily: "inherit", background: "none", border: "none", cursor: "pointer",
color: view === v ? C.accent : C.textDim,
borderBottom: view === v ? `2px solid ${C.accent}` : "2px solid transparent",
fontWeight: view === v ? 800 : 500,
transition: "all 0.15s",
WebkitTapHighlightColor: "transparent",
}}>{v}</button>
))}
</div>
{/* TODAY */}
{view === "today" && (
<div style={{ padding: "24px 20px" }}>
<div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textDim, marginBottom: 14 }}>
Select reps
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 9, marginBottom: 18 }}>
{nums.map((n) => (
<button key={n} onClick={() => setSelected(n === selected ? null : n)} style={{
padding: "15px 0", fontSize: 17, fontFamily: "inherit", fontWeight: 800,
borderRadius: 10,
border: selected === n ? `2px solid ${C.accent}` : `2px solid ${C.border}`,
background: selected === n ? C.accent : C.surface,
color: selected === n ? "#0f0f0f" : C.textMid,

cursor: "pointer",
transition: "all 0.12s",
boxShadow: selected === n ? `0 0 20px ${C.accent}55` : "none",
WebkitTapHighlightColor: "transparent",
}}>{n}</button>
))}
</div>
<button onClick={logSet} disabled={!selected} style={{
width: "100%", padding: "18px", fontSize: 14,
fontFamily: "inherit", fontWeight: 800, letterSpacing: "0.15em",
textTransform: "uppercase",
background: selected ? `linear-gradient(135deg, ${C.accent}, ${C.orange})` : C.surface,
color: selected ? "#0f0f0f" : C.textDim,
border: "none", borderRadius: 12, cursor: selected ? "pointer" : "default",
transition: "all 0.15s",
boxShadow: selected ? `0 4px 24px ${C.accent}44` : "none",
WebkitTapHighlightColor: "transparent",
}}>
{saved ? "✓ Saved!" : selected ? `Save ${selected} reps` : "Select a number"}
</button>
{todaySets.length > 0 && (
<div style={{ marginTop: 28 }}>
<div style={{
fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
color: C.textDim, marginBottom: 12,
display: "flex", justifyContent: "space-between", alignItems: "center"
}}>
<span>Today's sets</span>
<button onClick={deleteLastSet} style={{
fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
padding: "3px 8px", cursor: "pointer", color: C.textDim, fontFamily: "inherit",
WebkitTapHighlightColor: "transparent",
}}>Undo last</button>
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
{todaySets.map((s, i) => (
<div key={i} style={{
padding: "6px 14px", background: C.surface2, borderRadius: 20,
fontSize: 14, fontWeight: 700, color: C.accent,
border: `1px solid ${C.border}`,
}}>{s}</div>
))}
</div>
<div style={{

padding: "14px 18px", background: C.surface, borderRadius: 12,
display: "flex", justifyContent: "space-between", marginBottom: 16,
border: `1px solid ${C.border}`,
}}>
<span style={{ fontSize: 13, color: C.textMid }}>Total today</span>
<span style={{ fontSize: 20, fontWeight: 900, color: C.accent }}>{todayTotal}</span>
</div>
<div>
<div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
Progress to 100
</div>
<div style={{ height: 6, background: C.surface2, borderRadius: 99, overflow: "hidden" }}>
<div style={{
height: "100%",
width: `${Math.min(todayTotal, 100)}%`,
background: todayTotal >= 100
? C.green
: `linear-gradient(90deg, ${C.accent}, ${C.orange})`,
borderRadius: 99,
transition: "width 0.5s ease",
boxShadow: `0 0 10px ${C.accent}88`,
}} />
</div>
<div style={{ textAlign: "right", fontSize: 11, color: C.textDim, marginTop: 6 }}>
{todayTotal >= 100 ? " Goal reached today!" : `${Math.max(0, 100 - todayTotal)} to go`}
</div>
</div>
</div>
)}
</div>
)}
{/* HISTORY */}
{view === "history" && (
<div style={{ padding: "24px 20px" }}>
<div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textDim, marginBottom: 16 }}>
Recent 14 days
</div>
{historyDays.length === 0 && (
<div style={{ color: C.textDim, fontSize: 14, textAlign: "center", marginTop: 60 }}>
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
background: C.surface, borderRadius: 12,
border: isToday ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
boxShadow: isToday ? `0 0 16px ${C.accent}22` : "none",
}}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
<span style={{ fontSize: 13, color: isToday ? C.accent : C.textMid, fontWeight: isToday ? 800 : 400 }}>
{isToday ? "Today" : label}
</span>
<div style={{ display: "flex", gap: 14, alignItems: "center" }}>
<span style={{ fontSize: 11, color: C.textDim }}>{val.sets.length} sets</span>
<span style={{ fontSize: 17, fontWeight: 900, color: C.text }}>{total}</span>
</div>
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
{val.sets.map((s, i) => (
<span key={i} style={{
fontSize: 11, background: C.surface2, borderRadius: 12,
padding: "2px 9px", fontWeight: 700, color: C.textMid,
border: `1px solid ${C.border}`,
}}>{s}</span>
))}
</div>
</div>
);
})}
</div>
)}
{/* STATS */}
{view === "stats" && (
<div style={{ padding: "24px 20px" }}>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
<BigStat label="All-time total" value={allTimeTotal.toLocaleString()} accent={C.accent} />
<BigStat label="Personal record" value={record} sub="reps in one set" accent={C.blue} />
<BigStat label="Current streak" value={`${streak}d`} sub={streak > 0 ? "keep it up!" : "start today"} accent={C.orange} />
<BigStat label="Avg per set" value={allSets.length ? Math.round(allTimeTotal / allSets.length) : "—"} sub="all time" accent={C.green} />
</div>
<div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textDim, marginBottom: 14 }}>
Last 7 days
</div>
<div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 16px", marginBottom: 20 }}>
<div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
{chartData.map((d) => (

<div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
<div style={{ fontSize: 10, color: C.textDim, fontWeight: 700, minHeight: 14 }}>{d.total > 0 ? d.total : ""}</div>
<div style={{
width: "100%", borderRadius: 5,
background: d.key === today
? `linear-gradient(180deg, ${C.accent}, ${C.orange})`
: C.surface2,
height: `${Math.max((d.total / maxChart) * 76, d.total > 0 ? 4 : 2)}px`,
transition: "height 0.4s ease",
boxShadow: d.key === today ? `0 0 12px ${C.accent}66` : "none",
}} />
<div style={{ fontSize: 10, color: d.key === today ? C.accent : C.textDim, fontWeight: d.key === today ? 800 : 400 }}>{d.label}</div>
</div>
))}
</div>
</div>
<div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 16px" }}>
<div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textDim, marginBottom: 12 }}>
Ultimate goal: 100 reps in one set
</div>
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
<span style={{ fontSize: 13, color: C.textMid }}>Best single set</span>
<span style={{ fontWeight: 900, fontSize: 15, color: C.text }}>{record} / 100</span>
</div>
<div style={{ height: 6, background: C.surface2, borderRadius: 99, overflow: "hidden" }}>
<div style={{
height: "100%", width: `${Math.min(record, 100)}%`,
background: record >= 100
? C.green
: `linear-gradient(90deg, ${C.blue}, ${C.accent})`,
borderRadius: 99, transition: "width 0.5s",
boxShadow: `0 0 10px ${C.blue}88`,
}} />
</div>
{record >= 100
? <div style={{ marginTop: 10, fontSize: 14, color: C.green, fontWeight: 800 }}> Goal achieved!</div>
: <div style={{ marginTop: 8, fontSize: 12, color: C.textDim }}>{100 - record} reps away from the goal</div>
}
</div>
</div>
)}
<div style={{ height: "env(safe-area-inset-bottom, 20px)" }} />
</div>
);
}

function Divider() {
return <div style={{ width: 1, background: "#2e2e2e", margin: "0 4px" }} />;
}
function StatPill({ label, value, accent }) {
return (
<div style={{ textAlign: "center", padding: "0 14px" }}>
<div style={{ fontSize: 20, fontWeight: 900, color: accent, lineHeight: 1 }}>{value}</div>
<div style={{ fontSize: 9, color: "#555", marginTop: 3, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
</div>
);
}
function BigStat({ label, value, sub, accent }) {
return (
<div style={{ background: "#1a1a1a", borderRadius: 12, border: "1px solid #2e2e2e", padding: "16px" }}>
<div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1, color: accent }}>{value}</div>
<div style={{ fontSize: 10, color: "#666", marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
{sub && <div style={{ fontSize: 10, color: "#444", marginTop: 3 }}>{sub}</div>}
</div>
);
}
