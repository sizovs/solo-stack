import formBody from "@fastify/formbody";
import session from "@fastify/secure-session";
import statics from "@fastify/static";
import fastify from "fastify";
import { performance } from "node:perf_hooks";
import { db } from "./modules/database/connect.js";
import { errors } from "./modules/errors.js";
import { logger } from "./modules/logger.js";
import { appVersion } from "./modules/version.js";
import { initAdmin } from "./routes/admin.js";
import { initTodos } from "./routes/todos.js";
import { Alert } from "./views/Alert.js";

export const startApp = async (options = { port: 0 }) => {
  let health = 404; // app is unhealthy until cluster signals otherwise.

  const isDevMode = process.env.NODE_ENV === "development";

  if (!process.env.DB_LOCATION) {
    throw new Error("DB_LOCATION environment variable is missing.");
  }

  const envs = ["development", "production"];
  if (!envs.includes(process.env.NODE_ENV)) {
    throw new Error(`NODE_ENV environment variable must be one of ${envs}.`);
  }

  const app = fastify({ trustProxy: true });

  const STATICS_PREFIX = "/static";

  // Static files
  app.register(statics, {
    prefix: STATICS_PREFIX,
    root: process.cwd() + STATICS_PREFIX,
    decorateReply: false,
    cacheControl: false,
  });

  // URL-Encoded forms
  app.register(formBody);

  const insecure =
    "0000000000000000000000000000000000000000000000000000000000000000";
  const sessionSecret = process.env.COOKIE_SECRET ?? insecure;
  if (!isDevMode && sessionSecret === insecure) {
    throw new Error("Cannot use insecure session secret in production");
  }

  app.register(session, {
    sessionName: "session",
    key: Buffer.from(sessionSecret, "hex"),
    expiry: 15552000, // 180 days in seconds
    cookie: {
      maxAge: 34560000,
      path: "/",
    },
  });

  // Request logging
  app.addHook("onResponse", async (request, reply) => {
    logger.info(
      `${request.method} ${request.url} ${reply.statusCode} - ${Math.round(reply.elapsedTime)}ms`,
    );
  });

  // Current time (so that tests can manipulate time)
  app.decorateRequest("now", function () {
    if (!isDevMode) {
      return Date.now();
    }
    return (
      +this.headers["x-mock-time"] || +this.query["x-mock-time"] || Date.now()
    );
  });

  // CSRF protection
  app.addHook("preHandler", async (request, reply) => {
    const unsafeMethods = ["POST", "PUT", "PATCH", "DELETE"];
    if (!unsafeMethods.includes(request.method)) return;

    const fetchSiteHeader = request.headers["sec-fetch-site"];

    if (!fetchSiteHeader) {
      return reply
        .code(403)
        .send("Forbidden. Sec-Fetch-Site header is missing.");
    }

    if (fetchSiteHeader === "cross-site") {
      return reply.code(403).send("Cross-site requests are forbidden");
    }
  });

  app.addHook("preHandler", async (request, reply) => {
    const clientVersion = request.headers["x-client-version"];
    if (clientVersion && clientVersion < appVersion) {
      return reply.send(
        Alert({
          lead: "🎉 New Release",
          follow: "Please refresh the page to use the latest version",
        }).render(),
      );
    }
  });

  const captureClientError = errors({
    appVersion,
    source: "client",
  });
  const captureServerError = errors({
    appVersion,
    source: "server",
  });

  app.setErrorHandler((e, request, reply) => {
    captureServerError(e);

    if (request.headers["fetch-it"]) {
      return Alert({ lead: "Action failed", follow: e.message }).render();
    } else {
      return reply.status(e.statusCode || 500).send(e.message);
    }
  });

  await initTodos({ app });
  await initAdmin({ app });

  app.get("/", (request, reply) => reply.redirect("/todos"));
  app.get("/health", (request, reply) => reply.status(health).send());

  app.post("/js-error", (request, reply) => {
    const {
      context,
      errors: [error],
    } = JSON.parse(request.body);
    captureClientError(error, context);
    return reply.status(204).send();
  });

  const healthy = () => (health = 200);

  const url = await app.listen(options);

  const loadTime = performance.nodeTiming.bootstrapComplete.toFixed(2);
  logger.info(`Running @ ${url} (${loadTime}ms)`);

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, closing gracefully...");
    logger.flush();
    await app.close();
    await db.close();
    process.exit(0);
  });

  return { url, healthy };
};
