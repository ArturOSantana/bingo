"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Theme } from "@/hooks/useTheme";

interface QRShareProps {
  theme?: Theme;
}

export function QRShare({ theme = "dark" }: QRShareProps) {
  const [viewUrl, setViewUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    const base = window.location.origin;
    setViewUrl(`${base}/view`);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(viewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!viewUrl) return null;

  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-3 ${isDark ? "border-white/8 bg-white/3" : "border-gray-200 bg-white"}`}>
      <p className={`text-xs uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-400"}`}>Compartilhar</p>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl p-3">
          <QRCodeSVG
            value={viewUrl}
            size={148}
            bgColor="#ffffff"
            fgColor="#0f0f13"
            level="M"
          />
        </div>
      </div>

      {/* URL + botão copiar */}
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors group w-full
          ${isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}
      >
        <span className={`flex-1 text-xs truncate text-left font-mono ${isDark ? "text-white/40" : "text-gray-400"}`}>
          {viewUrl}
        </span>
        <span className={`text-xs font-medium shrink-0 transition-colors ${copied ? "text-emerald-500" : isDark ? "text-white/30 group-hover:text-white/60" : "text-gray-400 group-hover:text-gray-700"}`}>
          {copied ? "✓ copiado" : "copiar"}
        </span>
      </button>

      <p className={`text-[11px] text-center leading-relaxed ${isDark ? "text-white/25" : "text-gray-400"}`}>
        Participantes escaneiam o QR ou abrem o link no celular
      </p>
    </div>
  );
}
