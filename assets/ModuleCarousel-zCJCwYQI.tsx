// TypeScript interfaces for modules and sensors
interface ModuleSpec {
  capacidad_maxima: string;
  presion_interna: string;
  composicion_atmosfera: string;
  reserva_oxigeno: string;
  ciclo_agua: string;
  temperatura_operacional: string;
}

interface Sensor {
  nombre: string;
  funcion: string;
}

interface Module {
  nombre: string;
  funcion_principal: string;
  especificaciones?: ModuleSpec;
  sensores?: Sensor[];
}

interface ModulePhase {
  title: string;
  img: string;
  descripcion: string;
  modulos: Module[];
}
import React, { useEffect, useRef, useState } from 'react';

import extraImg from '../assets/module-extra.jpg';
import impImg from '../assets/module-imprescindible.jpg';
import presImg from '../assets/module-prescindible.jpg';

import FasesModulares from './FasesModulares';

// Data for each phase (with modules)
const MODULE_PHASES: ModulePhase[] = [
  {
    title: 'Fase 1: imprescindibles',
    img: impImg,
    descripcion: 'Los esenciales para sobrevivir y establecer presencia humana inicial.',
    modulos: [
      {
        nombre: 'Vivienda (Hábitat principal)',
        funcion_principal: 'Espacio vital: dormitorios, cocina, baño y área común. Incluye soporte vital (O₂, temperatura, agua).',
        especificaciones: {
          capacidad_maxima: '4 tripulantes (inicial)',
          presion_interna: '70 kPa (~0.7 atm)',
          composicion_atmosfera: '50% O₂ y 50% N₂',
          reserva_oxigeno: '500 litros de O₂ líquido (7 días de soporte total)',
          ciclo_agua: '95% de reciclaje',
          temperatura_operacional: '20 - 24 °C',
        },
        sensores: [
          { nombre: 'Sensor de CO₂ (SCD30)', funcion: 'Activa depuradores si CO₂ > 5000 ppm (alerta de salud).' },
          { nombre: 'Sensor de O₂ (ZE07-O2)', funcion: 'Monitorea nivel; activa suministro de emergencia si baja de 48%.' },
          { nombre: 'Sensor de Presión (BME280)', funcion: 'Detección rápida de fugas; activa sellos automáticos y alertas de despresurización.' },
          { nombre: 'Sensor Infrarrojo (PIR)', funcion: 'Detección de movimiento para ahorro de energía e iluminación.' },
        ],
      },
      {
        nombre: 'Energía',
        funcion_principal: 'Generación, almacenamiento y distribución eléctrica (mínimo 20 kW continuos).',
        sensores: [
          { nombre: 'Sensor de Corriente/Voltaje', funcion: 'Controla el rendimiento de los paneles y detecta sobrecargas/cortocircuitos.' },
          { nombre: 'Sensor de Temperatura (RTD Pt100)', funcion: 'Previene fallas por sobrecalentamiento en baterías y reactor.' },
          { nombre: 'Sensor de Radiación (Dosímetro)', funcion: 'Asegura el blindaje del reactor y la seguridad de la tripulación.' },
        ],
      },
      // ...otros módulos de Fase 1...
    ],
  },
  {
    title: 'Fase 2: prescindibles',
    img: presImg,
    descripcion: 'Para mejorar autonomía y sostenibilidad, pero no críticos al inicio.',
    modulos: [
      {
        nombre: 'Laboratorio Científico',
        funcion_principal: 'Investigación geológica, biológica y química. Ensayos para producción de materiales locales.',
      },
      // ...otros módulos de Fase 2...
    ],
  },
  {
    title: 'Fase 3: extras',
    img: extraImg,
    descripcion: 'Pensados para misiones de larga duración o colonias permanentes.',
    modulos: [
      {
        nombre: 'Recreación / Social',
        funcion_principal: 'Soporte psicológico, ejercicio físico y cohesión grupal.',
      },
      // ...otros módulos de Fase 3...
    ],
  },
];

const AUTO_ADVANCE_MS = 5000;

export default function ModuleCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setActiveIdx(idx => (idx + 1) % MODULE_PHASES.length);
          return 0;
        }
        return prev + 2;
      });
    }, AUTO_ADVANCE_MS / 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIdx]);

  const handleDotClick = (idx: number) => {
    setActiveIdx(idx);
    setProgress(0);
  };

  return (
    <div>
      <section className="bg-white/5 rounded-lg p-6 mb-6 shadow-lg">
        <h2 className="orbitron-subtitle text-2xl font-bold mb-2 flex items-center gap-2">
          <span></span> Módulos
        </h2>
        <p className="zalando-text text-sm text-white mt-6 mb-8">
          Los módulos de la base marciana se dividen en tres fases: imprescindibles, prescindibles y extras. Cada una representa un nivel de prioridad para establecer y expandir una colonia humana en Marte.
        </p>
        <div className="h-8" />
        <div className="flex gap-6 justify-center items-center mt-6 mb-4">
          {MODULE_PHASES.map((phase, idx) => {
            const isActive = activeIdx === idx;
            const isHover = hoverIdx === idx;
            const containerScale = (isActive ? 1.3 : 1) * (isHover ? 1.1 : 1);
            return (
              <div key={phase.title} className="flex-1 flex flex-col items-center">
                <button
                  type="button"
                  className={`w-48 h-48 bg-black/10 rounded-lg border border-white/20 flex items-center justify-center relative overflow-hidden transition-all duration-300 ${isActive ? 'z-10' : 'opacity-40'}`}
                  style={{ transform: `scale(${containerScale})`, zIndex: isActive ? 10 : 1 }}
                  onMouseEnter={() => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onClick={() => setModalIdx(idx)}
                  aria-pressed={isActive}
                >
                  {/* image background - keep its visual size stable by applying inverse scale */}
                  <div
                    className="absolute inset-0 bg-center bg-cover"
                    style={{
                      backgroundImage: `url(${phase.img})`,
                      transform: `scale(${1 / containerScale})`,
                      transition: 'transform 0.1s linear',
                    }}
                  />

                  <div className="relative z-20 flex flex-col items-center justify-center w-full h-full px-2">
                    <span
                      className="orbitron-subtitle text-lg text-white text-center w-full"
                      style={{ textShadow: '0 0 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)' }}
                    >
                      {phase.title}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 h-2 bg-mars" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-8 mb-8">
          {MODULE_PHASES.map((_, idx) => (
            <button
              key={idx}
              className={`w-4 h-4 rounded-full border-2 border-black/30 ${
                activeIdx === idx ? 'bg-mars' : 'bg-white/40'
              } transition`}
              onClick={() => handleDotClick(idx)}
              aria-label={`Ir a fase ${idx + 1}`}
            />
          ))}
        </div>
        <div className="zalando-text text-xs text-white mt-2" />
      </section>

      {/* Modal for phase details */}
      {modalIdx !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative text-white">
            <button
              className="absolute top-4 right-4 px-3 py-1 bg-mars/80 rounded text-white font-bold"
              onClick={() => setModalIdx(null)}
            >
              Cerrar
            </button>
            <h3 className="text-2xl font-bold mb-2 text-mars">{MODULE_PHASES[modalIdx].title}</h3>
            <p className="mb-4 text-base text-white/80">{MODULE_PHASES[modalIdx].descripcion}</p>
            <div className="space-y-4">
              {MODULE_PHASES[modalIdx].modulos.map((mod) => (
                <div key={mod.nombre} className="bg-slate-800/60 rounded-xl p-4 border border-mars/40">
                  <div className="font-bold text-lg text-mars mb-1">{mod.nombre}</div>
                  <div className="text-sm mb-2 text-white/90">{mod.funcion_principal}</div>
                  {'especificaciones' in mod && mod.especificaciones && (
                    <div className="mb-2">
                      <div className="font-semibold text-xs text-white/70 mb-1">Especificaciones:</div>
                      <ul className="text-xs text-white/70 grid grid-cols-2 gap-2">
                        {Object.entries(mod.especificaciones).map(([k, v]: [string, string]) => (
                          <li key={k}><span className="font-bold text-mars">{k.replace(/_/g,' ')}:</span> {v}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {'sensores' in mod && Array.isArray(mod.sensores) && (
                    <div className="mb-2">
                      <div className="font-semibold text-xs text-white/70 mb-1">Sensores:</div>
                      <ul className="text-xs text-white/70 list-disc ml-4">
                        {mod.sensores.map((s: {nombre: string, funcion: string}, j: number) => (
                          <li key={j}><span className="font-bold text-mars">{s.nombre}:</span> {s.funcion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <FasesModulares />
    </div>
  );
}
// End of ModuleCarousel component
