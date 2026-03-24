import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
   /**
    * Establece la conexion con la base de datos al inicializar el modulo.
    *
    * @returns Promesa resuelta cuando la conexion se ha establecido
    */
   async onModuleInit() {
      await this.$connect();
   }

   /**
    * Registra el cierre ordenado de la aplicacion cuando Prisma emite `beforeExit`.
    *
    * @param app - Instancia de la aplicacion NestJS
    * @returns Promesa resuelta cuando el hook queda registrado
    */
   async enableShutdownHooks(app: INestApplication) {
      process.on('beforeExit', async () => {
         await app.close();
      });
   }
}
