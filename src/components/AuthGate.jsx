import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import BrandLogo from "./BrandLogo";
import { ShieldCheck, Lock, UserPlus, LogIn, Clock } from "lucide-react";

export default function AuthGate({ session, profile, onDemoLogin, onSignOut }) {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (session && profile && !profile.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-uni-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-uni-900 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Cuenta Pendiente de Validación
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
            Hola <span className="font-semibold">{profile.full_name}</span>. Tu
            solicitud de acceso a <strong>PEM Trainer</strong> ha sido
            registrada. Un administrador debe validar tu cuenta antes de
            ingresar.
          </p>
          <button
            onClick={onSignOut}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium hover:opacity-90 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setMessage({
        type: "error",
        text: "Configura tus variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env, o usa el Modo Demo local.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Registro exitoso. Espera a que el administrador apruebe tu cuenta.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 dark:from-uni-950 dark:via-uni-900 dark:to-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-uni-900 border border-blue-200/80 dark:border-blue-800/50 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3.5 mb-6">
          <BrandLogo className="w-12 h-12" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              PEM Trainer
            </h1>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Entrenamiento Matemático & Demostraciones
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Camila Rojas"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Correo Universitario / Personal
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="estudiante@universidad.cl"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                message.type === "error"
                  ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800"
                  : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition"
          >
            {isRegister ? (
              <>
                <UserPlus className="w-4 h-4" /> Solicitar Registro
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Ingresar a PEM Trainer
              </>
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage(null);
            }}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {isRegister
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿Nuevo estudiante? Solicita acceso"}
          </button>

          <span className="flex items-center gap-1 text-slate-400">
            <Lock className="w-3.5 h-3.5" /> Acceso Validado
          </span>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onDemoLogin}
            className="w-full py-2 px-3 rounded-xl border border-blue-300 dark:border-blue-700/70 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center gap-2 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            Entrar en Modo Demo Admin (Prueba Local)
          </button>
        </div>
      </div>
    </div>
  );
}