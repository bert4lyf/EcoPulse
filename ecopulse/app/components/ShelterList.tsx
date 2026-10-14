"use client";

import { ShelterCard } from "./ShelterCard";
import shelterData from "@/app/data/shelters.json";
import { AlertCircle } from "lucide-react";

interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "Open" | "Full";
  capacity: number;
  ada_accessible: boolean;
  medical_support: boolean;
}

export function ShelterList() {
  const typedShelters = shelterData as unknown as Shelter[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Emergency Shelters</h2>
        <p className="text-gray-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          {typedShelters.length} shelters available
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {typedShelters.map((shelter, index) => (
          <ShelterCard key={shelter.id} shelter={shelter} index={index} />
        ))}
      </div>
    </div>
  );
}
