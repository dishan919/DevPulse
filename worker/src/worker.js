// Intentionally fail rather than implying that endpoint checks are running.
console.error('The monitoring worker is not implemented in foundation stage. BullMQ scheduling and safe endpoint checks are planned for the monitoring stage.');
process.exitCode = 1;
