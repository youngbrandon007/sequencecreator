export type AppConfig = {
  port: number;
  corsOrigin: string;
  joinCodeLength: number;
  idleTtlDays: number;
  compactEveryNUpdates: number;
};

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  joinCodeLength: parseInt(process.env.JOIN_CODE_LENGTH ?? '6', 10),
  idleTtlDays: parseInt(process.env.IDLE_TTL_DAYS ?? '60', 10),
  compactEveryNUpdates: parseInt(
    process.env.COMPACT_EVERY_N_UPDATES ?? '100',
    10,
  ),
});
