/* ============================================================
   INICIALIZAR AOS
   ============================================================ */
AOS.init({ duration: 800, once: true, offset: 100 });

/* ============================================================
   AÑO DINÁMICO
   ============================================================ */
const yearEl = document.getElementById('year');
const yearEl2 = document.getElementById('year2');
if (yearEl) yearEl.textContent = new Date().getFullYear();
if (yearEl2) yearEl2.textContent = new Date().getFullYear();

/* ============================================================
   MENÚ HAMBURGUESA
   ============================================================ */
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
if (hamburger) {
  hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('active'));
  });
}

/* ============================================================
   MODO OSCURO
   ============================================================ */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeIcon.classList.replace('fa-moon', 'fa-sun');
}
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeIcon.classList.toggle('fa-moon', !isDark);
  themeIcon.classList.toggle('fa-sun', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

/* ============================================================
   BOTÓN VOLVER ARRIBA
   ============================================================ */
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('show', window.scrollY > 400);
});
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   IMÁGENES ROTAS → Placeholder elegante
   ============================================================ */
document.querySelectorAll('.mosaico-item img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.display = 'none';
    const parent = img.parentElement;
    parent.style.background = 'linear-gradient(135deg, #d4dfee, #b8c8de)';
    parent.style.display = 'flex';
    parent.style.alignItems = 'center';
    parent.style.justifyContent = 'center';
    if (!parent.querySelector('.placeholder-icon')) {
      const icon = document.createElement('i');
      icon.className = 'fas fa-image placeholder-icon';
      icon.style.color = '#003876';
      icon.style.fontSize = '2rem';
      icon.style.opacity = '0.4';
      parent.appendChild(icon);
    }
  });
});

/* ============================================================
   GALERÍA + LIGHTBOX
   Lee TODOS los .mosaico-item dentro de cada card .galeria-card
   y arma la galería automáticamente.
   ============================================================ */

// Detectar tipo y src de cada mosaico-item
function extraerArchivo(mosaicoItem) {
  const video = mosaicoItem.querySelector('video');
  const img = mosaicoItem.querySelector('img');
  if (video) {
    return { tipo: 'video', src: video.getAttribute('src') };
  }
  if (img) {
    return { tipo: 'imagen', src: img.getAttribute('src') };
  }
  return null;
}

// Crear el lightbox una sola vez y agregarlo al body
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <div class="lightbox-header">
    <div class="lightbox-titulo">
      <i class="fas fa-images"></i>
      <span id="lb-titulo"></span>
      <span class="lightbox-contador" id="lb-contador"></span>
    </div>
    <button class="lightbox-cerrar" id="lb-cerrar" title="Cerrar (ESC)">
      <i class="fas fa-times"></i>
    </button>
  </div>
  <div class="lightbox-main">
    <button class="lightbox-nav lightbox-prev" id="lb-prev" title="Anterior (←)">
      <i class="fas fa-chevron-left"></i>
    </button>
    <div class="lightbox-contenido" id="lb-contenido"></div>
    <button class="lightbox-nav lightbox-next" id="lb-next" title="Siguiente (→)">
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
  <div class="lightbox-thumbs" id="lb-thumbs"></div>
`;
document.body.appendChild(lightbox);

let lbArchivos = [];
let lbIndice = 0;
let lbTitulo = '';

// Añadir data-restantes al 4to mosaico-item si hay más de 4
document.querySelectorAll('.galeria-card').forEach(card => {
  const mosaico = card.querySelector('.mosaico');
  const items = mosaico.querySelectorAll('.mosaico-item');
  if (items.length > 4) {
    items[3].dataset.restantes = items.length - 3;
  }

  // Click en la card → abrir lightbox
  card.addEventListener('click', () => {
    const archivos = [];
    mosaico.querySelectorAll('.mosaico-item').forEach(item => {
      const a = extraerArchivo(item);
      if (a) archivos.push(a);
    });
    if (archivos.length === 0) return;
    abrirLightbox(card.dataset.titulo || 'Galería', archivos, 0);
  });
});

function abrirLightbox(titulo, archivos, indice = 0) {
  lbArchivos = archivos;
  lbIndice = indice;
  lbTitulo = titulo;
  lightbox.classList.add('activo');
  document.body.style.overflow = 'hidden';
  pintarThumbs();
  mostrarActual();
}

function cerrarLightbox() {
  lightbox.classList.remove('activo');
  document.body.style.overflow = '';
  const v = lightbox.querySelector('video');
  if (v) v.pause();
}

function mostrarActual() {
  const item = lbArchivos[lbIndice];
  const cont = document.getElementById('lb-contenido');

  document.getElementById('lb-titulo').textContent = lbTitulo;
  document.getElementById('lb-contador').textContent =
    `(${lbIndice + 1} / ${lbArchivos.length})`;

  cont.style.animation = 'none';
  void cont.offsetWidth;
  cont.style.animation = 'zoomIn 0.4s ease';

  if (item.tipo === 'video') {
    cont.innerHTML = `<video src="${item.src}" controls autoplay playsinline></video>`;
  } else {
    cont.innerHTML = `<img src="${item.src}" alt="">`;
  }

  document.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
    t.classList.toggle('activo', i === lbIndice);
  });

  const hayVarios = lbArchivos.length > 1;
  document.getElementById('lb-prev').style.display = hayVarios ? '' : 'none';
  document.getElementById('lb-next').style.display = hayVarios ? '' : 'none';
}

function pintarThumbs() {
  const cont = document.getElementById('lb-thumbs');
  cont.innerHTML = '';
  if (lbArchivos.length < 2) return;

  lbArchivos.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'lightbox-thumb' + (item.tipo === 'video' ? ' es-video' : '');

    if (item.tipo === 'video') {
      const v = document.createElement('video');
      v.src = item.src;
      v.muted = true;
      v.preload = 'metadata';
      div.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.loading = 'lazy';
      div.appendChild(img);
    }

    div.addEventListener('click', (e) => {
      e.stopPropagation();
      lbIndice = i;
      mostrarActual();
    });

    cont.appendChild(div);
  });
}

function siguiente() {
  lbIndice = (lbIndice + 1) % lbArchivos.length;
  mostrarActual();
}
function anterior() {
  lbIndice = (lbIndice - 1 + lbArchivos.length) % lbArchivos.length;
  mostrarActual();
}

document.getElementById('lb-cerrar').addEventListener('click', cerrarLightbox);
document.getElementById('lb-prev').addEventListener('click', anterior);
document.getElementById('lb-next').addEventListener('click', siguiente);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lightbox-main')) {
    cerrarLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('activo')) return;
  if (e.key === 'Escape') cerrarLightbox();
  if (e.key === 'ArrowRight') siguiente();
  if (e.key === 'ArrowLeft') anterior();
});