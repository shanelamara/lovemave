import PhotoCarousel from "./components/photo-carousel";
import { mugs } from "./mugs";
import StoryBook from "./components/story-book";
import Hero from "./components/hero";
import MugCollection from "./components/mug-collection";
import ScrollReveal from "./components/scroll-reveal";

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <header className="site-header">
        <div className="wrap nav">
          <a className="brand" href="#top">love, mave<span aria-hidden="true">♡</span></a>
          <nav aria-label="Main navigation">
            <a className="nav-collection" href="#collection">Mugs</a>
            <a href="#about">About</a>
            <a href="#care">Mug care</a>
          </nav>
        </div>
      </header>
      <main className="tablecloth">
      <div className="tablecloth-coasters" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>
      <Hero />

      <MugCollection />

      <section className="rituals" id="rituals" aria-labelledby="rituals-title">
       <div className="rituals-accents" aria-hidden="true">
        <span>✦</span><span>♡</span><span>✧</span>
       </div>
       <div className="wrap">
        <div className="care-head" data-reveal=""><p className="eyebrow">Pairings &amp; rituals</p><h2 id="rituals-title">Sweet <em>mornings</em></h2><p>Every mug has a moment it was made for. Here are three ways to enjoy yours.</p></div>
        <div className="ritual-cards">
         <article className="ritual-card r1" data-reveal="">
          <span className="when">Slow start</span>
          <div className="ritual-art" aria-hidden="true">
           <span className="ritual-mark ritual-mark-left">✦</span>
           <img src="/assets/images/collection/7344.webp" alt="" loading="lazy" />
           <span className="ritual-mark ritual-mark-right">✧</span>
          </div>
          <h3>Pink Bunny</h3>
          <p>Take your first cup by the window, before the day gets loud.</p>
          <p className="pair"><span>Pair it with</span> an oat latte and cherry toast</p>
         </article>
         <article className="ritual-card r2" data-reveal="">
          <span className="when">Sweet break</span>
          <div className="ritual-art" aria-hidden="true">
           <span className="ritual-mark ritual-mark-left">♡</span>
           <img src="/assets/images/collection/7368.webp" alt="" loading="lazy" />
           <span className="ritual-mark ritual-mark-right">♡</span>
          </div>
          <h3>What If Mag Cry AQ?</h3>
          <p>A midmorning pause with something warm, creamy, and a little bit chocolatey.</p>
          <p className="pair"><span>Pair it with</span> hot cocoa and marshmallows</p>
         </article>
         <article className="ritual-card r3" data-reveal="">
          <span className="when">Tea time</span>
          <div className="ritual-art" aria-hidden="true">
           <span className="ritual-mark ritual-mark-left">✧</span>
           <img src="/assets/images/collection/7359.webp" alt="" loading="lazy" />
           <span className="ritual-mark ritual-mark-right">✦</span>
          </div>
          <h3>What the Shibal</h3>
          <p>Steep something calming and let the afternoon settle around you.</p>
          <p className="pair"><span>Pair it with</span> Earl Grey and shortbread</p>
         </article>
        </div>
       </div>
      </section>

      <div className="collection-story">
        <PhotoCarousel photos={mugs} />
        <StoryBook />
      </div>

      <section className="care2" id="care" aria-labelledby="care-title">
       <div className="wrap">
        <div className="care-head" data-reveal=""><p className="eyebrow">Keep it lovely</p><h2 id="care-title">Mug <em>care</em></h2><p>A few tips for keeping your favorite cup in good shape.</p></div>
        <div className="care-cards">
         <article data-reveal=""><span className="num">01</span><h3>How should I wash a glazed mug?</h3><p>Wash it with warm water, mild dish soap, and a soft sponge. A soft cloth works well for drying.</p></article>
         <article data-reveal=""><span className="num">02</span><h3>Can I use the microwave or dishwasher?</h3><p>Check the care instructions for your specific mug. If the maker hasn’t confirmed either use, hand-wash it and heat your drink separately.</p></article>
         <article data-reveal=""><span className="num">03</span><h3>How do I avoid sudden temperature changes?</h3><p>Let a cold mug come to room temperature before filling it with hot coffee or tea. Let a hot mug cool before rinsing it with cold water.</p></article>
        </div>
       </div>
      </section>
      </main>
      <footer><div className="wrap"><a className="brand" href="#top">love, mave<span>♡</span></a><a href="#care">Mug care</a><a href="#top">Back to top ↑</a></div><p className="site-credit"><a className="credit-pill" href="https://ds-labs-tech.vercel.app/work"><span>Created with <i aria-hidden="true">♡</i> by</span> <strong>d&amp;slabs</strong> <b aria-hidden="true">↗</b></a></p></footer>
    </>
  );
}
