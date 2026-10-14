export type ShelterStatus = "Open" | "Full";

export interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: ShelterStatus;
  capacity: number;
  ada_accessible: boolean;
  medical_support: boolean;
}
