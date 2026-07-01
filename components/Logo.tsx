import React from "react";

export function LogoIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Chevron Gradients */}
        <linearGradient id="logo-chevron-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Play Button Gradients */}
        <linearGradient id="logo-play-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>

        {/* Swoosh Gradients */}
        <linearGradient id="logo-swoosh-grad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="60%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* 1. Purple Chevron at Top */}
      <path
        d="M 70 65 L 100 35 L 130 65 L 130 80 L 100 50 L 70 80 Z"
        fill="url(#logo-chevron-grad)"
      />

      {/* 2. Cyan-to-Purple Swoosh/Wave Ribbon wrapping around */}
      <path
        d="M 50 140 C 60 140, 80 140, 95 125 C 110 110, 115 85, 115 80 C 115 80, 105 100, 90 110 C 75 120, 60 120, 50 120 Z M 50 140 C 75 140, 105 140, 125 120 C 145 100, 140 75, 140 70 C 140 70, 148 95, 130 115 C 112 135, 75 145, 50 140 Z"
        fill="url(#logo-swoosh-grad)"
      />

      {/* 3. Play Button icon */}
      <path
        d="M 102 85 C 102 81, 106 79, 109 81 L 137 98 C 140 100, 140 105, 137 107 L 109 124 C 106 126, 102 124, 102 120 Z"
        fill="url(#logo-play-grad)"
      />
    </svg>
  );
}

export function LogoText({ showSub = true }: { showSub?: boolean }) {
  return (
    <div className="flex flex-col justify-center leading-none">
      <span className="font-sans font-black tracking-tight text-white text-lg">
        U-
        <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          FORWARD
        </span>
      </span>
      {showSub && (
        <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-zinc-500 mt-0.5">
          ACADEMY
        </span>
      )}
    </div>
  );
}

export default function Logo({ className = "h-10 w-10", showSub = true }: { className?: string; showSub?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <LogoIcon className={className} />
      <LogoText showSub={showSub} />
    </div>
  );
}
