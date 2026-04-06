"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [clinicName, setClinicName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://clinic-saas-lp.vercel.app/api/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planName: "頭痛専門アプリ3点セット",
            email,
            clinicName,
            ownerName: name,
            amount: 3980,
            paymentType: "monthly",
            selectedApps: ["headache-monshin"],
          }),
        }
      );

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("決済ページの取得に失敗しました。もう一度お試しください。");
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
      <div>
        <label
          htmlFor="clinicName"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          院名 <span className="text-red-500">*</span>
        </label>
        <input
          id="clinicName"
          type="text"
          required
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          placeholder="例）大口神経整体院"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-slate-800 placeholder:text-slate-400"
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          担当者名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例）大口 陽平"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-slate-800 placeholder:text-slate-400"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="例）info@example.com"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            処理中...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            申し込む
          </>
        )}
      </button>

      <p className="text-xs text-center text-slate-500">
        お申し込み後、Stripeの安全な決済ページに移動します
      </p>
    </form>
  );
}
