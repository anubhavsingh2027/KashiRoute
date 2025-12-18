// Update current time
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
  document.getElementById("current-time").textContent = timeString;
}

// Go back function
function goBack() {
  // Add a nice animation before going back
  document.body.style.opacity = "0.5";
  document.body.style.transform = "scale(0.95)";
  document.body.style.transition = "all 0.3s ease";

  setTimeout(() => {
    if (window.history.length > 1) {
      window.location.href = "/home";
    } else {
      window.location.href = "/home";
    }
  }, 300);
}

// Contact support function
function contactSupport() {
  // Simulate opening support
  const supportModal = document.createElement("div");
  supportModal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px; margin: 1rem;">
                        <i class="fas fa-envelope text-4xl text-white mb-4"></i>
                        <h3 style="color: white; margin-bottom: 1rem; font-size: 1.5rem;">Contact Support</h3>
                        <p style="color: rgba(255,255,255,0.9); margin-bottom: 1.5rem;">For assistance, please email us at:</p>
                        <p style="color: white; font-weight: bold; margin-bottom: 1.5rem;">anubhavsingh2027@gmail.com</p>
                        <button onclick="this.closest('div').parentElement.remove()" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">Close</button>
                    </div>
                </div>
            `;
  document.body.appendChild(supportModal);

  // Add fade in animation
  supportModal.style.opacity = "0";
  supportModal.style.transition = "opacity 0.3s ease";
  setTimeout(() => {
    supportModal.style.opacity = "1";
  }, 10);
}

// Add subtle mouse movement effect
document.addEventListener("mousemove", (e) => {
  const particles = document.querySelectorAll(".particle");
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  particles.forEach((particle, index) => {
    const speed = (index + 1) * 0.02;
    const x = mouseX * speed * 50;
    const y = mouseY * speed * 50;
    particle.style.transform = `translate(${x}px, ${y}px)`;
  });
});

// Add click ripple effect
document.addEventListener("click", (e) => {
  const ripple = document.createElement("div");
  ripple.style.position = "fixed";
  ripple.style.left = e.clientX + "px";
  ripple.style.top = e.clientY + "px";
  ripple.style.width = "4px";
  ripple.style.height = "4px";
  ripple.style.background = "rgba(147, 51, 234, 0.6)";
  ripple.style.borderRadius = "50%";
  ripple.style.pointerEvents = "none";
  ripple.style.transform = "translate(-50%, -50%)";
  ripple.style.animation = "ripple 1s ease-out forwards";
  ripple.style.zIndex = "9999";

  document.body.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 1000);
});

// Add ripple keyframe animation
const style = document.createElement("style");
style.textContent = `
            @keyframes ripple {
                to {
                    width: 100px;
                    height: 100px;
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);

// Initialize
updateTime();
setInterval(updateTime, 1000);

// Add page load animation
window.addEventListener("load", () => {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.5s ease";
  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 100);
});

// Add keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    goBack();
  } else if (e.key === "Enter") {
    contactSupport();
  }
});

setInterval(() => {
  if (Math.random() < 0.1) {
    // 10% chance every interval
    const glitchElement = document.querySelector(".glitch");
    glitchElement.style.animation = "none";
    setTimeout(() => {
      glitchElement.style.animation = "glitch-main 2s infinite";
    }, 50);
  }
}, 3000);
