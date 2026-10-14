import { NextResponse } from "next/server";

const TRIAGE_INSTRUCTIONS =
  "You are EcoPulse, a cautious emergency first-aid and disaster survival assistant. Give short, calm, actionable general guidance. For immediate danger or life-threatening symptoms, tell the user to contact their local emergency number now and follow dispatcher instructions. Do not diagnose, claim to replace a professional, or recommend risky procedures. State uncertainty and ask one essential follow-up question when needed.";

function getAnswer(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("candidates" in value)) {
    return null;
  }

  const candidates = value.candidates;
  if (!Array.isArray(candidates)) return null;

  const firstCandidate: unknown = candidates[0];
  if (
    typeof firstCandidate !== "object" ||
    firstCandidate === null ||
    !("content" in firstCandidate)
  ) {
    return null;
  }

  const content = firstCandidate.content;
  if (typeof content !== "object" || content === null || !("parts" in content)) {
    return null;
  }

  const parts = content.parts;
  if (!Array.isArray(parts)) return null;

  const text = parts
    .flatMap((part: unknown) => {
      if (
        typeof part !== "object" ||
        part === null ||
        !("text" in part) ||
        typeof part.text !== "string"
      ) {
        return [];
      }
      return [part.text];
    })
    .join("")
    .trim();

  return text || null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("prompt" in body) ||
    typeof body.prompt !== "string" ||
    body.prompt.trim().length === 0 ||
    body.prompt.length > 1000
  ) {
    return NextResponse.json(
      { error: "Prompt must be a non-empty string of at most 1000 characters." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini is not configured on the server." },
      { status: 503 },
    );
  }

  const endpoint = new URL(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  );
  endpoint.searchParams.set("key", apiKey);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: request.signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: TRIAGE_INSTRUCTIONS }],
        },
        contents: [
          { role: "user", parts: [{ text: body.prompt.trim() }] },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 400,
        },
      }),
    });

    if (!response.ok) {
      console.error(
        "Gemini triage provider returned an error status:",
        response.status,
      );
      return NextResponse.json(
        { error: "The triage assistant is temporarily unavailable." },
        { status: 502 },
      );
    }

    const result: unknown = await response.json();
    const answer = getAnswer(result);
    if (!answer) {
      console.error("Gemini triage provider returned no usable answer.");
      return NextResponse.json(
        { error: "The triage assistant returned no guidance." },
        { status: 502 },
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Gemini triage request failed.", error);
    return NextResponse.json(
      { error: "The triage assistant is temporarily unavailable." },
      { status: 502 },
    );
  }
}
