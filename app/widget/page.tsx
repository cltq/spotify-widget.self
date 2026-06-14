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

type ScriptFont = {
  family: string;
  test: RegExp;
};

const SCRIPT_FONTS: ScriptFont[] = [
  { family: "Chakra Petch", test: /[\u0E00-\u0E7F]/ },
  { family: "Noto Sans JP", test: /[\u3040-\u309F\u30A0-\u30FF]/ },
  { family: "Noto Sans SC", test: /[\u4E00-\u9FFF]/ },
  { family: "Noto Sans KR", test: /[\uAC00-\uD7AF]/ },
  { family: "Noto Sans Arabic", test: /[\u0600-\u06FF]/ },
  { family: "Noto Sans Devanagari", test: /[\u0900-\u097F]/ },
];

function detectFont(text: string, fallback: string): string {
  for (const sf of SCRIPT_FONTS) {
    if (sf.test.test(text)) return sf.family;
  }
  return fallback;
}

function loadGoogleFont(font: string) {
  const id = `gf-${font.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const family = font.replace(/ /g, "+");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
}

function msToTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
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

  const text = [status?.title, status?.artist].filter(Boolean).join(" ");
  const activeFont = detectFont(text, params.font);

  useEffect(() => {
    loadGoogleFont(activeFont);
  }, [activeFont]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.background = params.bg;
    document.body.style.background = params.bg;
  }, [params.bg]);

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
  const showBar =
    params.progress === "bar" &&
    status?.durationMs &&
    (status.isPlaying || isPaused);
  const progress = showBar
    ? Math.min((elapsed / status.durationMs!) * 100, 100)
    : null;

  return (
    <div
      style={{
        background: params.bg,
        color: params.color,
        fontFamily: activeFont,
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
            {showBar && (
              <div className="mt-1.5 flex w-1/2 items-center gap-2">
                <div
                  className="flex-1 overflow-hidden rounded-full"
                  style={{
                    height: 3,
                    background: `${params.color}22`,
                  }}
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
                <span
                  className="shrink-0 text-xs tabular-nums"
                  style={{ color: params.color, opacity: 0.5 }}
                >
                  {msToTime(elapsed)}/{msToTime(status?.durationMs ?? 0)}
                </span>
              </div>
            )}
            {isPaused && !showBar && (
              <p
                className="mt-0.5 text-xs"
                style={{ color: params.color, opacity: 0.4 }}
              >
                Paused
              </p>
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
