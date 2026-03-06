# db-warmer

Runs on a interval and pings each Postgres database given in the `.env` with `SELECT now()`

### Setup

Prerequisites:

- Docker
- Docker compose

1. Copy and fill in the .env file:

```bash
cp .env.example .env
```

The environment variables are like so:
| Variable | Default | Info |
|:---------|:---------|:---------|
| POSTGRES_CONNECTION_STRINGS | N/A | The connection strings, comma separated, in the form `postgresql://username:password@host:port/database?sslmode=require&channel_binding=require` |
| WARMING_INTERVAL | "4m" | A string, parsed by `ms()` to set the interval at which it pings all the databases. |

2. Run it (in detached mode with `-d` flag)

```bash
docker compose up -d
```

The container also has `restart: always`, so it will start on boot, or restart with docker crashes, etc.
