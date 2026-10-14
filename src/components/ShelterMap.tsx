"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Shelter } from "@/src/types/shelter";

interface ShelterMapProps {
  shelters: Shelter[];
  selectedShelterId?: string;
  onReportIssue: (shelterId: string) => void;
}

const AUSTIN_CENTER: [number, number] = [30.2672, -97.7431];
const DEFAULT_ZOOM = 11;

// Helper component to center and zoom map when a shelter is selected
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}

function createShelterIcon(status: "Open" | "Full", isSelected: boolean) {
  const bg = status === "Open" ? "#10b981" : "#ef4444";
  const border = isSelected ? "#f59e0b" : "#0f172a";
  const size = isSelected ? 26 : 20;

  return L.divIcon({
    className: "custom-shelter-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${bg};
        border: 3px solid ${border};
        border-radius: 50%;
        box-shadow: 0 0 ${isSelected ? "14px #f59e0b" : "6px rgba(0,0,0,0.7)"};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export function ShelterMap({
  shelters,
  selectedShelterId,
  onReportIssue,
}: ShelterMapProps) {
  const selectedShelter = useMemo(
    () => shelters.find((s) => s.id === selectedShelterId),
    [shelters, selectedShelterId],
  );

  const activeCenter: [number, number] = selectedShelter
    ? [selectedShelter.lat, selectedShelter.lng]
    : AUSTIN_CENTER;
  const activeZoom = selectedShelter ? 14 : DEFAULT_ZOOM;

  return (
    <div className="relative h-[550px] w-full overflow-hidden rounded-xl border border-slate-700 shadow-xl shadow-black/30">
      <MapContainer
        center={AUSTIN_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ height: "100%", width: "100%", backgroundColor: "#191a1a" }}
      >
        <MapController center={activeCenter} zoom={activeZoom} />

        {/* Free CartoDB Dark Matter tile layer - requires no API key */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {shelters.map((shelter) => {
          const isSelected = shelter.id === selectedShelterId;
          const icon = createShelterIcon(shelter.status, isSelected);

          return (
            <Marker
              key={shelter.id}
              position={[shelter.lat, shelter.lng]}
              icon={icon}
            >
              <Popup className="shelter-leaflet-popup">
                <div className="min-w-48 space-y-2 p-1 text-slate-900">
                  <h3 className="font-bold text-base leading-tight">
                    {shelter.name}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>
                      Status:{" "}
                      <strong
                        className={
                          shelter.status === "Open"
                            ? "font-bold text-emerald-700"
                            : "font-bold text-red-700"
                        }
                      >
                        {shelter.status}
                      </strong>
                    </p>
                    <p>
                      Capacity: <strong>{shelter.capacity}</strong>
                    </p>
                    <p>
                      Accessibility:{" "}
                      <strong>
                        {shelter.ada_accessible ? "ADA Compliant" : "Standard"}
                      </strong>
                    </p>
                    <p>
                      Medical Support:{" "}
                      <strong>
                        {shelter.medical_support ? "Available" : "None"}
                      </strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onReportIssue(shelter.id)}
                    className="mt-2 w-full min-h-10 cursor-pointer rounded-md bg-red-700 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-red-800"
                  >
                    Report Issue
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
