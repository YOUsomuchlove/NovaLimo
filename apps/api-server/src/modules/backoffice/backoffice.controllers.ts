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
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { AuthUser } from '../../common/auth/auth-user';
import { CurrentUser, Public, Staff } from '../../common/auth/decorators';
import { ListQueryDto } from '../../common/http/pagination';
import {
  BackofficeService,
  ContactInput,
  CustomerInput,
  FinanceInput,
  FinanceListQuery,
  TicketListQuery,
  TicketUpdate,
  UpdateCustomerInput,
  UpdateFinanceInput,
} from './backoffice.service';
import { GeocodeQuery, GeocodeService, ReverseQuery } from './geocode.service';
import { RangeQuery, ReportsService } from './reports.service';

const Id = () => Param('id', ParseUUIDPipe);

@ApiTags('admin · back office')
@Controller('admin')
export class BackofficeController {
  constructor(
    private readonly bo: BackofficeService,
    private readonly reports: ReportsService,
  ) {}

  /* customers */
  @Staff('customer.read') @Get('customers') customers(
    @Query() q: ListQueryDto,
  ) {
    return this.bo.listCustomers(q);
  }
  @Staff('customer.read') @Get('customers/:id') customer(@Id() id: string) {
    return this.bo.getCustomer(id);
  }
  @Staff('customer.write') @Post('customers') createCustomer(
    @Body() dto: CustomerInput,
  ) {
    return this.bo.createCustomer(dto);
  }
  @Staff('customer.write') @Patch('customers/:id') updateCustomer(
    @Id() id: string,
    @Body() dto: UpdateCustomerInput,
  ) {
    return this.bo.updateCustomer(id, dto);
  }
  @Staff('customer.write')
  @Delete('customers/:id')
  @HttpCode(204)
  archiveCustomer(@Id() id: string) {
    return this.bo.archiveCustomer(id);
  }

  /* finance */
  @Staff('finance.read') @Get('finance/transactions') finance(
    @Query() q: FinanceListQuery,
  ) {
    return this.bo.listFinance(q);
  }
  @Staff('finance.read') @Get('finance/transactions/:id') financeOne(
    @Id() id: string,
  ) {
    return this.bo.getFinance(id);
  }
  @Staff('finance.write') @Post('finance/transactions') createFinance(
    @Body() dto: FinanceInput,
    @CurrentUser() u: AuthUser,
  ) {
    return this.bo.createFinance(dto, u.sub);
  }
  @Staff('finance.write') @Patch('finance/transactions/:id') updateFinance(
    @Id() id: string,
    @Body() dto: UpdateFinanceInput,
  ) {
    return this.bo.updateFinance(id, dto);
  }

  /* support inbox (contact form, cancel / change requests) */
  @Staff('support.manage') @Get('support/tickets') tickets(
    @Query() q: TicketListQuery,
  ) {
    return this.bo.listTickets(q);
  }
  @Staff('support.manage') @Patch('support/tickets/:id') updateTicket(
    @Id() id: string,
    @Body() dto: TicketUpdate,
  ) {
    return this.bo.updateTicket(id, dto);
  }

  /* dashboard + reports */
  @Staff('dashboard.view') @Get('dashboard') dashboard() {
    return this.reports.dashboard();
  }
  @Staff('report.view') @Get('reports/revenue') revenue(
    @Query() q: RangeQuery,
  ) {
    return this.reports.revenue(q);
  }
  @Staff('report.view') @Get('reports/trips') trips(@Query() q: RangeQuery) {
    return this.reports.tripsReport(q);
  }
  @Staff('report.view') @Get('reports/cargo') cargo(@Query() q: RangeQuery) {
    return this.reports.cargo(q);
  }
  @Staff('report.view') @Get('reports/drivers') drivers(
    @Query() q: RangeQuery,
  ) {
    return this.reports.drivers(q);
  }
}

@ApiTags('public')
@Public()
@Controller('public')
export class BackofficePublicController {
  constructor(
    private readonly bo: BackofficeService,
    private readonly geo: GeocodeService,
  ) {}

  /** Contact form → support inbox. */
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('contact')
  contact(@Body() dto: ContactInput) {
    return this.bo.createContact(dto);
  }

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Get('geocode')
  geocode(@Query() q: GeocodeQuery) {
    return this.geo.search(q);
  }

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Get('geocode/reverse')
  reverse(@Query() q: ReverseQuery) {
    return this.geo.reverse(q);
  }
}
