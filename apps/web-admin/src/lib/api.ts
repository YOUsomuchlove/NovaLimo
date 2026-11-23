import type {
  ApiError as ApiErrorBody,
  AuditLogDto,
  AuthTokens,
  BookingDto,
  BookingSource,
  BookingStatus,
  CargoDto,
  CargoPayer,
  CargoQuoteDto,
  CargoQuoteRequest,
  CargoSize,
  CargoStatus,
  ChatMessageDto,
  CodSettlementDto,
  CustomerDto,
  DashboardStatsDto,
  DriverDto,
  DriverRunDetailDto,
  FinanceCategory,
  FinanceKind,
  FinanceTransactionDto,
  IncidentDto,
  IncidentStatus,
  LatLng,
  Me,
  Paginated,
  PaymentMethod,
  PaymentStatus,
  Permission,
  PriceRuleDto,
  ReportSeriesPoint,
  RoleDto,
  RouteDto,
  SeatTier,
  StaffUserDto,
  StopDto,
  StopKind,
  SupportTicketDto,
  TicketKind,
  TicketStatus,
  TimeSlotDto,
  TripBatchDto,
  TripBatchStatus,
  TripRunDto,
  TripRunStatus,
  TripSeatMapDto,
  UserStatus,
  VehicleDto,
  VehicleStatus,
  VehicleTypeDto,
} from '@limousine-workspace/shared-types';

const DEFAULT_API = 'http://localhost:3000/api';

export const ADMIN_WEB_TOKEN_KEY = 'novalimo_admin_access_token';
export const ADMIN_WEB_REFRESH_KEY = 'novalimo_admin_refresh_token';

export function getApiBaseUrl(): string {
  const fromEnv = (
    (typeof window === 'undefined'
      ? process.env.API_INTERNAL_URL
      : undefined) ?? process.env.NEXT_PUBLIC_API_URL
  )?.replace(/\/$/, '');
  return fromEnv || DEFAULT_API;
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_WEB_TOKEN_KEY);
}

export function getAdminRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_WEB_REFRESH_KEY);
}

export function setAdminToken(token: string, refreshToken?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_WEB_TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(ADMIN_WEB_REFRESH_KEY, refreshToken);
  }
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_WEB_TOKEN_KEY);
  localStorage.removeItem(ADMIN_WEB_REFRESH_KEY);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const refresh = getAdminRefreshToken();
  if (!refresh) return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) {
        clearAdminToken();
        return null;
      }
      const tokens = (await res.json()) as AuthTokens;
      setAdminToken(tokens.access_token, tokens.refresh_token);
      return tokens.access_token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    if (getAdminRefreshToken()) {
      const nextToken = await tryRefreshToken();
      if (nextToken) {
        headers.set('Authorization', `Bearer ${nextToken}`);
        res = await fetch(input, { ...init, headers });
      }
    }
    if (res.status === 401) {
      clearAdminToken();
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        const next = encodeURIComponent(
          window.location.pathname + window.location.search,
        );
        window.location.replace(`/login?next=${next}`);
      }
    }
  }
  return res;
}

type FetchOpts = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  headers?: Record<string, string>;
};

export async function api<T>(
  path: string,
  { body, headers, ...init }: FetchOpts = {},
): Promise<T> {
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;
  let res: Response;
  try {
    res = await authFetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(!isFormData && body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...headers,
      },
      body: isFormData
        ? (body as FormData)
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK',
      'Không kết nối được máy chủ API. Vui lòng kiểm tra kết nối mạng.',
    );
  }
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const e = (data ?? {}) as Partial<ApiErrorBody> & {
      message?: string | string[];
    };
    const msg = Array.isArray(e.message)
      ? e.message.join(', ')
      : e.message || `Yêu cầu thất bại (${res.status})`;
    throw new ApiError(res.status, e.code ?? 'ERROR', msg, e.details);
  }
  return data as T;
}

export const qs = (
  params: Record<string, string | number | boolean | undefined | null>,
): string => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      sp.set(k, String(v));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export type AdminLoginResponse = AuthTokens;

export async function loginAdmin(
  phone: string,
  password: string,
): Promise<AuthTokens> {
  const tokens = await api<AuthTokens>('/auth/staff/login', {
    method: 'POST',
    body: { phone, password },
  });
  setAdminToken(tokens.access_token, tokens.refresh_token);
  return tokens;
}

export async function logoutAdmin(): Promise<void> {
  const refresh = getAdminRefreshToken();
  try {
    if (refresh) {
      await api<void>('/auth/logout', {
        method: 'POST',
        body: { refresh_token: refresh },
      });
    }
  } catch {
    // ignore logout network errors
  } finally {
    clearAdminToken();
  }
}

export function getSocketBaseUrl(): string {
  return getApiBaseUrl()
    .replace(/\/$/, '')
    .replace(/\/api\/?$/, '');
}

/** Resolve relative `/api/uploads/...` URLs against the API host. */
export function resolveUploadUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/api/')) {
    return `${getSocketBaseUrl()}${url}`;
  }
  return url;
}

/* ---------------- Dispatch & Reports specific shapes ---------------- */

export interface DispatchBoardBookingDto {
  id: string;
  code: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  trip_run_id: string | null;
  contact_name: string;
  contact_phone: string;
  pickup_address: string;
  pickup: LatLng | null;
  dropoff_address: string;
  dropoff: LatLng | null;
  pickup_order: number | null;
  dropoff_order: number | null;
  seats: string[];
  note: string | null;
}

export interface DispatchBoardDto {
  batch: {
    id: string;
    code: string;
    status: TripBatchStatus;
    departure_at: string;
    route: string;
    capacity_per_vehicle: number;
    planned_vehicles: number;
  };
  runs: TripRunDto[];
  bookings: DispatchBoardBookingDto[];
}

export interface AutoPlanResponseDto {
  board: DispatchBoardDto;
  unassigned: { booking_id: string; reason: string }[];
  runs_planned: number;
}

export interface CodOutstandingRowDto {
  driver_id: string;
  driver_name: string;
  cargo_count: number;
  amount_vnd: number;
  oldest_collected_at: string;
}

export interface ChatThreadRowDto {
  driver_id: string;
  driver_name: string;
  avatar_url: string | null;
  last_body: string;
  last_sender_role: 'DRIVER' | 'OPS';
  last_at: string;
  unread: number;
}

export interface RevenueReportDto {
  series: ReportSeriesPoint[];
  totals: {
    tickets_vnd: number;
    cargo_vnd: number;
    other_vnd: number;
    income_vnd: number;
    expense_vnd: number;
    net_vnd: number;
  };
}

export interface TripsReportDto {
  series: (ReportSeriesPoint & { occupancy_pct: number })[];
  routes: {
    id: string;
    name: string;
    passengers: number;
    revenue_vnd: number;
  }[];
}

export interface CargoReportDto {
  series: ReportSeriesPoint[];
}

export interface DriversReportDto {
  drivers: {
    id: string;
    full_name: string;
    runs: number;
    passengers: number;
    no_shows: number;
    cargos: number;
    incidents: number;
  }[];
}

export interface AdminSettingsMap {
  'booking.policy': {
    free_cancel_hours: number;
    late_cancel_refund_pct: number;
    max_seats_per_booking: number;
    seat_hold_minutes: number;
    payment_due_minutes: number;
  };
  'cod.policy': {
    max_cod_vnd: number;
    cod_fee_pct: number;
    min_cod_fee_vnd: number;
    settle_within_hours: number;
  };
  'cargo.pricing': {
    base_fee_vnd: { S: number; M: number; L: number; XL: number };
    per_kg_over_vnd: number;
    included_kg: { S: number; M: number; L: number; XL: number };
    fragile_surcharge_vnd: number;
    insurance_pct: number;
  };
  'notifications.templates': {
    booking_confirmed: string;
    booking_reminder: string;
    otp: string;
    cargo_created: string;
  };
  'company.profile': {
    name: string;
    hotline: string;
    email: string;
    address: string;
  };
}

export interface GeocodeHit {
  lat: number;
  lng: number;
  display_name: string;
}

/* ---------------- Typed Admin API Surface ---------------- */

export const adminApi = {
  /* Auth */
  me: () => api<Me>('/auth/me'),
  changePassword: (body: { current_password: string; new_password: string }) =>
    api<void>('/auth/change-password', { method: 'POST', body }),

  /* Uploads */
  upload: async (
    kind: 'avatars' | 'vehicles' | 'proofs' | 'incidents' | 'routes',
    file: File | Blob,
  ): Promise<{ url: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    return api<{ url: string }>(`/uploads/${kind}`, {
      method: 'POST',
      body: fd,
    });
  },

  /* Public helpers used in Admin forms */
  geocode: (q: string) => api<GeocodeHit[]>(`/public/geocode${qs({ q })}`),
  cargoQuote: (body: CargoQuoteRequest) =>
    api<CargoQuoteDto>('/public/cargo/quote', { method: 'POST', body }),

  /* Dashboard & Reports */
  dashboard: () => api<DashboardStatsDto>('/admin/dashboard'),
  reportRevenue: (q: { from: string; to: string }) =>
    api<RevenueReportDto>(`/admin/reports/revenue${qs(q)}`),
  reportTrips: (q: { from: string; to: string }) =>
    api<TripsReportDto>(`/admin/reports/trips${qs(q)}`),
  reportCargo: (q: { from: string; to: string }) =>
    api<CargoReportDto>(`/admin/reports/cargo${qs(q)}`),
  reportDrivers: (q: { from: string; to: string }) =>
    api<DriversReportDto>(`/admin/reports/drivers${qs(q)}`),

  /* Fleet: Vehicle Types & Vehicles */
  vehicleTypes: () => api<VehicleTypeDto[]>('/admin/vehicle-types'),
  createVehicleType: (body: {
    code: string;
    name: string;
    seat_layout: ({ label: string; tier: SeatTier } | null)[][];
    description?: string;
    image_url?: string;
  }) => api<VehicleTypeDto>('/admin/vehicle-types', { method: 'POST', body }),
  updateVehicleType: (
    id: string,
    body: Partial<{
      code: string;
      name: string;
      seat_layout: ({ label: string; tier: SeatTier } | null)[][];
      description: string;
      image_url: string;
    }>,
  ) =>
    api<VehicleTypeDto>(`/admin/vehicle-types/${id}`, {
      method: 'PATCH',
      body,
    }),

  vehicles: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
    status?: VehicleStatus;
    vehicle_type_id?: string;
  }) => api<Paginated<VehicleDto>>(`/admin/vehicles${qs(q ?? {})}`),
  vehicle: (id: string) => api<VehicleDto>(`/admin/vehicles/${id}`),
  createVehicle: (body: {
    license_plate: string;
    vehicle_type_id: string;
    status?: VehicleStatus;
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    odometer_km?: number;
    registration_expires_on?: string;
    insurance_expires_on?: string;
    next_maintenance_on?: string;
    image_url?: string;
    note?: string;
  }) => api<VehicleDto>('/admin/vehicles', { method: 'POST', body }),
  updateVehicle: (
    id: string,
    body: Partial<{
      license_plate: string;
      vehicle_type_id: string;
      status: VehicleStatus;
      brand: string;
      model: string;
      year: number;
      color: string;
      odometer_km: number;
      registration_expires_on: string;
      insurance_expires_on: string;
      next_maintenance_on: string;
      image_url: string;
      note: string;
    }>,
  ) => api<VehicleDto>(`/admin/vehicles/${id}`, { method: 'PATCH', body }),
  archiveVehicle: (id: string) =>
    api<void>(`/admin/vehicles/${id}`, { method: 'DELETE' }),

  /* Drivers */
  drivers: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
    status?: UserStatus;
  }) => api<Paginated<DriverDto>>(`/admin/drivers${qs(q ?? {})}`),
  driver: (id: string) => api<DriverDto>(`/admin/drivers/${id}`),
  createDriver: (body: {
    full_name: string;
    phone: string;
    email?: string;
    password: string;
    avatar_url?: string;
    profile?: {
      license_number?: string;
      license_class?: string;
      license_expires_on?: string;
      date_of_birth?: string;
      address?: string;
      emergency_contact?: string;
      default_vehicle_id?: string;
      hired_on?: string;
      note?: string;
    };
  }) => api<DriverDto>('/admin/drivers', { method: 'POST', body }),
  updateDriver: (
    id: string,
    body: Partial<{
      full_name: string;
      phone: string;
      email: string;
      status: UserStatus;
      avatar_url: string;
      profile: {
        license_number?: string;
        license_class?: string;
        license_expires_on?: string;
        date_of_birth?: string;
        address?: string;
        emergency_contact?: string;
        default_vehicle_id?: string;
        hired_on?: string;
        note?: string;
      };
    }>,
  ) => api<DriverDto>(`/admin/drivers/${id}`, { method: 'PATCH', body }),
  resetDriverPassword: (id: string, new_password: string) =>
    api<void>(`/admin/drivers/${id}/password`, {
      method: 'PUT',
      body: { new_password },
    }),
  archiveDriver: (id: string) =>
    api<void>(`/admin/drivers/${id}`, { method: 'DELETE' }),

  /* Network & Settings: Routes, Stops, TimeSlots, PriceRules, Settings */
  routes: () => api<RouteDto[]>('/admin/routes'),
  route: (id: string) => api<RouteDto>(`/admin/routes/${id}`),
  createRoute: (body: {
    code: string;
    name: string;
    origin_name: string;
    destination_name: string;
    distance_km?: number;
    duration_min: number;
    description?: string;
    image_url?: string;
    is_active?: boolean;
    sort_order?: number;
  }) => api<RouteDto>('/admin/routes', { method: 'POST', body }),
  updateRoute: (
    id: string,
    body: Partial<{
      code: string;
      name: string;
      origin_name: string;
      destination_name: string;
      distance_km: number;
      duration_min: number;
      description: string;
      image_url: string;
      is_active: boolean;
      sort_order: number;
    }>,
  ) => api<RouteDto>(`/admin/routes/${id}`, { method: 'PATCH', body }),
  archiveRoute: (id: string) =>
    api<void>(`/admin/routes/${id}`, { method: 'DELETE' }),

  createStop: (
    routeId: string,
    body: {
      name: string;
      address: string;
      lat: number;
      lng: number;
      kind?: StopKind;
      sort_order?: number;
      is_active?: boolean;
    },
  ) => api<StopDto>(`/admin/routes/${routeId}/stops`, { method: 'POST', body }),
  updateStop: (
    id: string,
    body: Partial<{
      name: string;
      address: string;
      lat: number;
      lng: number;
      kind: StopKind;
      sort_order: number;
      is_active: boolean;
    }>,
  ) => api<StopDto>(`/admin/stops/${id}`, { method: 'PATCH', body }),
  deleteStop: (id: string) =>
    api<void>(`/admin/stops/${id}`, { method: 'DELETE' }),

  timeSlots: (route_id?: string) =>
    api<TimeSlotDto[]>(`/admin/time-slots${qs({ route_id })}`),
  createTimeSlot: (body: {
    route_id: string;
    departure_time: string;
    days_of_week: number[];
    vehicle_type_id: string;
    planned_vehicles?: number;
    valid_from?: string;
    valid_to?: string;
    is_active?: boolean;
  }) => api<TimeSlotDto>('/admin/time-slots', { method: 'POST', body }),
  updateTimeSlot: (
    id: string,
    body: Partial<{
      route_id: string;
      departure_time: string;
      days_of_week: number[];
      vehicle_type_id: string;
      planned_vehicles: number;
      valid_from: string;
      valid_to: string;
      is_active: boolean;
    }>,
  ) => api<TimeSlotDto>(`/admin/time-slots/${id}`, { method: 'PATCH', body }),
  deleteTimeSlot: (id: string) =>
    api<void>(`/admin/time-slots/${id}`, { method: 'DELETE' }),

  priceRules: (route_id?: string) =>
    api<PriceRuleDto[]>(`/admin/price-rules${qs({ route_id })}`),
  createPriceRule: (body: {
    route_id: string;
    vehicle_type_id?: string;
    name: string;
    base_price_vnd: number;
    vip_surcharge_vnd?: number;
    valid_from?: string;
    valid_to?: string;
    priority?: number;
    is_active?: boolean;
  }) => api<PriceRuleDto>('/admin/price-rules', { method: 'POST', body }),
  updatePriceRule: (
    id: string,
    body: Partial<{
      route_id: string;
      vehicle_type_id: string;
      name: string;
      base_price_vnd: number;
      vip_surcharge_vnd: number;
      valid_from: string;
      valid_to: string;
      priority: number;
      is_active: boolean;
    }>,
  ) => api<PriceRuleDto>(`/admin/price-rules/${id}`, { method: 'PATCH', body }),
  deletePriceRule: (id: string) =>
    api<void>(`/admin/price-rules/${id}`, { method: 'DELETE' }),

  settings: () => api<AdminSettingsMap>('/admin/settings'),
  updateSetting: <K extends keyof AdminSettingsMap>(
    key: K,
    body: Partial<AdminSettingsMap[K]>,
  ) =>
    api<AdminSettingsMap[K]>(`/admin/settings/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body,
    }),

  /* Trip Batches */
  tripBatches: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
    route_id?: string;
    from?: string;
    to?: string;
    status?: TripBatchStatus;
  }) => api<Paginated<TripBatchDto>>(`/admin/trip-batches${qs(q ?? {})}`),
  tripBatch: (id: string) => api<TripBatchDto>(`/admin/trip-batches/${id}`),
  tripBatchSeats: (id: string) =>
    api<TripSeatMapDto>(`/admin/trip-batches/${id}/seats`),
  createTripBatch: (body: {
    route_id: string;
    vehicle_type_id: string;
    date: string;
    time: string;
    planned_vehicles?: number;
    note?: string;
  }) => api<TripBatchDto>('/admin/trip-batches', { method: 'POST', body }),
  updateTripBatch: (
    id: string,
    body: Partial<{
      status: TripBatchStatus;
      planned_vehicles: number;
      note: string;
    }>,
  ) =>
    api<TripBatchDto>(`/admin/trip-batches/${id}`, { method: 'PATCH', body }),
  generateTripBatches: (days = 7) =>
    api<{ created: number }>('/admin/trip-batches/generate', {
      method: 'POST',
      body: { days },
    }),

  /* Bookings */
  bookings: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
    trip_batch_id?: string;
    trip_run_id?: string;
    route_id?: string;
    status?: BookingStatus;
    payment_status?: PaymentStatus;
    source?: BookingSource;
    from?: string;
    to?: string;
    unassigned?: number;
  }) => api<Paginated<BookingDto>>(`/admin/bookings${qs(q ?? {})}`),
  booking: (id: string) => api<BookingDto>(`/admin/bookings/${id}`),
  createBooking: (body: {
    trip_batch_id: string;
    contact_name: string;
    contact_phone: string;
    contact_email?: string;
    pickup: { stop_id?: string; address: string; lat: number; lng: number };
    dropoff: { stop_id?: string; address: string; lat: number; lng: number };
    passengers: { seat_label: string; name: string; phone?: string }[];
    payment_method: PaymentMethod;
    source?: 'ADMIN' | 'CALL_CENTER';
    discount_vnd?: number;
    note?: string;
  }) => api<BookingDto>('/admin/bookings', { method: 'POST', body }),
  updateBooking: (
    id: string,
    body: Partial<{
      contact_name: string;
      contact_phone: string;
      contact_email: string;
      pickup: { stop_id?: string; address: string; lat: number; lng: number };
      dropoff: { stop_id?: string; address: string; lat: number; lng: number };
      note: string;
    }>,
  ) => api<BookingDto>(`/admin/bookings/${id}`, { method: 'PATCH', body }),
  changeBookingStatus: (id: string, status: BookingStatus, reason?: string) =>
    api<BookingDto>(`/admin/bookings/${id}/status`, {
      method: 'POST',
      body: { status, reason },
    }),
  recordBookingPayment: (
    id: string,
    method: PaymentMethod,
    provider_txn_id?: string,
  ) =>
    api<BookingDto>(`/admin/bookings/${id}/payments`, {
      method: 'POST',
      body: { method, provider_txn_id },
    }),

  /* Dispatch & Trip Runs */
  dispatchBoard: (batchId: string) =>
    api<DispatchBoardDto>(`/admin/dispatch/batches/${batchId}`),
  dispatchAutoPlan: (batchId: string) =>
    api<AutoPlanResponseDto>(`/admin/dispatch/batches/${batchId}/auto-plan`, {
      method: 'POST',
    }),
  dispatchAssign: (body: {
    booking_ids: string[];
    trip_run_id: string | null;
    force?: boolean;
  }) =>
    api<{ warnings: string[] }>('/admin/dispatch/assign', {
      method: 'POST',
      body,
    }),

  tripRuns: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
    trip_batch_id?: string;
    driver_id?: string;
    vehicle_id?: string;
    status?: TripRunStatus;
    date?: string;
  }) => api<Paginated<TripRunDto>>(`/admin/trip-runs${qs(q ?? {})}`),
  tripRun: (id: string) => api<DriverRunDetailDto>(`/admin/trip-runs/${id}`),
  createTripRun: (body: {
    trip_batch_id: string;
    vehicle_id: string;
    driver_id: string;
    note?: string;
  }) => api<TripRunDto>('/admin/trip-runs', { method: 'POST', body }),
  updateTripRun: (
    id: string,
    body: Partial<{ vehicle_id: string; driver_id: string; note: string }>,
  ) => api<TripRunDto>(`/admin/trip-runs/${id}`, { method: 'PATCH', body }),
  deleteTripRun: (id: string) =>
    api<void>(`/admin/trip-runs/${id}`, { method: 'DELETE' }),
  changeTripRunStatus: (
    id: string,
    status: 'DISPATCHED' | 'PENDING' | 'CANCELLED',
  ) =>
    api<TripRunDto>(`/admin/trip-runs/${id}/status`, {
      method: 'POST',
      body: { status },
    }),
  reorderTripRunStops: (
    id: string,
    body: { pickup: string[]; dropoff: string[] },
  ) =>
    api<DriverRunDetailDto>(`/admin/trip-runs/${id}/order`, {
      method: 'PUT',
      body,
    }),

  /* Cargos & COD */
  cargos: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
    status?: CargoStatus;
    route_id?: string;
    trip_batch_id?: string;
    trip_run_id?: string;
    cod_pending?: number;
  }) => api<Paginated<CargoDto>>(`/admin/cargos${qs(q ?? {})}`),
  cargo: (id: string) => api<CargoDto>(`/admin/cargos/${id}`),
  createCargo: (body: {
    route_id: string;
    size: CargoSize;
    weight_kg: number;
    is_fragile?: boolean;
    declared_value_vnd?: number;
    cod_amount_vnd?: number;
    sender: {
      name: string;
      phone: string;
      address: string;
      lat: number;
      lng: number;
    };
    receiver: {
      name: string;
      phone: string;
      address: string;
      lat: number;
      lng: number;
    };
    description: string;
    fee_payer?: CargoPayer;
    trip_batch_id?: string;
    note?: string;
  }) => api<CargoDto>('/admin/cargos', { method: 'POST', body }),
  updateCargo: (
    id: string,
    body: Partial<{
      trip_batch_id: string | null;
      trip_run_id: string | null;
      status: CargoStatus;
      note: string;
    }>,
  ) => api<CargoDto>(`/admin/cargos/${id}`, { method: 'PATCH', body }),

  codOutstanding: () => api<CodOutstandingRowDto[]>('/admin/cod/outstanding'),
  codSettlements: () => api<CodSettlementDto[]>('/admin/cod/settlements'),
  settleCod: (body: { driver_id: string; note?: string }) =>
    api<CodSettlementDto>('/admin/cod/settlements', { method: 'POST', body }),

  /* Customers */
  customers: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
  }) => api<Paginated<CustomerDto>>(`/admin/customers${qs(q ?? {})}`),
  customer: (id: string) => api<CustomerDto>(`/admin/customers/${id}`),
  createCustomer: (body: {
    full_name: string;
    phone: string;
    email?: string;
    note?: string;
    tags?: string[];
  }) => api<CustomerDto>('/admin/customers', { method: 'POST', body }),
  updateCustomer: (
    id: string,
    body: Partial<{
      full_name: string;
      phone: string;
      email: string;
      note: string;
      tags: string[];
    }>,
  ) => api<CustomerDto>(`/admin/customers/${id}`, { method: 'PATCH', body }),
  archiveCustomer: (id: string) =>
    api<void>(`/admin/customers/${id}`, { method: 'DELETE' }),

  /* Finance */
  financeTransactions: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
    kind?: FinanceKind;
    category?: FinanceCategory;
    from?: string;
    to?: string;
  }) =>
    api<Paginated<FinanceTransactionDto>>(
      `/admin/finance/transactions${qs(q ?? {})}`,
    ),
  financeTransaction: (id: string) =>
    api<FinanceTransactionDto>(`/admin/finance/transactions/${id}`),
  createFinanceTransaction: (body: {
    kind: FinanceKind;
    category: FinanceCategory;
    amount_vnd: number;
    occurred_at: string;
    memo?: string;
  }) =>
    api<FinanceTransactionDto>('/admin/finance/transactions', {
      method: 'POST',
      body,
    }),
  updateFinanceTransaction: (
    id: string,
    body: Partial<{
      kind: FinanceKind;
      category: FinanceCategory;
      amount_vnd: number;
      occurred_at: string;
      memo: string;
    }>,
  ) =>
    api<FinanceTransactionDto>(`/admin/finance/transactions/${id}`, {
      method: 'PATCH',
      body,
    }),

  /* Support / Call Center / Comms / Incidents */
  supportTickets: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    sort?: string;
    kind?: TicketKind;
    status?: TicketStatus;
  }) =>
    api<Paginated<SupportTicketDto>>(`/admin/support/tickets${qs(q ?? {})}`),
  updateSupportTicket: (
    id: string,
    body: Partial<{
      status: TicketStatus;
      assignee_id: string;
      internal_note: string;
    }>,
  ) =>
    api<SupportTicketDto>(`/admin/support/tickets/${id}`, {
      method: 'PATCH',
      body,
    }),

  chatThreads: () => api<ChatThreadRowDto[]>('/admin/chat'),
  chatHistory: (driverId: string, before?: string) =>
    api<ChatMessageDto[]>(`/admin/chat/${driverId}${qs({ before })}`),
  sendChat: (driverId: string, body: string) =>
    api<ChatMessageDto>(`/admin/chat/${driverId}`, {
      method: 'POST',
      body: { body },
    }),

  incidents: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: IncidentStatus;
  }) => api<Paginated<IncidentDto>>(`/admin/incidents${qs(q ?? {})}`),
  updateIncident: (
    id: string,
    body: { status: IncidentStatus; resolution_note?: string },
  ) => api<IncidentDto>(`/admin/incidents/${id}`, { method: 'PATCH', body }),

  /* Staff, Roles, Audit (RBAC) */
  staff: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: UserStatus;
    role_id?: string;
  }) => api<Paginated<StaffUserDto>>(`/admin/staff${qs(q ?? {})}`),
  staffOne: (id: string) => api<StaffUserDto>(`/admin/staff/${id}`),
  createStaff: (body: {
    full_name: string;
    phone: string;
    email?: string;
    password: string;
    role_ids: string[];
  }) => api<StaffUserDto>('/admin/staff', { method: 'POST', body }),
  updateStaff: (
    id: string,
    body: Partial<{
      full_name: string;
      phone: string;
      email: string;
      status: UserStatus;
      avatar_url: string;
      role_ids: string[];
    }>,
  ) => api<StaffUserDto>(`/admin/staff/${id}`, { method: 'PATCH', body }),
  resetStaffPassword: (id: string, new_password: string) =>
    api<void>(`/admin/staff/${id}/password`, {
      method: 'PUT',
      body: { new_password },
    }),
  archiveStaff: (id: string) =>
    api<void>(`/admin/staff/${id}`, { method: 'DELETE' }),

  roles: () => api<RoleDto[]>('/admin/roles'),
  createRole: (body: {
    slug: string;
    name: string;
    description?: string;
    permissions: Permission[];
  }) => api<RoleDto>('/admin/roles', { method: 'POST', body }),
  updateRole: (
    id: string,
    body: Partial<{
      name: string;
      description: string;
      permissions: Permission[];
    }>,
  ) => api<RoleDto>(`/admin/roles/${id}`, { method: 'PATCH', body }),
  deleteRole: (id: string) =>
    api<void>(`/admin/roles/${id}`, { method: 'DELETE' }),

  auditLogs: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    actor_id?: string;
    resource?: string;
    resource_id?: string;
    from?: string;
    to?: string;
  }) => api<Paginated<AuditLogDto>>(`/admin/audit-logs${qs(q ?? {})}`),
};

/** Helper to export table rows as UTF-8 BOM CSV for Excel compatibility. */
export function exportToCsv<T>(
  filename: string,
  rows: readonly T[],
  columns: readonly {
    header: string;
    value: (row: T) => string | number | null | undefined;
  }[],
): void {
  if (typeof window === 'undefined') return;
  const escapeCell = (val: string | number | null | undefined): string => {
    const str = val === null || val === undefined ? '' : String(val);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const headerLine = columns.map((c) => escapeCell(c.header)).join(',');
  const bodyLines = rows.map((row) =>
    columns.map((c) => escapeCell(c.value(row))).join(','),
  );
  const csv = `\uFEFF${[headerLine, ...bodyLines].join('\r\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
