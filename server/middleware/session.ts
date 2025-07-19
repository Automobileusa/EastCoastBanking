import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db";

const PgSession = connectPgSimple(session);

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pool,
    tableName: "sessions",
  }),
  secret: process.env.SESSION_SECRET || "eastcoast-credit-union-secret-key-2025",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
  proxy: process.env.NODE_ENV === "production", // Trust first proxy (Render)
  name: "eccu.session.id",
});
