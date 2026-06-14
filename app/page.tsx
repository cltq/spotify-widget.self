"use client";

import { useEffect, useState, useCallback } from "react";

type SpotifyUser = {
  displayName: string;
  avatarUrl?: string;
  product?: string;
};

const SYSTEM_FONTS = ["system-ui", "sans-serif", "monospace", "serif"];
const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Poppins",
  "Lato",
  "Noto Sans",
  "Oswald",
  "Raleway",
  "Source Sans Pro",
];

export default function Home() {
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [bg, setBg] = useState("transparent");
  const [color, setColor] = useState("#ffffff");
  const [font, setFont] = useState("system-ui");
  const [size, setSize] = useState("md");
  const [showProgress, setShowProgress] = useState(true);
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetch("/api/spotify/user")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setUser(data);
      })
      .catch(() => {});
  }, []);

  const widgetUrl = `${origin}/widget?bg=${encodeURIComponent(bg)}&color=${encodeURIComponent(color)}&font=${encodeURIComponent(font)}&size=${size}&progress=${showProgress ? "bar" : "none"}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(widgetUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [widgetUrl]);

  return (
    <div className="flex min-h-dvh flex-col items-center gap-8 bg-zinc-950 p-8 pb-16 font-sans">
      <div className="flex flex-col items-center gap-4 pt-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Spotify Widget
        </h1>
        <p className="max-w-md text-center text-zinc-400">
          An OBS-ready widget that shows your currently playing Spotify track.
        </p>
      </div>

      {user && (
        <div className="flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2 text-sm">
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt=""
              className="size-6 rounded-full"
            />
          )}
          <span className="text-zinc-300">
            Connected as{" "}
            <strong className="text-white">{user.displayName}</strong>
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 text-center">
        <a
          href="/api/auth"
          className="rounded-full bg-green-500 px-6 py-3 font-medium text-white transition-colors hover:bg-green-400"
        >
          Connect Spotify
        </a>
      </div>

      <div className="flex w-full max-w-4xl flex-col gap-6 lg:flex-row">
        <div className="min-h-32 flex-1 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <iframe
            key={widgetUrl}
            src={widgetUrl}
            title="Widget Preview"
            className="h-full w-full"
            style={{ minHeight: 160 }}
          />
        </div>

        <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-6 lg:w-80">
          <h2 className="mb-4 font-semibold text-white">Customizer</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bg === "transparent" ? "#000000" : bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="size-7 cursor-pointer rounded border border-zinc-700 bg-transparent"
                />
                <button
                  onClick={() =>
                    setBg(bg === "transparent" ? "#000000" : "transparent")
                  }
                  className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
                >
                  {bg === "transparent" ? "Solid" : "Transparent"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400">Text Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="size-7 cursor-pointer rounded border border-zinc-700 bg-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400">Font</label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-36 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-300"
              >
                <optgroup label="System">
                  {SYSTEM_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Google Fonts">
                  {GOOGLE_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400">Size</label>
              <div className="flex gap-1">
                {["sm", "md", "lg"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded px-3 py-1 text-xs ${
                      size === s
                        ? "bg-green-600 text-white"
                        : "border border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400">Progress Bar</label>
              <button
                onClick={() => setShowProgress(!showProgress)}
                className={`rounded px-3 py-1 text-xs ${
                  showProgress
                    ? "bg-green-600 text-white"
                    : "border border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {showProgress ? "On" : "Off"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <input
              readOnly
              value={widgetUrl}
              className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300"
            />
            <button
              onClick={handleCopy}
              className="rounded bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <p className="max-w-md text-center text-xs text-zinc-600">
        This widget is designed for personal use only.{" "}
        <a
          href="https://github.com/cltq/spotify-widget.self"
          className="underline hover:text-zinc-400"
        >
          Fork it on GitHub
        </a>{" "}
        to make it your own.
      </p>
    </div>
  );
}
