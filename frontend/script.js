// script.js - Controls greeting sequence, particles, and reveal animations
// Lightweight, no external libs. Aim: 5-7s greeting, then cinematic fade.

(function(){
  const OVERLAY_ID = 'loading-overlay';
  const DURATION_MS = 5500; // total visible time (you can tweak 5000-7000)

  function createDiyaParticles(container, count=8){
    if(!container) return;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight * 0.6;
    for(let i=0;i<count;i++){
      const d = document.createElement('div');
      d.className = 'diya';
      // random position around the center-ish area
      const left = Math.round(Math.random() * 100);
      const top = Math.round(Math.random() * 60);
      d.style.left = left + '%';
      d.style.top = top + '%';
      const dur = 5500 + Math.round(Math.random()*5000);
      d.style.animation = `floatY ${dur}ms ease-in-out ${Math.random()*1000}ms infinite`;
      const scale = 0.6 + Math.random()*1.2;
      d.style.transform = `scale(${scale})`;
      d.style.opacity = 0.85 + Math.random()*0.15;
      d.style.filter = 'blur(6px)';
      container.appendChild(d);
    }
  }

  function showSequentialLines(container){
    const lines = container.querySelectorAll('.greeting-line');
    // timings: small stagger, total should be around 3.5s for lines
    const times = [400, 1600, 3000];
    lines.forEach((line, i) => {
      setTimeout(()=> line.classList.add('show'), times[i] || (400 + i*600));
    });
  }

  function hideOverlayThenReveal(){
    const overlay = document.getElementById(OVERLAY_ID);
    if(!overlay) return;
    // fade overlay
    overlay.classList.add('fade-out');
    // after transition remove from DOM to ensure pointer events freed
    setTimeout(()=>{
      try{ overlay.parentNode && overlay.parentNode.removeChild(overlay);}catch(e){}
      document.body.classList.add('loaded');
      // reveal hero animations
      revealHero();
    }, 950);
  }

  function revealHero(){
    const title = document.querySelector('.hero-title');
    const sub = document.querySelector('.hero-sub');
    const btnExplore = document.querySelector('.btn-explore');
    const btnBook = document.querySelector('.btn-book');

    if(title) setTimeout(()=> title.classList.add('revealed'), 100);
    if(sub) setTimeout(()=> sub.classList.add('revealed'), 220);
    if(btnExplore) setTimeout(()=> btnExplore.classList.add('enter'), 360);
    if(btnBook) setTimeout(()=> btnBook.classList.add('enter'), 420);
  }

  // Ensure we run after DOM loaded so elements exist
  document.addEventListener('DOMContentLoaded', ()=>{
    const overlay = document.getElementById(OVERLAY_ID);
    if(!overlay) return;
    // Prevent scroll while overlay visible
    document.body.style.overflow = 'hidden';

    const diyaField = overlay.querySelector('.diya-field');
    createDiyaParticles(diyaField, 9);

    const greetings = overlay.querySelector('.greetings');
    showSequentialLines(greetings);

    // Final hide after DURATION_MS
    setTimeout(()=>{
      hideOverlayThenReveal();
      // restore body overflow after a short delay
      setTimeout(()=>{
        document.body.style.overflow = '';
      }, 1050);
    }, DURATION_MS);

  });

})();
