"use client";

export default function Hero() {
  function moveCups(event) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reducedMotion.matches || !finePointer.matches || event.pointerType === "touch") return;

    const stage = event.currentTarget;
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    const y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    stage.style.setProperty("--pointer-x", x.toFixed(3));
    stage.style.setProperty("--pointer-y", y.toFixed(3));
  }

  function resetCups(event) {
    event.currentTarget.style.removeProperty("--pointer-x");
    event.currentTarget.style.removeProperty("--pointer-y");
  }

  return (
    <section className="hero tabletop" data-enter="" aria-labelledby="title">
     <div className="tabletop-stage" onPointerMove={moveCups} onPointerLeave={resetCups}>
      <div className="tabletop-glow" aria-hidden="true" />
      <div className="tabletop-art" aria-hidden="true">
       <div className="tabletop-cup cup-cherry"><div className="cup-arrival"><img src="/assets/images/collection/7344.webp" alt="" fetchPriority="high" /></div></div>
       <div className="tabletop-cup cup-heart"><div className="cup-arrival"><img src="/assets/images/collection/7368.webp" alt="" fetchPriority="high" /></div></div>
       <div className="tabletop-cup cup-bow"><div className="cup-arrival"><img src="/assets/images/collection/7359.webp" alt="" fetchPriority="high" /></div></div>
       <span className="tabletop-spark spark-left">✦</span><span className="tabletop-spark spark-right">✧</span><span className="tabletop-spark spark-top">✦</span>
      </div>
      <div className="tabletop-copy">
       <p className="tabletop-label">Ceramic mugs for sweet mornings</p>
       <h1 id="title"><span className="tabletop-title-mask"><span className="tabletop-title"><i>love,</i> mave</span></span></h1>
       <a className="tabletop-link" href="#collection">Explore the mugs <span aria-hidden="true">↓</span></a>
      </div>
     </div>
    </section>
  );
}
