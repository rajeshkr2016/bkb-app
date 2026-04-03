const MEETUP_GROUP_SLUG = "break-ke-baad-bkb-divorced-indians";
const MEETUP_EVENTS_URL = `https://www.meetup.com/${MEETUP_GROUP_SLUG}/events/`;

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
  const res = await fetch(MEETUP_EVENTS_URL);
  if (!res.ok) throw new Error(`Meetup fetch failed: ${res.status}`);

  const html = await res.text();

  const match = html.match(
    /__NEXT_DATA__"\s*type="application\/json">(.+?)<\/script>/
  );
  if (!match) throw new Error("Could not find __NEXT_DATA__ in Meetup page");

  const data = JSON.parse(match[1]);
  const apollo = data?.props?.pageProps?.__APOLLO_STATE__;
  if (!apollo) throw new Error("Could not find Apollo state in Meetup data");

  // Extract events
  const events: MeetupEvent[] = Object.entries(apollo)
    .filter(([key]) => key.startsWith("Event:"))
    .map(([, value]: [string, any]) => ({
      id: value.id,
      title: value.title,
      dateTime: value.dateTime,
      endTime: value.endTime ?? null,
      going: value.going?.totalCount ?? 0,
      maxTickets: value.maxTickets ?? 0,
      eventType: value.eventType ?? "PHYSICAL",
      eventUrl: value.eventUrl ?? "",
      description: value.description ?? "",
      fee: value.feeSettings?.amount
        ? `$${value.feeSettings.amount}`
        : null,
      status: value.status ?? "ACTIVE",
    }))
    .sort(
      (a, b) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

  // Extract group info
  let group: MeetupGroup | null = null;
  const groupEntry = Object.entries(apollo).find(([key]) =>
    key.startsWith("Group:")
  );
  if (groupEntry) {
    const g = groupEntry[1] as any;
    group = {
      name: g.name ?? MEETUP_GROUP_SLUG,
      memberCount: g.stats?.memberCounts?.all ?? 0,
      rating: g.stats?.eventRatings?.average ?? 0,
      totalRatings: g.stats?.eventRatings?.total ?? 0,
    };
  }

  return { events, group };
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
