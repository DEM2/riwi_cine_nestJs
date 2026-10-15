import { NestFactory } from '@nestjs/core';
import { SeedService } from './seed.service.js';

/**
 * Punto de entrada del script de datos semilla.
 *
 * Levanta el contexto de la aplicación (reutilizando la configuración de
 * TypeORM y de variables de entorno) y ejecuta los seeders de forma
 * idempotente.
 *
 * Ejecución: `npm run db:seed` (o `npm run db:seed:local`)
 *
 * Host de la base de datos:
 *  - Dentro de Docker, `POSTGRES_HOST` ya viene definido (`db`).
 *  - En local, si no está definido, se usa `localhost` (el puerto de la BD
 *    está mapeado en el host). El valor se fija ANTES de importar `AppModule`
 *    porque `ConfigModule.forRoot` se evalúa al cargar el módulo y da
 *    precedencia a `process.env` sobre el archivo `.env`.
 */
process.env.POSTGRES_HOST ??= 'localhost';

async function bootstrap(): Promise<void> {
  const { AppModule } = await import('../app.module.js');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    console.log(
      `[seed] Conectando a POSTGRES_HOST=${process.env.POSTGRES_HOST}`,
    );
    await app.get(SeedService).run();
  } finally {
    await app.close();
  }
}

await bootstrap();

// El agente de Observe/TypeORM mantiene manejadores abiertos; forzamos una
// salida limpia una vez finalizada la siembra.
process.exit(0);
