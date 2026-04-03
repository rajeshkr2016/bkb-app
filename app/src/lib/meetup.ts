const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://ywleqlcyxtalbxejniov.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export type MeetupEvent = {
  id: string;
  title: string;
  dateTime: string;
  endTime: string | null;
  going: number;
  maxTickets: number;
  eventType: "PHYSICAL" | "ONLINE";
  eventUrl: string;
  description: string;
  fee: string | null;
  status: string;
};

export type MeetupGroup = {
  name: string;
  memberCount: number;
  rating: number;
  totalRatings: number;
};

type FetchResult = {
  events: MeetupEvent[];
  group: MeetupGroup | null;
};

export async function fetchMeetupEvents(): Promise<FetchResult> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/meetup-events`, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fetch failed (${res.status}): ${body}`);
  }

  const data = await res.json();

  if (data.error) throw new Error(data.error);

  return {
    events: data.events ?? [],
    group: data.group ?? null,
  };
}

export function formatEventDate(dateTime: string): { month: string; day: string; full: string } {
  const d = new Date(dateTime);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return {
    month: months[d.getMonth()],
    day: String(d.getDate()),
    full: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
}

export function formatEventTime(dateTime: string): string {
  return new Date(dateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function isHikingEvent(event: MeetupEvent): boolean {
  const text = `${event.title} ${event.description}`.toLowerCase();
  return (
    text.includes("hike") ||
    text.includes("hiking") ||
    text.includes("trail") ||
    text.includes("trek")
  );
}
