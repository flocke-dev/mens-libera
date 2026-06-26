export async function POST(req) {
  const { text } = await req.json();

  if (!process.env.ELEVENLABS_API_KEY) {
    return new Response(JSON.stringify({ error: "no_key" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "elevenlabs_error" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "fetch_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
