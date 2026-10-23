import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function AboutUsPage() {
  return (
    <div className="site-shell min-h-screen w-full overflow-x-hidden bg-[#f7f8f4] text-[#20221e]">
      <Header onExplore={() => { window.location.href = "/#open-roles"; }} onNotice={() => {}} />
      <main className="section-wrap mx-auto min-h-[65vh] w-[90%] max-w-[1160px] py-20">
        <span className="section-kicker">ABOUT HIRE-ME</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Good work finds good people.</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#777a73]">
          Hire-Me helps people discover meaningful opportunities and helps teams
          meet the people who will move their work forward.
        </p>
        <a className="button button-dark mt-8" href="/">Explore open roles</a>
      </main>
      <Footer />
    </div>
  );
}
