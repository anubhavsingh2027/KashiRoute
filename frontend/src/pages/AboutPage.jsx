import "../styles.css";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"></div>
        <div className="floating-shape absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full"></div>
        <div className="floating-shape absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-12 text-center glass">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            About Kashi Route
          </h1>
          <p className="text-xl text-gray-600">
            Your gateway to the spiritual heart of India
          </p>
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 glass">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Kashi Route was born from a passion to share the spiritual and
            cultural richness of Varanasi with travelers from around the world.
            Our platform combines modern technology with ancient wisdom to
            create unforgettable travel experiences.
          </p>
          <p className="text-gray-600 leading-relaxed">
            From the sacred banks of the Ganges to the bustling streets filled
            with history, we help you discover the true essence of this sacred
            city through carefully curated packages and reliable transportation
            services.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 glass card-3d">
            <h3 className="text-2xl font-bold text-sky-600 mb-4">
              <i className="fas fa-bullseye mr-2"></i>Our Mission
            </h3>
            <p className="text-gray-600">
              To provide seamless, authentic, and respectful travel experiences
              to the sacred city of Varanasi, connecting travelers with the
              spiritual and cultural heart of India.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 glass card-3d">
            <h3 className="text-2xl font-bold text-purple-600 mb-4">
              <i className="fas fa-eye mr-2"></i>Our Vision
            </h3>
            <p className="text-gray-600">
              To be the most trusted platform for spiritual tourism in Varanasi,
              celebrating its cultural heritage while fostering sustainable and
              responsible travel practices.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 glass">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center card-3d">
              <div className="text-5xl mb-4">🙏</div>
              <h4 className="font-bold text-gray-800 mb-2">Respect</h4>
              <p className="text-gray-600 text-sm">
                We respect the spiritual significance of Varanasi and its
                traditions.
              </p>
            </div>
            <div className="text-center card-3d">
              <div className="text-5xl mb-4">✨</div>
              <h4 className="font-bold text-gray-800 mb-2">Excellence</h4>
              <p className="text-gray-600 text-sm">
                We strive for excellence in every service we provide.
              </p>
            </div>
            <div className="text-center card-3d">
              <div className="text-5xl mb-4">🌍</div>
              <h4 className="font-bold text-gray-800 mb-2">Sustainability</h4>
              <p className="text-gray-600 text-sm">
                We promote responsible and sustainable tourism practices.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-2xl shadow-lg p-8 glass">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-emerald-500 text-2xl mt-1"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">
                  Expert Local Guides
                </h4>
                <p className="text-gray-600 text-sm">
                  Our knowledgeable guides know Varanasi intimately
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-emerald-500 text-2xl mt-1"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">
                  Comfortable Transportation
                </h4>
                <p className="text-gray-600 text-sm">
                  Fleet of well-maintained vehicles for your safety
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-emerald-500 text-2xl mt-1"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">
                  Authentic Experiences
                </h4>
                <p className="text-gray-600 text-sm">
                  Curated packages that go beyond typical tourism
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-emerald-500 text-2xl mt-1"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm">
                  Always here to help during your journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          animation: float 6s ease-in-out infinite;
        }

        .floating-shape:nth-child(1) {
          animation-delay: 0s;
        }
        .floating-shape:nth-child(2) {
          animation-delay: 2s;
        }
        .floating-shape:nth-child(3) {
          animation-delay: 4s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .card-3d {
          perspective: 1000px;
          transform-style: preserve-3d;
          transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .card-3d:hover {
          transform: rotateY(10deg) rotateX(10deg) translateZ(20px);
        }
      `}</style>
    </div>
  );
}
