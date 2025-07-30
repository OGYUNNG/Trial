// --- Mobile Menu Toggle ---
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  menuToggle.classList.toggle('active');
  document.body.classList.toggle('no-scroll');
});

// --- Close Menu on Nav Link Click ---
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });
});

// --- Scroll to Top Button ---
const scrollBtn = document.getElementById('scrollToTopBtn');
window.onscroll = () => {
  if (scrollBtn) {
    scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  }
};

if (scrollBtn) {
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- Image Gallery Lightbox (Optional Enhancement) ---
document.querySelectorAll('.gallery-item img').forEach(img => {
  img.addEventListener('click', () => {
    const src = img.getAttribute('src');
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <img src="${src}" alt="Full View" />
      </div>
    `;
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    modal.querySelector('.close-btn').addEventListener('click', () => {
      modal.remove();
      document.body.classList.remove('no-scroll');
    });
  });
});
