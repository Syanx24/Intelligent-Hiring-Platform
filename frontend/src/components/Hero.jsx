import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

export default function Hero({ search, location, onSearchChange, onLocationChange, onExplore }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> A little closer to your next big thing</div>
        <h1>Work should feel<br />like <span>your thing.</span></h1>
        <p className="hero-description">
          Find thoughtful teams, meaningful work, and a place to do the best work of your life.
        </p>
        <form
          className="search-panel"
          onSubmit={(event) => {
            event.preventDefault();
            onExplore();
          }}
        >
          <label className="search-field">
            <Search size={19} />
            <input
              aria-label="Job title, skill or company"
              placeholder="Job title, skill or company"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
          <span className="search-divider" />
          <label className="search-field location-field">
            <MapPin size={19} />
            <select
              aria-label="Work arrangement"
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
            >
              <option value="">Anywhere</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
            <ChevronDown className="select-chevron" size={15} />
          </label>
          <button className="button button-lime search-button" type="submit">
            Search jobs <ArrowRight size={16} />
          </button>
        </form>
        <div className="popular-searches">
          <span>Popular:</span>
          {["Product designer", "Remote", "Frontend"].map((term) => (
            <button
              key={term}
              onClick={() => {
                onSearchChange(term === "Remote" ? "" : term);
                onLocationChange(term === "Remote" ? "Remote" : "");
              }}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
      <div className="hero-visual" aria-label="Illustration of a person discovering new opportunities">
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />
        <div className="sun-disc" />
        <div className="floating-card float-top">
          <span className="float-icon"><Sparkles size={16} /></span>
          <span><strong>Good things ahead</strong><small>Fresh roles, just added</small></span>
          <ArrowUpRight size={15} />
        </div>
        <div className="person-illustration">
          <div className="person-shadow" />
          <div className="person-leg leg-left" />
          <div className="person-leg leg-right" />
          <div className="person-body"><span className="shirt-fold" /></div>
          <div className="person-arm" />
          <div className="person-neck" />
          <div className="person-head">
            <span className="hair hair-back" />
            <span className="face" />
            <span className="hair hair-front" />
            <span className="face-detail" />
          </div>
          <div className="person-bag" />
        </div>
        <div className="plant plant-left"><i /><i /><i /><b /></div>
        <div className="plant plant-right"><i /><i /><i /><b /></div>
        <div className="floating-card float-bottom">
          <span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span>
          <span><strong>Find your people</strong><small>Meet your future team</small></span>
        </div>
        <div className="visual-spark spark-one">✳</div>
        <div className="visual-spark spark-two">✦</div>
      </div>
      <div className="hero-note"><span>✳</span> Your next chapter starts here</div>
    </section>
  );
}
