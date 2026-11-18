import React, { useState, useEffect, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { CURRICULUM } from "../data/curriculum";
import MathText from "./MathText";
import {
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookPlus,
  FolderPlus,
  Tag,
  Trash2,
  FileJson,
  Database,
  Loader2,
  Search,
  Pencil,
  Eye,
  EyeOff,
  Save,
  X,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

const PAGE_SIZE = 20;

function buildVariedProblem(course, topic, difficulty, idx) {
  const cLower = (course || "").toLowerCase();
  const a = ((idx * 3) % 13) + 2;
  const b = ((idx * 5) % 17) + 1;
  const c = ((idx * 7) % 11) + 2;
  const n = (idx % 5) + 2;
  const variant = idx % 4;

  // Álgebra Lineal / Matrices / Sistemas
  if (cLower.includes("lineal") || cLower.includes("matriz")) {
    const det = a * c - b;
    return {
      statement: `Considere la matriz $A = \\begin{pmatrix} ${a} & 1 \\\\ ${b} & ${c} \\end{pmatrix} \\in M_{2\\times 2}(\\mathbb{R})$. Determine $\\det(A)$, indique si $A$ es invertible y calcule su traza $\\operatorname{tr}(A)$ en el contexto de **${topic}**.`,
      steps: [
        {
          title: "Cálculo del determinante",
          content: `$\\det(A) = (${a})(${c}) - (1)(${b}) = ${a * c} - ${b} = ${det}$.`,
        },
        {
          title: "Invertibilidad y traza",
          content: `Como $\\det(A) = ${det} ${det !== 0 ? "\\neq 0$, la matriz es invertible" : "= 0$, la matriz es singular"}. Además, $\\operatorname{tr}(A) = ${a} + ${c} = ${a + c}$.`,
        },
      ],
      answer: `$\\det(A) = ${det}$, $\\operatorname{tr}(A) = ${a + c}$`,
    };
  }

  // Ecuaciones Diferenciales
  if (cLower.includes("diferencial") || cLower.includes("edo")) {
    return {
      statement: `Resuelva el problema de valor inicial $y' + ${a}y = ${a * b}$, con condición inicial $y(0) = ${c}$, justificando el método empleado (**${topic}**).`,
      steps: [
        {
          title: "Factor integrante",
          content: `Multiplicando por $\\mu(x) = e^{\\int ${a}\\,dx} = e^{${a}x}$, se obtiene $\\frac{d}{dx}\\left(y e^{${a}x}\\right) = ${a * b} e^{${a}x}$.`,
        },
        {
          title: "Integración y condición inicial",
          content: `Integrando: $y(x) = ${b} + C e^{-${a}x}$. Evaluando $y(0) = ${c} \\implies C = ${c - b}$.`,
        },
      ],
      answer: `$y(x) = ${b} + (${c - b})e^{-${a}x}$`,
    };
  }

  // Probabilidad y Estadística
  if (cLower.includes("probabilidad") || cLower.includes("estadística")) {
    return {
      statement: `Sea $X$ una variable aleatoria continua con función de densidad $f(x) = k x^{${n - 1}}$ para $x \\in [0, ${a}]$ y $0$ en otro caso. Determine la constante de normalización $k$ y la esperanza $\\mathbb{E}[X]$ (**${topic}**).`,
      steps: [
        {
          title: "Condición de normalización",
          content: `$\\int_0^{${a}} k x^{${n - 1}}\\,dx = k \\frac{${a}^{${n}}}{${n}} = 1 \\implies k = \\frac{${n}}{${a}^{${n}}}$.`,
        },
        {
          title: "Cálculo de esperanza",
          content: `$\\mathbb{E}[X] = \\int_0^{${a}} k x^{${n}}\\,dx = \\frac{${n}}{${n + 1}} \\cdot ${a} = \\frac{${n * a}}{${n + 1}}$.`,
        },
      ],
      answer: `$k = \\frac{${n}}{${a}^{${n}}}$, $\\mathbb{E}[X] = \\frac{${n * a}}{${n + 1}}$`,
    };
  }

  // Cálculo / Análisis / General (4 variantes distintas)
  if (variant === 0) {
    return {
      statement: `Calcule el siguiente límite indeterminado justificando cada transformación algebraica (**${topic}**): $$\\lim_{x \\to ${a}} \\frac{x^2 - ${a * a}}{x - ${a}}$$`,
      steps: [
        {
          title: "Factorización del numerador",
          content: `Reconociendo diferencia de cuadrados: $x^2 - ${a * a} = (x - ${a})(x + ${a})$.`,
        },
        {
          title: "Simplificación y evaluación",
          content: `Para $x \\neq ${a}$, $\\frac{(x - ${a})(x + ${a})}{x - ${a}} = x + ${a} \\xrightarrow{x \\to ${a}} ${2 * a}$.`,
        },
      ],
      answer: `$${2 * a}$`,
    };
  }

  if (variant === 1) {
    return {
      statement: `Determine el valor de la integral definida (**${topic}**): $$I = \\int_0^{${b}} \\left(${a * n}x^{${n - 1}} + ${c}\\right) dx$$`,
      steps: [
        {
          title: "Búsqueda de primitiva",
          content: `Una antiderivada del integrando es $F(x) = ${a}x^{${n}} + ${c}x$.`,
        },
        {
          title: "Regla de Barrow",
          content: `$I = F(${b}) - F(0) = ${a}(${b})^{${n}} + ${c}(${b}) = ${a * Math.pow(b, n) + c * b}$.`,
        },
      ],
      answer: `$I = ${a * Math.pow(b, n) + c * b}$`,
    };
  }

  if (variant === 2) {
    return {
      statement: `Sea $f(x) = ${a}x^{${n}} + ${b}x$. Determine su derivada segunda $f''(x)$ y evalúe en $x = 1$ (**${topic}**).`,
      steps: [
        {
          title: "Primera derivada",
          content: `$f'(x) = ${a * n}x^{${n - 1}} + ${b}$.`,
        },
        {
          title: "Segunda derivada y evaluación",
          content: `$f''(x) = ${a * n * (n - 1)}x^{${Math.max(0, n - 2)}}$, por lo que $f''(1) = ${a * n * (n - 1)}$.`,
        },
      ],
      answer: `$f''(1) = ${a * n * (n - 1)}$`,
    };
  }

  return {
    statement: `Encuentre el conjunto solución en $\\mathbb{R}$ de la ecuación $(x - ${a})(x + ${b}) = 0$ y verifique sus raíces (**${topic}**).`,
    steps: [
      {
        title: "Propiedad del producto nulo",
        content: `Un producto en $\\mathbb{R}$ es cero si y solo si al menos uno de sus factores es cero: $x - ${a} = 0$ o $x + ${b} = 0$.`,
      },
      {
        title: "Despeje de raíces",
        content: `Se obtienen las soluciones $x_1 = ${a}$ y $x_2 = -${b}$.`,
      },
    ],
    answer: `$S = \\{-${b}, ${a}\\}$`,
  };
}

export default function AdminPanel({
  session = null,
  demoMode = false,
  problems = [],
  curriculum = CURRICULUM,
  onUpdateProblem,
  onDeleteProblem,
  onAddCourse,
  onAddTopic,
  onDeleteCourse,
  onDeleteTopic,
  onRestoreBaseCurriculum,
  hasHiddenBaseCurriculum = false,
  onProblemsMutated,
  localPendingProblems = [],
  onApproveLocalProblem,
  onRejectLocalProblem,
}) {
  const [subTab, setSubTab] = useState("curriculum");

  // --- Estado Gestor de Preguntas ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("Todas");
  const [filterTopic, setFilterTopic] = useState("Todos");
  const [filterDifficulty, setFilterDifficulty] = useState("Todas");
  const [currentPage, setCurrentPage] = useState(1);

  const [expandedPautaIds, setExpandedPautaIds] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [editingProblem, setEditingProblem] = useState(null);
  const [editSteps, setEditSteps] = useState([]);
  const [editVariablesText, setEditVariablesText] = useState("{}");
  const [savingEdit, setSavingEdit] = useState(false);
  const [managerNotice, setManagerNotice] = useState(null);

  const filterTopicsList = useMemo(() => {
    if (filterCourse === "Todas") return [];
    return curriculum.find((c) => c.course === filterCourse)?.topics || [];
  }, [curriculum, filterCourse]);

  const filteredQuestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return problems.filter((p) => {
      if (filterCourse !== "Todas" && p.course !== filterCourse) return false;
      if (filterTopic !== "Todos" && p.topic !== filterTopic) return false;
      if (filterDifficulty !== "Todas" && p.difficulty !== filterDifficulty)
        return false;

      if (q) {
        const hayTexto =
          (p.statement || "").toLowerCase().includes(q) ||
          (p.answer || "").toLowerCase().includes(q) ||
          (p.topic || "").toLowerCase().includes(q) ||
          (p.course || "").toLowerCase().includes(q) ||
          String(p.id || "").toLowerCase().includes(q);
        if (!hayTexto) return false;
      }
      return true;
    });
  }, [problems, filterCourse, filterTopic, filterDifficulty, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / PAGE_SIZE)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCourse, filterTopic, filterDifficulty]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, currentPage]);

  const openEditModal = (problem) => {
    setEditingProblem({
      id: problem.id,
      course: problem.course || curriculum[0]?.course || "",
      topic: problem.topic || "General",
      difficulty: problem.difficulty || "Intermedio",
      statement: problem.statement || "",
      answer: problem.answer || "",
    });
    setEditSteps(
      Array.isArray(problem.steps) && problem.steps.length > 0
        ? problem.steps.map((s) => ({
            title: s.title || "",
            content: s.content || "",
          }))
        : []
    );
    setEditVariablesText(
      problem.variables && Object.keys(problem.variables).length > 0
        ? JSON.stringify(problem.variables, null, 2)
        : "{}"
    );
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProblem) return;

    let parsedVariables = {};
    try {
      parsedVariables = editVariablesText.trim()
        ? JSON.parse(editVariablesText)
        : {};
    } catch {
      alert(
        "El campo de Variables Paramétricas no tiene un formato JSON válido."
      );
      return;
    }

    setSavingEdit(true);
    try {
      await onUpdateProblem?.({
        ...editingProblem,
        variables: parsedVariables,
        steps: editSteps.filter((s) => s.title.trim() || s.content.trim()),
      });

      setEditingProblem(null);
      setManagerNotice({
        type: "success",
        text: "Pregunta actualizada correctamente.",
      });
      setTimeout(() => setManagerNotice(null), 4000);
    } catch (err) {
      alert("Error al guardar los cambios: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async (id) => {
    setDeletingId(id);
    try {
      await onDeleteProblem?.(id);
      setConfirmDeleteId(null);
      setManagerNotice({
        type: "success",
        text: "Pregunta eliminada del banco.",
      });
      setTimeout(() => setManagerNotice(null), 4000);
    } catch (err) {
      alert("Error al eliminar la pregunta: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // --- Estado Gestión de Asignaturas y Temas ---
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseTopicsRaw, setNewCourseTopicsRaw] = useState("");
  const [targetCourse, setTargetCourse] = useState(
    curriculum[0]?.course || ""
  );
  const [newTopicName, setNewTopicName] = useState("");
  const [curriculumFeedback, setCurriculumFeedback] = useState(null);
  const [confirmDeleteCourseName, setConfirmDeleteCourseName] = useState(null);

  useEffect(() => {
    if (curriculum.length === 0) {
      setTargetCourse("");
    } else if (!curriculum.some((c) => c.course === targetCourse)) {
      setTargetCourse(curriculum[0].course);
    }
  }, [curriculum, targetCourse]);

  // --- Estado Usuarios Pendientes y Propuestas ---
  const [pendingUsers, setPendingUsers] = useState([]);
  const [dbPendingProblems, setDbPendingProblems] = useState([]);

  // --- Estado Generador / Importador Masivo ---
  const [genCourse, setGenCourse] = useState(curriculum[0]?.course || "");
  const [genTopic, setGenTopic] = useState(curriculum[0]?.topics?.[0] || "");
  const [genCount, setGenCount] = useState(25);
  const [genDifficulty, setGenDifficulty] = useState("Intermedio");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState(null);
  const [jsonInput, setJsonInput] = useState("");

  useEffect(() => {
    const found = curriculum.find((c) => c.course === genCourse);
    if (!found) {
      setGenCourse(curriculum[0]?.course || "");
      setGenTopic(curriculum[0]?.topics?.[0] || "General");
    } else if (!found.topics.includes(genTopic)) {
      setGenTopic(found.topics?.[0] || "General");
    }
  }, [curriculum, genCourse, genTopic]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || demoMode) return;
    fetchAdminQueues();
  }, [demoMode]);

  const fetchAdminQueues = async () => {
    const [{ data: users }, { data: probs }] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false }),
      supabase
        .from("problems")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);
    if (users) setPendingUsers(users);
    if (probs) setDbPendingProblems(probs);
  };

  const handleApproveUser = async (userId) => {
    await supabase
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", userId);
    setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleDbProblemDecision = async (id, status) => {
    const { error } = await supabase
      .from("problems")
      .update({ status })
      .eq("id", id);
    if (error) {
      alert("Error al actualizar propuesta: " + error.message);
      return;
    }
    setDbPendingProblems((prev) => prev.filter((p) => p.id !== id));
    if (status === "approved" && onProblemsMutated) {
      await onProblemsMutated();
    }
  };

  const submitNewCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const initialTopics = newCourseTopicsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await onAddCourse?.(newCourseName, initialTopics);
    setTargetCourse(newCourseName.trim());
    setNewCourseName("");
    setNewCourseTopicsRaw("");
    setCurriculumFeedback(
      `Asignatura "${newCourseName.trim()}" agregada correctamente.`
    );
    setTimeout(() => setCurriculumFeedback(null), 4000);
  };

  const submitNewTopic = async (e) => {
    e.preventDefault();
    if (!targetCourse || !newTopicName.trim()) return;

    await onAddTopic?.(targetCourse, newTopicName);
    setCurriculumFeedback(
      `Tema "${newTopicName.trim()}" agregado a ${targetCourse}.`
    );
    setNewTopicName("");
    setTimeout(() => setCurriculumFeedback(null), 4000);
  };

  const handleRemoveCourse = async (courseName) => {
    await onDeleteCourse?.(courseName);
    setConfirmDeleteCourseName(null);
    setCurriculumFeedback(`Asignatura "${courseName}" eliminada.`);
    setTimeout(() => setCurriculumFeedback(null), 4000);
  };

  const handleRemoveTopic = async (courseName, topicName) => {
    await onDeleteTopic?.(courseName, topicName);
    setCurriculumFeedback(
      `Tema "${topicName}" eliminado de ${courseName}.`
    );
    setTimeout(() => setCurriculumFeedback(null), 4000);
  };

  // --- Inserción segura en Supabase con detección real de errores ---
  const saveGeneratedItems = async (items) => {
    const canUseCloudDb =
      isSupabaseConfigured && supabase && !demoMode && !!session?.user?.id;

    if (canUseCloudDb) {
      const batchSize = 200;
      for (let i = 0; i < items.length; i += batchSize) {
        const chunk = items
          .slice(i, i + batchSize)
          .map(({ id, ...rest }) => ({
            ...rest,
            created_by: session.user.id,
          }));

        setGenStatus({
          type: "info",
          text: `Guardando en Supabase: lote ${Math.min(
            i + batchSize,
            items.length
          )} de ${items.length}...`,
        });

        let { error } = await supabase.from("problems").insert(chunk);

        if (error && /column .* does not exist/i.test(error.message)) {
          const coreChunk = chunk.map(
            ({ variables, created_by, ...core }) => core
          );
          const retry = await supabase.from("problems").insert(coreChunk);
          error = retry.error;
        }

        if (error) {
          throw new Error(error.message);
        }
      }
      await onProblemsMutated?.();
      return "Supabase";
    } else {
      await onProblemsMutated?.(items);
      return "Almacenamiento Local";
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    if (!genCourse) {
      alert("Crea o selecciona al menos una asignatura primero.");
      return;
    }

    const total = Math.max(1, Number(genCount) || 1);
    setIsGenerating(true);
    setGenStatus({
      type: "info",
      text: `Construyendo ${total} ejercicios para ${genCourse}...`,
    });

    try {
      const generatedItems = Array.from({ length: total }, (_, idx) => {
        const built = buildVariedProblem(
          genCourse,
          genTopic || "General",
          genDifficulty,
          idx
        );
        return {
          id: `bulk-${Date.now()}-${idx}`,
          course: genCourse,
          topic: genTopic || "General",
          difficulty: genDifficulty,
          statement: built.statement,
          variables: {},
          steps: built.steps,
          answer: built.answer,
          status: "approved",
        };
      });

      const target = await saveGeneratedItems(generatedItems);

      setGenStatus({
        type: "success",
        text: `¡Listo! Se agregaron ${total} ejercicios al banco (${target}).`,
      });
    } catch (err) {
      setGenStatus({
        type: "error",
        text: `No se pudieron guardar los ejercicios: ${err.message}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJsonImport = async () => {
    setIsGenerating(true);
    setGenStatus(null);
    try {
      const parsed = JSON.parse(jsonInput);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const formatted = list.map((item, idx) => ({
        id: `json-${Date.now()}-${idx}`,
        course: item.course || genCourse || "General",
        topic: item.topic || genTopic || "General",
        difficulty: item.difficulty || "Intermedio",
        statement: item.statement,
        variables: item.variables || {},
        steps: item.steps || [],
        answer: item.answer || "",
        status: "approved",
      }));

      const target = await saveGeneratedItems(formatted);

      setJsonInput("");
      setGenStatus({
        type: "success",
        text: `Se importaron ${formatted.length} ejercicios desde JSON (${target}).`,
      });
    } catch (err) {
      setGenStatus({
        type: "error",
        text: `Error al importar JSON: ${err.message}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const baseCourseNames = new Set(CURRICULUM.map((c) => c.course));
  const baseTopicsByCourse = new Map(
    CURRICULUM.map((c) => [c.course, new Set(c.topics)])
  );

  const allPendingProblems = [
    ...localPendingProblems.map((p) => ({ ...p, _isLocal: true })),
    ...dbPendingProblems.map((p) => ({ ...p, _isLocal: false })),
  ];

  const editCourseTopics = editingProblem
    ? curriculum.find((c) => c.course === editingProblem.course)?.topics || []
    : [];

  return (
    <div className="space-y-6">
      {/* Cabecera y Navegación interna */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Panel de Administración — PEM Trainer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Banco actual: <strong>{problems.length}</strong> ejercicios activos •{" "}
            <strong>{curriculum.length}</strong> asignaturas • Destino:{" "}
            <strong>
              {demoMode || !isSupabaseConfigured
                ? "Local / Demo"
                : "Supabase Nube"}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setSubTab("curriculum")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              subTab === "curriculum"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <BookPlus className="w-3.5 h-3.5" /> Asignaturas y Temas
          </button>

          <button
            onClick={() => setSubTab("bulk")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              subTab === "bulk"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Generador / Importador
          </button>

          <button
            onClick={() => setSubTab("questions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              subTab === "questions"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Gestor de Preguntas (
            {problems.length})
          </button>

          <button
            onClick={() => setSubTab("proposals")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              subTab === "proposals"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Propuestas (
            {allPendingProblems.length})
          </button>

          <button
            onClick={() => setSubTab("users")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              subTab === "users"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Usuarios ({pendingUsers.length})
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PESTAÑA 1: GESTIÓN DE ASIGNATURAS Y TEMAS (CREAR Y ELIMINAR)          */}
      {/* ===================================================================== */}
      {subTab === "curriculum" && (
        <div className="space-y-6">
          {curriculumFeedback && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
              <span>{curriculumFeedback}</span>
              <button onClick={() => setCurriculumFeedback(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form
              onSubmit={submitNewCourse}
              className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <FolderPlus className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Agregar Nueva Asignatura
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Ej. Ecuaciones Diferenciales Ordinarias"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Temas Iniciales (separados por coma, opcional)
                </label>
                <input
                  type="text"
                  value={newCourseTopicsRaw}
                  onChange={(e) => setNewCourseTopicsRaw(e.target.value)}
                  placeholder="Ej. EDO Lineales, Transformada de Laplace, Series"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <FolderPlus className="w-4 h-4" /> Crear Asignatura
              </button>
            </form>

            <form
              onSubmit={submitNewTopic}
              className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Tag className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Agregar Tema a Asignatura
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Seleccionar Asignatura
                </label>
                <select
                  value={targetCourse}
                  disabled={curriculum.length === 0}
                  onChange={(e) => setTargetCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium disabled:opacity-50"
                >
                  {curriculum.length === 0 ? (
                    <option value="">Crea primero una asignatura</option>
                  ) : (
                    curriculum.map((c) => (
                      <option key={c.course} value={c.course}>
                        {c.course}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Nombre del Nuevo Tema / Unidad
                </label>
                <input
                  type="text"
                  required
                  disabled={curriculum.length === 0}
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Ej. Teorema de Stokes y Divergencia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={curriculum.length === 0 || !targetCourse}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Tag className="w-4 h-4" /> Añadir Tema
              </button>
            </form>
          </div>

          {/* Malla Curricular Activa con eliminación de cualquier Asignatura y Tema */}
          <div className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Malla Curricular Activa ({curriculum.length} asignaturas)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Haz clic en <strong>×</strong> junto a cualquier tema para
                  eliminarlo o en <strong>Eliminar</strong> para quitar la
                  asignatura completa.
                </p>
              </div>

              {hasHiddenBaseCurriculum && (
                <button
                  type="button"
                  onClick={onRestoreBaseCurriculum}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  Restaurar Malla Base
                </button>
              )}
            </div>

            {curriculum.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                No hay asignaturas activas. Crea una nueva asignatura arriba o
                restaura la malla base.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {curriculum.map((item) => {
                  const isCustomCourse = !baseCourseNames.has(item.course);
                  const baseTopics =
                    baseTopicsByCourse.get(item.course) || new Set();
                  const isConfirmingCourse =
                    confirmDeleteCourseName === item.course;

                  return (
                    <div
                      key={item.course}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.course}
                          </h4>
                          {isCustomCourse && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                              Personalizada
                            </span>
                          )}
                        </div>

                        {!isConfirmingCourse ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDeleteCourseName(item.course)
                            }
                            title="Eliminar asignatura completa"
                            className="px-2 py-1 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-1 transition shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 px-2 py-1 rounded-lg shrink-0">
                            <span className="text-[11px] font-bold text-red-700 dark:text-red-300 mr-1">
                              ¿Eliminar?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCourse(item.course)}
                              className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold hover:bg-red-700"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteCourseName(null)}
                              className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {item.topics.length === 0 && (
                          <span className="text-xs text-slate-400 italic">
                            Sin temas específicos aún
                          </span>
                        )}
                        {item.topics.map((topic) => {
                          const isCustomTopic = !baseTopics.has(topic);
                          return (
                            <span
                              key={topic}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                                isCustomTopic
                                  ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800"
                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <span>{topic}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveTopic(item.course, topic)
                                }
                                title={`Eliminar tema "${topic}"`}
                                className="ml-0.5 w-4 h-4 rounded-full inline-flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 transition font-bold leading-none"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 2: GENERADOR E IMPORTADOR ILIMITADO                           */}
      {/* ===================================================================== */}
      {subTab === "bulk" && (
        <div className="space-y-4">
          {genStatus && (
            <div
              className={`p-4 rounded-xl border text-xs sm:text-sm font-bold flex items-start gap-2.5 ${
                genStatus.type === "error"
                  ? "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300"
                  : genStatus.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                  : "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
              }`}
            >
              {genStatus.type === "error" && (
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <span>{genStatus.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form
              onSubmit={handleBulkGenerate}
              className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Generador Masivo de Ejercicios (Sin Límite)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Asignatura
                  </label>
                  <select
                    value={genCourse}
                    onChange={(e) => setGenCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    {curriculum.map((c) => (
                      <option key={c.course} value={c.course}>
                        {c.course}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Tema
                  </label>
                  <select
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    {(
                      curriculum.find((c) => c.course === genCourse)
                        ?.topics || ["General"]
                    ).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Cantidad de Ejercicios (Sin tope)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={genCount}
                    onChange={(e) => setGenCount(e.target.value)}
                    placeholder="Ej. 25, 100, 500..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Dificultad
                  </label>
                  <select
                    value={genDifficulty}
                    onChange={(e) => setGenDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado / Certamen</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generar {genCount || 0}{" "}
                    Ejercicios
                  </>
                )}
              </button>
            </form>

            <div className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileJson className="w-5 h-5 text-blue-500" />
                Importar Lote JSON (Cualquier Cantidad)
              </h3>

              <textarea
                rows={6}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"course": "Cálculo I", "topic": "Límites", "statement": "Calcule $\\lim_{x \\to 0} \\frac{\\sin x}{x}$", "answer": "$1$"}]'
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
              />

              <button
                type="button"
                onClick={handleJsonImport}
                disabled={!jsonInput.trim() || isGenerating}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 transition"
              >
                Importar JSON al Banco
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 3: GESTOR DE PREGUNTAS (REVISAR, MODIFICAR Y ELIMINAR)         */}
      {/* ===================================================================== */}
      {subTab === "questions" && (
        <div className="space-y-5">
          {managerNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
              <span>{managerNotice.text}</span>
              <button onClick={() => setManagerNotice(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por enunciado, respuesta o ID..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
                />
              </div>

              <select
                value={filterCourse}
                onChange={(e) => {
                  setFilterCourse(e.target.value);
                  setFilterTopic("Todos");
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium"
              >
                <option value="Todas">Todas las Asignaturas</option>
                {curriculum.map((c) => (
                  <option key={c.course} value={c.course}>
                    {c.course}
                  </option>
                ))}
              </select>

              <select
                value={filterTopic}
                disabled={filterCourse === "Todas"}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium disabled:opacity-50"
              >
                <option value="Todos">Todos los Temas</option>
                {filterTopicsList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium"
              >
                <option value="Todas">Todas las Dificultades</option>
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado / Certamen</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>
                Mostrando{" "}
                <strong className="text-slate-900 dark:text-white">
                  {paginatedQuestions.length}
                </strong>{" "}
                de{" "}
                <strong className="text-slate-900 dark:text-white">
                  {filteredQuestions.length}
                </strong>{" "}
                preguntas encontradas
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    Página {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {paginatedQuestions.length === 0 ? (
            <div className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-10 text-center text-sm text-slate-500">
              No se encontraron preguntas con los filtros seleccionados.
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedQuestions.map((prob, index) => {
                const isExpanded = !!expandedPautaIds[prob.id];
                const isConfirming = confirmDeleteId === prob.id;
                const isSeed = String(prob.id || "").startsWith("seed-");
                const hasVars =
                  prob.variables && Object.keys(prob.variables).length > 0;

                return (
                  <div
                    key={prob.id}
                    className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500">
                          #{(currentPage - 1) * PAGE_SIZE + index + 1}
                        </span>
                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                          {prob.course}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {prob.topic}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                          {prob.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
                          {isSeed ? "Base Inicial" : "Banco Activo"}
                        </span>
                        {hasVars && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                            Parametrizado
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPautaIds((prev) => ({
                              ...prev,
                              [prob.id]: !prev[prob.id],
                            }))
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition"
                        >
                          {isExpanded ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Ocultar Pauta
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-blue-600" />{" "}
                              Revisar Pauta
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(prob)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Modificar
                        </button>

                        {!isConfirming ? (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(prob.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/70 border border-red-300 dark:border-red-800 px-2 py-1 rounded-lg">
                            <span className="text-[11px] font-bold text-red-700 dark:text-red-300 mr-1">
                              ¿Seguro?
                            </span>
                            <button
                              type="button"
                              disabled={deletingId === prob.id}
                              onClick={() => handleConfirmDelete(prob.id)}
                              className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold hover:bg-red-700"
                            >
                              {deletingId === prob.id ? "..." : "Sí"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                      <MathText text={prob.statement} />
                    </div>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                        {Array.isArray(prob.steps) && prob.steps.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                              Pasos de Resolución ({prob.steps.length})
                            </p>
                            {prob.steps.map((st, sIdx) => (
                              <div key={sIdx} className="text-xs sm:text-sm">
                                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                                  {st.title}:
                                </span>
                                <MathText text={st.content} />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 flex-wrap">
                          <span className="text-emerald-700 dark:text-emerald-400">
                            Respuesta Final:
                          </span>
                          <MathText text={prob.answer || "Sin respuesta"} />
                        </div>

                        <p className="text-[10px] font-mono text-slate-400">
                          ID interno: {prob.id}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE EDICIÓN DE PREGUNTA */}
      {editingProblem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-uni-900 border border-slate-300 dark:border-blue-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-500" />
                Modificar Pregunta
              </h3>
              <button
                type="button"
                onClick={() => setEditingProblem(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Asignatura
                  </label>
                  <select
                    value={editingProblem.course}
                    onChange={(e) => {
                      const nextCourse = e.target.value;
                      const nextTopics =
                        curriculum.find((c) => c.course === nextCourse)
                          ?.topics || [];
                      setEditingProblem((prev) => ({
                        ...prev,
                        course: nextCourse,
                        topic: nextTopics[0] || prev.topic || "General",
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
                  >
                    {curriculum.map((c) => (
                      <option key={c.course} value={c.course}>
                        {c.course}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Tema / Unidad
                  </label>
                  {editCourseTopics.length > 0 ? (
                    <select
                      value={editingProblem.topic}
                      onChange={(e) =>
                        setEditingProblem((prev) => ({
                          ...prev,
                          topic: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
                    >
                      {!editCourseTopics.includes(editingProblem.topic) && (
                        <option value={editingProblem.topic}>
                          {editingProblem.topic}
                        </option>
                      )}
                      {editCourseTopics.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editingProblem.topic}
                      onChange={(e) =>
                        setEditingProblem((prev) => ({
                          ...prev,
                          topic: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Dificultad
                  </label>
                  <select
                    value={editingProblem.difficulty}
                    onChange={(e) =>
                      setEditingProblem((prev) => ({
                        ...prev,
                        difficulty: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Enunciado (LaTeX soportado)
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingProblem.statement}
                  onChange={(e) =>
                    setEditingProblem((prev) => ({
                      ...prev,
                      statement: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
                />
                {editingProblem.statement.trim() && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
                    <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block mb-1">
                      Vista previa enunciado:
                    </span>
                    <MathText text={editingProblem.statement} />
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Pasos de Desarrollo (Pauta)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditSteps((prev) => [
                        ...prev,
                        { title: `Paso ${prev.length + 1}`, content: "" },
                      ])
                    }
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir Paso
                  </button>
                </div>

                {editSteps.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) =>
                          setEditSteps((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, title: e.target.value }
                                : item
                            )
                          )
                        }
                        placeholder="Título del paso"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditSteps((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                        title="Eliminar paso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={st.content}
                      onChange={(e) =>
                        setEditSteps((prev) =>
                          prev.map((item, i) =>
                            i === idx
                              ? { ...item, content: e.target.value }
                              : item
                          )
                        )
                      }
                      placeholder="Desarrollo matemático..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Respuesta / Conclusión Final
                </label>
                <input
                  type="text"
                  required
                  value={editingProblem.answer}
                  onChange={(e) =>
                    setEditingProblem((prev) => ({
                      ...prev,
                      answer: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
                />
                {editingProblem.answer.trim() && (
                  <div className="mt-1.5 text-xs flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="font-bold">Vista previa respuesta:</span>
                    <MathText text={editingProblem.answer} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Variables Paramétricas (JSON opcional)
                </label>
                <textarea
                  rows={2}
                  value={editVariablesText}
                  onChange={(e) => setEditVariablesText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProblem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingEdit ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 4: PROPUESTAS PENDIENTES                                      */}
      {/* ===================================================================== */}
      {subTab === "proposals" && (
        <div className="space-y-4">
          {allPendingProblems.length === 0 ? (
            <div className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-8 text-center text-sm text-slate-500">
              No hay ejercicios pendientes de aprobación.
            </div>
          ) : (
            allPendingProblems.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {p.course} • {p.topic} ({p.difficulty})
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        p._isLocal
                          ? onApproveLocalProblem?.(p)
                          : handleDbProblemDecision(p.id, "approved")
                      }
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                    </button>
                    <button
                      onClick={() =>
                        p._isLocal
                          ? onRejectLocalProblem?.(p.id)
                          : handleDbProblemDecision(p.id, "rejected")
                      }
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>
                </div>
                <div className="text-sm">
                  <MathText text={p.statement} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 5: USUARIOS PENDIENTES                                        */}
      {/* ===================================================================== */}
      {subTab === "users" && (
        <div className="bg-white dark:bg-uni-900 border border-slate-200 dark:border-blue-900/60 rounded-2xl p-6">
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No hay solicitudes de estudiantes pendientes.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <div>
                    <p className="font-bold text-sm">{u.full_name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <button
                    onClick={() => handleApproveUser(u.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                  >
                    Aprobar Acceso
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}