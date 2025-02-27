import { ApiProperty } from '@nestjs/swagger';

export class Metadata {
  @ApiProperty()
  nextPageToken: string | null;
}
