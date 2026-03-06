import { SQL } from "bun";
import ms, { type StringValue } from "ms";
const logger = require("pino")();

const POSTGRES_URLS = process.env.POSTGRES_CONNECTION_STRINGS?.split(",");
const warmingInterval = process.env.WARMING_INTERVAL;

let INTERVAL_MS = warmingInterval
  ? ms(warmingInterval as StringValue)
  : ms("4m");

if (INTERVAL_MS === undefined) {
  INTERVAL_MS = ms("4m");
}

if (!POSTGRES_URLS) {
  throw new Error("Postgres connection strings not set as env variables");
}

async function runWake() {
  async function wake(URL: string) {
    const pg = new SQL(URL);
    // this just returns a computed value of 1, rather than pulling any data
    // so like sending SELECT `2+2` or SELECT 'hello'
    // it checks the connection works, the SQL parser works, the query executor runs, and server responds
    try {
      const result = await pg`SELECT now()`;
    } catch (error) {
      console.error("Ping failed", error);
    }
  }

  if (POSTGRES_URLS) {
    for (let i = 0; i < POSTGRES_URLS.length; i++) {
      const connection_string = POSTGRES_URLS[i];
      if (connection_string) {
        await wake(connection_string);
      }
    }
  }
  logger.info("Finished warming run");
}

// run immediately one time
logger.info("Starting database warmer");
await runWake();

setInterval(runWake, INTERVAL_MS);
