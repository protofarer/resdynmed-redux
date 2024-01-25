import type { MetaFunction } from "@remix-run/node";

import About from "~/components/static/About";
import IntroText from "~/components/static/IntroText";
import SessionTexts from "~/components/static/SessionTexts";

export const meta: MetaFunction = () => [{ title: "Resonant Dynamic Meditation Experience" }];

export default function Index() {
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      {/* <div className="moon-container">
        <a href="/" className="moon">
          <div className="moon-disc"></div>
          <div className="moon-text"></div>
        </a>
        <div className="moon-diffusor"></div>
      </div>  */}
      <div className="mx-auto mt-10 max-w-sm sm:flex sm:flex-col sm:max-w-none sm:justify-center">
        -------INDEX TEXT----------
        <br />
        <IntroText />
        <SessionTexts />
        <About />
      </div>
    </main>
  );
}
