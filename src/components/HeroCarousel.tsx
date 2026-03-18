import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import slide1 from "@/assets/slide-1.jpeg";
import slide2 from "@/assets/slide-2.jpg";
import slide3 from "@/assets/slide-3.png";
import slide4 from "@/assets/slide-4.png";

const slides = [slide1, slide2, slide3, slide4];

const HeroCarousel = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const isPaused = useRef(false);

  // Preload upcoming images progressively
  useEffect(() => {
    slides.forEach((src, i) => {
      if (i === 0) return;
      const img = new Image();
      img.src = src;
      img.onload = () => setLoadedImages((prev) => new Set(prev).add(i));
    });
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused.current) next();
    }, 5500);
    return () => clearInterval(timer);
  }, [next]);

  const handleExplore = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative h-[85vh] w-full overflow-hidden bg-foreground"
      onMouseEnter={() => (isPaused.current = true)}
      onMouseLeave={() => (isPaused.current = false)}
    >
      {/* Blur placeholder background */}
      <div
        className="absolute inset-0 bg-foreground transition-opacity duration-500"
        style={{
          backgroundImage: loadedImages.has(index) ? `url(${slides[index]})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(20px)",
          transform: "scale(1.1)",
          opacity: loadedImages.has(index) ? 1 : 0,
        }}
      />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.img
          key={index}
          src={slides[index]}
          alt={`Campus slide ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 40 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-4 text-center">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-lg"
          style={{ textWrap: "balance" as any }}
        >
          Connect. Participate. Grow.
        </h1>
        <p
          className="text-base md:text-lg text-white/80 max-w-2xl mb-8"
          style={{ textWrap: "pretty" as any }}
        >
          Your one-stop platform for campus events and student engagement
        </p>
        <button
          onClick={handleExplore}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium text-base transition-all hover:shadow-lg active:scale-95"
        >
          Explore Events
        </button>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full p-3 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full p-3 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === index ? "bg-white w-6" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
