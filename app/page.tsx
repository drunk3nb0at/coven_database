"use client";
// ═══════════════════════════════════════════
// COVENS — 阅读即抵抗
// 华语激进性别政治共享知识库
// ═══════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ──
type Domain = {
  id: number;
  slug: string;
  icon: string;
  name_zh: string;
  name_en: string;
  color: string;
  sort_order: number;
};

type Resource = {
  id: number;
  domain_slug: string;
  media_type: string;
  title: string;
  title_original: string | null;
  authors: string[];
  year: number | null;
  tags: string[];
  summary: string | null;
  external_links: Record<string, string>;
};

// ── Constants ──
const MEDIA_TYPES: { slug: string; icon: string; label: string }[] = [
  { slug: "monograph", icon: "📕", label: "专著" },
  { slug: "anthology", icon: "📚", label: "文集" },
  { slug: "syllabus", icon: "📋", label: "课纲" },
  { slug: "zine", icon: "✂️", label: "Zine / 宣言" },
  { slug: "film", icon: "🎬", label: "电影" },
  { slug: "documentary", icon: "🎞️", label: "纪录片" },
  { slug: "standup", icon: "🎤", label: "脱口秀" },
  { slug: "theater", icon: "🎭", label: "戏剧" },
  { slug: "podcast", icon: "🎧", label: "播客" },
  { slug: "media", icon: "📰", label: "媒体" },
  { slug: "topic", icon: "💬", label: "话题 / 存档" },
];

const LINK_COLORS: Record<string, string> = {
  "豆瓣": "#319B2C", Letterboxd: "#FF8000", IMDB: "#E6B91E",
  Goodreads: "#553B08", WorldCat: "#2C5AA0", "Z-Library": "#C23B22",
  "Google Scholar": "#4285F4", "Sci-Hub": "#B71C1C",
  "小宇宙": "#EE4466", Spotify: "#1DB954", Bilibili: "#00A1D6", "原文": "#888",
};

const MODULES = [
  { id: "about", icon: "⊹", label: "关于" },
  { id: "forum", icon: "◫", label: "讨论广场" },
  { id: "submit", icon: "↗", label: "供稿" },
  { id: "graph", icon: "⬡", label: "理论图谱" },
];

// ── Theme ──
function useTheme(dark: boolean) {
  return dark
    ? { bg:"#0A090D",bgS:"#111018",bgC:"#17161F",bgH:"#1E1D2A",bdr:"#252435",bdrA:"#3D3B52",tx:"#E4E2EE",txM:"#908DA5",txD:"#5B5872",acc:"#C0B0E0",accS:"rgba(192,176,224,0.07)" }
    : { bg:"#FAFAF8",bgS:"#F2F1EE",bgC:"#FFFFFF",bgH:"#EDEDEB",bdr:"#E0DFDB",bdrA:"#C8C7C2",tx:"#1A1918",txM:"#6B6966",txD:"#9E9B97",acc:"#5E4478",accS:"rgba(94,68,120,0.05)" };
}

// ═══════════════════════════════════════════
// FORCE GRAPH
// ═══════════════════════════════════════════

const GN = [
  {id:"marxist",label:"马克思主义女权",g:"t"},{id:"radical",label:"激进女权",g:"t"},
  {id:"black",label:"黑人女权主义",g:"t"},{id:"postcolonial",label:"后殖民女权",g:"t"},
  {id:"queer",label:"酷儿理论",g:"t"},{id:"trans",label:"跨性别女权",g:"t"},
  {id:"intersectional",label:"交叉性女权",g:"t"},{id:"anarcha",label:"无政府女权",g:"t"},
  {id:"abolition",label:"废除主义女权",g:"t"},{id:"material",label:"物质女权主义",g:"t"},
  {id:"disability",label:"残障正义",g:"t"},{id:"srt",label:"社会再生产理论",g:"c"},
  {id:"perf",label:"表演性",g:"c"},{id:"genderabol",label:"性别废除",g:"c"},
  {id:"ra",label:"关系无政府主义",g:"c"},{id:"aroma",label:"无浪漫爱",g:"c"},
  {id:"comphet",label:"强制异性恋",g:"c"},{id:"cyborg",label:"赛博格",g:"c"},
  {id:"carecris",label:"照护危机",g:"c"},
  {id:"butler",label:"Butler",g:"f"},{id:"federici",label:"Federici",g:"f"},
  {id:"hooks",label:"bell hooks",g:"f"},{id:"spivak",label:"Spivak",g:"f"},
  {id:"haraway",label:"Haraway",g:"f"},{id:"crenshaw",label:"Crenshaw",g:"f"},
  {id:"rich",label:"Rich",g:"f"},{id:"halberstam",label:"Halberstam",g:"f"},
];
const GE = [
  ["marxist","srt"],["marxist","federici"],["marxist","material"],
  ["radical","genderabol"],["radical","comphet"],
  ["black","intersectional"],["black","hooks"],["black","crenshaw"],
  ["postcolonial","spivak"],["postcolonial","intersectional"],
  ["queer","butler"],["queer","perf"],["queer","genderabol"],["queer","trans"],["queer","comphet"],["queer","halberstam"],
  ["trans","genderabol"],["intersectional","crenshaw"],["intersectional","postcolonial"],
  ["anarcha","ra"],["anarcha","abolition"],["ra","aroma"],["aroma","comphet"],
  ["comphet","rich"],["srt","carecris"],["srt","federici"],["perf","butler"],
  ["material","haraway"],["material","cyborg"],["cyborg","haraway"],
  ["disability","intersectional"],["disability","abolition"],
  ["hooks","intersectional"],["abolition","intersectional"],
];
const GC: Record<string, string> = { t: "#8B7EC8", c: "#D4726A", f: "#5A9E8F" };

function ForceGraph({ t }: { t: ReturnType<typeof useTheme> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const nodes = useRef<Array<{ id: string; label: string; g: string; x: number; y: number; vx: number; vy: number }>>([]);
  const [hov, setHov] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const raf = useRef<number>(0);
  const dr = useRef<string | null>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (el) setDims({ w: el.clientWidth, h: el.clientHeight });
    const o = new ResizeObserver((e) => {
      for (const x of e) setDims({ w: x.contentRect.width, h: x.contentRect.height });
    });
    if (el) o.observe(el);
    return () => o.disconnect();
  }, []);

  useEffect(() => {
    const cx = dims.w / 2, cy = dims.h / 2;
    nodes.current = GN.map((n, i) => ({
      ...n,
      x: cx + Math.cos(i * 2.399) * 180 + (Math.random() - 0.5) * 100,
      y: cy + Math.sin(i * 2.399) * 180 + (Math.random() - 0.5) * 100,
      vx: 0, vy: 0,
    }));
  }, [dims]);

  const tick = useCallback(() => {
    const ns = nodes.current;
    const cx = dims.w / 2, cy = dims.h / 2;
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[j].x - ns[i].x, dy = ns[j].y - ns[i].y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = 800 / (d * d);
        ns[i].vx -= (dx / d) * f; ns[i].vy -= (dy / d) * f;
        ns[j].vx += (dx / d) * f; ns[j].vy += (dy / d) * f;
      }
    }
    const m: Record<string, (typeof ns)[0]> = {};
    ns.forEach((n) => (m[n.id] = n));
    for (const [a, b] of GE) {
      const na = m[a], nb = m[b];
      if (!na || !nb) continue;
      const dx = nb.x - na.x, dy = nb.y - na.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - 100) * 0.005;
      na.vx += (dx / d) * f; na.vy += (dy / d) * f;
      nb.vx -= (dx / d) * f; nb.vy -= (dy / d) * f;
    }
    for (const n of ns) {
      n.vx += (cx - n.x) * 0.001; n.vy += (cy - n.y) * 0.001;
      n.vx *= 0.92; n.vy *= 0.92;
      if (dr.current !== n.id) { n.x += n.vx; n.y += n.vy; }
      n.x = Math.max(50, Math.min(dims.w - 50, n.x));
      n.y = Math.max(40, Math.min(dims.h - 40, n.y));
    }
  }, [dims]);

  const draw = useCallback(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    c.width = dims.w * dpr; c.height = dims.h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dims.w, dims.h);
    const ns = nodes.current;
    const m: Record<string, (typeof ns)[0]> = {};
    ns.forEach((n) => (m[n.id] = n));
    for (const [a, b] of GE) {
      const na = m[a], nb = m[b];
      if (!na || !nb) continue;
      const hl = hov && (hov === a || hov === b);
      ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = hl ? t.acc + "60" : t.bdr;
      ctx.lineWidth = hl ? 1.5 : 0.5; ctx.stroke();
    }
    for (const x of ns) {
      const hl = hov === x.id;
      const conn = hov && GE.some(([a, b]) => (a === hov && b === x.id) || (b === hov && a === x.id));
      const r = x.g === "f" ? 4 : x.g === "c" ? 5 : 6;
      ctx.globalAlpha = !hov || hl || conn ? 1 : 0.2;
      ctx.beginPath(); ctx.arc(x.x, x.y, hl ? r + 2 : r, 0, Math.PI * 2);
      ctx.fillStyle = GC[x.g]; ctx.fill();
      if (hl) {
        ctx.beginPath(); ctx.arc(x.x, x.y, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = GC[x.g] + "40"; ctx.lineWidth = 1; ctx.stroke();
      }
      if (!hov || hl || conn) {
        ctx.font = `${hl ? "500 13" : "400 11"}px "Noto Serif SC",serif`;
        ctx.fillStyle = hl ? t.tx : t.txM;
        ctx.textAlign = "center"; ctx.fillText(x.label, x.x, x.y - r - 6);
      }
      ctx.globalAlpha = 1;
    }
  }, [dims, hov, t]);

  useEffect(() => {
    let go = true;
    const loop = () => { if (!go) return; tick(); draw(); raf.current = requestAnimationFrame(loop); };
    loop();
    return () => { go = false; cancelAnimationFrame(raf.current); };
  }, [tick, draw]);

  const find = (x: number, y: number) => {
    for (const n of nodes.current) {
      const dx = n.x - x, dy = n.y - y;
      if (dx * dx + dy * dy < 200) return n.id;
    }
    return null;
  };

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: dims.w, height: dims.h, cursor: hov ? "pointer" : "default" }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left, y = e.clientY - rect.top;
          setHov(find(x, y));
          if (dr.current) {
            const n = nodes.current.find((n) => n.id === dr.current);
            if (n) { n.x = x; n.y = y; n.vx = 0; n.vy = 0; }
          }
        }}
        onMouseDown={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const id = find(e.clientX - rect.left, e.clientY - rect.top); if (id) dr.current = id; }}
        onMouseUp={() => (dr.current = null)}
        onMouseLeave={() => { setHov(null); dr.current = null; }}
      />
      <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 16, fontSize: 10, fontFamily: "'DM Sans',sans-serif", color: t.txD }}>
        {([["理论传统", "t"], ["关键概念", "c"], ["代表人物", "f"]] as const).map(([l, g]) => (
          <div key={g} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: GC[g] }} />{l}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 16, right: 16, fontSize: 10, color: t.txD, fontFamily: "'DM Sans',sans-serif" }}>
        拖拽节点 · 悬停查看关联
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════

export default function Home() {
  const [dark, setDark] = useState(true);
  const [dom, setDom] = useState("gender");
  const [med, setMed] = useState<string | null>(null);
  const [mod, setMod] = useState<string | null>(null);
  const [col, setCol] = useState(false);
  const [search, setSearch] = useState("");

  // Data from Supabase
  const [domains, setDomains] = useState<Domain[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const t = useTheme(dark);

  // Fetch data on mount
  useEffect(() => {
    async function load() {
      const [dRes, rRes] = await Promise.all([
        supabase.from("domains").select("*").order("sort_order"),
        supabase.from("resources").select("*").eq("status", "published"),
      ]);
      if (dRes.data) setDomains(dRes.data);
      if (rRes.data) setResources(rRes.data);
      if (dRes.data && dRes.data.length > 0) setDom(dRes.data[0].slug);
      setLoading(false);
    }
    load();
  }, []);

  const domain = domains.find((d) => d.slug === dom);
  const domRes = resources.filter((r) => r.domain_slug === dom);
  const filtered = (med ? domRes.filter((r) => r.media_type === med) : domRes)
    .filter((r) => !search || r.title.includes(search) || (r.title_original?.toLowerCase().includes(search.toLowerCase()) ?? false) || r.authors.some((a) => a.includes(search)));

  const mc: Record<string, number> = {};
  for (const mt of MEDIA_TYPES) mc[mt.slug] = domRes.filter((r) => r.media_type === mt.slug).length;
  const avail = MEDIA_TYPES.filter((mt) => mc[mt.slug] > 0);

  const two = mod !== null;

  // Module content
  const ModuleContent = () => {
    if (mod === "about") return (
      <div style={{ padding: "40px 48px", maxWidth: 640 }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, marginBottom: 8 }}>关于 Covens</h1>
        <p style={{ fontSize: 13, color: t.txD, fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif", marginBottom: 32 }}>阅读即抵抗</p>
        <div style={{ fontSize: 14, lineHeight: 2, color: t.txM }}>
          <p style={{ marginBottom: 16 }}>Covens 是一个华语激进性别政治的共享知识库。我们收集关于交叉性女权、马克思主义女权、酷儿理论、关系无政府主义、去殖民女权等方向的书籍、论文、影视、播客和亚文化实践。</p>
          <p style={{ marginBottom: 16 }}>面向所有华语使用者——无论你在中国大陆、台湾、香港、东南亚还是全球华语离散社群。</p>
          <p style={{ marginBottom: 16 }}>Covens 的名字来自女巫集会。在被猎杀的历史中，女巫们在暗处集结。每一位参与者都是 Sibyl——先知，在裂隙中发声的人。</p>
          <div style={{ width: 32, height: 1, background: t.bdr, margin: "28px 0" }} />
          <p style={{ fontSize: 12, color: t.txD }}>开源 · 无广告 · 无商业赞助</p>
        </div>
      </div>
    );
    if (mod === "forum") return (
      <div style={{ padding: "40px 48px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, marginBottom: 32 }}>讨论广场</h1>
        <div style={{ padding: 48, borderRadius: 12, border: `1px dashed ${t.bdr}`, textAlign: "center" }}>
          <div style={{ fontSize: 32, opacity: 0.15, marginBottom: 12 }}>◫</div>
          <div style={{ fontSize: 13, color: t.txD }}>即将上线</div>
          <div style={{ fontSize: 11, color: t.txD, marginTop: 6, fontFamily: "'DM Sans',sans-serif" }}>匿名 · 话题标签 · 无等级</div>
        </div>
      </div>
    );
    if (mod === "submit") return (
      <div style={{ padding: "40px 48px", maxWidth: 640 }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, marginBottom: 32 }}>供稿</h1>
        <div style={{ fontSize: 14, lineHeight: 2, color: t.txM, marginBottom: 24 }}>
          <p style={{ marginBottom: 16 }}>Covens 欢迎所有 Sibyl 提交资源。尤其欢迎：</p>
          <div style={{ paddingLeft: 16, borderLeft: `2px solid ${t.bdr}` }}>
            <p>· 华语原创</p><p>· 非英语世界的女权 / 酷儿文本</p><p>· 华语离散群体的经验书写</p><p>· 被审查删除的内容存档</p>
          </div>
        </div>
        <div style={{ padding: 36, borderRadius: 12, border: `1px dashed ${t.bdr}`, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: t.txD }}>供稿入口即将开放</div>
        </div>
      </div>
    );
    if (mod === "graph") return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${t.bdr}`, flexShrink: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 400, marginBottom: 4 }}>女权理论图谱</h1>
          <p style={{ fontSize: 12, color: t.txD, fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif" }}>理论传统 · 关键概念 · 代表人物</p>
        </div>
        <ForceGraph t={t} />
      </div>
    );
    return null;
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, color: t.txD, fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontStyle: "italic" }}>
        COVENS...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Noto Serif SC','Cormorant Garamond',Georgia,serif", background: t.bg, color: t.tx, height: "100vh", display: "flex", flexDirection: "column", transition: "background .5s ease, color .4s ease", overflow: "hidden" }}>
      <style>{`
        ::-webkit-scrollbar-thumb { background: ${t.bdr}; }
        .hbg:hover { background: ${t.bgH} !important; }
        .hs:hover { background: ${t.accS} !important; }
        .hb:hover { border-color: ${t.bdrA} !important; }
        .ho:hover { opacity: .75 !important; }
        @keyframes fu { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fu .3s ease forwards; }
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: `1px solid ${t.bdr}`, fontFamily: "'DM Sans',sans-serif", fontSize: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 16, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, letterSpacing: ".12em", cursor: "pointer" }}
            onClick={() => { setMod(null); setMed(null); }}>COVENS</span>
          <span style={{ color: t.txD, fontSize: 11, fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif" }}>阅读即抵抗</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button style={{ color: t.txM, background: "none", border: `1px solid ${t.bdr}`, borderRadius: 4, padding: "3px 10px", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}>简 / 繁</button>
          <div style={{ display: "flex", gap: 2, background: t.bgC, border: `1px solid ${t.bdr}`, borderRadius: 16, padding: "3px", cursor: "pointer" }} onClick={() => setDark(!dark)}>
            {(["☀", "☽"] as const).map((ic, i) => (
              <div key={ic} style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, background: (i === 0 ? !dark : dark) ? t.acc : "transparent", color: (i === 0 ? !dark : dark) ? (dark ? "#0A090D" : "#fff") : t.txD, transition: "all .3s ease" }}>{ic}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ PANELS ═══ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* LEFT: Domains + Modules */}
        <div style={{ width: col ? 50 : 210, borderRight: `1px solid ${t.bdr}`, display: "flex", flexDirection: "column", transition: "width .3s ease", flexShrink: 0, overflow: "hidden" }}>
          <div style={{ padding: col ? "10px 0" : "10px 14px", borderBottom: `1px solid ${t.bdr}`, display: "flex", justifyContent: col ? "center" : "space-between", alignItems: "center" }}>
            {!col && <span style={{ fontSize: 10, color: t.txD, fontFamily: "'DM Sans',sans-serif", letterSpacing: ".12em", textTransform: "uppercase" as const }}>议题域</span>}
            <button onClick={() => setCol(!col)} style={{ background: "none", border: "none", color: t.txD, cursor: "pointer", fontSize: 11, padding: 2 }}>{col ? "›" : "‹"}</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: col ? "6px 4px" : "6px 8px" }}>
            {domains.map((d) => (
              <button key={d.slug} className="hs"
                onClick={() => { setDom(d.slug); setMed(null); setMod(null); setSearch(""); }}
                style={{ display: "flex", alignItems: col ? "center" : "flex-start", justifyContent: col ? "center" : "flex-start", gap: col ? 0 : 10, width: "100%", padding: col ? "10px 0" : "9px 10px", marginBottom: 1, background: !mod && dom === d.slug ? t.accS : "transparent", border: "none", borderRadius: 6, cursor: "pointer", color: !mod && dom === d.slug ? t.tx : t.txM, textAlign: "left" as const, fontSize: 12.5, position: "relative" as const, fontFamily: "'Noto Serif SC',serif", transition: "all .15s ease" }}>
                <span style={{ fontSize: col ? 15 : 12, flexShrink: 0, opacity: 0.65, fontFamily: "serif" }}>{d.icon}</span>
                {!col && <div style={{ lineHeight: 1.5 }}>{d.name_zh}</div>}
                {!mod && dom === d.slug && <div style={{ position: "absolute" as const, left: 0, top: "50%", transform: "translateY(-50%)", width: 2, height: 18, borderRadius: 1, background: d.color }} />}
              </button>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${t.bdr}`, padding: col ? "8px 4px" : "8px 8px" }}>
            {!col && <div style={{ fontSize: 10, color: t.txD, fontFamily: "'DM Sans',sans-serif", letterSpacing: ".1em", textTransform: "uppercase" as const, padding: "4px 10px 6px" }}>更多</div>}
            {MODULES.map((m) => (
              <button key={m.id} className="hs"
                onClick={() => setMod(m.id)}
                style={{ display: "flex", alignItems: col ? "center" : "flex-start", justifyContent: col ? "center" : "flex-start", gap: col ? 0 : 9, width: "100%", padding: col ? "8px 0" : "7px 10px", marginBottom: 1, background: mod === m.id ? t.accS : "transparent", border: "none", borderRadius: 6, cursor: "pointer", color: mod === m.id ? t.tx : t.txD, textAlign: "left" as const, fontSize: 12, position: "relative" as const, fontFamily: "'DM Sans',sans-serif", transition: "all .15s ease" }}>
                <span style={{ fontSize: col ? 14 : 12, flexShrink: 0, opacity: 0.6 }}>{m.icon}</span>
                {!col && <span>{m.label}</span>}
                {mod === m.id && <div style={{ position: "absolute" as const, left: 0, top: "50%", transform: "translateY(-50%)", width: 2, height: 14, borderRadius: 1, background: t.acc }} />}
              </button>
            ))}
          </div>
        </div>

        {two ? (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><ModuleContent /></div>
        ) : (
          <>
            {/* CENTER: Media Types */}
            <div style={{ width: 190, borderRight: `1px solid ${t.bdr}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.bdr}` }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 13, opacity: 0.6, fontFamily: "serif" }}>{domain?.icon}</span>
                  <h2 style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{domain?.name_zh}</h2>
                </div>
                <div style={{ fontSize: 10, color: t.txD, fontFamily: "'Cormorant Garamond',serif", marginTop: 3, fontStyle: "italic" }}>{domain?.name_en}</div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
                <div style={{ fontSize: 10, color: t.txD, fontFamily: "'DM Sans',sans-serif", letterSpacing: ".1em", textTransform: "uppercase" as const, padding: "8px 8px 6px" }}>媒介</div>
                {avail.map((mt) => (
                  <button key={mt.slug} className="hs"
                    onClick={() => setMed(med === mt.slug ? null : mt.slug)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 10px", marginBottom: 1, background: med === mt.slug ? t.accS : "transparent", border: "none", borderRadius: 6, cursor: "pointer", color: med === mt.slug ? t.tx : t.txM, textAlign: "left" as const, fontSize: 12, fontFamily: "'DM Sans',sans-serif", transition: "all .15s ease", position: "relative" as const }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 12 }}>{mt.icon}</span><span>{mt.label}</span>
                    </div>
                    <span style={{ fontSize: 10, color: t.txD, minWidth: 16, textAlign: "right" as const }}>{mc[mt.slug]}</span>
                    {med === mt.slug && <div style={{ position: "absolute" as const, left: 0, top: "50%", transform: "translateY(-50%)", width: 2, height: 14, borderRadius: 1, background: domain?.color }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Resource Cards */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              <div style={{ padding: "8px 24px 4px" }}>
                <input
                  type="text" placeholder="搜索…" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", background: t.bgS, border: `1px solid ${t.bdr}`, borderRadius: 6, padding: "7px 12px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: t.tx, outline: "none" }}
                />
              </div>
              <div style={{ padding: "10px 24px 6px", fontSize: 11, color: t.txD, fontFamily: "'DM Sans',sans-serif" }}>
                {filtered.length} 个资源{med && " · " + MEDIA_TYPES.find((mt) => mt.slug === med)?.label}
              </div>

              {filtered.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", color: t.txD }}>
                  <div style={{ fontSize: 28, opacity: 0.12, marginBottom: 12 }}>☽</div>
                  <div style={{ fontSize: 13, fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif" }}>等待 Sibyl 投稿…</div>
                </div>
              ) : (
                filtered.map((r, idx) => {
                  const mt = MEDIA_TYPES.find((m) => m.slug === r.media_type);
                  return (
                    <div key={r.id} className="fu"
                      style={{ margin: "0 16px 12px", padding: "18px 22px", borderRadius: 10, border: `1px solid ${t.bdr}`, background: t.bgC, animationDelay: `${idx * 50}ms`, opacity: 0, transition: "border-color .2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.bdrA)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.bdr)}>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 12 }}>{mt?.icon}</span>
                        <span style={{ fontSize: 10, color: t.txD, fontFamily: "'DM Sans',sans-serif" }}>{mt?.label}</span>
                        {r.year && <><span style={{ fontSize: 10, color: t.txD }}>·</span><span style={{ fontSize: 10, color: t.txD, fontFamily: "'DM Sans',sans-serif" }}>{r.year}</span></>}
                      </div>

                      <div style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.5, marginBottom: 2 }}>{r.title}</div>
                      {r.title_original && r.title_original !== r.title && (
                        <div style={{ fontSize: 13, color: t.txM, fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif", marginBottom: 4 }}>{r.title_original}</div>
                      )}
                      {r.authors.length > 0 && (
                        <div style={{ fontSize: 12, color: t.txM, fontFamily: "'DM Sans',sans-serif", marginBottom: 10 }}>{r.authors.join(" / ")}</div>
                      )}

                      {r.summary && <div style={{ fontSize: 12.5, lineHeight: 1.9, color: t.txD, marginBottom: 14 }}>{r.summary}</div>}

                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: r.external_links && Object.keys(r.external_links).length > 0 ? 12 : 0 }}>
                        {r.tags.map((tag) => (
                          <span key={tag} className="hb" style={{ padding: "2px 9px", borderRadius: 10, fontSize: 10, border: `1px solid ${t.bdr}`, color: t.txD, fontFamily: "'Noto Serif SC',serif", cursor: "pointer", transition: "border-color .15s ease" }}>{tag}</span>
                        ))}
                      </div>

                      {r.external_links && Object.keys(r.external_links).length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {Object.entries(r.external_links).map(([name, url]) => (
                            <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="ho"
                              style={{ padding: "3px 10px", borderRadius: 4, fontSize: 10, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", background: (LINK_COLORS[name] || "#666") + "12", color: LINK_COLORS[name] || t.txM, transition: "opacity .15s ease", textDecoration: "none" }}>
                              {name} <span style={{ opacity: 0.4 }}>↗</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div style={{ height: 40 }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
