"use client";

import { useEffect, useState } from "react";

type SpotifyUser = {
  displayName: string;
  avatarUrl?: string;
  product?: string;
};

export default function Home() {
  const [user, setUser] = useState<SpotifyUser | null>(null);

  useEffect(() => {
    fetch("/api/spotify/user")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setUser(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 p-8 font-sans">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Spotify Widget
      </h1>
      <p className="max-w-md text-center text-zinc-400">
        An OBS-ready widget that shows your currently playing Spotify track.
      </p>

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
            Connected as <strong className="text-white">{user.displayName}</strong>
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
        <a
          href="/widget"
          className="rounded-full border border-zinc-700 px-6 py-3 font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          View Widget
        </a>
      </div>

      <div className="mt-8 max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-sm">
        <h2 className="mb-2 font-semibold text-white">OBS Setup</h2>
        <ol className="ml-4 list-decimal space-y-1 text-zinc-400">
          <li>
            Add a <strong className="text-zinc-200">Browser Source</strong> in OBS
          </li>
          <li>
            Set URL to{" "}
            <code className="rounded bg-zinc-800 px-1 text-zinc-200">
              http://localhost:3000/widget
            </code>
          </li>
          <li>Set width to 400, height to 100</li>
          <li>
            Enable{" "}
            <strong className="text-zinc-200">
              Refresh browser when scene becomes active
            </strong>
          </li>
        </ol>
      </div>
    </div>
  );
}
