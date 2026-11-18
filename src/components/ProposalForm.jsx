import React, { useState, useEffect } from "react";
import { CURRICULUM } from "../data/curriculum";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import MathText from "./MathText";
import {
  Lightbulb,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Eye,
} from "lucide-react";

export default function ProposalForm({
  profile,
  curriculum = CURRICULUM,
  onLocalProposalAdded,
}) {
  const [course, setCourse] = useState(curriculum[0]?.course || "");
  const [topic, setTopic] = useState(curriculum[0]?.topics?.[0] || "General");
  const [difficulty, setDifficulty] = useState("Intermedio");
  const [statement, setStatement] = useState("");
  const [steps, setSteps] = useState([
    { title: "Planteamiento y teoremas", content: "" },
  ]);
  const [answer, setAnswer] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState(null);

  useEffect(() => {
    const found = curriculum.find((c) => c.course === course);
    if (!found && curriculum.length > 0) {
      setCourse(curriculum[0].course);
      setTopic(curriculum[0].topics?.[0] || "General");
    } else if (
      found &&
      found.topics.length > 0 &&
      !found.topics.includes(topic)
    ) {
      setTopic(found.topics[0]);
    } else if (found && found.topics.length === 0 && !topic) {
      setTopic("General");
    }
  }, [curriculum, course, topic]);

  const currentCourseTopics =
    curriculum.find((c) => c.course === course)?.topics || [];

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      { title: `Paso ${prev.length + 1}`, content: "" },
    ]);
  };

  const handleRemoveStep = (index) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStepChange = (index, field, value) => {
    setSteps((prev) =>
      prev.map((st, i) => (i === index ? { ...st, [field]: value } : st))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!statement.trim() || !answer.trim()) return;

    setSubmitting(true);
    setSubmittedMsg(null);

    const cleanSteps = steps.filter(
      (s) => s.title.trim() || s.content.trim()
    );

    const payload = {
      course,
      topic: topic.trim() || "General",
      difficulty,
      statement: statement.trim(),
      variables: {},
      steps: cleanSteps,
      answer: answer.trim(),
      status: "pending",
    };

    try {
      if (
        isSupabaseConfigured &&
        supabase &&
        profile?.id &&
        profile.id !== "demo-admin"
      ) {
        const { error } = await supabase.from("problems").insert([
          {
            ...payload,
            created_by: profile.id,
          },
        ]);
        if (error) throw error;
      } else {
        onLocalProposalAdded?.({
          id: `local-prop-${Date.now()}`,
          ...payload,
        });
      }

      setStatement("");
      setSteps([{ title: "Planteamiento y teoremas", content: "" }]);
      setAnswer("");
      setSubmittedMsg(
        "¡Ejercicio enviado! Quedó en cola para revisión y aprobación del administrador."
      );
    } catch (err) {
      alert("Error al enviar propuesta: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Proponer Nuevo Ejercicio
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Aporta problemas originales o de certámenes anteriores al banco de{" "}
          <strong>PEM Trainer</strong>. Puedes usar sintaxis LaTeX entre{" "}
          <code>$...$</code> o <code>$$...$$</code>.
        </p>

        {submittedMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {submittedMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Asignatura
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              >
                {curriculum.map((c) => (
                  <option key={c.course} value={c.course}>
                    {c.course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Tema / Unidad
              </label>
              {currentCourseTopics.length > 0 ? (
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
                >
                  {currentCourseTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej. General"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Dificultad
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              >
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado / Certamen</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Enunciado del Problema
            </label>
            <textarea
              rows={4}
              required
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Ej. Demuestre que $\int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}$ utilizando coordenadas polares."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          {/* Vista previa LaTeX en vivo */}
          {statement.trim() && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Vista Previa Renderizada
              </span>
              <div className="text-sm text-slate-900 dark:text-slate-100">
                <MathText text={statement} />
              </div>
            </div>
          )}

          {/* Pasos de Desarrollo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Desarrollo Paso a Paso (Pauta)
              </label>
              <button
                type="button"
                onClick={handleAddStep}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Paso
              </button>
            </div>

            {steps.map((st, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) =>
                      handleStepChange(idx, "title", e.target.value)
                    }
                    placeholder="Título del paso"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                      title="Eliminar paso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={st.content}
                  onChange={(e) =>
                    handleStepChange(idx, "content", e.target.value)
                  }
                  placeholder="Explicación algebraica o demostración de este paso..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Conclusión / Respuesta Final
            </label>
            <input
              type="text"
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Ej. $I = \frac{\sqrt{\pi}}{2}$"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 transition"
          >
            <Send className="w-4 h-4" />
            {submitting
              ? "Enviando Propuesta..."
              : "Enviar Ejercicio a Revisión"}
          </button>
        </form>
      </div>
    </div>
  );
}