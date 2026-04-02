/**
 * Lloyd k-means on 2D points (lng/lat). Returns cluster index 0..k-1 per point.
 */
export function kMeansLabels(
  points: Array<{ lng: number; lat: number }>,
  k: number,
  iterations = 25,
): number[] {
  const n = points.length;
  if (n === 0) return [];
  const clusters = Math.max(1, Math.min(k, n));

  let centroids = pickInitialCentroids(points, clusters);
  const labels = new Array<number>(n).fill(0);

  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestD = Number.POSITIVE_INFINITY;
      for (let c = 0; c < clusters; c++) {
        const dx = points[i].lng - centroids[c].lng;
        const dy = points[i].lat - centroids[c].lat;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      labels[i] = best;
    }

    const sumLng = new Array(clusters).fill(0);
    const sumLat = new Array(clusters).fill(0);
    const count = new Array(clusters).fill(0);
    for (let i = 0; i < n; i++) {
      const c = labels[i];
      sumLng[c] += points[i].lng;
      sumLat[c] += points[i].lat;
      count[c] += 1;
    }
    for (let c = 0; c < clusters; c++) {
      if (count[c] > 0) {
        centroids[c] = {
          lng: sumLng[c] / count[c],
          lat: sumLat[c] / count[c],
        };
      }
    }
  }

  return labels;
}

function pickInitialCentroids(
  points: Array<{ lng: number; lat: number }>,
  k: number,
): Array<{ lng: number; lat: number }> {
  const centroids: Array<{ lng: number; lat: number }> = [];
  const step = Math.max(1, Math.floor(points.length / k));
  for (let i = 0; i < k; i++) {
    centroids.push({ ...points[(i * step) % points.length] });
  }
  return centroids;
}
