"use client";

import { motion } from "framer-motion";
import { Accessibility, Stethoscope, MapPin, Users } from "lucide-react";

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

interface ShelterCardProps {
  shelter: Shelter;
  index: number;
}

export function ShelterCard({ shelter, index }: ShelterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
        shelter.status === "Open"
          ? "border-green-600 bg-gray-800 hover:border-green-400"
          : "border-red-600 bg-gray-900 hover:border-red-400"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{shelter.name}</h3>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                shelter.status === "Open"
                  ? "bg-green-900 border border-green-600 text-green-200"
                  : "bg-red-900 border border-red-600 text-red-200 animate-pulse"
              }`}
            >
              {shelter.status}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3 text-gray-300">
          <Users className="w-5 h-5 text-amber-500" />
          <span className="text-sm">
            Capacity: <span className="font-semibold text-white">{shelter.capacity}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-gray-300">
          <MapPin className="w-5 h-5 text-red-500" />
          <span className="text-sm">
            <span className="font-semibold text-white">
              {shelter.lat.toFixed(4)}°, {shelter.lng.toFixed(4)}°
            </span>
          </span>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-700">
        {shelter.ada_accessible && (
          <motion.div
            className="flex items-center gap-2 px-3 py-2 bg-blue-900 border border-blue-600 rounded-lg flex-1 justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <Accessibility className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-200">ADA</span>
          </motion.div>
        )}
        {shelter.medical_support && (
          <motion.div
            className="flex items-center gap-2 px-3 py-2 bg-purple-900 border border-purple-600 rounded-lg flex-1 justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <Stethoscope className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-semibold text-purple-200">Medical</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
