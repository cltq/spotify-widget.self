"use client";

import { useEffect, useState, useRef } from "react";

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

type WidgetParams = {
  bg: string;
  color: string;
  font: string;
  progress: string;
  size: string;
};

function useParams(): WidgetParams {
  if (typeof window === "undefined") {
    return {
      bg: "transparent",
      color: "#ffffff",
      font: "system-ui",
      progress: "bar",
      size: "md",
    };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    bg: p.get("bg") ?? "transparent",
    color: p.get("color") ?? "#ffffff",
    font: p.get("font") ?? "system-ui",
    progress: p.get("progress") ?? "bar",
    size: p.get("size") ?? "md",
  };
}

const sizeMap: Record<string, { img: number; title: string; artist: string }> =
  {
    sm: { img: 12, title: "text-sm", artist: "text-xs" },
    md: { img: 16, title: "text-base", artist: "text-sm" },
    lg: { img: 20, title: "text-lg", artist: "text-base" },
  };

export default function WidgetPage() {
  const [status, setStatus] = useState<SpotifyStatus | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [animating, setAnimating] = useState(false);
  const prevTitleRef = useRef<string | undefined>(undefined);
  const params = useParams();

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/spotify");
        if (res.ok) {
          const data: SpotifyStatus = await res.json();
          setStatus((prev) => {
            if (prev?.title && data.title && prev.title !== data.title) {
              setAnimating(true);
              setTimeout(() => setAnimating(false), 500);
            }
            return data;
          });
        }
      } catch {
        // noop
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!status?.isPlaying || !status?.progressMs) return;

    const title = status.title ?? "";
    if (title !== prevTitleRef.current) {
      prevTitleRef.current = title;
      setElapsed(status.progressMs);
    }

    const tick = setInterval(() => {
      setElapsed((prev) => prev + 1000);
    }, 1000);

    return () => clearInterval(tick);
  }, [status?.title, status?.trackUrl, status?.isPlaying, status?.progressMs]);

  const isPaused = status && !status.isPlaying && status.title;
  const dims = sizeMap[params.size] ?? sizeMap.md;
  const progress =
    params.progress === "bar" &&
    status?.durationMs &&
    (status.isPlaying || isPaused)
      ? Math.min((elapsed / status.durationMs) * 100, 100)
      : null;

  return (
    <div
      style={{
        background: params.bg,
        color: params.color,
        fontFamily: params.font,
      }}
      className={`flex items-center gap-3 p-4 transition-opacity duration-500 ${
        animating ? "opacity-0" : "opacity-100"
      }`}
    >
      {status?.albumImageUrl && (
        <img
          src={status.albumImageUrl}
          alt={status.album ?? ""}
          className="rounded-lg object-cover shadow-lg transition-transform duration-500"
          style={{ width: dims.img * 4, height: dims.img * 4 }}
        />
      )}
      <div className="min-w-0 flex-1">
        {status?.isPlaying || isPaused ? (
          <>
            <p
              className={`truncate font-semibold ${dims.title}`}
              style={{ color: params.color }}
            >
              {status?.title}
            </p>
            <p
              className={`truncate ${dims.artist}`}
              style={{ color: params.color, opacity: 0.7 }}
            >
              {status?.artist}
            </p>
            {isPaused && (
              <p
                className="mt-0.5 text-xs"
                style={{ color: params.color, opacity: 0.4 }}
              >
                Paused
              </p>
            )}
            {progress !== null && (
              <div
                className="mt-1.5 h-1 w-full overflow-hidden rounded-full"
                style={{ background: `${params.color}22` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${progress}%`,
                    background: params.color,
                    opacity: status?.isPlaying ? 1 : 0.4,
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <p
            className={dims.artist}
            style={{ color: params.color, opacity: 0.5 }}
          >
            Nothing playing
          </p>
        )}
      </div>
    </div>
  );
}
