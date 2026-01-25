import React from "react";
import { Heart } from "lucide-react";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      {/* Decorative elements - Desktop */}
      <img src="/img/flowers1.webp" alt="" className="hero__flowers-right" />
      <img src="/img/flowers2.webp" alt="" className="hero__flowers-left" />

      {/* Decorative elements - Mobile */}
      <img src="/img/flowers3.webp" alt="" className="hero__flowers-top" />
      <img src="/img/flowers2.webp" alt="" className="hero__flowers-bottom" />
    </section>
  );
};

export default Hero;
