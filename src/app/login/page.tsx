"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Senha incorreta.");
        setLoading(false);
      }
    } catch {
      setError("Erro de conexão.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🎱</span>
          <h1 className="mt-4 text-xl font-bold">Bingo — Admin</h1>
          <p className="text-white/40 text-sm mt-1">Acesso restrito ao organizador</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/3 p-6 flex flex-col gap-4"
        >
          <div>
            <label className="block text-xs text-white/50 mb-2 uppercase tracking-widest">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              placeholder="••••••••"
              className="w-full bg-white/8 rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-amber-400/50 transition-colors placeholder:text-white/20"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-bold hover:from-amber-300 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-white/20 mt-4">
          Participantes entram em{" "}
          <span className="text-white/40">/view</span>
        </p>
      </div>
    </div>
  );
}
