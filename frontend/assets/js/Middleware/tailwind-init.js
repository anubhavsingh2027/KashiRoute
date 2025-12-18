// Utilities: toast, loader, and scroll reveal using Tailwind classes
export function showToast(message, type = 'info', timeout = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-6 right-6 z-50 flex flex-col items-end gap-4 max-w-md';
    document.body.appendChild(container);
  }

  const getToastStyles = (type) => {
    switch(type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          shadow: 'shadow-lg shadow-green-500/20',
          ring: 'ring-1 ring-green-400/50'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          shadow: 'shadow-lg shadow-red-500/20',
          ring: 'ring-1 ring-red-400/50'
        };
      default:
        return {
          bg: 'bg-blue-500',
          shadow: 'shadow-lg shadow-blue-500/20',
          ring: 'ring-1 ring-blue-400/50'
        };
    }
  };

  const styles = getToastStyles(type);
  const toast = document.createElement('div');
  toast.className = `${styles.bg} text-white px-6 py-3 rounded-xl ${styles.shadow} backdrop-blur-sm
                     ${styles.ring} animate-slide-in-right flex items-center gap-3
                     transform hover:scale-102 transition-all duration-300`;

  const icon = document.createElement('i');
  icon.className = `fas ${type === 'success' ? 'fa-check-circle text-emerald-100' :
                         type === 'error' ? 'fa-exclamation-circle text-rose-100' :
                         'fa-info-circle text-sky-100'} text-lg ${
                         type === 'success' ? 'animate-bounce' :
                         type === 'error' ? 'animate-pulse' : ''
                         }`;

  const text = document.createElement('span');
  text.className = 'font-medium text-white/90';
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 400);
  }, timeout);
}
export function withLoader(button, fn) {
  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = `<svg class="animate-spin h-5 w-5 mr-2 inline-block text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Processing...`;

  return fn().finally(() => {
    button.disabled = false;
    button.innerHTML = original;
  });
}

// Simple scroll reveal using IntersectionObserver
export function initScrollReveal(selector = '[data-reveal]') {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => {
    el.classList.add('opacity-0', 'translate-y-6', 'transition-all', 'duration-700', 'ease-out');
    obs.observe(el);
  });
}

  // small helper to mount Tailwind animations (if not present)
export function mountUtilities() {
  // create some keyframes via style tag for slide-in/out
  if (!document.getElementById('tw-utils-style')) {
    const s = document.createElement('style');
    s.id = 'tw-utils-style';
    s.innerHTML = `
      @keyframes slide-in-right { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
      @keyframes fade-out { from { opacity: 1 } to { opacity: 0; transform: translateY(-8px) } }
      @keyframes slide-up { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      @keyframes scale-in { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      @keyframes float {
        0% { transform: translateY(0px) }
        50% { transform: translateY(-10px) }
        100% { transform: translateY(0px) }
      }
      @keyframes pulse-soft {
        0% { transform: scale(1) }
        50% { transform: scale(1.05) }
        100% { transform: scale(1) }
      }
      @keyframes border-glow {
        0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.6) }
        50% { box-shadow: 0 0 0 4px rgba(56, 189, 248, 0) }
        100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0) }
      }
      .scale-102 { transform: scale(1.02); }
      @keyframes nav-slide-down {
        from { transform: translateY(-100%); opacity: 0 }
        to { transform: translateY(0); opacity: 1 }
      }
      @keyframes menu-fade {
        from { opacity: 0; transform: scale(0.95) }
        to { opacity: 1; transform: scale(1) }
      }
      @keyframes shine {
        from { transform: translateX(-100%) rotate(45deg) }
        to { transform: translateX(100%) rotate(45deg) }
      }
      .animate-slide-in-right { animation: slide-in-right .35s ease forwards }
      .animate-fade-out { animation: fade-out .35s ease forwards }
      .animate-fade-in { animation: menu-fade .2s ease-out forwards }
      .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards }
      .animate-scale-in { animation: scale-in 0.4s ease-out forwards }
      .animate-float { animation: float 3s ease-in-out infinite }
      .animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite }
      .animate-border-glow { animation: border-glow 2s ease-in-out infinite }
      .animate-nav-slide-down { animation: nav-slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) }
      .nav-item { position: relative; overflow: hidden }
      .nav-item::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 30px;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        animation: shine 3s infinite linear;
        pointer-events: none;
      }

      /* Hover states */
      .hover-lift { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) }
      .hover-lift:hover { transform: translateY(-4px) }
      .hover-scale { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) }
      .hover-scale:hover { transform: scale(1.05) }
    `;
    document.head.appendChild(s);
  }
}// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  mountUtilities();
  initScrollReveal();
});
