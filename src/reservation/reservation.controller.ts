import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReservationService } from './reservation.service.js';
import { LockSeatsDto } from './dto/lock-seats.dto.js';
import { ReleaseSeatsDto } from './dto/release-seats.dto.js';
import { ReservationSummaryQueryDto } from './dto/summary-query.dto.js';
import {
  LockSeatsResponseDto,
  ReservationSummaryResponseDto,
} from './dto/reservation-response.dto.js';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('lock-seats')
  @ApiOperation({
    summary: 'Bloquear sillas de una función',
    description:
      'Bloquea un conjunto de sillas para un carrito. El timer inicia con el primer bloqueo y no se extiende. Es idempotente para el mismo carrito.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sillas bloqueadas correctamente',
    type: LockSeatsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o máximo de entradas excedido' })
  @ApiResponse({ status: 404, description: 'La función no existe' })
  @ApiResponse({ status: 409, description: 'Una o más sillas están bloqueadas por otro carrito' })
  lockSeats(@Body() dto: LockSeatsDto): Promise<LockSeatsResponseDto> {
    return this.reservationService.lockSeats(dto);
  }

  @Delete('release-seats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Liberar sillas bloqueadas de una función',
    description: 'Libera un conjunto de sillas previamente bloqueadas por un carrito.',
  })
  @ApiResponse({ status: 200, description: 'Sillas liberadas correctamente', schema: { example: { released: 3 } } })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'No hay sillas bloqueadas para liberar' })
  async releaseSeats(@Body() dto: ReleaseSeatsDto): Promise<{ released: number }> {
    const released = await this.reservationService.releaseSeats(dto);
    return { released };
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Obtener el resumen de reserva',
    description: 'Obtiene el resumen de las sillas bloqueadas por un carrito para una función.',
  })
  @ApiQuery({ name: 'cartId', type: Number, required: true })
  @ApiQuery({ name: 'showtimeId', type: Number, required: true })
  @ApiResponse({
    status: 200,
    description: 'Resumen de la reserva',
    type: ReservationSummaryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No hay sillas bloqueadas para este carrito y función' })
  getSummary(
    @Query() query: ReservationSummaryQueryDto,
  ): Promise<ReservationSummaryResponseDto> {
    return this.reservationService.getReservationSummary(
      query.cartId,
      query.showtimeId,
    );
  }
}
