"use client";

import { Save } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface EventData {
  id: string;
  startsAt: string;
}

export default function SettingsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { session } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json() as Promise<EventData>)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  async function save() {
    if (!event) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          startsAt: event.startsAt,
        }),
      });
      if (!res.ok) throw new Error("保存失敗");
      setMsg("保存しました");
    } catch {
      setMsg("エラー: 保存できませんでした");
    } finally {
      setSaving(false);
    }
  }

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
          <div>
            <label htmlFor="settings-starts-at" className="block text-xs text-rp-muted mb-1.5">
              開始日時
            </label>
            <input
              id="settings-starts-at"
              type="datetime-local"
              className="input-field"
              value={event.startsAt.slice(0, 16)}
              onChange={(e) =>
                canEdit &&
                setEvent((ev) =>
                  ev ? { ...ev, startsAt: new Date(e.target.value).toISOString() } : ev,
                )
              }
              disabled={!canEdit}
            />
          </div>
          {canEdit && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="btn-primary inline-flex items-center gap-1.5"
              >
                <Save aria-hidden="true" size={15} />
                {saving ? "保存中..." : "変更を保存"}
              </button>
              {msg && (
                <p
                  className={`text-sm ${msg.startsWith("エラー") ? "text-rp-accent" : "text-rp-success"}`}
                >
                  {msg}
                </p>
              )}
            </div>
          )}
          {!canEdit && (
            <p className="text-xs text-rp-muted pt-2">設定の変更は Admin のみ可能です</p>
          )}
        </div>
      )}
    </div>
  );
}
