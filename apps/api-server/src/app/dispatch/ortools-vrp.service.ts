import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { BookingEntity } from '../entities/booking.entity';
import { OsrmService } from './osrm.service';
import { nearestNeighborOrder } from './tsp';

/**
 * Lớp heuristic VRP/CVRP tương thích giao diện OR-Tools (Routing + capacity).
 * Có thể thay bằng Google OR-Tools RoutingModel (C++/Python) khi tích hợp native.
 */
@Injectable()
export class OrToolsVrpService {
  private readonly logger = new Logger(OrToolsVrpService.name);

  constructor(
    private readonly osrm: OsrmService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Thứ tự thăm điểm đón trong một nhóm: NN trên ma trận thời gian OSRM.
   */
  async orderPickupStops(group: BookingEntity[]): Promise<number[]> {
    if (group.length === 0) return [];
    const coords = group.map((b) => ({
      lng: b.pickup_lng,
      lat: b.pickup_lat,
    }));
    const t0 = Date.now();
    const matrix = await this.osrm.getDurationMatrix(coords);
    const tour = nearestNeighborOrder(matrix, 0);
    const ms = Date.now() - t0;
    if (this.config.get<string>('DISPATCH_LOG_MATRICES') === 'true') {
      this.logger.debug(
        `pickup tour n=${group.length} osrm_ms=${ms} engine=nearest_neighbor`,
      );
    }
    return tour;
  }
}
