(function() {
  // Detect if DevTools is open
  function detectDevTools() {
    const threshold = 160; // difference between inner and outer size
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      window.location.replace("about:blank");
    }
  }

  let devtoolsOpen = false;
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      devtoolsOpen = true;
      window.location.replace("about:blank");
    }
  });



  // Run checks
  window.addEventListener('resize', detectDevTools);
  setInterval(detectDevTools, 1000);

  // Block key shortcuts
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && e.key.toUpperCase() === 'U')
    ) {
      e.preventDefault();
      window.location.replace("about:blank");
    }
  });

  // Disable right-click
  document.addEventListener('contextmenu', e => e.preventDefault());
})();