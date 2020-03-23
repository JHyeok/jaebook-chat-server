/**
 * NODE_ENV에 따른 .env 파일 로드
 */
require("dotenv").config({
    path: `config/.env.${process.env.NODE_ENV || "development"}`,
});

/**
 * 환경 변수
 */
export const env = {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    app: {
        port: Number(process.env.PORT) || 4000,
    },
    sentry: {
        dsn: process.env.SENTRY_DSN,
    },
};
