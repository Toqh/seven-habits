import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

/* ═══════════════════════════ HABITS ═══════════════════════════ */

const HABITS = [
  { id: 1, name: "Be Proactive", tag: "Own your responses", gi: 0,
    desc: "You are responsible for your life. Your behavior is a function of your decisions, not your conditions.",
    prompt: "Did you choose your response rather than react to circumstances today?" },
  { id: 2, name: "Begin with the End in Mind", tag: "Define your vision first", gi: 0,
    desc: "Start every day and task with a clear picture of your desired destination, then use your proactive energy to make it happen.",
    prompt: "Did you act from a clear sense of purpose and long-term vision today?" },
  { id: 3, name: "Put First Things First", tag: "Prioritize what matters most", gi: 0,
    desc: "The key is not to prioritize your schedule but to schedule your priorities. Focus on what's important, not just urgent.",
    prompt: "Did you prioritize important things over merely urgent ones today?" },
  { id: 4, name: "Think Win-Win", tag: "Seek mutual benefit always", gi: 1,
    desc: "Frame every interaction as cooperative, not competitive. Look for solutions that benefit all parties — not at anyone else's expense.",
    prompt: "Did you approach your interactions seeking mutual benefit today?" },
  { id: 5, name: "Seek First to Understand", tag: "Listen before you speak", gi: 1,
    desc: "Most people listen with intent to reply. Listen instead with genuine intent to understand. Diagnose fully before you prescribe.",
    prompt: "Did you genuinely listen to understand someone before asserting your view today?" },
  { id: 6, name: "Synergize", tag: "Create more than the sum of parts", gi: 1,
    desc: "The whole is greater than its parts. Creative cooperation opens possibilities that no individual could achieve alone.",
    prompt: "Did you contribute to a collaboration that exceeded what any individual could achieve alone today?" },
  { id: 7, name: "Sharpen the Saw", tag: "Renew yourself regularly", gi: 2,
    desc: "Preserve and enhance your greatest asset — you. Invest in renewal across physical, mental, emotional, and spiritual dimensions.",
    prompt: "Did you invest in renewing yourself physically, mentally, emotionally, or spiritually today?" },
];

/* ═══════════════════════════ SUB-HABITS ═══════════════════════════ */
// Each written as: I [text] today.
// 2–3 per habit, highest-leverage actions from the book.

const SUB_HABITS = {
  1: [
    { id: "1a", text: "focused on what I can control rather than what I cannot" },
    { id: "1b", text: "chose my response deliberately rather than reacting on impulse" },
    { id: "1c", text: "used proactive language — 'I will' or 'I choose' — in my thoughts or words" },
  ],
  2: [
    { id: "2a", text: "made at least one decision guided by my core values, not immediate pressure" },
    { id: "2b", text: "reviewed or reflected on a meaningful goal or long-term vision" },
    { id: "2c", text: "began a task by clearly defining what success looks like before starting" },
  ],
  3: [
    { id: "3a", text: "spent intentional time on something important but not urgent" },
    { id: "3b", text: "planned or reviewed my top priorities before getting into the day" },
    { id: "3c", text: "said no to something urgent but unimportant to protect what matters most" },
  ],
  4: [
    { id: "4a", text: "sought an outcome that genuinely works for all parties in a conflict or negotiation" },
    { id: "4b", text: "entered a situation with an abundance mindset rather than a scarcity mindset" },
    { id: "4c", text: "chose cooperation over competition where it was the wiser move" },
  ],
  5: [
    { id: "5a", text: "listened fully to someone without planning my reply while they were speaking" },
    { id: "5b", text: "asked questions to understand someone's perspective before offering mine" },
    { id: "5c", text: "held back my advice until I was certain I genuinely understood the other person" },
  ],
  6: [
    { id: "6a", text: "built on someone else's idea rather than dismissing or overriding it" },
    { id: "6b", text: "contributed to an outcome better than what any party could have reached alone" },
  ],
  7: [
    { id: "7a", text: "did something physically restorative — movement, exercise, or rest" },
    { id: "7b", text: "invested time in reading, learning, or sharpening a mental skill" },
    { id: "7c", text: "spent time in prayer, reflection, gratitude, or spiritual renewal" },
  ],
};

const ALL_SUBS = Object.values(SUB_HABITS).flat();
const TOTAL_SUBS = ALL_SUBS.length; // 20

const GC = ["#a78bfa", "#fb923c", "#34d399"];

const FAQS = [
  { q: "Do I need to complete all sub-habits every day?",
    a: "No. Consistent progress matters more than perfection. Even 8–10 sub-habits practised intentionally each day builds real momentum over time." },
  { q: "How is my daily score calculated?",
    a: `It's the percentage of all ${TOTAL_SUBS} specific actions you checked off. Checking 10 = 50%. It's a mirror of what you actually did, not a judgment.` },
  { q: "Why two or three sub-habits per category?",
    a: "Covey identifies specific behavioural actions within each habit. The ones listed here are the highest-leverage — the ones that produce the most change in the shortest time." },
  { q: "Should I add a reflection note every time?",
    a: "It's optional but powerful. A single sentence per habit sharpens self-awareness and helps the practices integrate faster." },
  { q: "What's the difference between weekly and monthly scores?",
    a: "Weekly is the average of your daily scores over the last 7 days. Monthly is the average of all logged days in the current calendar month." },
  { q: "Why are the habits grouped into three sections?",
    a: "Covey's framework: Habits 1–3 (Private Victory) — master yourself. Habits 4–6 (Public Victory) — work effectively with others. Habit 7 (Renewal) — sustain everything." },
];

/* ═══════════════════════════ HELPERS ═══════════════════════════ */

const localKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const calcScore = (h) =>
  Math.round((Object.values(h).filter(Boolean).length / TOTAL_SUBS) * 100);

const lastNDays = (n) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return localKey(d);
  });

const dayLabel = (key) => {
  if (key === localKey()) return "Today";
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (key === localKey(y)) return "Yest";
  const [yr, mo, d] = key.split("-").map(Number);
  return new Date(yr, mo - 1, d).toLocaleDateString("en-US", { weekday: "short" });
};

const monthDayKeys = () => {
  const now = new Date(), yr = now.getFullYear(), mo = now.getMonth();
  const keys = [], today = localKey();
  for (let d = new Date(yr, mo, 1); d.getMonth() === mo; d.setDate(d.getDate() + 1)) {
    const k = localKey(new Date(d));
    keys.push(k);
    if (k === today) break;
  }
  return keys;
};

const calcStreak = (logs) => {
  let count = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const k = localKey(d);
    if (logs[k] !== undefined) {
      if (logs[k].score > 0) count++;
      else break;
    } else if (i === 0) { /* today not yet logged */ }
    else break;
    d.setDate(d.getDate() - 1);
  }
  return count;
};

const calcBest = (logs) => {
  const sorted = Object.keys(logs).sort();
  let best = 0, cur = 0, prev = null;
  for (const k of sorted) {
    if (logs[k]?.score > 0) {
      if (prev) {
        const [py, pm, pd] = prev.split("-").map(Number);
        const [cy, cm, cd] = k.split("-").map(Number);
        const diff = Math.round((new Date(cy, cm - 1, cd) - new Date(py, pm - 1, pd)) / 86400000);
        cur = diff === 1 ? cur + 1 : 1;
      } else cur = 1;
      best = Math.max(best, cur);
      prev = k;
    } else { cur = 0; prev = null; }
  }
  return best;
};

/* ═══════════════════════════ STORAGE ═══════════════════════════ */

useEffect(() => {
  const all = stor.all();
  setLogs(all);
  const td = all[localKey()];
  if (td) { setHabits(td.habits || {}); setNotes(td.notes || {}); }
  setReady(true);
}, []);

/* ═══════════════════════════ SCORE RING ═══════════════════════════ */

function ScoreRing({ pct, size = 80 }) {
  const r = size / 2 - 8, c = 2 * Math.PI * r, fill = (pct / 100) * c;
  const color = pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : pct > 0 ? "#f87171" : "#3f3f46";
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${fill} ${c - fill}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.5s ease" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dy="0.35em"
        fill="#fafafa" fontSize={size * 0.19} fontWeight="700" fontFamily="'Jost',sans-serif">
        {pct}%
      </text>
    </svg>
  );
}

/* ═══════════════════════════ BOTTOM NAV ═══════════════════════════ */

function BottomNav({ tab, setTab }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(9,9,11,0.97)", backdropFilter: "blur(16px)",
      borderTop: "1px solid #27272a", display: "flex",
      paddingBottom: "env(safe-area-inset-bottom,0px)",
    }}>
      {[{ id: "info", icon: "📖", label: "Info" }, { id: "daily", icon: "✅", label: "Today" }, { id: "history", icon: "📈", label: "History" }].map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          flex: 1, background: "none", border: "none", cursor: "pointer",
          padding: "10px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        }}>
          <span style={{ fontSize: 22 }}>{t.icon}</span>
          <span style={{
            fontFamily: "'Jost',sans-serif", fontSize: 10, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.07em",
            color: tab === t.id ? "#f59e0b" : "#52525b", transition: "color 0.2s",
          }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ═══════════════════════════ INFO TAB ═══════════════════════════ */

const PS = { fontFamily: "'Jost',sans-serif", fontSize: 13, color: "#a1a1aa", lineHeight: 1.65, margin: "0 0 8px" };
const HS = { fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "#fafafa", margin: "0 0 14px" };

function InfoTab() {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div style={{ padding: "20px 16px 110px", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "28px 0 32px" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>📖</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: "#fafafa", margin: "0 0 10px", lineHeight: 1.15 }}>
          7 Habits Tracker
        </h1>
        <p style={{ ...PS, margin: 0, maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>
          A daily practice companion built on Stephen R. Covey's framework for enduring personal and interpersonal effectiveness.
        </p>
      </div>

      <div style={{ height: 1, background: "linear-gradient(to right, transparent, #f59e0b44, transparent)", marginBottom: 28 }} />

      <div style={{ marginBottom: 28 }}>
        <h2 style={HS}>About the Book</h2>
        <p style={PS}>
          <em style={{ color: "#d4d4d8" }}>The 7 Habits of Highly Effective People</em> by Stephen R. Covey (1989) is one of the most influential personal development books ever written. Its core premise: lasting effectiveness comes from character, not technique.
        </p>
        <p style={PS}>The habits are sequential — building on each other, moving you from dependence through independence to interdependence.</p>
      </div>

      {[
        { label: "Private Victory", ids: [1, 2, 3], desc: "Master yourself before you can effectively lead others.", color: GC[0] },
        { label: "Public Victory", ids: [4, 5, 6], desc: "Build trust and create lasting collaborative outcomes.", color: GC[1] },
        { label: "Renewal", ids: [7], desc: "Sustain your capacity to keep practising everything else.", color: GC[2] },
      ].map((g) => (
        <div key={g.label} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 3, height: 14, borderRadius: 2, background: g.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: g.color }}>{g.label}</span>
          </div>
          <p style={{ ...PS, marginBottom: 10 }}>{g.desc}</p>
          {HABITS.filter((h) => g.ids.includes(h.id)).map((h) => (
            <div key={h.id} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: "1px solid #27272a" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: g.color + "18", border: `1px solid ${g.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: g.color, fontFamily: "'Jost',sans-serif", marginTop: 1 }}>{h.id}</div>
              <div>
                <div style={{ fontFamily: "'Jost',sans-serif", fontWeight: 600, fontSize: 14, color: "#fafafa", marginBottom: 3 }}>{h.name}</div>
                <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, color: "#71717a", lineHeight: 1.55 }}>{h.desc}</div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginBottom: 28 }}>
        <h2 style={HS}>How to Use</h2>
        {[
          ["📋 Today Tab", `Open it each day. Tap a habit card to expand it. Check each specific action you actually did — written as "I ... today." Your score updates with every tick.`],
          ["📈 History Tab", "See your daily, weekly, and monthly scores. Track your streak and performance trends over time."],
          ["💡 Mindset", "Missing a day is not failure — it's data. Just show up the next day."],
        ].map(([t, d]) => (
          <div key={t} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontFamily: "'Jost',sans-serif", fontWeight: 600, fontSize: 13, color: "#f59e0b", marginBottom: 4 }}>{t}</div>
            <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, color: "#a1a1aa", lineHeight: 1.55 }}>{d}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 style={HS}>FAQs</h2>
        {FAQS.map((f, i) => (
          <div key={i} style={{ borderBottom: "1px solid #27272a" }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "13px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, textAlign: "left" }}>
              <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 14, fontWeight: 500, color: "#e4e4e7", lineHeight: 1.4 }}>{f.q}</span>
              <span style={{ color: "#52525b", fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{openFaq === i ? "−" : "+"}</span>
            </button>
            {openFaq === i && <p style={{ ...PS, paddingBottom: 12, marginTop: -4 }}>{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ HABIT CARD ═══════════════════════════ */

function HabitCard({ habit, subs, checkedMap, onToggle, note, onNote }) {
  const [exp, setExp] = useState(false);
  const [refExp, setRefExp] = useState(false);
  const gc = GC[habit.gi];
  const done = subs.filter((s) => checkedMap[s.id]).length;
  const total = subs.length;
  const allDone = done === total;

  return (
    <div style={{
      background: "#18181b", borderRadius: 14, marginBottom: 10,
      border: `1px solid ${allDone ? gc + "55" : exp ? "#3f3f46" : "#27272a"}`,
      transition: "border-color 0.25s ease",
      overflow: "hidden",
    }}>
      {/* ── Card Header (always visible, click to expand) ── */}
      <button onClick={() => setExp(!exp)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "13px 14px", display: "flex", gap: 12, alignItems: "center", textAlign: "left",
      }}>
        {/* Number badge */}
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: allDone ? gc : "#27272a", color: allDone ? "#09090b" : "#52525b",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, fontFamily: "'Jost',sans-serif",
          transition: "background 0.2s, color 0.2s",
        }}>{habit.id}</div>

        {/* Name + tag */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Jost',sans-serif", fontWeight: 600, fontSize: 15, color: "#fafafa", lineHeight: 1.3 }}>{habit.name}</div>
          <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, color: gc, marginTop: 2 }}>{habit.tag}</div>
        </div>

        {/* Progress dots + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {subs.map((s) => (
              <div key={s.id} style={{
                width: 7, height: 7, borderRadius: "50%",
                background: checkedMap[s.id] ? gc : "#3f3f46",
                transition: "background 0.2s",
              }} />
            ))}
          </div>
          <span style={{ color: "#52525b", fontSize: 13 }}>{exp ? "▴" : "▾"}</span>
        </div>
      </button>

      {/* ── Expandable Body ── */}
      {exp && (
        <div style={{ borderTop: "1px solid #27272a" }}>
          {/* Sub-habits */}
          <div style={{ padding: "4px 14px 2px" }}>
            {subs.map((s, i) => (
              <div key={s.id}
                onClick={() => onToggle(s.id)}
                style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  padding: "10px 0",
                  borderBottom: i < subs.length - 1 ? "1px solid #1f1f23" : "none",
                  cursor: "pointer",
                }}>
                {/* Checkbox */}
                {checkedMap[s.id]
                  ? <div style={{ width: 22, height: 22, borderRadius: "50%", background: gc, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <svg width="11" height="11" viewBox="0 0 14 14">
                        <path d="M2 7l4 4 6-6" stroke="#09090b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </div>
                  : <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #3f3f46", flexShrink: 0, marginTop: 1 }} />
                }
                {/* "I [text] today." */}
                <span style={{
                  fontFamily: "'Jost',sans-serif", fontSize: 13,
                  color: checkedMap[s.id] ? "#52525b" : "#d4d4d8",
                  lineHeight: 1.55, transition: "color 0.2s",
                }}>
                  <em style={{ fontStyle: "normal", fontWeight: 700, color: checkedMap[s.id] ? "#52525b" : gc }}>I </em>
                  {s.text} today.
                </span>
              </div>
            ))}
          </div>

          {/* Reflection note */}
          <div style={{ padding: "8px 14px 12px" }}>
            <button onClick={() => setRefExp(!refExp)} style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontFamily: "'Jost',sans-serif", fontSize: 11,
              color: refExp ? gc : "#3f3f46",
              display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s",
            }}>
              <span>{refExp ? "▾" : "▸"}</span>
              <span>{note ? "Edit reflection" : "Add reflection"}</span>
            </button>
            {refExp && (
              <textarea value={note} onChange={(e) => onNote(e.target.value)}
                placeholder="What did this look like for you today?"
                style={{
                  display: "block", width: "100%", marginTop: 6, background: "#09090b",
                  border: "1px solid #3f3f46", borderRadius: 8, padding: "8px 10px",
                  fontFamily: "'Jost',sans-serif", fontSize: 12, color: "#d4d4d8",
                  resize: "none", height: 70, outline: "none", lineHeight: 1.5, boxSizing: "border-box",
                }} />
            )}
            {!refExp && note && (
              <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, color: "#3f3f46", margin: "4px 0 0", lineHeight: 1.4, fontStyle: "italic" }}>
                "{note.length > 80 ? note.slice(0, 80) + "…" : note}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ DAILY TAB ═══════════════════════════ */

function DailyTab({ habits, notes, onToggle, onNote, saved }) {
  const s = calcScore(habits);
  const done = Object.values(habits).filter(Boolean).length;
  const ds = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ padding: "20px 16px 110px", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#fafafa", margin: "0 0 4px", lineHeight: 1.2 }}>
            Daily Check-in
          </h1>
          <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, color: "#52525b" }}>{ds}</div>
          <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, color: saved ? "#34d399" : "transparent", marginTop: 3, transition: "color 0.3s" }}>✓ Saved</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <ScoreRing pct={s} size={78} />
          <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 10, color: "#52525b", marginTop: 3 }}>{done}/{TOTAL_SUBS} actions</div>
        </div>
      </div>

      {/* Habit cards */}
      {HABITS.map((h) => (
        <HabitCard
          key={h.id}
          habit={h}
          subs={SUB_HABITS[h.id]}
          checkedMap={habits}
          onToggle={onToggle}
          note={notes[h.id] || ""}
          onNote={(v) => onNote(h.id, v)}
        />
      ))}

      {done === TOTAL_SUBS && (
        <div style={{ textAlign: "center", padding: "20px 0 4px", fontFamily: "'Cormorant Garamond',serif", fontSize: 19, color: "#34d399", letterSpacing: "0.02em" }}>
          All {TOTAL_SUBS} actions completed today. ✦
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ HISTORY TAB ═══════════════════════════ */

const TT = { background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontFamily: "'Jost',sans-serif", fontSize: 12, color: "#fafafa" };

function HistoryTab({ logs }) {
  const l7 = lastNDays(7).map((d) => ({ day: dayLabel(d), score: logs[d]?.score ?? 0 }));
  const wAvg = Math.round(l7.reduce((s, d) => s + d.score, 0) / 7);

  const mKeys = monthDayKeys();
  const mData = mKeys.map((d) => {
    const [, , day] = d.split("-").map(Number);
    return { day, score: logs[d]?.score ?? 0 };
  });
  const loggedM = mKeys.filter((d) => logs[d]);
  const mAvg = loggedM.length
    ? Math.round(loggedM.reduce((s, d) => s + (logs[d]?.score ?? 0), 0) / loggedM.length)
    : 0;

  const todayScore = logs[localKey()]?.score ?? 0;
  const allVals = Object.values(logs);
  const total = allVals.length;
  const avg = total ? Math.round(allVals.reduce((s, v) => s + (v.score || 0), 0) / total) : 0;
  const streak = calcStreak(logs);
  const best = calcBest(logs);

  return (
    <div style={{ padding: "20px 16px 110px", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#fafafa", margin: "0 0 20px" }}>Progress</h1>

      {/* Score rings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[{ label: "Today", pct: todayScore }, { label: "7-Day Avg", pct: wAvg }, { label: "Month Avg", pct: mAvg }].map(({ label, pct }) => (
          <div key={label} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 12, padding: "14px 8px", textAlign: "center" }}>
            <ScoreRing pct={pct} size={64} />
            <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 10, color: "#52525b", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 14, padding: "16px 14px", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, fontWeight: 600, color: "#e4e4e7", marginBottom: 14 }}>Last 7 Days</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={l7} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="#1f1f23" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: "'Jost',sans-serif", fill: "#52525b" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontFamily: "'Jost',sans-serif", fill: "#52525b" }} axisLine={false} tickLine={false} tickCount={3} />
            <Tooltip contentStyle={TT} formatter={(v) => [`${v}%`, "Score"]} cursor={{ fill: "#1f1f23" }} />
            <Bar dataKey="score" fill="#f59e0b" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly line chart */}
      <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 14, padding: "16px 14px", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, fontWeight: 600, color: "#e4e4e7", marginBottom: 14 }}>
          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={mData}>
            <CartesianGrid vertical={false} stroke="#1f1f23" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "'Jost',sans-serif", fill: "#52525b" }} axisLine={false} tickLine={false} interval={4} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontFamily: "'Jost',sans-serif", fill: "#52525b" }} axisLine={false} tickLine={false} tickCount={3} />
            <Tooltip contentStyle={TT} formatter={(v) => [`${v}%`, "Score"]} />
            <Line type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#a78bfa" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* All-time */}
      <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 14, padding: "16px 14px" }}>
        <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, fontWeight: 600, color: "#e4e4e7", marginBottom: 14 }}>All-Time</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Days Logged", val: total, icon: "📅" },
            { label: "Avg Score", val: `${avg}%`, icon: "📊" },
            { label: "Current Streak", val: `${streak}d`, icon: "🔥" },
            { label: "Best Streak", val: `${best}d`, icon: "🏆" },
          ].map(({ label, val, icon }) => (
            <div key={label} style={{ background: "#09090b", borderRadius: 10, padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 5 }}>{icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#fafafa", lineHeight: 1 }}>{val}</div>
              <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 10, color: "#52525b", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ APP ═══════════════════════════ */

export default function App() {
  const [tab, setTab] = useState("daily");
  // habits = flat map of sub-habit IDs → boolean
  // e.g. { "1a": true, "1b": false, "2a": true, ... }
  const [habits, setHabits] = useState({});
  const [notes, setNotes] = useState({});
  const [logs, setLogs] = useState({});
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef(null);
  const inited = useRef(false);

  // Inject fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  // Load all data on mount
  useEffect(() => {
    (async () => {
      const all = await stor.all();
      setLogs(all);
      const td = all[localKey()];
      if (td) { setHabits(td.habits || {}); setNotes(td.notes || {}); }
      setReady(true);
    })();
  }, []);

  // Autosave
  useEffect(() => {
    if (!ready) return;
    if (!inited.current) { inited.current = true; return; }
    const s = calcScore(habits);
    const log = { habits, notes, score: s, date: localKey() };
    stor.set(`log:${localKey()}`, log);
    setLogs((prev) => ({ ...prev, [localKey()]: log }));
    setSaved(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 2000);
  }, [habits, notes, ready]);

  const toggleSub = (subId) => {
    setHabits((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  if (!ready) return (
    <div style={{ background: "#09090b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Jost',sans-serif", color: "#3f3f46", fontSize: 14 }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ background: "#09090b", minHeight: "100vh" }}>
      {tab === "info" && <InfoTab />}
      {tab === "daily" && (
        <DailyTab habits={habits} notes={notes} saved={saved}
          onToggle={toggleSub}
          onNote={(id, v) => setNotes((p) => ({ ...p, [id]: v }))} />
      )}
      {tab === "history" && <HistoryTab logs={logs} />}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
