import { NextRequest, NextResponse } from 'next/server';
import genkitNext from '@genkit-ai/next';

// TODO: Replace with your actual import of your Genkit action or flow
// import { yourActionOrFlow } from './path/to/your/action';

// Placeholder - replace null with your actual imported action or flow
// The type 'any' is used here as a placeholder. Replace it with the actual type of your action/flow.
const myActionOrFlow: any = null as any; // This is the Genkit Action or Flow

// genkitNext is a higher-order function that takes a Genkit Action or Flow
// and returns a Next.js API route handler function.
// @ts-ignore // Ignoring type check for genkitNext as the placeholder type is 'any'
const genkitHandler = genkitNext(myActionOrFlow);

export async function GET(
  req: NextRequest,
  context: { params: { slug: string[] } }
): Promise<NextResponse<unknown>> {
  // Call the handler returned by genkitNext
  // @ts-ignore // genkitHandler's type can be complex, ignoring for simplicity.
  const response = await genkitHandler(req, context);

  return response;
}

export async function POST(
  req: NextRequest,
  context: { params: { slug: string[] } }
): Promise<NextResponse<unknown>> {
  // Call the handler returned by genkitNext
  // @ts-ignore // genkitHandler's type can be complex, ignoring for simplicity.
  const response = await genkitHandler(req, context);

  return response;
}
