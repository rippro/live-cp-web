import { GlobalNav } from "@/components/nav/GlobalNav";
import { EventNav } from "@/components/nav/EventNav";

interface EventLayoutProps {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { eventId: _rawEventId } = await params;
  const eventId = decodeURIComponent(_rawEventId);

  return (
    <>
      <GlobalNav />
      <EventNav eventId={eventId} />
      <main className="min-h-screen bg-rp-900 pt-[108px]">
        {children}
      </main>
    </>
  );
}
