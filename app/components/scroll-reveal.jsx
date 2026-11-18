"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.15 });

    root.classList.add("js");
    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      root.classList.remove("js");
    };
  }, []);

  return null;
}
