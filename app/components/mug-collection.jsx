"use client";

import { useState } from "react";
import { mugs } from "../mugs";

export default function MugCollection() {
  const [selection, setSelection] = useState({ index: 0, revision: 0 });
  const { index, revision } = selection;
  const mug = mugs[index];

  return (
    <section className="shelf" id="collection" aria-labelledby="collection-title" data-mug={index}>
      <div className="wrap">
        <p className="eyebrow" data-reveal="">Pick a favorite &#9825;</p>
        <h2 id="collection-title" data-reveal="">The mug <em>collection</em></h2>
        <div className="shelf-grid">
          <div className="shelf-photo" data-reveal="">
            {mugs.map(({ name, image, alt }, i) => (
              <img key={name} className={i === index ? "on" : undefined} src={`/assets/images/${image}`} alt={alt} aria-hidden={i !== index} />
            ))}
            {revision > 0 && <span key={revision} className="shelf-glint" aria-hidden="true" />}
          </div>
          <div className="shelf-info" aria-live="polite">
            <p key={`count-${revision}`} className="shelf-count"><b>{String(index + 1).padStart(2, "0")}</b> / {mugs.length}</p>
            <h3 key={`name-${revision}`}>{mug.name}</h3>
            <p key={`description-${revision}`} className="shelf-desc">{mug.description}</p>
          </div>
        </div>
        <div className="picker" role="group" aria-label="Choose a mug">
          {mugs.map(({ name, image }, i) => (
            <button
              key={name}
              type="button"
              aria-pressed={i === index}
              onClick={() => setSelection(previous => ({ index: i, revision: previous.revision + 1 }))}
            >
              <img src={`/assets/images/${image}`} alt="" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
