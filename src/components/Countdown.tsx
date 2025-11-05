import { differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";

export default function Countdown({ iso }: { iso: string }) {
  const [sec, setSec] = useState(() =>
    Math.max(0, differenceInSeconds(new Date(iso), new Date()))
  );
  useEffect(() => {
    const t = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return <div className="text-center text-2xl">{d}d {h}h {m}m {s}s</div>;
}