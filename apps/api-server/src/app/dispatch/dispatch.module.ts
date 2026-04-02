import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { OrToolsVrpService } from './ortools-vrp.service';
import { OsrmService } from './osrm.service';
import { SpatialClusterService } from './spatial-cluster.service';

@Module({
  providers: [
    DispatchService,
    OsrmService,
    SpatialClusterService,
    OrToolsVrpService,
  ],
  exports: [DispatchService, OsrmService, SpatialClusterService, OrToolsVrpService],
})
export class DispatchModule {}
