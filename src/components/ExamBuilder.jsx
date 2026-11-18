import React, { useState, useEffect } from "react";
import { CURRICULUM } from "../data/curriculum";
import { instantiateProblem } from "../utils/mathEngine";
import MathText from "./MathText";
import BrandLogo from "./BrandLogo";
import {
  FileDown,
  FileCheck2,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  FileText,
} from "lucide-react";

export default function ExamBuilder({ problems, curriculum = CURRICULUM }) {
  const [course, setCourse] = useState(curriculum[0]?.course || "");
  const [selectedTopic, setSelectedTopic] = useState("Todos");
  const [questionCount, setQuestionCount] = useState(4);
  const [examTitle, setExamTitle] = useState("Evaluación Sumativa / Certamen");
  const [institution, setInstitution] = useState(
    "Facultad de Ciencias Físicas y Matemáticas"
  );
  const [durationText, setDurationText] = useState("90 minutos");

  const [examQuestions, setExamQuestions] = useState([]);
  const [showSolutionsOnScreen, setShowSolutionsOnScreen] = useState(false);
  const [printMode, setPrintMode] = useState("screen");

  useEffect(() => {
    if (
      course !== "Todos" &&
      curriculum.length > 0 &&
      !curriculum.some((c) => c.course === course)
    ) {
      setCourse(curriculum[0].course);
      setSelectedTopic("Todos");
    }
  }, [curriculum, course]);

  const availableTopics =
    curriculum.find((c) => c.course === course)?.topics || [];

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintMode("screen");
      document.title = "PEM Trainer — Entrenamiento Matemático";
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const generateExam = () => {
    const total = Math.max(1, Number(questionCount) || 1);

    const pool = problems.filter((p) => {
      if (course !== "Todos" && p.course !== course) return false;
      if (selectedTopic !== "Todos" && p.topic !== selectedTopic) return false;
      return true;
    });

    if (pool.length === 0) {
      alert("No hay ejercicios suficientes para esta asignatura/tema.");
      return;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const pointsPerQuestion = Math.round((100 / total) * 10) / 10;

    const generated = Array.from({ length: total }, (_, idx) => {
      const template = shuffled[idx % shuffled.length];
      return {
        examKey: `${template.id}-${idx}-${Date.now()}`,
        points: pointsPerQuestion,
        ...instantiateProblem(template),
      };
    });

    setExamQuestions(generated);
    setShowSolutionsOnScreen(false);
    setPrintMode("screen");
  };

  const triggerPdfDownload = (mode) => {
    setPrintMode(mode);
    const cleanCourse = course.replace(/\s+/g, "_");
    const dateStr = new Date().toISOString().slice(0, 10);
    document.title =
      mode === "solutions"
        ? `Solucionario_${cleanCourse}_${dateStr}`
        : `Prueba_${cleanCourse}_${dateStr}`;

    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (examQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Generador de Prueba Universitaria (PDF)
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Genera un documento formal de desarrollo abierto (sin alternativas) y
          descarga por separado el PDF de la prueba y el PDF del solucionario
          paso a paso.
        </p>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Asignatura
              </label>
              <select
                value={course}
                onChange={(e) => {
                  setCourse(e.target.value);
                  setSelectedTopic("Todos");
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
              >
                {curriculum.map((c) => (
                  <option key={c.course} value={c.course}>
                    {c.course}
                  </option>
                ))}
                <option value="Todos">Global (Todas las Asignaturas)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Unidad / Tema Específico
              </label>
              <select
                value={selectedTopic}
                disabled={course === "Todos"}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium disabled:opacity-50"
              >
                <option value="Todos">Todo el Programa del Ramo</option>
                {availableTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Título de la Evaluación
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Departamento / Facultad
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Número de Preguntas (Sin límite)
              </label>
              <input
                type="number"
                min={1}
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Tiempo Sugerido
              </label>
              <input
                type="text"
                value={durationText}
                onChange={(e) => setDurationText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        <button
          onClick={generateExam}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition"
        >
          <Sparkles className="w-5 h-5" /> Generar Documento de Prueba
        </button>
      </div>
    );
  }

  const shouldRenderSolutions =
    printMode === "solutions" ||
    (printMode === "screen" && showSolutionsOnScreen);

  const todayFormatted = new Date().toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="no-print sticky top-4 z-20 bg-white/95 dark:bg-uni-900/95 backdrop-blur border border-blue-200 dark:border-blue-800 rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => triggerPdfDownload("exam")}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition"
          >
            <FileDown className="w-4 h-4" /> Descargar Prueba (PDF)
          </button>

          <button
            onClick={() => triggerPdfDownload("solutions")}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition"
          >
            <FileCheck2 className="w-4 h-4" /> Descargar Solucionario (PDF)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSolutionsOnScreen((v) => !v)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {showSolutionsOnScreen ? (
              <>
                <EyeOff className="w-4 h-4" /> Ocultar Pauta
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" /> Ver Pauta en Pantalla
              </>
            )}
          </button>

          <button
            onClick={() => setExamQuestions([])}
            className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
          >
            <RotateCcw className="w-4 h-4" /> Configurar Otra
          </button>
        </div>
      </div>

      <div className="exam-sheet max-w-4xl mx-auto bg-white text-slate-900 border border-slate-300 rounded-xl shadow-xl p-8 sm:p-12">
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex items-start gap-3.5">
              <BrandLogo className="w-12 h-12 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  PEM Trainer • {institution}
                </p>
                <h1 className="text-2xl font-extrabold text-slate-950 mt-1">
                  {examTitle}
                  {shouldRenderSolutions && (
                    <span className="ml-2 text-blue-700">
                      — PAUTA Y SOLUCIONARIO
                    </span>
                  )}
                </h1>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  Asignatura: {course}{" "}
                  {selectedTopic !== "Todos" ? `(${selectedTopic})` : ""}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-700 space-y-1">
              <p>
                <strong>Fecha:</strong> {todayFormatted}
              </p>
              <p>
                <strong>Tiempo:</strong> {durationText}
              </p>
              <p>
                <strong>Puntaje Total:</strong> 100 pts
              </p>
            </div>
          </div>

          {!shouldRenderSolutions && (
            <div className="mt-4 pt-3 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-800">
              <div className="sm:col-span-2">
                <strong>Nombre Estudiante:</strong>{" "}
                _____________________________________________
              </div>
              <div>
                <strong>RUT / Matrícula:</strong> _____________________
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 leading-relaxed">
          <strong>Instrucciones:</strong> Responda de forma clara, ordenada y
          rigurosa cada uno de los siguientes problemas. Justifique todos sus
          pasos algebraicos, teoremas utilizados y demostraciones formales.
          Respuestas sin desarrollo no obtendrán puntaje completo.
        </div>

        <div className="space-y-8">
          {examQuestions.map((q, index) => {
            const statement = q.renderedStatement || q.statement;
            const steps = q.renderedSteps || q.steps || [];
            const answer = q.renderedAnswer || q.answer;

            return (
              <div
                key={q.examKey}
                className="exam-question-block border-b border-slate-200 pb-6 last:border-none"
              >
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base text-slate-950">
                    Problema {index + 1}.{" "}
                    <span className="font-normal text-sm text-slate-600">
                      ({q.topic})
                    </span>
                  </h3>
                  <span className="text-xs font-bold text-slate-800 shrink-0">
                    [{q.points} puntos]
                  </span>
                </div>

                <div className="text-slate-900 text-sm sm:text-base pl-1">
                  <MathText text={statement} />
                </div>

                {!shouldRenderSolutions && (
                  <div className="mt-4 h-36 border border-dashed border-slate-300 rounded-lg p-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      Espacio de desarrollo y demostración — Problema{" "}
                      {index + 1}
                    </span>
                  </div>
                )}

                {shouldRenderSolutions && (
                  <div className="mt-4 p-4 bg-blue-50/70 border-l-4 border-blue-700 rounded-r-lg space-y-2.5">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                      Desarrollo y Pauta — Problema {index + 1}
                    </p>

                    {steps.map((st, sIdx) => (
                      <div key={sIdx} className="text-sm text-slate-900">
                        <span className="font-bold text-xs text-blue-800 block">
                          {st.title}:
                        </span>
                        <MathText text={st.content} />
                      </div>
                    ))}

                    <div className="pt-2 border-t border-blue-200 text-sm font-bold text-slate-950 flex items-center gap-2 flex-wrap">
                      <span>Conclusión / Resultado:</span>
                      <MathText text={answer} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}