"use client";

import { useEffect, useState } from "react";

type DashboardFrameProps = {
  slug: string;
  title: string;
};

const MIN_HEIGHT = 420;
const MAX_HEIGHT = 3600;

export function DashboardFrame({ slug, title }: DashboardFrameProps) {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || data.type !== "dashboard:height" || data.slug !== slug) return;

      const nextHeight = Number(data.height);
      if (!Number.isFinite(nextHeight)) return;

      setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(nextHeight))));
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [slug]);

  return (
    <iframe
      className="dashboard"
      src={`/app/view/${slug}`}
      style={height ? { height } : undefined}
      title={title}
    />
  );
}
