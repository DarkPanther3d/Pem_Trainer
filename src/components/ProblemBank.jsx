import React, { useState, useEffect, useMemo } from "react";
import { CURRICULUM } from "../data/curriculum";
import { instantiateProblem } from "../utils/mathEngine";
import MathText from "./MathText";
import {
  Shuffle,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  BookOpen,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

export default function ProblemBank({
  problems = [],
  curriculum = CURRICULUM,
}) {
  const [selectedCourse, setSelectedCourse] = useState("Todos");
  const [selectedTopic, setSelectedTopic] = useState("Todos");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todas");
  const [exerciseCount, setExerciseCount] = useState(10);
  const [useAllAvailable, setUseAllAvailable] = useState(false);

  const [sessionList, setSessionList] = useState([]);
  const [revealedSteps, setRevealedSteps] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [completedIds, setCompletedIds] = useState({});

  const availableTopics = useMemo(() => {
    if (selectedCourse === "Todos") return [];
    return curriculum.find((c) => c.course === selectedCourse)?.topics || [];
  }, [curriculum, selectedCourse]);

  // Sincroniza automáticamente si el administrador elimina la asignatura o el tema seleccionado
  useEffect(() => {
    if (selectedCourse !== "Todos") {
      const courseObj = curriculum.find((c) => c.course === selectedCourse);
      if (!courseObj) {
        setSelectedCourse("Todos");
        setSelectedTopic("Todos");
      } else if (
        selectedTopic !== "Todos" &&
        !(courseObj.topics || []).includes(selectedTopic)
      ) {
        setSelectedTopic("Todos");
      }
    }
  }, [curriculum, selectedCourse, selectedTopic]);

  const filteredPool = useMemo(() => {
    return problems.filter((p) => {
      if (selectedCourse !== "Todos" && p.course !== selectedCourse)
        return false;
      if (selectedTopic !== "Todos" && p.topic !== selectedTopic) return false;
      if (
        selectedDifficulty !== "Todas" &&
        p.difficulty !== selectedDifficulty
      )
        return false;
      return true;
    });
  }, [problems, selectedCourse, selectedTopic, selectedDifficulty]);

  const startSession = () => {
    if (filteredPool.length === 0) {
      setSessionList([]);
      return;
    }

    const shuffled = [...filteredPool].sort(() => Math.random() - 0.5);
    const targetTotal = useAllAvailable
      ? shuffled.length
      : Math.max(1, Number(exerciseCount) || 1);

    const instantiated = Array.from({ length: targetTotal }, (_, idx) => {
      const template = shuffled[idx % shuffled.length];
      return {
        sessionKey: `${template.id}-${idx}-${Date.now()}`,
        ...instantiateProblem(template),
      };
    });

    setSessionList(instantiated);
    setRevealedSteps({});
    setRevealedAnswers({});
    setCompletedIds({});
  };

  useEffect(() => {
    if (sessionList.length === 0 && filteredPool.length > 0) {
      startSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problems.length]);

  const toggleSteps = (key) => {
    setRevealedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAnswer = (key) => {
    setRevealedAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCompleted = (key) => {
    setCompletedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(completedIds).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Entrenamiento Aleatorio — PEM Trainer
            </h2>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {filteredPool.length} ejercicios disponibles en este filtro
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Asignatura
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedTopic("Todos");
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
            >
              <option value="Todos">Todas las Asignaturas</option>
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
            <select
              value={selectedTopic}
              disabled={selectedCourse === "Todos"}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium disabled:opacity-50"
            >
              <option value="Todos">Todos los Temas</option>
              {availableTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Dificultad
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
            >
              <option value="Todas">Todas las Dificultades</option>
              <option value="Básico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado / Certamen</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Cantidad (Sin límite)
              </label>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAllAvailable}
                  onChange={(e) => setUseAllAvailable(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Todos ({filteredPool.length})
              </label>
            </div>
            <input
              type="number"
              min={1}
              disabled={useAllAvailable}
              value={useAllAvailable ? filteredPool.length : exerciseCount}
              onChange={(e) => setExerciseCount(e.target.value)}
              placeholder="Ej. 10, 50, 200..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Progreso de la serie actual:{" "}
            <strong className="text-slate-900 dark:text-white">
              {completedCount} / {sessionList.length}
            </strong>{" "}
            resueltos
          </div>

          <button
            type="button"
            onClick={startSession}
            disabled={filteredPool.length === 0}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 transition"
          >
            <Shuffle className="w-4 h-4" /> Generar Serie de Entrenamiento
          </button>
        </div>
      </div>

      {filteredPool.length === 0 ? (
        <div className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-10 text-center space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            No hay ejercicios para esta combinación de filtros
          </h3>
          <p className="text-xs text-slate-500">
            Prueba seleccionando otra asignatura, tema o dificultad.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sessionList.map((item, idx) => {
            const statement = item.renderedStatement || item.statement;
            const steps = item.renderedSteps || item.steps || [];
            const answer = item.renderedAnswer || item.answer;
            const isStepsOpen = !!revealedSteps[item.sessionKey];
            const isAnswerOpen = !!revealedAnswers[item.sessionKey];
            const isDone = !!completedIds[item.sessionKey];

            return (
              <div
                key={item.sessionKey}
                className={`bg-white dark:bg-uni-900 border rounded-2xl p-6 shadow-sm transition ${
                  isDone
                    ? "border-emerald-400/80 dark:border-emerald-700/70"
                    : "border-slate-200 dark:border-blue-900/60"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold">
                      Ejercicio #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.course} • {item.topic}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {item.difficulty}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCompleted(item.sessionKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                      isDone
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400"
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Resuelto
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        Marcar Resuelto
                      </>
                    )}
                  </button>
                </div>

                <div className="text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed mb-4">
                  <MathText text={statement} />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {steps.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleSteps(item.sessionKey)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      {isStepsOpen ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Ocultar Desarrollo
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Ver
                          Desarrollo Paso a Paso
                        </>
                      )}
                    </button>
                  )}

                  {answer && (
                    <button
                      type="button"
                      onClick={() => toggleAnswer(item.sessionKey)}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      {isAnswerOpen ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Ocultar Respuesta
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Ver Respuesta Final
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isStepsOpen && steps.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Desarrollo Detallado
                    </p>
                    {steps.map((st, sIdx) => (
                      <div key={sIdx} className="text-sm">
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                          {st.title}:
                        </span>
                        <MathText text={st.content} />
                      </div>
                    ))}
                  </div>
                )}

                {isAnswerOpen && answer && (
                  <div className="mt-3 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600 text-sm font-bold flex items-center gap-2 flex-wrap">
                    <span className="text-blue-800 dark:text-blue-300">
                      Resultado Final:
                    </span>
                    <MathText text={answer} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}