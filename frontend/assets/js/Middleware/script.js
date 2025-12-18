// Cinematic loading sequence controller
(function () {
  const DURATION_MS = 5000; // 5s total duration
  const EMBER_COUNT = 8; // number of floating particles - reduced for subtlety

  const MESSAGES = [
    "Illuminating the path of devotion...",
    "Awakening ancient wisdom...",
    "Sanctifying your spiritual journey...",
    "Embracing divine traditions...",
    "Opening the gates of Kashi...",
    "Connecting with sacred energies...",
    "Preparing for enlightenment...",
    "Your divine journey awaits...",
  ];

  let messageIdx = 0;
  let messageInterval = null;

  function $(id) {
    return document.getElementById(id);
  }

  function createEmber(container) {
    const ember = document.createElement("div");
    ember.className = "kr-ember";

    // Enhanced random properties
    const left = Math.random() * 90 + 5; // avoid edges
    const bottom = Math.random() * 30;
    const size = 2 + Math.random() * 3;
    const duration = 5000 + Math.random() * 4000;
    const delay = Math.random() * 2000;
    const glowSize = size * 3;
    const glowDuration = 1500 + Math.random() * 1000;
    const glowColor = `rgba(255, 216, 145, ${0.2 + Math.random() * 0.2})`;

    ember.style.cssText = `
      left: ${left}%;
      bottom: ${bottom}%;
      --size: ${size}px;
      --duration: ${duration}ms;
      --glow-size: ${glowSize}px;
      --glow-duration: ${glowDuration}ms;
      --glow-color: ${glowColor};
      animation-delay: ${delay}ms;
    `;

    container.appendChild(ember);

    // Remove after animation
    setTimeout(() => ember.remove(), duration + delay);
  }

  function createEmbers() {
    const container = $("kr-embers");
    if (!container) return;

    // Initial batch
    for (let i = 0; i < EMBER_COUNT; i++) {
      createEmber(container);
    }

    // Continuously add new embers
    setInterval(() => {
      if (container.childNodes.length < EMBER_COUNT) {
        createEmber(container);
      }
    }, 2000);
  }

  function typeWriter(el, text, speed = 40) {
    return new Promise((resolve) => {
      let i = 0;
      el.textContent = "";
      el.style.visibility = "visible";
      el.style.opacity = "1";

      function type() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          // Center the text after each character
          el.style.width = "100%";
          el.style.textAlign = "center";
          setTimeout(type, speed + Math.random() * 20);
        } else {
          resolve();
        }
      }

      type();
    });
  }

  function cycleMessages() {
    const msgEl = $("kr-message");
    if (!msgEl) return;

    // Set initial message
    msgEl.textContent = MESSAGES[0];
    msgEl.style.opacity = "1";

    messageInterval = setInterval(() => {
      msgEl.style.opacity = "0";

      setTimeout(() => {
        messageIdx = (messageIdx + 1) % MESSAGES.length;
        msgEl.textContent = MESSAGES[messageIdx];
        // Fade in with slight delay
        requestAnimationFrame(() => {
          msgEl.style.opacity = "1";
        });
      }, 400);
    }, 2500);
  }

  async function startSequence() {
    // Prevent scroll while loading
    document.body.style.overflow = "hidden";

    // Create floating embers early for ambiance
    createEmbers();

    // Stage 1: Welcome text with gentle fade-in
    const stage1 = $("kr-stage1");
    if (stage1) {
      stage1.style.opacity = "0";
      stage1.style.transform = "translateY(20px)";
      stage1.classList.add("show");

      // Ensure animation plays
      await new Promise((r) => setTimeout(r, 100));
      stage1.style.opacity = "1";
      stage1.style.transform = "translateY(0)";
    }

    // Wait for underline animation
    await new Promise((r) => setTimeout(r, 1500));

    // Stage 2: Typewriter effect
    const stage2 = $("kr-stage2");
    if (stage2) {
      stage2.classList.add("show");
      await typeWriter(stage2, "Discover the Sacred City of Varanasi", 45);
    }

    // Stage 3: Cycling messages
    await new Promise((r) => setTimeout(r, 500));
    cycleMessages();

    // Animate loader with percentage
    const loaderContainer = $("kr-loader");
    const loader = $("kr-loader-fill");
    const percentage = $("kr-loader-percentage");

    if (loader && loaderContainer) {
      // Initialize loader
      loader.style.width = "0%";

      // Create or update percentage display
      let percentText = percentage;
      if (!percentText) {
        percentText = document.createElement("div");
        percentText.id = "kr-loader-percentage";
        percentText.className = "kr-loader-percentage";
        loaderContainer.appendChild(percentText);
      }
      percentText.textContent = "0%";

      // Set up progress animation
      let progress = 0;
      const updateInterval = 30; // Update every 30ms for smooth animation
      const steps = Math.floor(DURATION_MS / updateInterval);
      const increment = 100 / steps;

      const updateProgress = () => {
        progress = Math.min(100, progress + increment);
        const currentProgress = Math.round(progress);

        // Update loader width
        loader.style.width = `${currentProgress}%`;

        // Update percentage text
        percentText.textContent = `${currentProgress}%`;

        // Add pulsing effect near completion
        if (progress > 80) {
          loader.style.filter = "brightness(1.2)";
          setTimeout(() => {
            loader.style.filter = "brightness(1)";
          }, 200);
        }

        // Enhanced visual feedback
        if (currentProgress === 100) {
          loader.style.boxShadow = "0 0 25px rgba(255, 216, 145, 0.8)";
          percentText.style.textShadow = "0 0 15px rgba(255, 216, 145, 0.8)";
        }
      };

      // Start progress animation
      const progressInterval = setInterval(() => {
        if (progress >= 100) {
          clearInterval(progressInterval);
          return;
        }
        updateProgress();
      }, updateInterval);

      // Ensure loader starts visibly at 0%
      requestAnimationFrame(() => {
        loader.style.transition = `width ${DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        updateProgress();
      });
    }

    // Create floating embers
    createEmbers();

    // End sequence
    setTimeout(() => {
      clearInterval(messageInterval);
      const overlay = $("kr-overlay");
      if (overlay) {
        overlay.classList.add("fade-out");

        // Remove from DOM after fade
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = "";
          revealHomepage();
        }, 1200);
      }
    }, DURATION_MS);
  }

  function revealHomepage() {
    // Redirect to /home after loading sequence completes
    window.location.href = "/";
  }

  // Start when DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    startSequence();

    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      DURATION_MS = 2000; // Shorter duration
      // Skip intensive animations
      document.documentElement.classList.add("reduce-motion");
    }
  });
})();
