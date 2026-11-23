import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsIn } from 'class-validator';
import type { AuthUser } from '../../common/auth/auth-user';
import { CurrentUser, Driver, Staff } from '../../common/auth/decorators';
import {
  ChatHistoryQuery,
  CommsService,
  IncidentListQuery,
  MarkReadDto,
  ReportIncidentDto,
  SendChatDto,
  UpdateIncidentDto,
} from './comms.service';
import {
  BookingActionDto,
  DriverRunsQuery,
  DriverService,
  EndShiftDto,
  IncomeQuery,
  LocationBatchDto,
  PushTokenDto,
  StartShiftDto,
} from './driver.service';
import {
  AssignBookingsDto,
  CreateRunDto,
  OrderStopsDto,
  RunListQuery,
  RunsService,
  UpdateRunDto,
} from './runs.service';

const Id = () => Param('id', ParseUUIDPipe);

class RunStatusDto {
  @ApiProperty({ enum: ['DISPATCHED', 'PENDING', 'CANCELLED'] })
  @IsIn(['DISPATCHED', 'PENDING', 'CANCELLED'])
  status!: 'DISPATCHED' | 'PENDING' | 'CANCELLED';
}

/* ================= Admin ================= */

@ApiTags('admin · trips')
@Controller('admin')
export class RunsAdminController {
  constructor(private readonly runs: RunsService) {}

  @Staff('trip.read') @Get('trip-runs') list(@Query() q: RunListQuery) {
    return this.runs.list(q);
  }
  @Staff('trip.read') @Get('trip-runs/:id') detail(@Id() id: string) {
    return this.runs.detail(id);
  }
  @Staff('dispatch.manage') @Post('trip-runs') create(
    @Body() dto: CreateRunDto,
  ) {
    return this.runs.create(dto);
  }
  @Staff('dispatch.manage') @Patch('trip-runs/:id') update(
    @Id() id: string,
    @Body() dto: UpdateRunDto,
  ) {
    return this.runs.update(id, dto);
  }
  @Staff('dispatch.manage') @Delete('trip-runs/:id') @HttpCode(204) remove(
    @Id() id: string,
  ) {
    return this.runs.remove(id);
  }

  /** DISPATCHED = "xuất lệnh" (sends the run to the driver app). */
  @Staff('dispatch.manage')
  @Post('trip-runs/:id/status')
  @HttpCode(200)
  status(@Id() id: string, @Body() dto: RunStatusDto) {
    return this.runs.setStatus(id, dto.status);
  }

  @Staff('dispatch.manage') @Put('trip-runs/:id/order') reorder(
    @Id() id: string,
    @Body() dto: OrderStopsDto,
  ) {
    return this.runs.reorder(id, dto);
  }

  /** Dispatch board for one batch: runs + all bookings (assigned and queue). */
  @Staff('dispatch.manage') @Get('dispatch/batches/:id') board(
    @Id() id: string,
  ) {
    return this.runs.board(id);
  }

  /** Auto-cluster & assign bookings in a batch across vehicles (CVRP + 2-opt TSP). */
  @Staff('dispatch.manage')
  @Post('dispatch/batches/:id/auto-plan')
  @HttpCode(200)
  autoPlan(@Id() id: string) {
    return this.runs.autoPlan(id);
  }

  /** Drag & drop: move bookings into a run (or back to the queue with `trip_run_id: null`). */
  @Staff('dispatch.manage')
  @Post('dispatch/assign')
  @HttpCode(200)
  assign(@Body() dto: AssignBookingsDto) {
    return this.runs.assign(dto);
  }
}

@ApiTags('admin · operations')
@Controller('admin')
export class CommsAdminController {
  constructor(private readonly comms: CommsService) {}

  @Staff('dispatch.manage') @Get('chat') threads() {
    return this.comms.threads();
  }

  @Staff('dispatch.manage')
  @Get('chat/:id')
  async history(@Id() driverId: string, @Query() q: ChatHistoryQuery) {
    await this.comms.markThreadRead(driverId, 'OPS');
    return this.comms.history(driverId, q.before);
  }

  @Staff('dispatch.manage')
  @Post('chat/:id')
  send(
    @Id() driverId: string,
    @Body() dto: SendChatDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.comms.send(driverId, user.sub, 'OPS', dto.body);
  }

  @Staff('dispatch.manage') @Get('incidents') incidents(
    @Query() q: IncidentListQuery,
  ) {
    return this.comms.listIncidents(q);
  }

  @Staff('dispatch.manage')
  @Patch('incidents/:id')
  updateIncident(
    @Id() id: string,
    @Body() dto: UpdateIncidentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.comms.updateIncident(id, dto, user.sub);
  }
}

/* ================= Driver app ================= */

@ApiTags('driver app')
@Driver()
@Controller('driver')
export class DriverAppController {
  constructor(
    private readonly driver: DriverService,
    private readonly comms: CommsService,
  ) {}

  @Get('me') me(@CurrentUser() u: AuthUser) {
    return this.driver.me(u.sub);
  }

  @Get('runs') runs(@CurrentUser() u: AuthUser, @Query() q: DriverRunsQuery) {
    return this.driver.myRuns(u.sub, q.scope);
  }
  @Get('runs/:id') run(@CurrentUser() u: AuthUser, @Id() id: string) {
    return this.driver.runDetail(u.sub, id);
  }
  @Post('runs/:id/start') @HttpCode(200) start(
    @CurrentUser() u: AuthUser,
    @Id() id: string,
  ) {
    return this.driver.startRun(u.sub, id);
  }
  @Post('runs/:id/finish') @HttpCode(200) finish(
    @CurrentUser() u: AuthUser,
    @Id() id: string,
  ) {
    return this.driver.finishRun(u.sub, id);
  }

  @Post('bookings/:id/pickup')
  @HttpCode(200)
  pickup(@CurrentUser() u: AuthUser, @Id() id: string) {
    return this.driver.bookingAction(u.sub, id, 'pickup');
  }
  @Post('bookings/:id/dropoff')
  @HttpCode(200)
  dropoff(@CurrentUser() u: AuthUser, @Id() id: string) {
    return this.driver.bookingAction(u.sub, id, 'dropoff');
  }
  @Post('bookings/:id/no-show')
  @HttpCode(200)
  noShow(
    @CurrentUser() u: AuthUser,
    @Id() id: string,
    @Body() dto: BookingActionDto,
  ) {
    return this.driver.bookingAction(u.sub, id, 'no-show', dto.reason);
  }

  @Get('shifts/current') shift(@CurrentUser() u: AuthUser) {
    return this.driver.currentShift(u.sub);
  }
  @Post('shifts/start') @HttpCode(200) startShift(
    @CurrentUser() u: AuthUser,
    @Body() dto: StartShiftDto,
  ) {
    return this.driver.startShift(u.sub, dto);
  }
  @Post('shifts/end') @HttpCode(200) endShift(
    @CurrentUser() u: AuthUser,
    @Body() dto: EndShiftDto,
  ) {
    return this.driver.endShift(u.sub, dto);
  }
  @Get('shifts/summary') summary(@CurrentUser() u: AuthUser) {
    return this.driver.shiftSummary(u.sub);
  }

  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  @Post('locations')
  @HttpCode(200)
  locations(@CurrentUser() u: AuthUser, @Body() dto: LocationBatchDto) {
    return this.driver.recordLocations(u.sub, dto);
  }

  @Get('chat')
  async chat(@CurrentUser() u: AuthUser, @Query() q: ChatHistoryQuery) {
    await this.comms.markThreadRead(u.sub, 'DRIVER');
    return this.comms.history(u.sub, q.before);
  }
  @Post('chat') sendChat(@CurrentUser() u: AuthUser, @Body() dto: SendChatDto) {
    return this.comms.send(u.sub, u.sub, 'DRIVER', dto.body);
  }

  @Get('notifications') notifications(@CurrentUser() u: AuthUser) {
    return this.comms.listNotifications(u.sub);
  }
  @Post('notifications/read') @HttpCode(204) read(
    @CurrentUser() u: AuthUser,
    @Body() dto: MarkReadDto,
  ) {
    return this.comms.markNotificationsRead(u.sub, dto.ids);
  }

  @Post('incidents') incident(
    @CurrentUser() u: AuthUser,
    @Body() dto: ReportIncidentDto,
  ) {
    return this.comms.report(u.sub, dto);
  }

  @Post('push-token') @HttpCode(204) push(
    @CurrentUser() u: AuthUser,
    @Body() dto: PushTokenDto,
  ) {
    return this.driver.registerPushToken(u.sub, dto);
  }

  @Get('income') income(@CurrentUser() u: AuthUser, @Query() q: IncomeQuery) {
    return this.driver.income(u.sub, q.month);
  }
}
