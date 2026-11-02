import type {
  Paginated,
  TripBatchDto,
  TripSeatMapDto,
} from '@limousine-workspace/shared-types';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public, Staff } from '../../common/auth/decorators';
import { SeatAvailabilityService } from './seat-availability.service';
import {
  BatchListQuery,
  CreateBatchDto,
  GenerateBatchesDto,
  SearchTripsQuery,
  TripsService,
  UpdateBatchDto,
} from './trips.service';

@ApiTags('public')
@Public()
@Controller('public/trips')
export class TripsPublicController {
  constructor(
    private readonly trips: TripsService,
    private readonly availability: SeatAvailabilityService,
  ) {}

  /** Departures of a route on a VN calendar day, with server-side price and seats left. */
  @Get()
  search(@Query() q: SearchTripsQuery): Promise<TripBatchDto[]> {
    return this.trips.search(q);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<TripBatchDto> {
    return this.trips.getPublic(id);
  }

  /** Seat layout + availability per seat (live updates: socket `seats_changed` in room batch:{id}). */
  @Get(':id/seats')
  seats(@Param('id', ParseUUIDPipe) id: string): Promise<TripSeatMapDto> {
    return this.availability.seatMap(id);
  }
}

@ApiTags('admin · trips')
@Controller('admin/trip-batches')
export class TripsAdminController {
  constructor(
    private readonly trips: TripsService,
    private readonly availability: SeatAvailabilityService,
  ) {}

  @Staff('trip.read') @Get() list(
    @Query() q: BatchListQuery,
  ): Promise<Paginated<TripBatchDto>> {
    return this.trips.list(q);
  }
  @Staff('trip.read') @Get(':id') get(@Param('id', ParseUUIDPipe) id: string) {
    return this.trips.get(id);
  }
  @Staff('trip.read') @Get(':id/seats') seats(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.availability.seatMap(id);
  }
  @Staff('trip.write') @Post() create(@Body() dto: CreateBatchDto) {
    return this.trips.create(dto);
  }
  @Staff('trip.write') @Patch(':id') update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBatchDto,
  ) {
    return this.trips.update(id, dto);
  }
  /** Create missing departures from time slots for the next N days (idempotent). */
  @Staff('settings.manage') @Post('generate') generate(
    @Body() dto: GenerateBatchesDto,
  ) {
    return this.trips.generate(dto.days);
  }
}
