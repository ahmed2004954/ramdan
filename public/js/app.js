window.addEventListener('DOMContentLoaded', () => {
  const flash = document.querySelector('.flash-success, .flash-error');

  if (flash) {
    window.setTimeout(() => {
      flash.style.opacity = '0';
      flash.style.transform = 'translateY(-6px)';
      flash.style.transition = 'opacity 180ms ease, transform 180ms ease';

      window.setTimeout(() => {
        flash.remove();
      }, 220);
    }, 3500);
  }
});
