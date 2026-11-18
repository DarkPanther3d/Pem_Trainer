import React, { useState, useEffect, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { CURRICULUM, SEED_PROBLEMS } from "./data/curriculum";
import AuthGate from "./components/AuthGate";
import BrandLogo from "./components/BrandLogo";
import ProblemBank from "./components/ProblemBank";
import ExamBuilder from "./components/ExamBuilder";
import ProposalForm from "./components/ProposalForm";
import AdminPanel from "./components/AdminPanel";
import {
  BookOpen,
  FileSpreadsheet,
  Lightbulb,
  ShieldAlert,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
} from "lucide-react";

const CUSTOM_CURRICULUM_KEY = "pem-trainer-custom-curriculum";
const HIDDEN_CURRICULUM_KEY = "pem-trainer-hidden-curriculum";
const PROBLEM_OVERRIDES_KEY = "pem-trainer-problem-overrides";
const DELETED_PROBLEMS_KEY = "pem-trainer-deleted-problems";
const LOCAL_PROBLEMS_KEY = "pem-trainer-local-problems";

const HIDDEN_COURSE_MARKER = "__HIDDEN_COURSE__";
const HIDDEN_TOPIC_MARKER = "__HIDDEN_TOPIC__";

function mergeCurriculum(baseList, customItems, hiddenState) {
  const hiddenCourses = new Set(hiddenState?.courses || []);
  const hiddenTopics = new Set(hiddenState?.topics || []);
  const map = new Map();

  baseList.forEach((item) => {
    if (hiddenCourses.has(item.course)) return;
    const visibleTopics = (item.topics || []).filter(
      (t) => !hiddenTopics.has(`${item.course}:::${t}`)
    );
    map.set(item.course, new Set(visibleTopics));
  });

  customItems.forEach(({ course, topic }) => {
    if (!course || course === HIDDEN_COURSE_MARKER || course === HIDDEN_TOPIC_MARKER) {
      return;
    }
    if (!map.has(course)) {
      map.set(course, new Set());
    }
    if (topic && topic.trim()) {
      map.get(course).add(topic.trim());
    }
  });

  return Array.from(map.entries()).map(([course, topicsSet]) => ({
    course,
    topics: Array.from(topicsSet),
  }));
}

function isLocalOnlyId(id) {
  const str = String(id || "");
  return (
    str.startsWith("seed-") ||
    str.startsWith("local-") ||
    str.startsWith("bulk-") ||
    str.startsWith("json-") ||
    str.startsWith("ai-")
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("pem-trainer-theme") !== "light";
  });

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const [activeTab, setActiveTab] = useState("bank");

  const [localGeneratedProblems, setLocalGeneratedProblems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PROBLEMS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [problemOverrides, setProblemOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem(PROBLEM_OVERRIDES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(DELETED_PROBLEMS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const applyLocalAdjustments = (
    list,
    overrides = problemOverrides,
    deleted = deletedIds
  ) => {
    const deletedSet = new Set(deleted);
    return list
      .filter((item) => !deletedSet.has(item.id))
      .map((item) =>
        overrides[item.id] ? { ...item, ...overrides[item.id] } : item
      );
  };

  const [problems, setProblems] = useState(() =>
    applyLocalAdjustments([...localGeneratedProblems, ...SEED_PROBLEMS])
  );
  const [localPending, setLocalPending] = useState([]);

  const [customCurriculum, setCustomCurriculum] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_CURRICULUM_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hiddenCurriculum, setHiddenCurriculum] = useState(() => {
    try {
      const saved = localStorage.getItem(HIDDEN_CURRICULUM_KEY);
      return saved ? JSON.parse(saved) : { courses: [], topics: [] };
    } catch {
      return { courses: [], topics: [] };
    }
  });

  const curriculum = useMemo(
    () => mergeCurriculum(CURRICULUM, customCurriculum, hiddenCurriculum),
    [customCurriculum, hiddenCurriculum]
  );

  useEffect(() => {
    localStorage.setItem(
      LOCAL_PROBLEMS_KEY,
      JSON.stringify(localGeneratedProblems)
    );
  }, [localGeneratedProblems]);

  useEffect(() => {
    localStorage.setItem(
      CUSTOM_CURRICULUM_KEY,
      JSON.stringify(customCurriculum)
    );
  }, [customCurriculum]);

  useEffect(() => {
    localStorage.setItem(
      HIDDEN_CURRICULUM_KEY,
      JSON.stringify(hiddenCurriculum)
    );
  }, [hiddenCurriculum]);

  useEffect(() => {
    localStorage.setItem(
      PROBLEM_OVERRIDES_KEY,
      JSON.stringify(problemOverrides)
    );
  }, [problemOverrides]);

  useEffect(() => {
    localStorage.setItem(DELETED_PROBLEMS_KEY, JSON.stringify(deletedIds));
  }, [deletedIds]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("pem-trainer-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("pem-trainer-theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) fetchProfileAndProblems(s.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        fetchProfileAndProblems(s.user.id);
      } else {
        setProfile(null);
        setProfileError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadCustomCurriculumFromDb = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data, error } = await supabase
      .from("custom_curriculum")
      .select("id, course, topic")
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data)) {
      const normalRows = [];
      const dbHiddenCourses = new Set();
      const dbHiddenTopics = new Set();

      data.forEach((row) => {
        if (row.course === HIDDEN_COURSE_MARKER && row.topic) {
          dbHiddenCourses.add(row.topic);
        } else if (row.course === HIDDEN_TOPIC_MARKER && row.topic) {
          dbHiddenTopics.add(row.topic);
        } else {
          normalRows.push(row);
        }
      });

      setCustomCurriculum((prev) => {
        const merged = [...normalRows];
        prev.forEach((localItem) => {
          const exists = merged.some(
            (dbItem) =>
              dbItem.course === localItem.course &&
              (dbItem.topic || "") === (localItem.topic || "")
          );
          if (!exists) merged.push(localItem);
        });
        return merged;
      });

      setHiddenCurriculum((prev) => ({
        courses: Array.from(new Set([...(prev.courses || []), ...dbHiddenCourses])),
        topics: Array.from(new Set([...(prev.topics || []), ...dbHiddenTopics])),
      }));
    }
  };

  const reloadApprovedProblems = async () => {
    if (!isSupabaseConfigured || !supabase || demoMode) {
      setProblems(
        applyLocalAdjustments([...localGeneratedProblems, ...SEED_PROBLEMS])
      );
      return;
    }

    let allDbProblems = [];
    let from = 0;
    const pageSize = 1000;
    let keepFetching = true;

    while (keepFetching) {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error || !data) break;
      allDbProblems = [...allDbProblems, ...data];

      if (data.length < pageSize) {
        keepFetching = false;
      } else {
        from += pageSize;
      }
    }

    setProblems(
      applyLocalAdjustments([
        ...localGeneratedProblems,
        ...SEED_PROBLEMS,
        ...allDbProblems,
      ])
    );
  };

  const fetchProfileAndProblems = async (userId) => {
    setLoadingProfile(true);
    setProfileError(null);

    try {
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profErr) {
        setProfileError(profErr.message);
        setProfile(null);
        return;
      }

      setProfile(prof);

      if (prof?.is_approved) {
        await Promise.all([
          reloadApprovedProblems(),
          loadCustomCurriculumFromDb(),
        ]);
      }
    } catch (err) {
      setProfileError(err.message || "Error inesperado al cargar el perfil.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProblem = async (updatedProblem) => {
    const {
      id,
      course,
      topic,
      difficulty,
      statement,
      variables,
      steps,
      answer,
    } = updatedProblem;

    const cleanFields = {
      course,
      topic,
      difficulty,
      statement,
      variables: variables || {},
      steps: steps || [],
      answer,
    };

    if (isSupabaseConfigured && supabase && !demoMode && !isLocalOnlyId(id)) {
      const { error } = await supabase
        .from("problems")
        .update(cleanFields)
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      setLocalGeneratedProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...cleanFields } : p))
      );
      setProblemOverrides((prev) => ({
        ...prev,
        [id]: cleanFields,
      }));
    }

    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...cleanFields } : p))
    );
  };

  const handleDeleteProblem = async (problemId) => {
    if (
      isSupabaseConfigured &&
      supabase &&
      !demoMode &&
      !isLocalOnlyId(problemId)
    ) {
      const { error } = await supabase
        .from("problems")
        .delete()
        .eq("id", problemId);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      setLocalGeneratedProblems((prev) =>
        prev.filter((p) => p.id !== problemId)
      );
      setDeletedIds((prev) =>
        prev.includes(problemId) ? prev : [...prev, problemId]
      );
    }

    setProblems((prev) => prev.filter((p) => p.id !== problemId));
  };

  // --- Agregar Asignatura ---
  const handleAddCourse = async (courseName, initialTopics = []) => {
    const cleanCourse = courseName.trim();
    if (!cleanCourse) return;

    const cleanTopics = initialTopics.map((t) => t.trim()).filter(Boolean);

    // Si estaba oculta previamente, rehabilitarla
    setHiddenCurriculum((prev) => ({
      courses: prev.courses.filter(
        (c) => c.toLowerCase() !== cleanCourse.toLowerCase()
      ),
      topics: prev.topics.filter(
        (t) =>
          !cleanTopics.some(
            (ct) => t.toLowerCase() === `${cleanCourse}:::${ct}`.toLowerCase()
          )
      ),
    }));

    const newRows =
      cleanTopics.length > 0
        ? cleanTopics.map((topic) => ({ course: cleanCourse, topic }))
        : [{ course: cleanCourse, topic: null }];

    setCustomCurriculum((prev) => {
      const next = [...prev];
      newRows.forEach((row) => {
        const exists = next.some(
          (item) =>
            item.course.toLowerCase() === row.course.toLowerCase() &&
            (item.topic || "").toLowerCase() === (row.topic || "").toLowerCase()
        );
        if (!exists) {
          next.push({ id: `local-${Date.now()}-${Math.random()}`, ...row });
        }
      });
      return next;
    });

    if (isSupabaseConfigured && supabase && !demoMode) {
      await supabase
        .from("custom_curriculum")
        .delete()
        .eq("course", HIDDEN_COURSE_MARKER)
        .eq("topic", cleanCourse);

      await supabase.from("custom_curriculum").upsert(newRows, {
        onConflict: "course,topic",
      });
      await loadCustomCurriculumFromDb();
    }
  };

  // --- Agregar Tema ---
  const handleAddTopic = async (courseName, topicName) => {
    const cleanCourse = courseName.trim();
    const cleanTopic = topicName.trim();
    if (!cleanCourse || !cleanTopic) return;

    const hiddenKey = `${cleanCourse}:::${cleanTopic}`;

    setHiddenCurriculum((prev) => ({
      ...prev,
      topics: prev.topics.filter(
        (t) => t.toLowerCase() !== hiddenKey.toLowerCase()
      ),
    }));

    setCustomCurriculum((prev) => {
      const exists = prev.some(
        (item) =>
          item.course.toLowerCase() === cleanCourse.toLowerCase() &&
          (item.topic || "").toLowerCase() === cleanTopic.toLowerCase()
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          id: `local-${Date.now()}-${Math.random()}`,
          course: cleanCourse,
          topic: cleanTopic,
        },
      ];
    });

    if (isSupabaseConfigured && supabase && !demoMode) {
      await supabase
        .from("custom_curriculum")
        .delete()
        .eq("course", HIDDEN_TOPIC_MARKER)
        .eq("topic", hiddenKey);

      await supabase
        .from("custom_curriculum")
        .upsert([{ course: cleanCourse, topic: cleanTopic }], {
          onConflict: "course,topic",
        });
      await loadCustomCurriculumFromDb();
    }
  };

  // --- Eliminar cualquier Asignatura (personalizada o base) ---
  const handleDeleteCourse = async (courseName) => {
    const isBaseCourse = CURRICULUM.some((c) => c.course === courseName);

    setCustomCurriculum((prev) =>
      prev.filter((item) => item.course !== courseName)
    );

    setHiddenCurriculum((prev) => ({
      courses: isBaseCourse
        ? Array.from(new Set([...prev.courses, courseName]))
        : prev.courses,
      topics: prev.topics.filter((t) => !t.startsWith(`${courseName}:::`)),
    }));

    if (isSupabaseConfigured && supabase && !demoMode) {
      await supabase
        .from("custom_curriculum")
        .delete()
        .eq("course", courseName);

      if (isBaseCourse) {
        await supabase
          .from("custom_curriculum")
          .upsert([{ course: HIDDEN_COURSE_MARKER, topic: courseName }], {
            onConflict: "course,topic",
          });
      }
    }
  };

  // --- Eliminar cualquier Tema (personalizado o base) ---
  const handleDeleteTopic = async (courseName, topicName) => {
    const baseCourse = CURRICULUM.find((c) => c.course === courseName);
    const isBaseTopic = !!baseCourse?.topics?.includes(topicName);
    const hiddenKey = `${courseName}:::${topicName}`;

    setCustomCurriculum((prev) => {
      const remaining = prev.filter(
        (item) => !(item.course === courseName && item.topic === topicName)
      );
      // Si era una asignatura personalizada y se quedó sin filas, conservar la asignatura vacía
      const isCustomCourse = !baseCourse;
      const stillHasCourseRow = remaining.some(
        (item) => item.course === courseName
      );
      if (isCustomCourse && !stillHasCourseRow) {
        return [
          ...remaining,
          { id: `local-${Date.now()}`, course: courseName, topic: null },
        ];
      }
      return remaining;
    });

    if (isBaseTopic) {
      setHiddenCurriculum((prev) => ({
        ...prev,
        topics: Array.from(new Set([...prev.topics, hiddenKey])),
      }));
    }

    if (isSupabaseConfigured && supabase && !demoMode) {
      await supabase
        .from("custom_curriculum")
        .delete()
        .eq("course", courseName)
        .eq("topic", topicName);

      if (!baseCourse) {
        await supabase
          .from("custom_curriculum")
          .upsert([{ course: courseName, topic: null }], {
            onConflict: "course,topic",
          });
      }

      if (isBaseTopic) {
        await supabase
          .from("custom_curriculum")
          .upsert([{ course: HIDDEN_TOPIC_MARKER, topic: hiddenKey }], {
            onConflict: "course,topic",
          });
      }
    }
  };

  // --- Restaurar asignaturas/temas base eliminados ---
  const handleRestoreBaseCurriculum = async () => {
    setHiddenCurriculum({ courses: [], topics: [] });

    if (isSupabaseConfigured && supabase && !demoMode) {
      await supabase
        .from("custom_curriculum")
        .delete()
        .in("course", [HIDDEN_COURSE_MARKER, HIDDEN_TOPIC_MARKER]);
    }
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setProfileError(null);
    setDemoMode(false);
  };

  if (session && !demoMode && loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-uni-950 text-slate-700 dark:text-slate-200">
        <div className="flex items-center gap-3 font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          Verificando permisos de cuenta...
        </div>
      </div>
    );
  }

  if (session && !demoMode && !profile && profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-uni-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-uni-900 border border-red-300 dark:border-red-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
            Error al consultar perfil en Supabase
          </h2>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs font-mono text-red-700 dark:text-red-300">
            {profileError}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => fetchProfileAndProblems(session.user.id)}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              Reintentar
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAuthenticated =
    demoMode || (session && profile && profile.is_approved);

  if (!isAuthenticated) {
    return (
      <AuthGate
        session={session}
        profile={profile}
        onDemoLogin={() => {
          setDemoMode(true);
          setProfile({
            id: "demo-admin",
            full_name: "Creador (Modo Demo)",
            role: "admin",
            is_approved: true,
          });
        }}
        onSignOut={handleSignOut}
      />
    );
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-uni-950 text-slate-900 dark:text-slate-100">
      <header className="no-print border-b border-blue-200/80 dark:border-blue-900/60 bg-white/90 dark:bg-uni-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-10 h-10" />
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                PEM Trainer
              </h1>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                Ingeniería & Matemática Pura
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("bank")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "bank"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-blue-600"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Entrenamiento Aleatorio
            </button>

            <button
              onClick={() => setActiveTab("exam")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "exam"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-blue-600"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Prueba PDF
            </button>

            <button
              onClick={() => setActiveTab("propose")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === "propose"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-blue-600"
              }`}
            >
              <Lightbulb className="w-4 h-4" /> Proponer Ejercicio
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === "admin"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                }`}
              >
                <ShieldAlert className="w-4 h-4" /> Administración
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Cambiar tema claro/oscuro"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-blue-300 hover:border-blue-400 transition"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleSignOut}
              title="Cerrar sesión"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-500 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "bank" && (
          <ProblemBank problems={problems} curriculum={curriculum} />
        )}
        {activeTab === "exam" && (
          <ExamBuilder problems={problems} curriculum={curriculum} />
        )}
        {activeTab === "propose" && (
          <ProposalForm
            profile={profile}
            curriculum={curriculum}
            onLocalProposalAdded={(p) => setLocalPending((prev) => [p, ...prev])}
          />
        )}
        {activeTab === "admin" && isAdmin && (
          <AdminPanel
            session={session}
            demoMode={demoMode}
            problems={problems}
            curriculum={curriculum}
            onUpdateProblem={handleUpdateProblem}
            onDeleteProblem={handleDeleteProblem}
            onAddCourse={handleAddCourse}
            onAddTopic={handleAddTopic}
            onDeleteCourse={handleDeleteCourse}
            onDeleteTopic={handleDeleteTopic}
            onRestoreBaseCurriculum={handleRestoreBaseCurriculum}
            hasHiddenBaseCurriculum={
              hiddenCurriculum.courses.length > 0 ||
              hiddenCurriculum.topics.length > 0
            }
            onProblemsMutated={async (localNewItems) => {
              if (Array.isArray(localNewItems)) {
                setLocalGeneratedProblems((prev) => [
                  ...localNewItems,
                  ...prev,
                ]);
                setProblems((prev) => [...localNewItems, ...prev]);
              } else {
                await reloadApprovedProblems();
              }
            }}
            localPendingProblems={localPending}
            onApproveLocalProblem={(p) => {
              const approved = { ...p, status: "approved" };
              setLocalGeneratedProblems((prev) => [approved, ...prev]);
              setProblems((prev) => [approved, ...prev]);
              setLocalPending((prev) => prev.filter((item) => item.id !== p.id));
            }}
            onRejectLocalProblem={(id) =>
              setLocalPending((prev) => prev.filter((item) => item.id !== id))
            }
          />
        )}
      </main>
    </div>
  );
}