import { motion, useInView } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

// Default export: HabitatDashboard React component
// TailwindCSS is used for styling. This is a single-file interactive dashboard
// that translates the provided design into an interactive UI wireframe.

export default function HabitatDashboard() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [energyMode, setEnergyMode] = useState("solar");
  const [selectedMaterial, setSelectedMaterial] = useState("Aluminio-Litio");
  const [timelineOpen, setTimelineOpen] = useState(0);

  return (
  <div className="min-h-screen bg-slate-900 text-slate-100 p-8 space-y-8 font-['zen-dots-regular'] max-w-[1200px] mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-mars">Hábitat - Diseño y Arquitectura (prototipo)</h1>
        <div className="space-x-3">
          <ExportButtons />
        </div>
      </header>

  <main className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-6">
          <Card title="1. Diseño modular y Tipos de Módulos">
            <ModuleDiagram
              selectedModule={selectedModule}
              onSelectModule={(m) => setSelectedModule(m)}
            />
            {selectedModule && (
              <div className="mt-4 p-3 bg-slate-800 rounded">
                <h3 className="font-semibold">{selectedModule.name}</h3>
                <p className="text-sm mt-1">{selectedModule.description}</p>
              </div>
            )}
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card title="Formas Geométricas">
              <GeometryCarousel />
            </Card>

            <Card title="Blindaje y Protección">
              <ShieldSection />
            </Card>
          </div>

          <Card title="3. Sostenibilidad y Recursos Esenciales">
            <ECLSSFlow />
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <EnergyToggle mode={energyMode} setMode={setEnergyMode} />
              <CropGallery />
            </div>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card title="Materiales y Métodos de Construcción">
            <MaterialsTabs
              selectedMaterial={selectedMaterial}
              onSelect={setSelectedMaterial}
            />
            <TimelineAccordion
              openIndex={timelineOpen}
              onToggle={(i) => setTimelineOpen(openIndex => (openIndex === i ? -1 : i))}
            />
            <div className="mt-4">
              <ISRUAnimation />
            </div>
          </Card>

          <Card title="Resumen rápido">
            <QuickSummary />
          </Card>
        </aside>
      </main>

      <footer className="text-sm text-slate-400 text-center mt-6">Prototipo interactivo — adapta y conecta con datos reales según necesidad</footer>
    </div>
  );
}

/* ---------------------- Helper UI Components ---------------------- */
function Card({ title, children }) {
  return (
    <div className="bg-slate-800/60 border border-mars/40 rounded-2xl p-6 shadow-md max-w-full">
      <h2 className="text-base md:text-lg font-semibold mb-3 text-mars">{title}</h2>
      {children}
    </div>
  );
}

/* ---------------------- Export Buttons (CSV) ---------------------- */
function ExportButtons() {
  function downloadCSV(filename, rows) {
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const sampleModules = [
    ["nombre", "tipo", "descripcion"],
    ["Vivienda", "Imprescindible", "Alojamiento principal con soporte vital"],
    ["ISRU", "Imprescindible", "Procesamiento de regolito para construcción"],
  ];

  return (
    <div className="flex gap-2">
      <button
        onClick={() => downloadCSV("modules.csv", sampleModules)}
        className="px-3 py-1 rounded bg-mars hover:bg-mars/80 text-white text-xs md:text-sm font-semibold"
      >
        Exportar módulos (CSV)
      </button>
      <button
        onClick={() => downloadCSV("materials.csv", [["material","propiedad"],["Aluminio-Litio","Ligero y resistente"]])}
        className="px-3 py-1 rounded bg-mars/70 hover:bg-mars/90 text-white text-xs md:text-sm font-semibold"
      >
        Exportar materiales
      </button>
    </div>
  );
}

/* ---------------------- Module Diagram (interactive SVG) ---------------------- */
const MODULES = [
  { id: "vivienda", name: "Vivienda", description: "Módulo principal para dormir, trabajar y soporte vital." , x: 40, y: 40 },
  { id: "isru", name: "ISRU", description: "Procesamiento de regolito y producción de material de construcción.", x: 140, y: 40 },
  { id: "habitat", name: "Laboratorio", description: "Laboratorios y talleres para investigación.", x: 90, y: 120 },
  { id: "storage", name: "Almacenamiento", description: "Depósito de recursos, propulsantes y repuestos.", x: 220, y: 120 },
];

function ModuleDiagram({ selectedModule, onSelectModule }) {
  return (
    <div className="w-full flex gap-4 items-start">
      <svg viewBox="0 0 300 200" className="w-full max-w-2xl h-56 bg-slate-900/30 rounded-xl p-2">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* base outline */}
        <rect x="5" y="5" width="290" height="190" rx="12" fill="none" stroke="#334155" />

        {/* modules as circles */}
        {MODULES.map((m) => (
          <g key={m.id} className="cursor-pointer" onClick={() => onSelectModule(m)}>
            <circle
              cx={m.x}
              cy={m.y}
              r={28}
              fill={selectedModule?.id === m.id ? "#0ea5a4" : "#475569"}
              stroke={selectedModule?.id === m.id ? "#06b6d4" : "#94a3b8"}
              strokeWidth={selectedModule?.id === m.id ? 3 : 1}
              style={{ filter: selectedModule?.id === m.id ? "url(#glow)" : "none" }}
            />
            <text x={m.x} y={m.y + 40} textAnchor="middle" fontSize="10" fill="#cbd5e1">{m.name}</text>
          </g>
        ))}

        {/* connections */}
        <line x1="68" y1="42" x2="120" y2="110" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 2" />
        <line x1="170" y1="42" x2="200" y2="120" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 2" />
      </svg>

  <div className="w-80 max-w-full">
        <h4 className="font-medium">Interactúa con los módulos</h4>
        <p className="text-sm text-slate-300 mt-2">Haz clic en un módulo para ver su descripción. Hover también ilumina el módulo.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {MODULES.map(m => (
            <button
              key={m.id}
              onClick={() => onSelectModule(m)}
              className={`text-left p-2 rounded border ${selectedModule?.id === m.id ? 'border-mars bg-slate-800' : 'border-slate-700'}`}
            >
              <div className="font-semibold text-mars text-xs md:text-sm">{m.name}</div>
              <div className="text-xs text-white/60 truncate max-w-[120px]">{m.description.slice(0,40)}...</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Geometry Carousel ---------------------- */
function GeometryCarousel() {
  const shapes = [
    { id: 'esfera', title: 'Esfera', pro: 'Ideal para presión interna', con: 'Difícil de empacar' },
    { id: 'cilindro', title: 'Cilindro', pro: 'Fácil de construir y apilar', con: 'Puntos de estrés en los extremos' },
    { id: 'prisma', title: 'Prisma', pro: 'Modular y plano', con: 'Menos eficiente para presión' },
    { id: 'domo', title: 'Domo', pro: 'Buena distribución de cargas', con: 'Complejo para ensamblar' },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(i => (i+1)%shapes.length), 4500); return () => clearInterval(t); }, [shapes.length]);

  return (
    <div className="space-y-3">
      <div className="h-40 flex items-center justify-center bg-slate-900/30 rounded">
        <motion.div
          key={shapes[idx].id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center p-4"
        >
          <div className="text-base md:text-lg font-semibold text-mars">{shapes[idx].title}</div>
          <div className="text-xs md:text-sm mt-2">{shapes[idx].pro}</div>
          <div className="text-xs text-mars/70 mt-1">Contra: {shapes[idx].con}</div>
        </motion.div>
      </div>
      <div className="flex gap-2 justify-center">
        {shapes.map((s,i) => (
          <button key={s.id} onClick={() => setIdx(i)} className={`w-6 h-2 rounded ${i===idx? 'bg-mars' : 'bg-slate-700'}`}></button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------- Shield Section (scroll-triggered) ---------------------- */
function ShieldSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  return (
    <div ref={ref} className="space-y-3">
      <div className="relative overflow-hidden rounded bg-slate-900/40 h-48 p-4">
        <div className="absolute left-2 top-2 text-xs text-slate-400">Scroll para ver capas</div>
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isInView ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ originY: 0 }}
          className="h-full flex flex-col justify-between"
        >
          <Layer label="Estructura" detail="Armazón metálico" />
          <Layer label="Polietileno" detail="Aislamiento contra radiación" />
          <Layer label="Mallas" detail="Contención y redundancia" />
          <Layer label="Regolito Exterior" detail="Protección micrometeoritos" last />
        </motion.div>
      </div>
    </div>
  );
}

function Layer({ label, detail, last }) {
  return (
    <div className={`p-2 rounded ${last ? 'bg-slate-700/50' : 'bg-slate-800/30'} border border-slate-700`}>
      <div className="font-medium">{label}</div>
      <div className="text-xs text-slate-400">{detail}</div>
    </div>
  );
}

/* ---------------------- Materials Tabs ---------------------- */
function MaterialsTabs({ selectedMaterial, onSelect }) {
  const materials = [
    { id: 'Aluminio-Litio', props: ['Ligero', 'Alta resistencia', 'Corrección térmica'] },
    { id: 'Fibra de Carbono', props: ['Alta resistencia', 'Baja densidad', 'Costosa'] },
    { id: 'Polietileno', props: ['Excelente protección radiación', 'Flexible', 'Ligero'] },
  ];

  const mat = materials.find(m => m.id === selectedMaterial) || materials[0];

  return (
    <div>
      <div className="flex gap-2">
        {materials.map(m => (
          <button key={m.id} onClick={() => onSelect(m.id)} className={`px-2 py-1 rounded text-sm ${m.id === selectedMaterial ? 'bg-cyan-600' : 'bg-slate-700'}`}>
            {m.id}
          </button>
        ))}
      </div>
      <div className="mt-3 p-3 border rounded bg-slate-900/30">
        <div className="font-semibold">{mat.id}</div>
        <div className="flex mt-2 gap-3 flex-wrap">
          {mat.props.map(p => (
            <div key={p} className="text-xs px-2 py-1 bg-slate-800 rounded border">{p}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Timeline Accordion ---------------------- */
function TimelineAccordion({ openIndex, onToggle }) {
  const phases = [
    { title: 'Fase 1 - Aterrizaje y Despliegue Robótico', body: 'Robots desplegados preparan la base: plataformas, anclajes y primeros módulos.' },
    { title: 'Fase 2 - Ensamblaje y Presurización', body: 'Ensamblaje humano/robótico, pruebas de hermeticidad y activación del ECLSS.' },
    { title: 'Fase 3 - Blindaje y Expansión', body: 'Adición de capas de regolito, ampliación de módulos y agricultura.' },
  ];

  return (
    <div className="mt-4">
      {phases.map((p,i) => (
        <div key={i} className="mb-2">
          <button onClick={() => onToggle(i)} className="w-full text-left p-2 rounded bg-slate-800 border border-slate-700">
            <div className="flex justify-between items-center">
              <div className="font-medium">{p.title}</div>
              <div className="text-slate-400">{openIndex === i ? '-' : '+'}</div>
            </div>
          </button>
          {openIndex === i && (
            <div className="p-2 text-sm bg-slate-900/40 border border-slate-700">{p.body}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------------- ISRU Animation (simple SVG loop) ---------------------- */
function ISRUAnimation() {
  return (
    <div className="p-3 rounded bg-slate-900/30">
      <div className="font-semibold">ISRU - Proceso</div>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex flex-col items-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#94a3b8" strokeWidth="1.2"/></svg>
          <div className="text-xs mt-1">Toma regolito</div>
        </div>
        <div className="text-2xl">→</div>
        <div className="flex flex-col items-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" stroke="#94a3b8" strokeWidth="1.2"/></svg>
          <div className="text-xs mt-1">Procesamiento</div>
        </div>
        <div className="text-2xl">→</div>
        <div className="flex flex-col items-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="#94a3b8" strokeWidth="1.2"/></svg>
          <div className="text-xs mt-1">Impresión 3D</div>
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-2">Loop animado esquemático para explicar la conversión regolito → material de construcción.</div>
    </div>
  );
}

/* ---------------------- ECLSS Flow (diagram) ---------------------- */
function ECLSSFlow() {
  return (
    <div className="mt-2 p-3 rounded bg-slate-900/30">
      <div className="font-semibold">ECLSS - Ciclo Cerrado</div>
      <div className="mt-3 grid grid-cols-3 gap-4 text-center">
        <FlowNode title="Agua" subtitle="Condensación → Filtrado → Almacen." />
        <FlowNode title="Aire" subtitle="CO2 → Scrubbers → O2" />
        <FlowNode title="Residuos" subtitle="Procesamiento → Compostaje" />
      </div>
    </div>
  );
}

function FlowNode({ title, subtitle }) {
  return (
    <div className="p-2 border rounded bg-slate-800/40">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
    </div>
  );
}

/* ---------------------- Energy Toggle ---------------------- */
function EnergyToggle({ mode, setMode }) {
  return (
    <div className="p-3 bg-slate-900/30 rounded border">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Energía</div>
          <div className="text-xs text-slate-400">Selector de fuente</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('solar')} className={`px-2 py-1 rounded ${mode==='solar' ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700'}`}>Solar</button>
          <button onClick={() => setMode('kilopower')} className={`px-2 py-1 rounded ${mode==='kilopower' ? 'bg-rose-500 text-slate-900' : 'bg-slate-700'}`}>Kilopower</button>
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-300">{mode === 'solar' ? 'Paneles solares desplegados — dependencia de iluminación.' : 'Reactor Kilopower — potente y compacto, requiere blindaje.'}</div>
    </div>
  );
}

/* ---------------------- Crop Gallery ---------------------- */
function CropGallery() {
  const crops = [
    { name: 'Lechuga', time: '30 días' },
    { name: 'Papas', time: '70 días' },
    { name: 'Algas', time: '10 días' },
    { name: 'Tomate', time: '60 días' },
  ];

  return (
    <div className="p-3 rounded bg-slate-900/30">
      <div className="font-semibold">Galería de cultivos</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {crops.map(c => (
          <div key={c.name} className="p-2 border rounded bg-slate-800/40 text-xs">
            <div className="font-medium">{c.name}</div>
            <div className="text-slate-400">Tiempo de cosecha: {c.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------- Quick Summary ---------------------- */
function QuickSummary() {
  return (
    <div className="text-sm space-y-2">
      <div>• Fase 1: Robótico — despliegue y estabilización.</div>
      <div>• Fase 2: Ensamblaje humano/robot y activación ECLSS.</div>
      <div>• Fase 3: Blindaje, ISRU e incremento de agricultura.</div>
      <div className="text-xs text-slate-400 mt-2">Puedes conectar estos bloques con datos reales (e.g., rendimiento paneles solares, consumo ECLSS) para hacer simulaciones.</div>
    </div>
  );
}

/* ---------------------- End of file ---------------------- */
