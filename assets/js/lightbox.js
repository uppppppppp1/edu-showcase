document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('lightbox');
  if (!overlay) return;

  var img = document.getElementById('lightboxImg');

  document.querySelectorAll('.gallery-thumb').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      img.src = this.dataset.src;
      overlay.classList.add('open');
    });
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.classList.contains('lightbox-close')) {
      overlay.classList.remove('open');
      img.src = '';
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      overlay.classList.remove('open');
      img.src = '';
    }
  });
});
