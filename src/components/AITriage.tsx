"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  HeartPulse,
  LoaderCircle,
  Send,
  ShieldAlert,
  WifiOff,
} from "lucide-react";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

type OfflineProtocol = {
  keywords: string[];
  response: string;
};

const offlineProtocols: OfflineProtocol[] = [
  {
    keywords: ["bleeding", "bleed", "cut"],
    response:
      "BLEEDING / CUT:\n1. Call your local emergency number for severe bleeding.\n2. Apply firm, continuous pressure with clean cloth or gauze; add more material if it soaks through.\n3. Do not remove an embedded object. Get urgent medical care for severe bleeding or a deep wound.",
  },
  {
    keywords: ["water", "purify", "thirst"],
    response:
      "WATER:\n1. Prefer sealed bottled water or an official safe-water source.\n2. If advised and the water is not chemically contaminated, bring it to a rolling boil for 1 minute (3 minutes above 6,500 ft / 2,000 m).\n3. Boiling does not remove chemicals or fuel; do not drink water with a chemical smell or sheen.",
  },
  {
    keywords: ["fire", "smoke", "flame"],
    response:
      "FIRE / SMOKE:\n1. Leave immediately if you can do so safely; stay low under smoke and use stairs, not elevators.\n2. Close doors behind you. Do not re-enter.\n3. Call your local emergency number from a safe location. If trapped, signal from a window.",
  },
  {
    keywords: ["trapped", "stuck", "debris", "rubble"],
    response:
      "TRAPPED:\n1. Call your local emergency number if possible, especially if there is fire, gas, or structural movement.\n2. Cover your nose and mouth from dust with cloth; conserve phone battery and share your location by text.\n3. Tap on a pipe or wall to signal. Do not move heavy debris or use a flame.",
  },
  {
    keywords: ["cpr", "cardiac arrest", "not breathing"],
    response:
      "CPR:\n1. Call your local emergency number and ask someone to get an AED.\n2. If the person is unresponsive and not breathing normally, begin firm, fast chest compressions in the center of the chest (100–120 per minute).\n3. Use the AED as soon as available and follow its prompts. Follow dispatcher instructions.",
  },
  {
    keywords: ["choking", "choke"],
    response:
      "CHOKING:\n1. If the person can cough or speak, encourage them to keep coughing and watch closely.\n2. If they cannot breathe, speak, or cough, call your local emergency number and follow dispatcher instructions. Use age-appropriate choking first aid only if trained.\n3. Do not do a blind finger sweep. If they become unresponsive, begin CPR and follow dispatcher guidance.",
  },
  {
    keywords: ["gas leak", "gas smell", "smell gas", "propane leak"],
    response:
      "GAS LEAK:\n1. Leave the area immediately; do not use flames, electrical switches, appliances, or phones inside.\n2. From well away, call your local emergency number or gas utility.\n3. Keep others away and do not return until authorities say it is safe.",
  },
  {
    keywords: ["hypothermia", "very cold", "cold exposure"],
    response:
      "HYPOTHERMIA:\n1. Call your local emergency number for confusion, extreme drowsiness, or severe cold exposure.\n2. Move the person to shelter, remove wet clothing, and cover them with dry layers.\n3. Warm the center of the body gently. Do not use direct high heat or rub the person's limbs.",
  },
  {
    keywords: ["heatstroke", "heat stroke", "overheated"],
    response:
      "HEATSTROKE:\n1. Call your local emergency number immediately for confusion, fainting, seizure, or very hot skin.\n2. Move the person to a cooler place and cool them rapidly with cool water, wet cloths, or fanning.\n3. Stay with them. Do not give anything to drink if they are confused, unconscious, or unable to swallow.",
  },
  {
    keywords: ["downed power lines", "power line", "electrical wire", "fallen wire"],
    response:
      "DOWNED POWER LINES:\n1. Stay at least 35 feet (10 meters) away; the ground and nearby objects may be energized.\n2. Do not touch the line, anything it contacts, or anyone in contact with it.\n3. Call your local emergency number or utility from a safe location and wait for responders.",
  },
  {
    keywords: ["flood", "floodwater"],
    response:
      "FLOOD SAFETY:\n1. Move to higher ground and follow evacuation instructions.\n2. Never walk, swim, or drive through floodwater; turn around and find another route.\n3. Avoid downed power lines and return only when authorities say it is safe.",
  },
  {
    keywords: ["earthquake", "aftershock"],
    response:
      "EARTHQUAKE:\n1. Drop, cover, and hold on. Protect your head and neck; stay away from windows.\n2. If indoors, stay inside until shaking stops; do not use elevators.\n3. Expect aftershocks, check for hazards, and follow local emergency instructions.",
  },
  {
    keywords: ["signal for help", "signal help", "attract attention", "rescue signal"],
    response:
      "SIGNAL FOR HELP:\n1. If possible, call your local emergency number and share your location; send a text if calls fail.\n2. Use a whistle, flashlight, or bright cloth to signal in repeated intervals from a safe place.\n3. Conserve phone battery and avoid entering hazardous areas to seek help.",
  },
  {
    keywords: ["shelter in place", "stay indoors", "indoors safely"],
    response:
      "SHELTER IN PLACE:\n1. Go indoors, close and lock doors and windows, and move away from glass.\n2. Follow official alerts; if instructed, turn off ventilation bringing outside air in.\n3. Keep your phone charged and emergency supplies nearby. Evacuate only when authorities direct you or the location becomes unsafe.",
  },
];

const quickReplies = [
  "I'm bleeding",
  "Water purification",
  "I'm trapped",
  "Fire safety",
  "CPR instructions",
  "Choking relief",
  "Gas leak response",
  "Hypothermia signs",
  "Heatstroke treatment",
  "Downed power lines",
  "Flood safety",
  "Earthquake safety",
  "Signal for help",
  "Shelter in place",
];

function getOfflineProtocol(prompt: string): string {
  const normalized = prompt.toLowerCase();
  const match = offlineProtocols.find((protocol) =>
    protocol.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return (
    match?.response ??
    "Offline mode: I don't have a local protocol for that. Please try one of the suggested prompts or seek immediate help."
  );
}

async function askGemini(prompt: string): Promise<string> {
  const response = await fetch("/api/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    const message =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : `Triage request failed with status ${response.status}.`;
    throw new Error(message);
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("answer" in result) ||
    typeof result.answer !== "string" ||
    !result.answer.trim()
  ) {
    throw new Error("The triage server returned an invalid response.");
  }

  return result.answer.trim();
}

export function AITriage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      text: "I’m here to help with basic emergency guidance. What’s happening right now?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [usingLocalProtocols, setUsingLocalProtocols] = useState(false);
  const [connectionNote, setConnectionNote] = useState("");
  const nextId = useRef(1);
  const endOfMessages = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function sendPrompt(value: string) {
    const prompt = value.trim();
    if (!prompt || isSending) return;

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: "user",
      text: prompt,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);
    setConnectionNote("");

    if (!navigator.onLine) {
      setUsingLocalProtocols(true);
      const answerId = nextId.current++;
      setMessages((current) => [
        ...current,
        {
          id: answerId,
          role: "assistant",
          text: getOfflineProtocol(prompt),
        },
      ]);
      setIsSending(false);
      return;
    }

    setUsingLocalProtocols(false);
    try {
      const answer = await askGemini(prompt);
      const answerId = nextId.current++;
      setMessages((current) => [
        ...current,
        { id: answerId, role: "assistant", text: answer },
      ]);
    } catch (error) {
      console.error("AI triage request failed; using local protocol.", error);
      setUsingLocalProtocols(true);
      setConnectionNote(
        "Couldn’t reach the assistant. Showing local guidance instead.",
      );
      const answerId = nextId.current++;
      setMessages((current) => [
        ...current,
        {
          id: answerId,
          role: "assistant",
          text: getOfflineProtocol(prompt),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendPrompt(input);
  }

  return (
    <section
      aria-labelledby="triage-heading"
      className="mx-auto flex min-h-[min(72vh,46rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#171a1d] shadow-2xl shadow-black/30"
    >
      <header className="border-b border-slate-800 bg-[#1d2023] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-red-950 text-red-300">
            <HeartPulse aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h1 id="triage-heading" className="text-xl font-black text-white">
              AI Triage Assistant
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              General guidance for urgent situations
            </p>
          </div>
        </div>
        {!isOnline && (
          <div className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-amber-700/70 bg-amber-950/60 px-3 py-1.5 text-xs font-bold text-amber-200">
            <WifiOff aria-hidden="true" className="size-4" />
            Offline Mode: Using local protocols
          </div>
        )}
        {connectionNote && (
          <p role="status" className="mt-3 text-sm text-amber-200">
            {connectionNote}
          </p>
        )}
      </header>

      <div
        aria-live="polite"
        aria-label="Conversation"
        className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <span className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-amber-300">
                    <Bot aria-hidden="true" className="size-4" />
                  </span>
                )}
                <p
                  className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 sm:text-base ${
                    isUser
                      ? "rounded-br-md bg-red-800 text-white"
                      : "rounded-bl-md border border-slate-700 bg-[#23272b] text-slate-100"
                  }`}
                >
                  {message.text}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isSending && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Preparing guidance…
          </div>
        )}
        <div ref={endOfMessages} />
      </div>

      <div className="border-t border-slate-800 bg-[#1d2023] p-4 sm:p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Quick prompts
        </p>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              disabled={isSending}
              onClick={() => void sendPrompt(reply)}
              className="min-h-11 shrink-0 rounded-full border border-amber-700/60 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-amber-500 hover:bg-amber-950/40 hover:text-amber-200 disabled:opacity-50"
            >
              {reply}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <label className="sr-only" htmlFor="triage-prompt">
            Describe the emergency
          </label>
          <textarea
            id="triage-prompt"
            rows={2}
            maxLength={1000}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tell me what’s happening…"
            className="min-h-12 min-w-0 flex-1 resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            aria-label="Send message"
            className="inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send aria-hidden="true" className="size-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Not a substitute for emergency services. In immediate danger, call
          your local emergency number.
        </p>
        {isOnline && (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Online prompts are sent to Gemini. Don’t include names, addresses,
            or other sensitive personal information.
          </p>
        )}
        {usingLocalProtocols && isOnline && (
          <p className="mt-2 flex items-center gap-1 text-xs text-amber-300">
            <Check aria-hidden="true" className="size-3" />
            Local fallback protocol used
          </p>
        )}
      </div>
    </section>
  );
}
