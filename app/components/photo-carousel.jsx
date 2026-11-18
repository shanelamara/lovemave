"use client";

import { useEffect, useState } from "react";

const slideDuration = 4200;

export default function PhotoCarousel({ photos }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const isAdvancing = playing && !hovered && pageVisible;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setPlaying(!preference.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!isAdvancing) return;
    const timer = window.setTimeout(
      () => setIndex((index + 1) % photos.length),
      slideDuration,
    );
    return () => window.clearTimeout(timer);
  }, [index, isAdvancing, photos.length]);

  function move(direction) {
    setPlaying(false);
    setIndex(current => (current + direction + photos.length) % photos.length);
  }

  return (
    <section
      className="photo-carousel"
      aria-labelledby="photo-carousel-title"
      aria-roledescription="carousel"
      style={{ "--slide-duration": `${slideDuration}ms` }}
    >
      <div className="photo-carousel-header">
        <h3 id="photo-carousel-title">Collection <em>photos</em></h3>
        <div className="photo-carousel-controls" role="group" aria-label="Photo controls">
          <button type="button" onClick={() => setPlaying(current => !current)}>
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" aria-label="Previous photo" onClick={() => move(-1)}>←</button>
          <button type="button" aria-label="Next photo" onClick={() => move(1)}>→</button>
        </div>
      </div>
      <div
        className="photo-carousel-stage"
        onPointerEnter={event => {
          if (event.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
      >
        {photos.map(({ name, image, alt }, position) => (
          <img
            key={name}
            className={position === index ? "is-active" : undefined}
            src={`/assets/images/${image}`}
            alt={alt}
            aria-hidden={position !== index}
          />
        ))}
        <div className="photo-carousel-progress" aria-hidden="true">
          {isAdvancing && <span key={index} />}
        </div>
      </div>
      <p className="photo-carousel-caption" aria-live={playing ? "off" : "polite"}>
        <span key={index}>{photos[index].name}</span>
        <span>{index + 1} / {photos.length}</span>
      </p>
    </section>
  );
}
