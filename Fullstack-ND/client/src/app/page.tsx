import HomeComp from "@/components/home/home";
import IncidentWrapper from "./data/wrapper";

export default function Home() {
  return (
    <div className="font-sans flex flex-col min-h-screen">
      {/* <Header /> */}

      <main className="flex-grow flex items-center justify-center min-h-screen p-8 gap-12 sm:p-8">
        <IncidentWrapper />
      </main>

      {/* <Footer /> */}
    </div>
  );
}
