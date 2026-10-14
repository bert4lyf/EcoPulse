import { Navbar } from "@/app/components/Navbar";
import { ShelterList } from "@/app/components/ShelterList";
import { OfflineToggle } from "@/app/components/OfflineToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ShelterList />
      </main>
      <OfflineToggle />
    </div>
  );
}
