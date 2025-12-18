
      import { sendMail } from "../Middleware/services.js";
      import { showToast } from "../Middleware/tailwind-init.js";

      // ==============================
      // CONTACT FORM HANDLER here 
      // ==============================
      class ContactFormEnhancer {
        constructor() {
          this.form = document.getElementById("contactForm");
          this.submitBtn = document.getElementById("submitBtn");
          this.btnText = document.getElementById("btnText");

          if (this.form) {
            this.form.addEventListener("submit", (e) => this.handleSubmit(e));
          }
        }

        setLoading(isLoading) {
          this.submitBtn.disabled = isLoading;
          this.btnText.innerHTML = isLoading
            ? '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...'
            : "Send Message";
        }

        validateForm() {
          const userName = document.getElementById("UserName").value.trim();
          const userEmail = document.getElementById("email").value.trim();
          const mobileNo = document.getElementById("mobileNo").value.trim();

          if (!userName || !userEmail || !mobileNo) {
            showToast("Please fill in all required fields", "error");
            return false;
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(userEmail)) {
            showToast("Please enter a valid email address", "error");
            return false;
          }

          const phoneRegex = /^[6-9]\d{9}$/;
          if (!phoneRegex.test(mobileNo)) {
            showToast("Please enter a valid 10-digit mobile number", "error");
            return false;
          }

          return true;
        }

        async handleSubmit(e) {
          e.preventDefault();
          if (!this.validateForm()) return;

          this.setLoading(true);
          showToast("Sending your message...", "info");

          const userName = document.getElementById("UserName").value.trim();
          const userEmail = document.getElementById("email").value.trim();
          const mobileNo = document.getElementById("mobileNo").value.trim();
          const subject = document.getElementById("subject").value.trim();
          const request = document.getElementById("request").value.trim();

          // User HTML Template
          const userHtml = `
      <div style="font-family:Arial, sans-serif; background:#f5f9ff; padding:30px; color:#333;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <div style="background:linear-gradient(135deg,#0284c7,#0ea5e9); padding:20px; text-align:center; color:white;">
            <h2 style="margin:0;">Thank You for Contacting Kashi Route ✈️</h2>
          </div>
          <div style="padding:25px;">
            <p>Dear <strong>${userName}</strong>,</p>
            <p>We’ve received your message and our team will reach out to you shortly.</p>
            <p>We truly appreciate your interest in <strong>Kashi Route</strong>! In the meantime, you can explore more about our work:</p>
            <ul style="list-style:none; padding:0; line-height:1.8;">
              <li>🌐 <a href="https://anubhav.nav-code.com/" style="color:#0284c7;">My Portfolio</a></li>
              <li>💼 <a href="https://github.com/anubhavsingh2027" style="color:#0284c7;">My GitHub</a></li>
              <li>🧭 <a href="https://kashiroute.nav-code.com/" style="color:#0284c7;">Visit Kashi Route</a></li>
            </ul>
            <p style="margin-top:20px;">Thank you again for visiting us — we look forward to connecting soon!</p>
            <p style="margin-top:30px;">Warm regards,<br><strong>Anubhav Singh</strong><br><em>Founder, Kashi Route</em></p>
          </div>
          <div style="background:#f0f4f8; padding:15px; text-align:center; font-size:13px; color:#555;">
            <p>© 2025 Kashi Route. All rights reserved.</p>
          </div>
        </div>
      </div>
      `;

          // Host HTML Template
          const hostHtml = `
      <div style="font-family:Arial, sans-serif; background:#f8fafc; padding:30px; color:#333;">
        <div style="max-width:650px; margin:auto; background:white; border-radius:12px; box-shadow:0 3px 10px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#2563eb,#0284c7); color:white; padding:18px; border-radius:12px 12px 0 0;">
            <h2 style="margin:0;">📩 New Contact Form Submission</h2>
          </div>
          <div style="padding:25px;">
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Mobile:</strong> ${mobileNo}</p>
            <p><strong>Message:</strong></p>
            <p style="background:#f1f5f9; padding:10px 15px; border-radius:8px;">${request}</p>
          </div>
          <div style="background:#f9fafb; padding:15px; text-align:center; font-size:13px;">
            <p style="margin:0;">Kashi Route — New Inquiry Received</p>
          </div>
        </div>
      </div>
      `;

          try {
            const userEmailResult = await sendMail({
              to: userEmail,
              subject: "Thank You for Contacting Kashi Route!",
              message: userHtml,
            });

            if (!userEmailResult || userEmailResult.error) {
              showToast("Failed to send confirmation email.", "error");
              this.setLoading(false);
              return;
            }

            const hostEmailResult = await sendMail({
              to: "anubhavsinghcustomer@gmail.com",
              subject: "New User Request — Kashi Route",
              message: hostHtml,
            });

            if (!hostEmailResult || hostEmailResult.error) {
              showToast("Message received, but team not notified.", "warning");
              this.form.reset();
              this.setLoading(false);
              return;
            }

            showToast("Thank you! We'll get back to you soon.", "success");
            this.form.reset();
          } catch (error) {
            showToast("Something went wrong. Please try again later.", "error");
          } finally {
            this.setLoading(false);
          }
        }
      }

      class AnimationController {
        constructor() {
          this.init();
        }

        init() {
          this.initPageAnimations();
          this.createFloatingParticles();
          this.initScrollAnimations();
          this.initMouseEffects();
        }

        initPageAnimations() {
          const elements = document.querySelectorAll(".page-enter");
          elements.forEach((el, index) => {
            el.style.opacity = "0";
            el.style.transform = "translateY(30px)";
            setTimeout(() => {
              el.style.transition = `all 1s cubic-bezier(0.16, 1, 0.3, 1)`;
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, index * 200);
          });
        }

        createFloatingParticles() {
          const particleCount = 15;
          for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("div");
            particle.className = "particle";
            particle.style.top = Math.random() * 100 + "%";
            particle.style.left = Math.random() * 100 + "%";
            particle.style.animationDelay = Math.random() * 6 + "s";
            particle.style.animationDuration = Math.random() * 3 + 3 + "s";
            document.body.appendChild(particle);
          }
        }

        initScrollAnimations() {
          window.addEventListener("scroll", () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector(".animated-bg");
            if (parallax) {
              const speed = scrolled * 0.5;
              parallax.style.transform = `translateY(${speed}px)`;
            }
          });
        }

        initMouseEffects() {
          if (window.innerWidth > 768) {
            document.addEventListener("mousemove", (e) => {
              let trail = document.querySelector(".cursor-trail");
              if (!trail) {
                trail = document.createElement("div");
                trail.className = "cursor-trail";
                trail.style.cssText = `
              position: fixed;
              width: 20px;
              height: 20px;
              background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
              border-radius: 50%;
              pointer-events: none;
              z-index: 9999;
              transition: transform 0.1s ease-out;
            `;
                document.body.appendChild(trail);
              }
              trail.style.left = e.clientX - 10 + "px";
              trail.style.top = e.clientY - 10 + "px";
            });
          }
        }
      }

      // ==============================
      // INITIALIZATION
      // ==============================
      document.addEventListener("DOMContentLoaded", () => {
        new ContactFormEnhancer();
        new AnimationController();

        const floatingIcons = document.querySelectorAll(".contact-icon");
        floatingIcons.forEach((icon) => {
          setInterval(() => {
            icon.style.animation = "none";
            icon.offsetHeight;
            icon.style.animation =
              "float 3s ease-in-out infinite, pulse 2s ease-in-out infinite";
          }, 10000);
        });
      });

      window.addEventListener("resize", () => {
        document.querySelectorAll(".particle").forEach((particle) => {
          particle.style.top = Math.random() * 100 + "%";
          particle.style.left = Math.random() * 100 + "%";
        });
      });

      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.style.setProperty(
          "--duration-normal",
          "150ms"
        );
        document.documentElement.style.setProperty("--duration-fast", "100ms");
      }