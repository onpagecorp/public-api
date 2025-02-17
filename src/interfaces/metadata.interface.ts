import { ApiProperty } from "@nestjs/swagger";

export class Metadata {
  @ApiProperty()
  hasMoreData: boolean;
}
