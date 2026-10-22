#!/bin/sh
set -eu

echo "[entrypoint] Waiting for PostgreSQL..."

ATTEMPTS=60
i=1
while [ "$i" -le "$ATTEMPTS" ]; do
  if node --input-type=module -e "
    import net from 'node:net';
    const url = new URL(process.env.DATABASE_URL);
    const socket = net.connect(
      { host: url.hostname, port: Number(url.port || 5432) },
      () => { socket.end(); process.exit(0); },
    );
    socket.on('error', () => process.exit(1));
    setTimeout(() => process.exit(1), 2000);
  "; then
    echo "[entrypoint] PostgreSQL is reachable."
    break
  fi

  if [ "$i" -eq "$ATTEMPTS" ]; then
    echo "[entrypoint] Timed out waiting for PostgreSQL." >&2
    exit 1
  fi

  echo "[entrypoint] Attempt $i/$ATTEMPTS — retrying in 2s..."
  i=$((i + 1))
  sleep 2
done

if [ "${RUN_DB_INIT:-true}" = "true" ]; then
  echo "[entrypoint] Applying database migrations..."
  ./node_modules/.bin/prisma migrate deploy
fi

echo "[entrypoint] Starting application..."
exec "$@"
