import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('finance_transactions')
export class FinanceTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  kind!: string;

  @Column({ type: 'double precision' })
  amount!: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  reference_type!: string | null;

  @Column({ type: 'uuid', nullable: true })
  reference_id!: string | null;

  @Column({ type: 'text', nullable: true })
  memo!: string | null;

  @Column({ type: 'timestamptz' })
  created_at!: Date;
}
