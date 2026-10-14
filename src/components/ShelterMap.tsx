"use client";

import { useState } from "react";
import {
  APIProvider,
  Circle,
  InfoWindow,
  Map,
  Marker,
} from "@vis.gl/react-google-maps";
import type { Shelter } from "@/src/types/shelter";

interface ShelterMapProps {
  shelters: Shelter[];
  selectedShelterId?: string;
  onReportIssue: (shelterId: string) => void;
}

const AUSTIN_CENTER: google.maps.LatLngLiteral = {
  lat: 30.2672,
  lng: -97.7431,
};

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#202124" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#e8eaed" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#202124" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#5f6368" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#292a2d" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#383a3d" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#202124" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#303134" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#111820" }],
  },
];

export function ShelterMap({
  shelters,
  selectedShelterId,
  onReportIssue,
}: ShelterMapProps) {
  const [mapError, setMapError] = useState<string | null>(null);
  const [clickedShelter, setClickedShelter] = useState<{
    parentSelection: string | undefined;
    shelterId: string | null;
  } | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const activeShelterId =
    clickedShelter && clickedShelter.parentSelection === selectedShelterId
      ? clickedShelter.shelterId
      : selectedShelterId;
  const selectedShelter =
    shelters.find((shelter) => shelter.id === activeShelterId);

  if (!apiKey) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center gap-3 rounded-xl border border-amber-700/50 bg-slate-950 px-6 text-center">
        <p className="text-lg font-bold text-white">Google Maps needs an API key</p>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Add <code className="text-amber-200">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
          to your local environment and deployment settings, then rebuild the
          app.
        </p>
        <a
          href="https://console.cloud.google.com/google/maps-apis"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-lg border border-amber-700/60 px-4 py-2 text-sm font-bold text-amber-200 hover:bg-amber-950/40"
        >
          Open Google Maps Platform
        </a>
      </div>
    );
  }

  if (mapError) {
    return (
      <div
        role="alert"
        className="flex h-[600px] flex-col items-center justify-center gap-3 rounded-xl border border-red-700/50 bg-slate-950 px-6 text-center"
      >
        <p className="text-lg font-bold text-white">Google Maps could not load</p>
        <p className="max-w-xl text-sm leading-6 text-slate-400">{mapError}</p>
        <p className="max-w-xl text-xs leading-5 text-slate-500">
          Check that Maps JavaScript API is enabled, billing is active, and the
          key allows this site&apos;s domain.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[600px] overflow-hidden rounded-xl border border-slate-700 shadow-xl shadow-black/30">
      <APIProvider
        apiKey={apiKey}
        onError={() =>
          setMapError(
            "The API key was rejected or the Maps JavaScript API could not be reached.",
          )
        }
      >
        <Map
          defaultCenter={AUSTIN_CENTER}
          defaultZoom={11}
          center={
            selectedShelter
              ? { lat: selectedShelter.lat, lng: selectedShelter.lng }
              : undefined
          }
          zoom={selectedShelter ? 14 : undefined}
          gestureHandling="greedy"
          disableDefaultUI={false}
          styles={DARK_MAP_STYLES}
          className="h-full w-full"
        >
          <Circle
            center={AUSTIN_CENTER}
            radius={9000}
            strokeColor="#f59e0b"
            strokeOpacity={0.65}
            strokeWeight={1}
            fillColor="#f59e0b"
            fillOpacity={0.04}
            clickable={false}
          />
          {shelters.map((shelter) => (
            <Marker
              key={shelter.id}
              position={{ lat: shelter.lat, lng: shelter.lng }}
              title={`${shelter.name} — ${shelter.status}`}
              onClick={() =>
                setClickedShelter({
                  parentSelection: selectedShelterId,
                  shelterId: shelter.id,
                })
              }
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="${shelter.status === "Open" ? "#34d399" : "#f87171"}" stroke="#111827" stroke-width="3"/></svg>`,
                )}`,
              }}
            />
          ))}
          {selectedShelter && (
            <InfoWindow
              position={{
                lat: selectedShelter.lat,
                lng: selectedShelter.lng,
              }}
              onCloseClick={() =>
                setClickedShelter({
                  parentSelection: selectedShelterId,
                  shelterId: null,
                })
              }
            >
              <div className="min-w-48 space-y-2 text-slate-900">
                <h3 className="font-bold">{selectedShelter.name}</h3>
                <p>
                  Status: <strong>{selectedShelter.status}</strong>
                </p>
                <p>
                  Capacity: <strong>{selectedShelter.capacity}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => onReportIssue(selectedShelter.id)}
                  className="min-h-11 rounded-md bg-red-700 px-3 py-2 font-semibold text-white hover:bg-red-800"
                >
                  Report Issue
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
