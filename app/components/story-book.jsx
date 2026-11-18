"use client";

import { useRef, useState } from "react";
import "./story-book-turn.css";

const pages = [
  {
    title: "A little about",
    emphasis: "love, mave.",
    image: "moodboard.webp",
    alt: "Love, Mave moodboard with embroidered lettering, cherries, and pink fabric",
    copy: "Inspired by embroidered cherries, vintage florals, and keepsakes tucked into scrapbooks. Our ceramic mugs bring those details to the kitchen shelf.",
  },
  {
    title: "The",
    emphasis: "moodboard",
    image: "moodboard.webp",
    alt: "Close-up of the Love, Mave collage with stitched cherries and paper keepsakes",
    copy: "Embroidered cherries, vintage florals, and scrapbook keepsakes are the details behind Love, Mave.",
  },
  {
    title: "The",
    emphasis: "mug collection",
    image: "collection/7344.webp",
    alt: "White mug with a pink bunny-eared character and a peach handle",
    copy: "Browse the collection for colorful characters, playful lettering, and mugs with wavy handles.",
  },
];

function StoryArt({ page }) {
  return (
    <div className="story-art">
      <img src={`/assets/images/${page.image}`} alt={page.alt} />
      <span className="story-sticker" aria-hidden="true">&#9825;</span>
    </div>
  );
}

function StoryNote({ page, interactive = true }) {
  return (
    <div className="story-note">
      <h2>{page.title} <em>{page.emphasis}</em></h2>
      <p className="lead">{page.copy}</p>
      {page === pages.at(-1) && (
        <a href={interactive ? "#collection" : undefined} className="story-link">
          See the collection <span aria-hidden="true">&#8599;</span>
        </a>
      )}
    </div>
  );
}

export default function StoryBook() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(null);
  const cover = useRef(null);
  const navigation = useRef(null);
  const page = pages[index];

  function openBook() {
    setOpen(true);
    requestAnimationFrame(() => navigation.current?.focus());
  }

  function closeBook() {
    setOpen(false);
    setIndex(0);
    setTurn(null);
    requestAnimationFrame(() => cover.current?.focus());
  }

  function turnPage(step) {
    const next = index + step;
    if (turn || next < 0 || next >= pages.length) return;
    const narrow = window.matchMedia("(max-width: 820px)").matches;
    setTurn({ next, step, narrow });
  }

  function finishTurn(event) {
    if (event.target !== event.currentTarget) return;
    setIndex(turn.next);
    setTurn(null);
  }

  return (
    <section className="story" id="about" aria-label="Our story">
      <div className="wrap story-book" data-open={open}>
        <div className="story-book-interior" inert={!open} id="story-pages">
          <div className="story-spread">
            <div className="story-grid" inert={Boolean(turn)}>
              <StoryArt page={turn && (turn.narrow || turn.step === -1) ? pages[turn.next] : page} />
              <StoryNote page={turn && (turn.narrow || turn.step === 1) ? pages[turn.next] : page} />
            </div>
            {turn && (
              <div className="story-leaf" data-direction={turn.step} aria-hidden="true" onAnimationEnd={finishTurn}>
                <div className="story-leaf-face story-leaf-front">
                  <StoryArt page={page} />
                  <StoryNote page={page} interactive={false} />
                </div>
                <div className="story-leaf-face story-leaf-back">
                  <StoryArt page={pages[turn.next]} />
                  <StoryNote page={pages[turn.next]} interactive={false} />
                </div>
              </div>
            )}
          </div>
          <div className="story-book-nav" ref={navigation} tabIndex={-1} role="group" aria-label="Book controls"
            onKeyDown={event => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                turnPage(event.key === "ArrowLeft" ? -1 : 1);
              }
              if (event.key === "Escape") closeBook();
            }}
          >
            <button type="button" aria-disabled={Boolean(turn) || index === 0} onClick={() => turnPage(-1)}>&#8592; Previous</button>
            <span aria-live="polite">Page {index + 1} of {pages.length}</span>
            <button type="button" aria-disabled={Boolean(turn) || index === pages.length - 1} onClick={() => turnPage(1)}>Next &#8594;</button>
            <button type="button" className="story-book-close" onClick={closeBook}>Close book</button>
          </div>
        </div>

        <button className="story-cover" type="button" ref={cover} tabIndex={open ? -1 : 0}
          aria-hidden={open} aria-expanded={open} aria-controls="story-pages" onClick={openBook}
        >
          <span className="story-cover-heart" aria-hidden="true">&#9825;</span>
          <span className="eyebrow">Our story</span>
          <span className="story-cover-title">love, <em>mave.</em></span>
          <span className="story-cover-action">Open the book &#8594;</span>
        </button>
      </div>
      <div className="story-book-stack" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>
    </section>
  );
}
