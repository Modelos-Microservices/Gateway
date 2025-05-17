
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RpcCustomExceptionFilter } from './common/exceptions/rpc-custom-exception.filter';

async function bootstrap() {
    const logger = new Logger('Gateway');
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api')

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        })
    );

    // Enable CORS
    app.enableCors({
    origin: 'http://localhost:4200', // URL de tu aplicación Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization'
  });


    app.useGlobalFilters(new RpcCustomExceptionFilter())

    await app.listen(envs.port);
    logger.log(`Gateway running on port ${envs.port}`);
    console.log('primer cambio de prueba')

}
bootstrap();
