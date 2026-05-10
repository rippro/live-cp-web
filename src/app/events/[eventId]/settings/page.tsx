"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface EventData {
  id: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { session } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json() as Promise<EventData>)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  const canEdit = session?.role === "admin";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-rp-100 mb-6">Settings</h1>

      {loading ? (
        <div className="card-surface p-8 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-rp-400 border-t-transparent" />
        </div>
      ) : !event ? (
        <div className="card-surface p-8 text-center">
          <p className="text-rp-muted">イベントが見つかりません</p>
        </div>
      ) : (
        <div className="card-surface p-6 space-y-5">
          <div>
            <label htmlFor="settings-event-id" className="block text-xs text-rp-muted mb-1.5">
              Event ID
            </label>
            <input
              id="settings-event-id"
              className="input-field opacity-60 cursor-not-allowed"
              value={event.id}
              readOnly
            />
          </div>
          {!canEdit && (
            <p className="text-xs text-rp-muted pt-2">設定の変更は Admin のみ可能です</p>
          )}
        </div>
      )}
    </div>
  );
}
