import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1793628187039 implements MigrationInterface {
  name = 'Init1793628187039';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await queryRunner.query(
      `CREATE TYPE "public"."user_kind" AS ENUM('STAFF', 'DRIVER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'INACTIVE', 'LOCKED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "full_name" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(255), "password_hash" character varying(255) NOT NULL, "kind" "public"."user_kind" NOT NULL, "status" "public"."user_status" NOT NULL DEFAULT 'ACTIVE', "avatar_url" text, "last_login_at" TIMESTAMP WITH TIME ZONE, "failed_login_count" integer NOT NULL DEFAULT '0', "locked_until" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_308c50af5d57940a72e7c7960e" ON "users" ("phone") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "driver_profiles" ("user_id" uuid NOT NULL, "license_number" character varying(32), "license_class" character varying(8), "license_expires_on" date, "date_of_birth" date, "address" text, "emergency_contact" character varying(255), "default_vehicle_id" uuid, "hired_on" date, "note" text, CONSTRAINT "PK_cec43742cd6dea0e8fcae3e29d8" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "token_hash" character varying(64) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "replaced_by_id" uuid, "user_agent" character varying(255), "ip" character varying(64), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ddc983c5f7bcf132fd8732c3f" ON "refresh_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a7838d2ba25be1342091b6695f" ON "refresh_tokens" ("token_hash") `,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "slug" character varying(64) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "is_system" boolean NOT NULL DEFAULT false, "permissions" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_881f72bac969d9a00a1a29e107" ON "roles" ("slug") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("user_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "actor_user_id" uuid, "action" character varying(255) NOT NULL, "resource" character varying(64) NOT NULL, "resource_id" character varying(64), "payload" jsonb, "status_code" integer NOT NULL, "ip" character varying(64), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f160d97a931844109de9d04228" ON "audit_logs" ("actor_user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2cd10fda8276bb995288acfbfb" ON "audit_logs" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aeec69af874f018dc3c58fc0d2" ON "audit_logs" ("resource", "resource_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."otp_purpose" AS ENUM('BOOKING_LOOKUP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "otp_codes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "phone" character varying(20) NOT NULL, "purpose" "public"."otp_purpose" NOT NULL, "code_hash" character varying(64) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "consumed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9d0487965ac1837d57fec4d6a26" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c318cbb3e55832043d8cfbc50" ON "otp_codes" ("phone", "purpose") `,
    );
    await queryRunner.query(
      `CREATE TABLE "push_tokens" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "token" character varying(255) NOT NULL, "platform" character varying(16) NOT NULL, CONSTRAINT "PK_32734e87f299c29ca3878861f4f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_94c371aff70dedeb89dae39f44" ON "push_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_869b4a9ba2c9e030aafc4b7dc7" ON "push_tokens" ("token") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vehicle_types" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying(32) NOT NULL, "name" character varying(128) NOT NULL, "capacity" integer NOT NULL, "seat_layout" jsonb NOT NULL, "description" text, "image_url" text, CONSTRAINT "PK_73d1e40f4add7f4f6947acad3a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d3cfbe7b0cdb6624573ca9a81b" ON "vehicle_types" ("code") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vehicle_status" AS ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "license_plate" character varying(20) NOT NULL, "vehicle_type_id" uuid NOT NULL, "status" "public"."vehicle_status" NOT NULL DEFAULT 'AVAILABLE', "brand" character varying(64), "model" character varying(64), "year" integer, "color" character varying(32), "odometer_km" integer NOT NULL DEFAULT '0', "registration_expires_on" date, "insurance_expires_on" date, "next_maintenance_on" date, "image_url" text, "note" text, CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b5c2be439db007e494896d8d81" ON "vehicles" ("license_plate") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "routes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "code" character varying(32) NOT NULL, "name" character varying(255) NOT NULL, "origin_name" character varying(128) NOT NULL, "destination_name" character varying(128) NOT NULL, "distance_km" integer, "duration_min" integer NOT NULL, "description" text, "image_url" text, "is_active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_76100511cdfa1d013c859f01d8b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_932becf8a838deea819a643c4b" ON "routes" ("code") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stop_kind" AS ENUM('PICKUP', 'DROPOFF', 'BOTH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "stops" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "route_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "address" text NOT NULL, "location" geography(Point,4326) NOT NULL, "kind" "public"."stop_kind" NOT NULL DEFAULT 'BOTH', "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_ed1be877403ad3c921b07f62ca5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dbc2394dc0bac04d772498dc50" ON "stops" ("route_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_920e71d4ead7cfc9bd4d4ec70b" ON "stops" USING GiST ("location") `,
    );
    await queryRunner.query(
      `CREATE TABLE "time_slots" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "route_id" uuid NOT NULL, "departure_time" TIME NOT NULL, "days_of_week" integer array NOT NULL DEFAULT '{0,1,2,3,4,5,6}', "vehicle_type_id" uuid NOT NULL, "planned_vehicles" integer NOT NULL DEFAULT '1', "valid_from" date, "valid_to" date, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_f87c73d8648c3f3f297adba3cb8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d20cd05e32008367b584de642b" ON "time_slots" ("route_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "price_rules" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "route_id" uuid NOT NULL, "vehicle_type_id" uuid, "name" character varying(128) NOT NULL, "base_price_vnd" integer NOT NULL, "vip_surcharge_vnd" integer NOT NULL DEFAULT '0', "valid_from" date, "valid_to" date, "priority" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_332f84d0bdaa08303a9292653f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c6fc97f713ec4424f4225c6484" ON "price_rules" ("route_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."trip_batch_status" AS ENUM('OPEN', 'CLOSED', 'CLUSTERED', 'DISPATCHED', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "trip_batches" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying(32) NOT NULL, "route_id" uuid NOT NULL, "time_slot_id" uuid, "departure_at" TIMESTAMP WITH TIME ZONE NOT NULL, "arrival_eta" TIMESTAMP WITH TIME ZONE NOT NULL, "vehicle_type_id" uuid NOT NULL, "planned_vehicles" integer NOT NULL DEFAULT '1', "status" "public"."trip_batch_status" NOT NULL DEFAULT 'OPEN', "sales_close_min" integer NOT NULL DEFAULT '60', "note" text, CONSTRAINT "PK_fff79b65554f5ed3b0e6899689e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_6341361494fe03a0e2243c8a04" ON "trip_batches" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3c3572c3d39111d7435b01dc68" ON "trip_batches" ("departure_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_trip_batches_slot_departure" ON "trip_batches" ("time_slot_id", "departure_at") WHERE time_slot_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3de074d0e031ce464662afa61" ON "trip_batches" ("route_id", "departure_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."trip_run_status" AS ENUM('PENDING', 'DISPATCHED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "trip_runs" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying(32) NOT NULL, "trip_batch_id" uuid NOT NULL, "vehicle_id" uuid NOT NULL, "driver_id" uuid NOT NULL, "status" "public"."trip_run_status" NOT NULL DEFAULT 'PENDING', "dispatched_at" TIMESTAMP WITH TIME ZONE, "started_at" TIMESTAMP WITH TIME ZONE, "finished_at" TIMESTAMP WITH TIME ZONE, "planned_distance_km" numeric(8,2), "route_geometry" jsonb, "note" text, CONSTRAINT "PK_00baa7d4fee126208e6c0f85d66" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2f6a6214c51dc90f8f856e0b50" ON "trip_runs" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8f77c999c8929cd3d8d1159ad6" ON "trip_runs" ("trip_batch_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d2c6267ebb3fbce7c30dfc223" ON "trip_runs" ("driver_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "full_name" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(255), "note" text, "tags" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_894aeb85da15a25507d6852353" ON "customers" ("phone") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_status" AS ENUM('PENDING_PAYMENT', 'CONFIRMED', 'PICKED_UP', 'DROPPED_OFF', 'NO_SHOW', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_source" AS ENUM('WEB', 'ADMIN', 'CALL_CENTER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'BANK_TRANSFER', 'VNPAY', 'MOMO', 'ZALOPAY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_status" AS ENUM('UNPAID', 'PENDING', 'PAID', 'REFUNDED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying(16) NOT NULL, "trip_batch_id" uuid NOT NULL, "trip_run_id" uuid, "customer_id" uuid, "contact_name" character varying(255) NOT NULL, "contact_phone" character varying(20) NOT NULL, "contact_email" character varying(255), "pickup_stop_id" uuid, "pickup_address" text NOT NULL, "pickup_point" geography(Point,4326) NOT NULL, "dropoff_stop_id" uuid, "dropoff_address" text NOT NULL, "dropoff_point" geography(Point,4326) NOT NULL, "pickup_order" integer, "dropoff_order" integer, "status" "public"."booking_status" NOT NULL DEFAULT 'PENDING_PAYMENT', "source" "public"."booking_source" NOT NULL DEFAULT 'WEB', "note" text, "subtotal_vnd" integer NOT NULL, "discount_vnd" integer NOT NULL DEFAULT '0', "total_vnd" integer NOT NULL, "payment_method" "public"."payment_method" NOT NULL, "payment_status" "public"."payment_status" NOT NULL DEFAULT 'UNPAID', "payment_due_at" TIMESTAMP WITH TIME ZONE, "picked_up_at" TIMESTAMP WITH TIME ZONE, "dropped_off_at" TIMESTAMP WITH TIME ZONE, "cancelled_at" TIMESTAMP WITH TIME ZONE, "cancel_reason" text, "created_by_id" uuid, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9add00bfd42ae2bbe830bab9aa" ON "bookings" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f2fab138b6b606aa6f5aea0e2e" ON "bookings" ("trip_batch_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff6b56eff8a9c2921990bc9e41" ON "bookings" ("trip_run_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e21b7ae33e7b0673270de4146" ON "bookings" ("customer_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9998fcf869e888817149ab9eab" ON "bookings" ("contact_phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58c163edb8104cf7212e856552" ON "bookings" USING GiST ("pickup_point") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87691d25d982c43208f4f69275" ON "bookings" USING GiST ("dropoff_point") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."seat_tier" AS ENUM('STANDARD', 'VIP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "booking_seats" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "booking_id" uuid NOT NULL, "trip_batch_id" uuid NOT NULL, "seat_label" character varying(8) NOT NULL, "seat_unit" integer NOT NULL DEFAULT '1', "tier" "public"."seat_tier" NOT NULL DEFAULT 'STANDARD', "price_vnd" integer NOT NULL, "passenger_name" character varying(255) NOT NULL, "passenger_phone" character varying(20), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a4d929dea33a0153ba9bc253db1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_25c8b5c1e010af1cd2f699c592" ON "booking_seats" ("booking_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_booking_seats_active" ON "booking_seats" ("trip_batch_id", "seat_label", "seat_unit") WHERE is_active`,
    );
    await queryRunner.query(
      `CREATE TABLE "seat_holds" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "trip_batch_id" uuid NOT NULL, "seat_label" character varying(8) NOT NULL, "seat_unit" integer NOT NULL DEFAULT '1', "hold_token" character varying(64) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_5b8bce6f92f229102b485b05f51" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b09ed18f666c7c7ace5afa470b" ON "seat_holds" ("hold_token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6198ab7ed5551fea832e2ba4a0" ON "seat_holds" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_seat_holds" ON "seat_holds" ("trip_batch_id", "seat_label", "seat_unit") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_txn_status" AS ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "booking_id" uuid, "cargo_id" uuid, "method" "public"."payment_method" NOT NULL, "amount_vnd" integer NOT NULL, "reference" character varying(32) NOT NULL, "status" "public"."payment_txn_status" NOT NULL DEFAULT 'PENDING', "provider_txn_id" character varying(128), "paid_at" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE, "raw" jsonb, "recorded_by_id" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e86edf76dc2424f123b9023a2b" ON "payments" ("booking_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b7bd2e89727cedcc062e756230" ON "payments" ("cargo_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_866ddee0e17d9385b4e3b86851" ON "payments" ("reference") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e55386b7ee18000d9a7154e89f" ON "payments" ("provider_txn_id") WHERE provider_txn_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cargo_size" AS ENUM('S', 'M', 'L', 'XL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cargo_payer" AS ENUM('SENDER', 'RECEIVER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cargo_status" AS ENUM('CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cargos" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "waybill_code" character varying(20) NOT NULL, "route_id" uuid NOT NULL, "trip_batch_id" uuid, "trip_run_id" uuid, "sender_name" character varying(255) NOT NULL, "sender_phone" character varying(20) NOT NULL, "pickup_address" text NOT NULL, "pickup_point" geography(Point,4326) NOT NULL, "receiver_name" character varying(255) NOT NULL, "receiver_phone" character varying(20) NOT NULL, "dropoff_address" text NOT NULL, "dropoff_point" geography(Point,4326) NOT NULL, "description" text NOT NULL, "size" "public"."cargo_size" NOT NULL DEFAULT 'S', "weight_kg" numeric(6,2) NOT NULL, "is_fragile" boolean NOT NULL DEFAULT false, "declared_value_vnd" integer NOT NULL DEFAULT '0', "fee_vnd" integer NOT NULL, "fee_payer" "public"."cargo_payer" NOT NULL DEFAULT 'SENDER', "cod_amount_vnd" integer NOT NULL DEFAULT '0', "cod_collected_at" TIMESTAMP WITH TIME ZONE, "cod_settlement_id" uuid, "status" "public"."cargo_status" NOT NULL DEFAULT 'CREATED', "picked_up_at" TIMESTAMP WITH TIME ZONE, "delivered_at" TIMESTAMP WITH TIME ZONE, "proof_photo_url" text, "note" text, "created_by_id" uuid, CONSTRAINT "PK_052f813788106484e4ef7cd1745" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d747f7767b941bb9a81b13dd2e" ON "cargos" ("waybill_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e07ce9a6e100cf0fd210987d27" ON "cargos" ("trip_batch_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de02de15a47ca151dd0c51c9c4" ON "cargos" ("trip_run_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d36e74d9a2031131a4ac7eca7" ON "cargos" ("sender_phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_105144a522187b1bf49ace3718" ON "cargos" ("receiver_phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ab8cebc0cb85e11ba3003e679" ON "cargos" ("cod_settlement_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cod_settlement_status" AS ENUM('PENDING', 'CONFIRMED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cod_settlements" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "driver_id" uuid NOT NULL, "amount_vnd" integer NOT NULL, "cargo_count" integer NOT NULL, "status" "public"."cod_settlement_status" NOT NULL DEFAULT 'PENDING', "confirmed_by_id" uuid, "confirmed_at" TIMESTAMP WITH TIME ZONE, "note" text, CONSTRAINT "PK_51079512624f2a18434b6b3da4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_02dfe64244e012f807508b2abb" ON "cod_settlements" ("driver_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "driver_shifts" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "driver_id" uuid NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ended_at" TIMESTAMP WITH TIME ZONE, "start_point" geography(Point,4326), "end_point" geography(Point,4326), "end_checklist" jsonb, "end_note" text, CONSTRAINT "PK_026dc3b73ae9a4a9779fa3a680c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3aaea2a7f8b259b832431cd762" ON "driver_shifts" ("driver_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "driver_locations" ("id" BIGSERIAL NOT NULL, "driver_id" uuid NOT NULL, "trip_run_id" uuid, "point" geography(Point,4326) NOT NULL, "speed_kmh" real, "heading" real, "accuracy_m" real, "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_31aae5c417762bf01ec26a53f02" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_98cc2b35c3d4546b7ce8338191" ON "driver_locations" ("driver_id", "recorded_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_sender_role" AS ENUM('DRIVER', 'OPS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "driver_id" uuid NOT NULL, "sender_user_id" uuid NOT NULL, "sender_role" "public"."chat_sender_role" NOT NULL, "body" text NOT NULL, "read_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f3529c36375c4905722258b7d4" ON "chat_messages" ("driver_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "kind" character varying(64) NOT NULL, "title" character varying(255) NOT NULL, "body" text NOT NULL, "data" jsonb, "read_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_310667f935698fcd8cb319113a" ON "notifications" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."incident_kind" AS ENUM('ACCIDENT', 'BREAKDOWN', 'MEDICAL', 'SECURITY', 'PASSENGER', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."incident_status" AS ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "incidents" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "driver_id" uuid NOT NULL, "trip_run_id" uuid, "kind" "public"."incident_kind" NOT NULL, "description" text NOT NULL, "point" geography(Point,4326), "photo_url" text, "status" "public"."incident_status" NOT NULL DEFAULT 'OPEN', "handled_by_id" uuid, "resolved_at" TIMESTAMP WITH TIME ZONE, "resolution_note" text, CONSTRAINT "PK_ccb34c01719889017e2246469f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7e391d19a6d870169c4008d217" ON "incidents" ("driver_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."finance_kind" AS ENUM('INCOME', 'EXPENSE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."finance_category" AS ENUM('TICKET', 'CARGO', 'COD', 'FUEL', 'TOLL', 'SALARY', 'MAINTENANCE', 'REFUND', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "finance_transactions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "kind" "public"."finance_kind" NOT NULL, "category" "public"."finance_category" NOT NULL, "amount_vnd" integer NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "reference_type" character varying(32), "reference_id" uuid, "memo" text, "created_by_id" uuid, CONSTRAINT "PK_afa9437df81e95c4295cd52f15f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_44468f745ec0bd035e975b7f36" ON "finance_transactions" ("occurred_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ticket_kind" AS ENUM('CONTACT', 'CHANGE_REQUEST', 'CANCEL_REQUEST', 'COMPLAINT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ticket_status" AS ENUM('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "support_tickets" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying(16) NOT NULL, "kind" "public"."ticket_kind" NOT NULL, "status" "public"."ticket_status" NOT NULL DEFAULT 'NEW', "name" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(255), "subject" character varying(255) NOT NULL, "message" text NOT NULL, "booking_id" uuid, "assignee_id" uuid, "internal_note" text, CONSTRAINT "PK_942e8d8f5df86100471d2324643" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_50f164c703c05454597eed6dfd" ON "support_tickets" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "settings" ("key" character varying(64) NOT NULL, "value" jsonb NOT NULL, "updated_by_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c8639b7626fa94ba8265628f214" PRIMARY KEY ("key"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" ADD CONSTRAINT "FK_cec43742cd6dea0e8fcae3e29d8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" ADD CONSTRAINT "FK_f4acfb1bd6d252051103de600e1" FOREIGN KEY ("default_vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_f160d97a931844109de9d04228f" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_tokens" ADD CONSTRAINT "FK_94c371aff70dedeb89dae39f440" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD CONSTRAINT "FK_8c6922f37d6f8a496a4cabfe080" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stops" ADD CONSTRAINT "FK_dbc2394dc0bac04d772498dc503" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD CONSTRAINT "FK_d20cd05e32008367b584de642bd" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" ADD CONSTRAINT "FK_f41e2f913fe72094497f742cc1e" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_rules" ADD CONSTRAINT "FK_c6fc97f713ec4424f4225c64841" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_rules" ADD CONSTRAINT "FK_d308bc793d1e3f2bd83a7d1ed40" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_batches" ADD CONSTRAINT "FK_2212b6d8dc43e9fc22a370a9f47" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_batches" ADD CONSTRAINT "FK_3210745dc1deb1534a2d615e926" FOREIGN KEY ("time_slot_id") REFERENCES "time_slots"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_batches" ADD CONSTRAINT "FK_5228fe12a2cd11a88e713371d6c" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_runs" ADD CONSTRAINT "FK_8f77c999c8929cd3d8d1159ad6f" FOREIGN KEY ("trip_batch_id") REFERENCES "trip_batches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_runs" ADD CONSTRAINT "FK_7cf9c3e7910a4203d998a9e0db0" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_runs" ADD CONSTRAINT "FK_2d2c6267ebb3fbce7c30dfc2235" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_f2fab138b6b606aa6f5aea0e2e6" FOREIGN KEY ("trip_batch_id") REFERENCES "trip_batches"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_ff6b56eff8a9c2921990bc9e41d" FOREIGN KEY ("trip_run_id") REFERENCES "trip_runs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_8e21b7ae33e7b0673270de4146f" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_7b1993a22ea035aae8057908544" FOREIGN KEY ("pickup_stop_id") REFERENCES "stops"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_8542b25c34a5025c95d045c8e27" FOREIGN KEY ("dropoff_stop_id") REFERENCES "stops"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seats" ADD CONSTRAINT "FK_25c8b5c1e010af1cd2f699c5926" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_holds" ADD CONSTRAINT "FK_6f2872f6929843d1cc672ae057a" FOREIGN KEY ("trip_batch_id") REFERENCES "trip_batches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_e86edf76dc2424f123b9023a2b2" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cargos" ADD CONSTRAINT "FK_f3815a52188b871bb9e29d92a27" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cargos" ADD CONSTRAINT "FK_e07ce9a6e100cf0fd210987d27a" FOREIGN KEY ("trip_batch_id") REFERENCES "trip_batches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cargos" ADD CONSTRAINT "FK_de02de15a47ca151dd0c51c9c4d" FOREIGN KEY ("trip_run_id") REFERENCES "trip_runs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cod_settlements" ADD CONSTRAINT "FK_02dfe64244e012f807508b2abbf" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_shifts" ADD CONSTRAINT "FK_3aaea2a7f8b259b832431cd7629" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_73245e057f063d01b5510f6d46f" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" ADD CONSTRAINT "FK_7e391d19a6d870169c4008d217a" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "incidents" DROP CONSTRAINT "FK_7e391d19a6d870169c4008d217a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_73245e057f063d01b5510f6d46f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_shifts" DROP CONSTRAINT "FK_3aaea2a7f8b259b832431cd7629"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cod_settlements" DROP CONSTRAINT "FK_02dfe64244e012f807508b2abbf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cargos" DROP CONSTRAINT "FK_de02de15a47ca151dd0c51c9c4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cargos" DROP CONSTRAINT "FK_e07ce9a6e100cf0fd210987d27a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cargos" DROP CONSTRAINT "FK_f3815a52188b871bb9e29d92a27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_e86edf76dc2424f123b9023a2b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_holds" DROP CONSTRAINT "FK_6f2872f6929843d1cc672ae057a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seats" DROP CONSTRAINT "FK_25c8b5c1e010af1cd2f699c5926"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_8542b25c34a5025c95d045c8e27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_7b1993a22ea035aae8057908544"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_8e21b7ae33e7b0673270de4146f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_ff6b56eff8a9c2921990bc9e41d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_f2fab138b6b606aa6f5aea0e2e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_runs" DROP CONSTRAINT "FK_2d2c6267ebb3fbce7c30dfc2235"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_runs" DROP CONSTRAINT "FK_7cf9c3e7910a4203d998a9e0db0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_runs" DROP CONSTRAINT "FK_8f77c999c8929cd3d8d1159ad6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_batches" DROP CONSTRAINT "FK_5228fe12a2cd11a88e713371d6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_batches" DROP CONSTRAINT "FK_3210745dc1deb1534a2d615e926"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_batches" DROP CONSTRAINT "FK_2212b6d8dc43e9fc22a370a9f47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_rules" DROP CONSTRAINT "FK_d308bc793d1e3f2bd83a7d1ed40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "price_rules" DROP CONSTRAINT "FK_c6fc97f713ec4424f4225c64841"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP CONSTRAINT "FK_f41e2f913fe72094497f742cc1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_slots" DROP CONSTRAINT "FK_d20cd05e32008367b584de642bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stops" DROP CONSTRAINT "FK_dbc2394dc0bac04d772498dc503"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" DROP CONSTRAINT "FK_8c6922f37d6f8a496a4cabfe080"`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_tokens" DROP CONSTRAINT "FK_94c371aff70dedeb89dae39f440"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_f160d97a931844109de9d04228f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" DROP CONSTRAINT "FK_f4acfb1bd6d252051103de600e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver_profiles" DROP CONSTRAINT "FK_cec43742cd6dea0e8fcae3e29d8"`,
    );
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_50f164c703c05454597eed6dfd"`,
    );
    await queryRunner.query(`DROP TABLE "support_tickets"`);
    await queryRunner.query(`DROP TYPE "public"."ticket_status"`);
    await queryRunner.query(`DROP TYPE "public"."ticket_kind"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_44468f745ec0bd035e975b7f36"`,
    );
    await queryRunner.query(`DROP TABLE "finance_transactions"`);
    await queryRunner.query(`DROP TYPE "public"."finance_category"`);
    await queryRunner.query(`DROP TYPE "public"."finance_kind"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7e391d19a6d870169c4008d217"`,
    );
    await queryRunner.query(`DROP TABLE "incidents"`);
    await queryRunner.query(`DROP TYPE "public"."incident_status"`);
    await queryRunner.query(`DROP TYPE "public"."incident_kind"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_310667f935698fcd8cb319113a"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f3529c36375c4905722258b7d4"`,
    );
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(`DROP TYPE "public"."chat_sender_role"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_98cc2b35c3d4546b7ce8338191"`,
    );
    await queryRunner.query(`DROP TABLE "driver_locations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3aaea2a7f8b259b832431cd762"`,
    );
    await queryRunner.query(`DROP TABLE "driver_shifts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_02dfe64244e012f807508b2abb"`,
    );
    await queryRunner.query(`DROP TABLE "cod_settlements"`);
    await queryRunner.query(`DROP TYPE "public"."cod_settlement_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3ab8cebc0cb85e11ba3003e679"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_105144a522187b1bf49ace3718"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d36e74d9a2031131a4ac7eca7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de02de15a47ca151dd0c51c9c4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e07ce9a6e100cf0fd210987d27"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d747f7767b941bb9a81b13dd2e"`,
    );
    await queryRunner.query(`DROP TABLE "cargos"`);
    await queryRunner.query(`DROP TYPE "public"."cargo_status"`);
    await queryRunner.query(`DROP TYPE "public"."cargo_payer"`);
    await queryRunner.query(`DROP TYPE "public"."cargo_size"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e55386b7ee18000d9a7154e89f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_866ddee0e17d9385b4e3b86851"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b7bd2e89727cedcc062e756230"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e86edf76dc2424f123b9023a2b"`,
    );
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payment_txn_status"`);
    await queryRunner.query(`DROP INDEX "public"."uq_seat_holds"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6198ab7ed5551fea832e2ba4a0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b09ed18f666c7c7ace5afa470b"`,
    );
    await queryRunner.query(`DROP TABLE "seat_holds"`);
    await queryRunner.query(`DROP INDEX "public"."uq_booking_seats_active"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_25c8b5c1e010af1cd2f699c592"`,
    );
    await queryRunner.query(`DROP TABLE "booking_seats"`);
    await queryRunner.query(`DROP TYPE "public"."seat_tier"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_87691d25d982c43208f4f69275"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58c163edb8104cf7212e856552"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9998fcf869e888817149ab9eab"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8e21b7ae33e7b0673270de4146"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff6b56eff8a9c2921990bc9e41"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f2fab138b6b606aa6f5aea0e2e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9add00bfd42ae2bbe830bab9aa"`,
    );
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TYPE "public"."payment_status"`);
    await queryRunner.query(`DROP TYPE "public"."booking_source"`);
    await queryRunner.query(`DROP TYPE "public"."booking_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_894aeb85da15a25507d6852353"`,
    );
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d2c6267ebb3fbce7c30dfc223"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f77c999c8929cd3d8d1159ad6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f6a6214c51dc90f8f856e0b50"`,
    );
    await queryRunner.query(`DROP TABLE "trip_runs"`);
    await queryRunner.query(`DROP TYPE "public"."trip_run_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3de074d0e031ce464662afa61"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_trip_batches_slot_departure"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3c3572c3d39111d7435b01dc68"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6341361494fe03a0e2243c8a04"`,
    );
    await queryRunner.query(`DROP TABLE "trip_batches"`);
    await queryRunner.query(`DROP TYPE "public"."trip_batch_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c6fc97f713ec4424f4225c6484"`,
    );
    await queryRunner.query(`DROP TABLE "price_rules"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d20cd05e32008367b584de642b"`,
    );
    await queryRunner.query(`DROP TABLE "time_slots"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_920e71d4ead7cfc9bd4d4ec70b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dbc2394dc0bac04d772498dc50"`,
    );
    await queryRunner.query(`DROP TABLE "stops"`);
    await queryRunner.query(`DROP TYPE "public"."stop_kind"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_932becf8a838deea819a643c4b"`,
    );
    await queryRunner.query(`DROP TABLE "routes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5c2be439db007e494896d8d81"`,
    );
    await queryRunner.query(`DROP TABLE "vehicles"`);
    await queryRunner.query(`DROP TYPE "public"."vehicle_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d3cfbe7b0cdb6624573ca9a81b"`,
    );
    await queryRunner.query(`DROP TABLE "vehicle_types"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_869b4a9ba2c9e030aafc4b7dc7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_94c371aff70dedeb89dae39f44"`,
    );
    await queryRunner.query(`DROP TABLE "push_tokens"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c318cbb3e55832043d8cfbc50"`,
    );
    await queryRunner.query(`DROP TABLE "otp_codes"`);
    await queryRunner.query(`DROP TYPE "public"."otp_purpose"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aeec69af874f018dc3c58fc0d2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2cd10fda8276bb995288acfbfb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f160d97a931844109de9d04228"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_881f72bac969d9a00a1a29e107"`,
    );
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7838d2ba25be1342091b6695f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3ddc983c5f7bcf132fd8732c3f"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "driver_profiles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_308c50af5d57940a72e7c7960e"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."user_status"`);
    await queryRunner.query(`DROP TYPE "public"."user_kind"`);
    // Shared by bookings.payment_method and payments.method — drop after both tables.
    await queryRunner.query(`DROP TYPE "public"."payment_method"`);
  }
}
