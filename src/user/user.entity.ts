import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Default, BeforeCreate } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

@Table({ 
  tableName: 'users', 
  timestamps: true 
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING(100), unique: true, allowNull: false })
  email!: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: 'password_hash' })
  password!: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: 'first_name' })
  firstName!: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: 'last_name' })
  lastName!: string;

  @Column({ type: DataType.INTEGER, allowNull: false, field: 'role_id' })
  roleId!: number;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  isVerified!: boolean;

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'failed_login_attempts' })
  failedLoginAttempts!: number;

  @Column({ type: DataType.DATE, allowNull: true, field: 'lockout_until' })
  lockoutUntil?: Date;

  @Default('INACTIVO')
  @Column({ type: DataType.STRING(20), allowNull: false })
  status!: string;

  @BeforeCreate
  static async hashPassword(instance: User) {
    const salt = await bcrypt.genSalt(10);
    instance.password = await bcrypt.hash(instance.password, salt);
  }
}