/**
 * This file configures a Genkit-instrumented Next.js API route handler.
 *
 * It supports the Genkit developer UI and related features.
 * It exports GET and POST handlers that delegate to the Genkit Next.js plugin.
 * It also exports Next.js config settings that enable streaming and disable caching.
 * This allows Genkit flows to work properly in Next.js.
 *
 * See: https://genkit.dev/docs/tools-and-integrations/nextjs
 */
import { genkitNext } from '@genkit-ai/next';
export const { GET, POST } = genkitNext();

// Required for Genkit streaming; see https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
export const experimental_runtime = 'nodejs';

// Recommended to disable caching; see https://genkit.dev/docs/tools-and-integrations/nextjs#disable-caching
export const dynamic = 'force-dynamic';
