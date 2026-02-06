import { z } from 'zod';
import { insertQuoteSchema, quotes } from './schema';

// ============================================
// API CONTRACT
// ============================================
export const api = {
  quotes: {
    list: {
      method: 'GET' as const,
      path: '/api/quotes',
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof quotes.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/quotes/:id',
      responses: {
        200: z.custom<typeof quotes.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    random: {
      method: 'GET' as const,
      path: '/api/quotes/random',
      input: z.object({
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.custom<typeof quotes.$inferSelect>(),
      },
    },
    // Admin only - populate DB
    create: {
      method: 'POST' as const,
      path: '/api/quotes',
      input: insertQuoteSchema,
      responses: {
        201: z.custom<typeof quotes.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
