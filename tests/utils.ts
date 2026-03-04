import { H3Event } from "h3";

export function createMockEvent(options: {
  url?: string;
  method?: string;
  body?: any;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  context?: any;
} = {}): H3Event {
  const req = {
    url: options.url || "/",
    method: options.method || "GET",
    headers: options.headers || {},
  };

  const res = {
    setHeader: () => {},
    getHeader: () => {},
    statusCode: 200,
    end: () => {},
  };

  const event = {
    node: {
      req,
      res,
    },
    context: {
      params: {},
      ...options.context,
    },
    headers: new Headers(options.headers as any),
    path: options.url || "/",
    method: options.method || "GET",
  } as unknown as H3Event;

  // Mock readBody support
  if (options.body) {
    (event as any)._body = options.body;
  }
  
  // Mock getQuery support
  if (options.query) {
    (event as any).query = options.query;
  }

  return event;
}
