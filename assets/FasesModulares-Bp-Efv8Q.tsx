import React from "react";

export default function FasesModulares() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-justify leading-relaxed">
      <h2 className="text-2xl font-bold mb-4">
        ¿Por qué dividir los módulos en tres fases?
      </h2>

      <p className="mb-4">
        Dividir los módulos de una base marciana en tres fases (
        <strong>imprescindibles</strong>, <strong>prescindibles</strong> y{" "}
        <strong>extras</strong>) es una estrategia científica, técnica y
        económica que busca maximizar la supervivencia humana, minimizar los
        costos logísticos y garantizar la sostenibilidad del asentamiento.
      </p>

      <p className="mb-4">
        Cada módulo que se envía a Marte representa una inversión enorme en
        transporte, diseño y mantenimiento. Enviar un solo kilogramo fuera de la
        Tierra puede costar miles de dólares, por lo que cada envío debe valer
        su costo y cumplir un rol esencial para la vida humana en el planeta
        rojo. Estudios sobre infraestructura espacial señalan que la construcción
        por fases permite reducir costos, aprovechar recursos locales y optimizar
        la logística interplanetaria (
        <a
          href="https://www.researchgate.net/publication/354456789_Infrastructure_and_Logistics_for_Mars_Colonization"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          ResearchGate, 2021
        </a>
        ).
      </p>

      <p className="mb-4">
        Asimismo, las primeras fases pueden ser preparadas por robots autónomos
        antes de la llegada de los humanos. Esta metodología, respaldada por la
        NASA en su documento{" "}
        <em>The Exploration of Mars: Reference Mission</em>, permite instalar y
        probar sistemas energéticos, comunicaciones y estructuras básicas sin
        poner en riesgo vidas humanas (
        <a
          href="https://www.lpi.usra.edu/lunar/mars_mission/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          NASA, LPI Report, 1997
        </a>
        ). Los robots pueden desplegar paneles solares, realizar perforaciones,
        montar módulos presurizados e incluso construir refugios iniciales con
        materiales locales, siguiendo los principios de{" "}
        <em>ISRU (In-Situ Resource Utilization)</em>, como lo plantea la
        investigación{" "}
        <em>Design and Development of the Second Generation Mars Habitat</em> (
        <a
          href="https://ntrs.nasa.gov/citations/20030093500"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          NASA Technical Reports Server
        </a>
        ).
      </p>

      <p className="mb-4">
        Además, estructurar la base en fases permite una adaptación progresiva.
        La primera fase se enfoca en la supervivencia: hábitat, energía, oxígeno
        y comunicación. La segunda se centra en la autosuficiencia: laboratorios,
        invernaderos y producción de oxígeno. Finalmente, la tercera etapa busca
        la expansión, incorporando módulos de confort, manufactura y exploración
        avanzada. Este enfoque modular y escalonado es recomendado por diversos
        estudios de colonización sostenible, como el de Neukart et al. (
        <em>
          Towards Sustainable Horizons: A Comprehensive Blueprint for Mars
          Colonization
        </em>
        ,{" "}
        <a
          href="https://arxiv.org/abs/2301.09741"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          arXiv, 2023
        </a>
        ).
      </p>

      <p className="mt-6 font-semibold">
        En conclusión, la división en tres fases no solo responde a criterios
        técnicos, sino también a una visión estratégica de supervivencia y
        sostenibilidad. Cada módulo se lanza con un propósito vital, cada fase
        se construye sobre la anterior y cada decisión reduce el riesgo y el
        costo de establecer vida humana en Marte.
      </p>
    </div>
  );
}
