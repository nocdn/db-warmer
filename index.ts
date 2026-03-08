import { SQL } from "bun";
const logger = require("pino")();
import { Cron } from "croner";

const POSTGRES_URLS = process.env.POSTGRES_CONNECTION_STRINGS?.split(",");
const CHRON_SCHEDULE = process.env.WARMING_SCHEDULE;

if (CHRON_SCHEDULE === undefined) {
  throw new Error("You must specify a chron schedule for the warming jobs");
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
      const result = await pg`SELECT 1`;
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

// schedule a chron job based on the schedule from .env
const job = new Cron(CHRON_SCHEDULE, () => {
  runWake();
});
