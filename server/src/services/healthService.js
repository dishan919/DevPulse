export function getReadiness(connection) {
  const connected = connection.readyState === 1;
  return { ready: connected, database: connected ? 'connected' : 'unavailable' };
}
