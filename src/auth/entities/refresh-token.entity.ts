import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey } from 'sequelize-typescript';
import { User } from '../../user/user.entity.js';


@Table({ tableName: 'refresh_tokens', timestamps: true })
export class RefreshToken extends Model<RefreshToken> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @Column({ type: DataType.STRING(500), allowNull: false, unique: true })
  token!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt!: Date;
}