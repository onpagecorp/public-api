import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as YAML from 'yaml';
import * as packageJson from '../package.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: '*', // Change this to your frontend's domain for security
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
  });

  // app.enableVersioning({
  //   type: VersioningType.HEADER,
  //   header: 'x-api-version'
  // });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('OnPage API')
    .setDescription(
      'OpenAPI definition for managing dispatching, pages, contacts, administrators, templates, settings, and webhooks.\n\n' +
        '[📥 Download Swagger YAML](./swagger.yaml)'
    )
    .setVersion('1.0')
    .addTag('API') // Optional: Tags for grouping
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }) // Optional: Add authentication support
    .addServer(
      `http://127.0.0.1:${configService.get<number>('PORT')}`,
      'Development Server'
    )
    .addServer('https://public-api.onsetmobile.com', 'Sandbox Server')
    .addServer('https://public-api.onpage.com', 'Production Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Convert Swagger JSON to YAML and save it
  const yamlString = YAML.stringify(document);
  writeFileSync('./swagger.yaml', yamlString); // Saves YAML file

  // Setup Swagger UI
  SwaggerModule.setup('api-docs', app, document, {
    customfavIcon: './favicon.ico'
  });

  // Serve YAML file for download
  app.use('/swagger.yaml', (req, res) => {
    res.download('./swagger.yaml');
  });

  app.use('/version', (req, res) => {
    res.status(200).send(packageJson.version);
  });

  app.use('/favicon.ico', (req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'favicon-32x32.png'));
  });

  await app.listen(process.env.PORT ?? 3003);
}

bootstrap();
