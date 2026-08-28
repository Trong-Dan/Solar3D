export interface MoonData {
  name: string;
  englishName: string;
  diameter: number; // km
  orbitPeriod: string;
  discovery: string;
  description: string;
}

export interface SpaceMission {
  name: string;
  year: string;
  agency: string;
  description: string;
}

export interface PhysicalStats {
  diameterKm: number;
  massKg: string; // e.g. "5.972 × 10^24 kg"
  gravity: number; // m/s^2
  meanTempC: number;
  minTempC?: number;
  maxTempC?: number;
  atmosphere: string;
  density: number; // g/cm^3
}

export interface OrbitStats {
  distanceAU: number;
  distanceMillionKm: number;
  orbitalPeriodDays: number;
  orbitalPeriodYears: number;
  rotationPeriodHours: number;
  orbitalVelocityKmS: number;
  axialTiltDeg: number;
  eccentricity: number;
}

export interface PlanetData {
  id: string;
  name: string;
  englishName: string;
  type: 'star' | 'terrestrial' | 'gas_giant' | 'ice_giant' | 'dwarf';
  formation: string;
  discovered: string;
  shape: string;
  description: string;
  funFact: string;
  
  // 3D visual parameters
  radius: number;
  distanceFromSun: number;
  orbitSpeed: number;
  rotationSpeed: number;
  texture: string;
  ringTexture?: string;
  color: string;
  emissiveColor?: string;
  tilt?: number; // radians
  hasRing?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  
  // Detailed scientific information
  physical: PhysicalStats;
  orbit: OrbitStats;
  moons: MoonData[];
  moonCount: string;
  missions: SpaceMission[];
  composition: {
    core: string;
    mantle: string;
    crustOrAtmosphere: string;
  };
}

export type ScaleMode = 'readable' | 'realistic';
export type QualityPreset = 'low' | 'medium' | 'high';
export type InfoTabType = 'overview' | 'physical' | 'orbit' | 'moons' | 'missions' | 'comparison';
