import { Hero } from "../../components/landing/hero";
import { Features } from "../../components/landing/features";
import { LiveDemo } from "../../components/landing/live-demo";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 antialiased selection:bg-indigo-500 selection:text-white">
      <Hero />
      <Features />
      <LiveDemo />
    </div>
  );
}
