"use client";

import { useEffect, useState } from "react";

type SpotifyStatus = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  progressMs?: number;
  durationMs?: number;
  trackUrl?: string;
};

export default function WidgetPage() {
  const [status, setStatus] = useState<SpotifyStatus | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/spotify");
        if (res.ok) {
          setStatus(await res.json());
        }
      } catch {
        // ignore
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const isPaused = status && !status.isPlaying && status.title;

  return (
    <div className="flex items-center gap-4 p-4">
      {status?.albumImageUrl && (
        <img
          src={status.albumImageUrl}
          alt={status.album ?? ""}
          className="size-16 rounded-lg object-cover shadow-lg"
        />
      )}
      <div className="min-w-0">
        {status?.isPlaying || isPaused ? (
          <>
            <p className="truncate text-base font-semibold text-white">
              {status?.title}
            </p>
            <p className="truncate text-sm text-white/70">
              {status?.artist}
            </p>
            {isPaused && (
              <p className="mt-0.5 text-xs text-white/40">Paused</p>
            )}
          </>
        ) : (
          <p className="text-sm text-white/50">Nothing playing</p>
        )}
      </div>
    </div>
  );
}
