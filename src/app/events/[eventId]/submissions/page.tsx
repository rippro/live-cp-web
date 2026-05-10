import { redirect } from "next/navigation";

export default function SubmissionsPage({ params }: { params: { eventId: string } }) {
  redirect(`/events/${params.eventId}/problems`);
}
