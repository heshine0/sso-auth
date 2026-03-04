import { mock } from "bun:test";

// Mock Nuxt/H3 auto-imports
globalThis.defineEventHandler = (handler: any) => handler;
globalThis.getQuery = (event: any) => event.query || {};
globalThis.readBody = (event: any) => Promise.resolve(event._body || {});
globalThis.createError = (opts: any) => {
  const err = new Error(opts.statusMessage || "Error");
  (err as any).statusCode = opts.statusCode || 500;
  return err;
};

// Mock $fetch if used
globalThis.$fetch = mock(() => Promise.resolve({}));

// Mock console to reduce noise if needed
// globalThis.console = { ...console, log: mock(), error: mock() };
