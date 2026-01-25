 import { getAllPackages, getAllCars } from "../Middleware/services.js";

      (async () => {
        // Fetch dynamic data
        const packageData = await getAllPackages();
        const carData = await getAllCars();

        
        const typewriterText = "Your Journey, Our Commitment";
        const typewriterElement = document.getElementById("typewriter");
        let i = 0;

        function typeWriter() {
          if (i < typewriterText.length) {
            typewriterElement.innerHTML += typewriterText.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
          }
        }

        window.addEventListener("load", () => {
          setTimeout(typeWriter, 1000);
        });

        // ===================== SCROLL PROGRESS =====================
        window.addEventListener("scroll", () => {
          const scrolled =
            (window.scrollY /
              (document.documentElement.scrollHeight - window.innerHeight)) *
            100;
          document.getElementById("progressBar").style.width = scrolled + "%";
        });

        // ===================== INTERSECTION OBSERVER =====================
        const observerOptions = {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        };
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
          });
        }, observerOptions);

        document
          .querySelectorAll(".fade-in, .slide-in-left, .slide-in-right")
          .forEach((el) => observer.observe(el));

        // ===================== COUNTERS =====================
        // Set dynamic targets
        document
          .getElementById("packageCount")
          .setAttribute("data-target", packageData.length || 0);
        document
          .getElementById("vehicleCount")
          .setAttribute("data-target", carData.length || 0);

        function animateCounter(element) {
          const target = parseInt(element.getAttribute("data-target"));
          const increment = target / 50;
          let current = 0;

          const updateCounter = () => {
            if (current < target) {
              current += increment;
              element.textContent = Math.ceil(current);
              requestAnimationFrame(updateCounter);
            } else {
              element.textContent = target;
            }
          };

          updateCounter();
        }

        const counterObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.5 }
        );

        document
          .querySelectorAll(".counter")
          .forEach((counter) => counterObserver.observe(counter));

        // ===================== PARTICLE EFFECT =====================
        function createParticle() {
          const particle = document.createElement("div");
          particle.className = "particle";
          particle.style.left = Math.random() * window.innerWidth + "px";
          particle.style.width = particle.style.height =
            Math.random() * 4 + 2 + "px";
          particle.style.animationDuration = Math.random() * 3 + 2 + "s";
          document.getElementById("particles").appendChild(particle);
          setTimeout(() => particle.remove(), 5000);
        }
        setInterval(createParticle, 300);

        // ===================== PARALLAX =====================
        document.addEventListener("mousemove", (e) => {
          const shapes = document.querySelectorAll(".floating-shape");
          const mouseX = e.clientX / window.innerWidth;
          const mouseY = e.clientY / window.innerHeight;
          shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.5;
            const x = mouseX * speed * 20;
            const y = mouseY * speed * 20;
            shape.style.transform = `translate(${x}px, ${y}px)`;
          });
        });

        // ===================== SMOOTH SCROLL =====================
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
          link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          });
        });

        // ===================== NAVBAR BACKGROUND =====================
        window.addEventListener("scroll", () => {
          const navbar = document.getElementById("navbar");
          navbar.style.background =
            window.scrollY > 100
              ? "rgba(17, 24, 39, 0.9)"
              : "rgba(255, 255, 255, 0.1)";
        });

        // ===================== RIPPLE BUTTONS =====================
        document.querySelectorAll(".ripple").forEach((button) => {
          button.addEventListener("click", function (e) {
            const ripple = document.createElement("span");
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + "px";
            ripple.style.left = x + "px";
            ripple.style.top = y + "px";
            ripple.classList.add("ripple-effect");
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
          });
        });

        // ===================== PERFORMANCE OPTIMIZATION =====================
        const performanceObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            entry.target.style.animationPlayState = entry.isIntersecting
              ? "running"
              : "paused";
          });
        });

        document
          .querySelectorAll(".floating-shape, .animated-bg")
          .forEach((el) => performanceObserver.observe(el));

        // ===================== LOADING ANIMATION =====================
        window.addEventListener("load", () =>
          document.body.classList.add("loaded")
        );
      })();