import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import * as packageJson from '../package.json';
// import { Public } from './auth/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Public()
  // @Get('version')
  // getVersion(): string {
  //   return packageJson.version;
  // }
}
