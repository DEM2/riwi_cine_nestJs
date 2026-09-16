import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';


/**
 * Punto de entrada principal de la aplicación.
 *
 * Inicializa NestJS y levanta el servidor HTTP.
 *
 * @returns {Promise<void>}
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  /**
   * Configuración principal de la documentación OpenAPI.
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Example API')
    .setDescription(
      'API de ejemplo para entrenamiento de NestJS.',
    )
    .setVersion('1.0.0')
    .build();

  /**
   * Genera el documento OpenAPI a partir
   * de los controllers y endpoints registrados.
   */
  const documentFactory = () =>
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  /**
   * Expone Swagger UI en:
   *
   * http://localhost:3000/api
   */
  SwaggerModule.setup(
    'api',
    app,
    documentFactory,
  );


  const port = process.env.APP_PORT ?? 3000;

  await app.listen(port);
}
await bootstrap();