export class SessionResponseDto {
  code!: string;
  title!: string | null;
  createdAt!: Date;
  lastActiveAt!: Date;
}
