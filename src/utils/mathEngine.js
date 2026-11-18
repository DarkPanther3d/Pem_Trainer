import { evaluate } from "mathjs";

function randomInt(min, max, nonZero = false) {
  let val = Math.floor(Math.random() * (max - min + 1)) + min;
  if (nonZero && val === 0) {
    val = max > 0 ? 1 : -1;
  }
  return val;
}

function interpolateTemplate(template, scope) {
  if (!template) return "";
  return String(template).replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    return scope[key] !== undefined ? scope[key] : `{{${key}}}`;
  });
}

export function instantiateProblem(problem) {
  // Si es demostración formal o no tiene parámetros, devuelve tal cual
  if (
    problem.type === "proof" ||
    !problem.params_config ||
    Object.keys(problem.params_config).length === 0
  ) {
    return {
      ...problem,
      renderedStatement: problem.statement_latex,
      renderedAnswer: problem.answer_latex,
      renderedSteps: problem.steps_latex || [],
      options: buildOptions(problem.answer_latex, problem.distractors_latex || []),
    };
  }

  const scope = {};

  // 1. Generar parámetros aleatorios
  for (const [param, cfg] of Object.entries(problem.params_config)) {
    if (Array.isArray(cfg.choices)) {
      scope[param] = cfg.choices[Math.floor(Math.random() * cfg.choices.length)];
    } else {
      scope[param] = randomInt(cfg.min ?? 1, cfg.max ?? 9, cfg.nonZero ?? false);
    }
  }

  // 2. Evaluar expresiones derivadas en orden usando mathjs
  if (problem.expressions_config) {
    for (const [varName, expr] of Object.entries(problem.expressions_config)) {
      try {
        const res = evaluate(String(expr), { ...scope });
        scope[varName] =
          typeof res === "number" && !Number.isInteger(res)
            ? Number(res.toFixed(4))
            : res;
      } catch {
        scope[varName] = expr;
      }
    }
  }

  // 3. Interpolar LaTeX en enunciado, respuesta, distractores y pasos
  const renderedStatement = interpolateTemplate(problem.statement_latex, scope);
  const renderedAnswer = interpolateTemplate(problem.answer_latex, scope);
  const renderedDistractors = (problem.distractors_latex || []).map((d) =>
    interpolateTemplate(d, scope)
  );
  const renderedSteps = (problem.steps_latex || []).map((step) => ({
    title: interpolateTemplate(step.title, scope),
    content: interpolateTemplate(step.content, scope),
  }));

  return {
    ...problem,
    scope,
    renderedStatement,
    renderedAnswer,
    renderedSteps,
    options: buildOptions(renderedAnswer, renderedDistractors),
  };
}

function buildOptions(correct, distractors) {
  const unique = Array.from(new Set([correct, ...distractors])).slice(0, 4);
  // Mezcla aleatoria (Fisher-Yates)
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  return unique;
}