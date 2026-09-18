import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({ tableName: 'login_audits', timestamps: true })
export class Audit extends Model<Audit> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  userId!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  event!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  ip!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  device!: string;
}