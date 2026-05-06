import Anthropic from "@anthropic-ai/sdk";

export async function POST(req) {
  const { messages, max_tokens } = await req.json();
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: max_tokens || 1500,
    messages,
  });
  return Response.json(response);
}
