const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 260;
canvas.height = window.innerHeight;

let modulos = [];
let conexiones = [];
let formaSeleccionada = null;
let moduloSeleccionado = null;
let creandoConexion = false;
let moduloConexionInicio = null;
let guiaConexion = null;

let arrastrando = false;
let offsetX = 0, offsetY = 0;

let escala = 0.2;
let camX = 0, camY = 0;
let moviendoCamara = false;
let camInicioX, camInicioY;

const datosModulos = {
  vivienda: { fase: 1, o2: -3.6, energia: -2, agua: -5, comida: -2, capacidad: 4 },
  energia: { fase: 1, o2: 0, energia: +10, agua: 0, comida: 0, capacidad: 0 },
  comunicacion: { fase: 1, o2: 0, energia: -1, agua: 0, comida: 0, capacidad: 0 },
  control: { fase: 1, o2: 0, energia: -1.5, agua: 0, comida: 0, capacidad: 0 },
  medico: { fase: 1, o2: -0.2, energia: -0.8, agua: -0.5, comida: 0, capacidad: 1 },
  laboratorio: { fase: 2, o2: 0, energia: -2, agua: -0.3, comida: 0, capacidad: 2 },
  moxie: { fase: 2, o2: +5, energia: -3, agua: 0, comida: 0, capacidad: 0 },
  invernadero: { fase: 2, o2: +2, energia: -3, agua: -2, comida: +4, capacidad: 0 },
  logistica: { fase: 2, o2: 0, energia: -0.5, agua: 0, comida: 0, capacidad: 0 },
  recreacion: { fase: 3, o2: -0.1, energia: -1, agua: -0.5, comida: 0, capacidad: 2 },
  transporte: { fase: 3, o2: 0, energia: -2, agua: 0, comida: 0, capacidad: 0 },
  manufactura: { fase: 3, o2: 0, energia: -3, agua: -0.5, comida: 0, capacidad: 1 },
  visitantes: { fase: 3, o2: -2, energia: -1, agua: -2, comida: -2, capacidad: 3 }
};

const imagenes = {};
for (let tipo in datosModulos) {
  ["cubo", "cilindro", "semiesfera"].forEach(f => {
    const key = `${tipo}_${f}`;
    const img = new Image();
    img.src = `img/${key}.png`;
    imagenes[key] = img;
  });
}

document.querySelectorAll(".forma").forEach(btn => {
  btn.addEventListener("click", () => formaSeleccionada = btn.dataset.forma);
});

document.getElementById("agregarModulo").addEventListener("click", () => {
  const tipo = document.getElementById("moduloSelect").value;
  const personas = parseInt(document.getElementById("numPersonas").value) || 1;
  if (!tipo || !formaSeleccionada) return alert("Selecciona módulo y forma");

  const base = datosModulos[tipo];
  const escalaConsumo = personas / (base.capacidad || 1);
  const nuevo = {
    id: Date.now(),
    tipo, forma: formaSeleccionada, personas,
    x: 2000 + Math.random() * 2000, y: 2000 + Math.random() * 2000,
    ancho: 1000 * (0.7 + 0.05 * escalaConsumo),
    alto: 1000 * (0.7 + 0.05 * escalaConsumo),
    o2: base.o2 * escalaConsumo,
    energia: base.energia * escalaConsumo,
    agua: base.agua * escalaConsumo,
    comida: base.comida * escalaConsumo,
    fase: base.fase
  };
  modulos.push(nuevo);
  dibujar();
  actualizarInfo();
});

document.getElementById("borrarSeleccion").addEventListener("click", () => {
  modulos.pop();
  conexiones = conexiones.filter(c => modulos.find(m => m.id === c.a) && modulos.find(m => m.id === c.b));
  dibujar();
  actualizarInfo();
});

document.getElementById("actualizar").addEventListener("click", () => {
  dibujar();
  actualizarInfo();
});

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const scaleAmount = 1.1;
  const [mx, my] = pantallaAMundo(e.offsetX, e.offsetY);
  if (e.deltaY < 0) escala *= scaleAmount;
  else escala /= scaleAmount;
  escala = Math.min(2, Math.max(0.05, escala));
  camX = mx - (e.offsetX / escala);
  camY = my - (e.offsetY / escala);
  dibujar();
});

canvas.addEventListener("mousedown", e => {
  if (e.button === 1 || e.button === 2) {
    moviendoCamara = true;
    camInicioX = e.clientX;
    camInicioY = e.clientY;
  } else {
    const [mx, my] = pantallaAMundo(e.offsetX, e.offsetY);
    const mod = modulos.find(m => mx > m.x && mx < m.x + m.ancho && my > m.y && my < m.y + m.alto);
    if (creandoConexion && moduloConexionInicio && mod && mod.id !== moduloConexionInicio.id) {
      conexiones.push({ a: moduloConexionInicio.id, b: mod.id });
      creandoConexion = false;
      guiaConexion = null;
      moduloConexionInicio = null;
    } else if (mod) {
      moduloSeleccionado = mod;
      arrastrando = true;
      offsetX = mx - mod.x;
      offsetY = my - mod.y;
    } else moduloSeleccionado = null;
  }
});

canvas.addEventListener("mousemove", e => {
  if (moviendoCamara) {
    camX += (e.clientX - camInicioX) / escala;
    camY += (e.clientY - camInicioY) / escala;
    camInicioX = e.clientX;
    camInicioY = e.clientY;
    dibujar();
  } else if (arrastrando && moduloSeleccionado) {
    const [mx, my] = pantallaAMundo(e.offsetX, e.offsetY);
    moduloSeleccionado.x = mx - offsetX;
    moduloSeleccionado.y = my - offsetY;
    dibujar();
  } else if (creandoConexion && moduloConexionInicio) {
    const [mx, my] = pantallaAMundo(e.offsetX, e.offsetY);
    guiaConexion = { x: mx, y: my };
    dibujar();
  }
});

canvas.addEventListener("mouseup", () => {
  arrastrando = false;
  moviendoCamara = false;
});

canvas.addEventListener("dblclick", e => {
  const [mx, my] = pantallaAMundo(e.offsetX, e.offsetY);
  const mod = modulos.find(m => mx > m.x && mx < m.x + m.ancho && my > m.y && my < m.y + m.alto);
  if (mod) {
    creandoConexion = true;
    moduloConexionInicio = mod;
  }
});

function pantallaAMundo(x, y) {
  return [(x / escala) + camX, (y / escala) + camY];
}

function dibujar() {
  ctx.save();
  ctx.setTransform(escala, 0, 0, escala, -camX * escala, -camY * escala);
  ctx.clearRect(camX, camY, canvas.width / escala, canvas.height / escala);

  // Conexiones
  ctx.lineWidth = 60;
  conexiones.forEach(c => {
    const a = modulos.find(m => m.id === c.a);
    const b = modulos.find(m => m.id === c.b);
    if (a && b) {
      const ax = a.x + a.ancho / 2, ay = a.y + a.alto / 2;
      const bx = b.x + b.ancho / 2, by = b.y + b.alto / 2;
      ctx.strokeStyle = "#888";
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      if (Math.abs(ax - bx) > Math.abs(ay - by)) ctx.lineTo(bx, ay);
      else ctx.lineTo(ax, by);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  });

  if (creandoConexion && moduloConexionInicio && guiaConexion) {
    const a = moduloConexionInicio;
    const ax = a.x + a.ancho / 2, ay = a.y + a.alto / 2;
    const bx = guiaConexion.x, by = guiaConexion.y;
    ctx.strokeStyle = "rgba(0,0,255,0.5)";
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    if (Math.abs(ax - bx) > Math.abs(ay - by)) ctx.lineTo(bx, ay);
    else ctx.lineTo(ax, by);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  modulos.forEach(m => {
    const key = `${m.tipo}_${m.forma}`;
    const img = imagenes[key];
    if (img && img.complete) ctx.drawImage(img, m.x, m.y, m.ancho, m.alto);
    else {
      ctx.fillStyle = "#ccc";
      ctx.fillRect(m.x, m.y, m.ancho, m.alto);
    }
    if (moduloSeleccionado && moduloSeleccionado.id === m.id) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 40;
      ctx.strokeRect(m.x, m.y, m.ancho, m.alto);
    }
  });
  ctx.restore();
  actualizarInfo();
}

function actualizarInfo() {
  const info = document.getElementById("infoModulo");
  info.innerHTML = modulos.map(m =>
    `<p><strong>${m.tipo}</strong> (${m.forma}) Fase ${m.fase} | 👩‍🚀${m.personas}</p>`).join("");
  document.getElementById("efectividadTotal").textContent = calcularEfectividad() + "%";
}

function calcularEfectividad() {
  let sumO2 = 0, sumE = 0, sumA = 0, sumC = 0;
  modulos.forEach(m => {
    sumO2 += m.o2; sumE += m.energia; sumA += m.agua; sumC += m.comida;
  });
  sumE -= conexiones.length * 0.5;
  const o2ok = Math.min(1, (sumO2 + 10) / 10);
  const eok = Math.min(1, (sumE + 10) / 10);
  const aok = Math.min(1, (sumA + 10) / 10);
  const cok = Math.min(1, (sumC + 10) / 10);
  return Math.round((o2ok * 0.3 + eok * 0.25 + aok * 0.2 + cok * 0.15 + 0.1) * 100);
}
