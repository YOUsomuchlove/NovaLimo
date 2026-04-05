import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargoEntity } from '../entities/cargo.entity';
import { EventsModule } from '../events/events.module';
import { CargosController } from './cargos.controller';
import { CargosService } from './cargos.service';

@Module({
  imports: [TypeOrmModule.forFeature([CargoEntity]), EventsModule],
  controllers: [CargosController],
  providers: [CargosService],
  exports: [CargosService],
})
export class CargosModule {}
