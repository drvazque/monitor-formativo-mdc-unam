const competencyData = [
  { code:'A1', short:'Comprensión e integración de información científica', t0:62, t1:82, uncertainty:6 },
  { code:'A2', short:'Evaluación de evidencia y argumentación', t0:58, t1:77, uncertainty:7 },
  { code:'A3', short:'Razonamiento cuantitativo, lógico y analítico', t0:39, t1:54, uncertainty:8 },
  { code:'A4', short:'Razonamiento científico y diagnóstico', t0:45, t1:69, uncertainty:7 },
  { code:'A5', short:'Juicio ético y responsabilidad profesional', t0:71, t1:86, uncertainty:5 },
  { code:'A6', short:'Uso crítico de información, tecnologías e IA', t0:48, t1:64, uncertainty:8 }
];

const institutionalData = [
  { code:'A1', name:'Comprensión científica', t0:61, t1:78, action:'Conservar tareas de integración de fuentes y reforzar su transferencia entre asignaturas.' },
  { code:'A2', name:'Evaluación de evidencia', t0:55, t1:70, action:'Extender actividades de contraste de argumentos y calidad de fuentes.' },
  { code:'A3', name:'Razonamiento cuantitativo', t0:34, t1:46, action:'Integrar lectura de tablas, variabilidad e incertidumbre en asignaturas del área común.' },
  { code:'A4', name:'Razonamiento científico', t0:43, t1:61, action:'Consolidar la articulación entre preguntas, diseños, evidencia e inferencias.' },
  { code:'A5', name:'Juicio ético', t0:68, t1:82, action:'Mantener el análisis situado de privacidad, consentimiento y consecuencias.' },
  { code:'A6', name:'Tecnologías e IA', t0:41, t1:58, action:'Incorporar actividades sobre trazabilidad, sesgos, seguridad y límites de la IA.' }
];

const navButtons = document.querySelectorAll('.nav-button');
const views = document.querySelectorAll('.view');
navButtons.forEach(button => button.addEventListener('click', () => {
  navButtons.forEach(b => { b.classList.remove('active'); b.removeAttribute('aria-current'); });
  button.classList.add('active'); button.setAttribute('aria-current','page');
  views.forEach(v => v.classList.remove('active'));
  document.getElementById(`${button.dataset.view}-view`).classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}));

let selectedTime = 't1';
let showComparison = true;
const list = document.getElementById('competency-list');

function category(value) {
  if (value >= 75) return ['Fortaleza observada','fortaleza'];
  if (value >= 50) return ['En consolidación','proceso'];
  return ['Requiere mayor evidencia','revision'];
}

function renderCompetencies() {
  list.innerHTML = competencyData.map(item => {
    const value = item[selectedTime];
    const [label] = category(value);
    const delta = item.t1 - item.t0;
    const left = Math.max(0, value - item.uncertainty);
    const width = Math.min(100 - left, item.uncertainty * 2);
    return `<div class="competency-row">
      <div class="competency-code"><span>${item.code}</span><strong>${item.short}</strong></div>
      <div class="bar-track" aria-label="${item.code}: ${value}% de probabilidad estimada">
        <i class="bar-fill" style="width:${value}%"></i>
        <i class="bar-uncertainty" style="left:${left}%;width:${width}%"></i>
        <i class="bar-t0" style="left:${item.t0}%;opacity:${showComparison && selectedTime === 't1' ? 1 : 0}"></i>
      </div>
      <div class="score-label"><strong>${value}%</strong><small>${selectedTime === 't1' ? `+${delta} desde T0` : label}</small></div>
    </div>`;
  }).join('');
}

document.querySelectorAll('[data-time]').forEach(button => button.addEventListener('click', () => {
  selectedTime = button.dataset.time;
  document.querySelectorAll('[data-time]').forEach(b => b.classList.toggle('active', b === button));
  document.getElementById('toggle-comparison').hidden = selectedTime === 't0';
  renderCompetencies();
}));

document.getElementById('toggle-comparison').addEventListener('click', event => {
  showComparison = !showComparison;
  event.currentTarget.textContent = showComparison ? 'Ocultar T0' : 'Mostrar T0';
  event.currentTarget.setAttribute('aria-pressed', String(showComparison));
  renderCompetencies();
});

function heatColor(value) {
  const alpha = .12 + (value/100) * .55;
  return `rgba(23,105,170,${alpha.toFixed(2)})`;
}

const heatmap = document.getElementById('heatmap');
function renderHeatmap() {
  heatmap.innerHTML = institutionalData.map((item, index) => `<button class="heatmap-row ${index === 2 ? 'active' : ''}" data-index="${index}">
    <span class="name"><i>${item.code}</i>${item.name}</span>
    <span class="heat-cell" style="background:${heatColor(item.t0)}">${item.t0}%</span>
    <span class="heat-cell" style="background:${heatColor(item.t1)}">${item.t1}%</span>
    <span class="change-cell">+${item.t1-item.t0}</span>
  </button>`).join('');
  heatmap.querySelectorAll('.heatmap-row').forEach(row => row.addEventListener('click', () => selectPriority(Number(row.dataset.index))));
}

function selectPriority(index) {
  const item = institutionalData[index];
  heatmap.querySelectorAll('.heatmap-row').forEach((r,i) => r.classList.toggle('active', i === index));
  document.getElementById('priority-title').textContent = `${item.code} · ${item.name}`;
  document.getElementById('priority-value').textContent = `${item.t1}%`;
  document.getElementById('priority-copy').textContent = `La cohorte muestra un cambio de +${item.t1-item.t0} puntos respecto de T0. Este patrón orienta una revisión conjunta de las oportunidades de aprendizaje y la evidencia disponible.`;
  document.getElementById('priority-action').textContent = item.action;
}

document.getElementById('reset-filters').addEventListener('click', () => {
  document.querySelectorAll('.filter-bar select').forEach(s => s.selectedIndex = 0);
  selectPriority(2);
});

const dialog = document.getElementById('detail-dialog');
document.querySelector('[data-open-detail]').addEventListener('click', () => dialog.showModal());
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

const toast = document.getElementById('toast');
document.getElementById('download-demo').addEventListener('click', () => {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
});

renderCompetencies();
renderHeatmap();
