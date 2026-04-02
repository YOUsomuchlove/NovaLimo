/**
 * Nearest-neighbor TSP tour on distance matrix. Returns visit order (indices).
 */
export function nearestNeighborOrder(dist: number[][], startIndex = 0): number[] {
  const n = dist.length;
  if (n === 0) return [];
  if (n === 1) return [0];

  const visited = new Array<boolean>(n).fill(false);
  const order: number[] = [];
  let current = startIndex;
  order.push(current);
  visited[current] = true;

  for (let step = 1; step < n; step++) {
    let best = -1;
    let bestD = Number.POSITIVE_INFINITY;
    for (let j = 0; j < n; j++) {
      if (visited[j]) continue;
      const d = dist[current][j];
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    if (best === -1) break;
    visited[best] = true;
    order.push(best);
    current = best;
  }

  return order;
}
