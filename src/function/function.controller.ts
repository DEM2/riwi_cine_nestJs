import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FunctionService } from './function.service.js';
import { ShowtimeSeatResponseDto } from './dto/seat-response.dto.js';

@ApiTags('Functions')
@Controller('functions')
export class FunctionController {
  constructor(private readonly functionService: FunctionService) {}

  @Get(':id/seats')
  @ApiOperation({
    summary: 'Obtener el mapa de sillas de una función',
    description:
      'Devuelve las sillas habilitadas de la sala de la función con su estado (disponible o bloqueada), el carrito que las bloquea y el precio calculado.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador de la función' })
  @ApiResponse({
    status: 200,
    description: 'Mapa de sillas obtenido exitosamente',
    type: [ShowtimeSeatResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Parámetro inválido o función ya iniciada' })
  @ApiResponse({ status: 404, description: 'Función no encontrada o no disponible' })
  getSeats(@Param('id', ParseIntPipe) id: number): Promise<ShowtimeSeatResponseDto[]> {
    return this.functionService.getShowtimeSeats(id);
  }
}
