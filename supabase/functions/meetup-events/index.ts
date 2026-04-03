import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MEETUP_URL =
  "https://www.meetup.com/break-ke-baad-bkb-divorced-indians/events/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const res = await fetch(MEETUP_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Meetup returned ${res.status}` }),
        { status: 502, headers: corsHeaders }
      );
    }

    const html = await res.text();
    const match = html.match(
      /__NEXT_DATA__"\s*type="application\/json">(.+?)<\/script>/
    );

    if (!match) {
      return new Response(
        JSON.stringify({ error: "Could not parse Meetup page" }),
        { status: 502, headers: corsHeaders }
      );
    }

    const data = JSON.parse(match[1]);
    const apollo = data?.props?.pageProps?.__APOLLO_STATE__;

    if (!apollo) {
      return new Response(
        JSON.stringify({ error: "No Apollo state found" }),
        { status: 502, headers: corsHeaders }
      );
    }

    // Extract events
    const events = Object.entries(apollo)
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
        (a: any, b: any) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );

    // Extract group info
    let group = null;
    const groupEntry = Object.entries(apollo).find(([key]) =>
      key.startsWith("Group:")
    );
    if (groupEntry) {
      const g = groupEntry[1] as any;
      group = {
        name: g.name ?? "",
        memberCount: g.stats?.memberCounts?.all ?? 0,
        rating: g.stats?.eventRatings?.average ?? 0,
        totalRatings: g.stats?.eventRatings?.total ?? 0,
      };
    }

    return new Response(JSON.stringify({ events, group }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Internal error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
