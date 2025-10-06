import type React from "react";

interface Props {
  children: React.ReactNode;
}

export default function Panel({ children }: Props) {
  return (
    <div className="flex w-90 rounded-4xl border border-white/40 bg-white/7 backdrop-blur-md">
      {children}
    </div>
  );
}
