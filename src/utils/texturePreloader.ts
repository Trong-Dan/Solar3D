import * as THREE from 'three';
import { allCelestialBodies } from '../data/planets';

const EXTRA_TEXTURES = ['/textures/moon.jpg', '/textures/sun.jpg'];

function buildTextureUrls(): string[] {
  const urls = allCelestialBodies.map((body) => body.texture);
  return [...new Set([...urls, ...EXTRA_TEXTURES])].filter((url) => url && !url.includes('saturn-ring'));
}

/**
 * Preloads all planet textures with a progress callback.
 * Resolves on completion, or after a safety timeout if a texture fails.
 */
export function preloadTextures(
  onProgress: (loaded: number, total: number) => void
): Promise<void> {
  const urls = buildTextureUrls();
  const total = urls.length;
  const loader = new THREE.TextureLoader();
  let loaded = 0;

  return new Promise((resolve) => {
    const tryResolve = () => {
      if (loaded >= total) resolve();
    };

    urls.forEach((url) => {
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          loaded += 1;
          onProgress(loaded, total);
          tryResolve();
        },
        undefined,
        () => {
          // Mark as attempted even on error so loading never hangs
          loaded += 1;
          onProgress(loaded, total);
          tryResolve();
        }
      );
    });

    // Safety net: never block the app beyond 8 seconds
    window.setTimeout(resolve, 8000);
  });
}
