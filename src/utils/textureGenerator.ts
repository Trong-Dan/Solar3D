import * as THREE from 'three';

// Cache generated/loaded textures
const textureCache: Record<string, THREE.Texture> = {};
const textureLoader = new THREE.TextureLoader();

// Helper noise and turbulence generators for fallback canvas
function pseudoNoise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const u = fx * fx * (3.0 - 2.0 * fx);
  const v = fy * fy * (3.0 - 2.0 * fy);

  const n00 = pseudoNoise(i, j);
  const n10 = pseudoNoise(i + 1, j);
  const n01 = pseudoNoise(i, j + 1);
  const n11 = pseudoNoise(i + 1, j + 1);

  const nx0 = n00 * (1.0 - u) + n10 * u;
  const nx1 = n01 * (1.0 - u) + n11 * u;
  return nx0 * (1.0 - v) + nx1 * v;
}

function fbm(x: number, y: number, octaves = 5): number {
  let val = 0;
  let freq = 1;
  let amp = 0.5;
  let maxAmp = 0;
  for (let i = 0; i < octaves; i++) {
    val += smoothNoise(x * freq, y * freq) * amp;
    maxAmp += amp;
    freq *= 2.0;
    amp *= 0.5;
  }
  return val / maxAmp;
}

// 5. Earth Clouds Texture (Swirling semi-transparent white clouds)
export function createEarthCloudsTexture(width = 2048, height = 1024): THREE.CanvasTexture {
  if (textureCache['earth_clouds']) return textureCache['earth_clouds'] as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const nx = (x / width) * 12;
      const ny = (y / height) * 6;

      const swirl = Math.sin(ny * 3 + (x / width) * 2) * 0.4;
      const c = fbm(nx + swirl, ny, 5);

      if (c > 0.52) {
        const alpha = Math.min(255, Math.floor((c - 0.52) * 4 * 255));
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = alpha;
      } else {
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = 0;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  textureCache['earth_clouds'] = texture;
  return texture;
}

// 10. Saturn Rings Texture (Radial gradient with Cassini division and Encke gap)
export function createSaturnRingTexture(width = 2048, height = 128): THREE.CanvasTexture {
  if (textureCache['saturn_ring']) return textureCache['saturn_ring'] as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let x = 0; x < width; x++) {
    const pos = x / width; // 0 (inner ring) to 1 (outer ring)

    let alpha = 0;
    let r = 210, g = 185, b = 145;

    // C Ring (innermost, semi-transparent dark)
    if (pos < 0.15) {
      alpha = pos * 3.0 * 80;
      r = 150; g = 130; b = 110;
    }
    // B Ring (brightest, dense) - inner bright band
    else if (pos < 0.25) {
      const band = Math.sin(pos * 120) * 0.1 + 0.9;
      alpha = 255 * band;
      r = Math.floor(240 * band);
      g = Math.floor(215 * band);
      b = Math.floor(175 * band);
    }
    // B Ring (brightest, dense) - outer
    else if (pos < 0.55) {
      const band = Math.sin(pos * 90) * 0.12 + 0.88;
      alpha = 230 * band;
      r = Math.floor(225 * band);
      g = Math.floor(200 * band);
      b = Math.floor(160 * band);
    }
    // Cassini Division (dark gap) - more visible
    else if (pos < 0.64) {
      const gapDepth = 1 - Math.abs(pos - 0.595) / 0.045;
      alpha = 8 + gapDepth * 20;
      r = 120; g = 110; b = 95;
    }
    // A Ring (outer bright ring with Encke gap)
    else if (pos < 0.90) {
      if (pos > 0.80 && pos < 0.83) {
        // Encke gap
        const gapDepth = 1 - Math.abs(pos - 0.815) / 0.015;
        alpha = 6 + gapDepth * 15;
      } else {
        const band = Math.sin(pos * 110) * 0.12 + 0.88;
        alpha = 200 * band;
        r = Math.floor(215 * band);
        g = Math.floor(190 * band);
        b = Math.floor(150 * band);
      }
    }
    // F Ring (thin outermost)
    else if (pos < 0.93) {
      const ring = Math.abs(pos - 0.915) < 0.015 ? 1 : 0;
      alpha = ring * 160;
      r = 200; g = 180; b = 150;
    }
    // Outer fade
    else {
      alpha = Math.max(0, (1 - pos) * 180);
    }

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = Math.floor(alpha);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  textureCache['saturn_ring'] = texture;
  return texture;
}

// 12. Uranus Ring Texture (Subtle faint thin ring)
export function createUranusRingTexture(width = 1024, height = 64): THREE.CanvasTexture {
  if (textureCache['uranus_ring']) return textureCache['uranus_ring'] as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let x = 0; x < width; x++) {
    const pos = x / width;
    let alpha = 0;
    if (pos > 0.4 && pos < 0.9) {
      alpha = Math.sin((pos - 0.4) / 0.5 * Math.PI) * 110;
    }

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      data[idx] = 170;
      data[idx + 1] = 220;
      data[idx + 2] = 230;
      data[idx + 3] = Math.floor(alpha);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  textureCache['uranus_ring'] = texture;
  return texture;
}

// Texture mapping from public/textures
const textureFiles: Record<string, string> = {
  sun: '/textures/sun.jpg',
  mercury: '/textures/mercury.jpg',
  venus: '/textures/venus.jpg',
  earth: '/textures/earth.jpg',
  moon: '/textures/moon.jpg',
  mars: '/textures/mars.jpg',
  jupiter: '/textures/jupiter.jpg',
  saturn: '/textures/saturn.jpg',
  uranus: '/textures/uranus.jpg',
  neptune: '/textures/neptune.jpg',
};

// Generic texture retrieval by planet ID
export function getPlanetTexture(planetId: string): THREE.Texture {
  if (textureCache[planetId]) return textureCache[planetId];

  if (planetId === 'saturn_ring') return createSaturnRingTexture();
  if (planetId === 'uranus_ring') return createUranusRingTexture();
  if (planetId === 'earth_clouds') return createEarthCloudsTexture();

  const filePath = textureFiles[planetId];
  if (filePath) {
    const texture = textureLoader.load(filePath);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureCache[planetId] = texture;
    return texture;
  }

  // Fallback
  return createSaturnRingTexture();
}

export function createMoonTexture(): THREE.Texture {
  return getPlanetTexture('moon');
}
