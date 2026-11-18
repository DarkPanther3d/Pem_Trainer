export const CURRICULUM = [
  {
    course: "Álgebra Básica",
    topics: [
      "Expresiones Algebraicas",
      "Polinomios y División Sintética",
      "Ecuaciones e Inecuaciones Polinómicas",
      "Exponenciales y Logarítmicas",
      "Valor Absoluto",
      "Trigonometría",
    ],
  },
  {
    course: "Álgebra I",
    topics: [
      "Lógica",
      "Teoría de Conjuntos",
      "Números Complejos",
      "Funciones",
      "Combinatoria y Binomio de Newton",
    ],
  },
  {
    course: "Introducción al Cálculo",
    topics: ["Geometría Analítica", "Funciones", "Límites y Continuidad"],
  },
  {
    course: "Cálculo I",
    topics: ["Derivadas", "Integrales Indefinidas"],
  },
  {
    course: "Cálculo II",
    topics: [
      "Integrales Definidas y Aplicaciones",
      "Coordenadas Polares",
      "Series y Sucesiones",
    ],
  },
  {
    course: "Geometría I",
    topics: [
      "Axiomas de Euclides",
      "Construcciones Geométricas (Regla y Compás)",
      "Triángulos",
    ],
  },
  {
    course: "Geometría II",
    topics: ["Cuadriláteros", "Circunferencias", "Cuerpos Geométricos"],
  },
];

export const SEED_PROBLEMS = [
  {
    id: "seed-1",
    course: "Álgebra Básica",
    topic: "Polinomios y División Sintética",
    type: "parametric",
    difficulty: "Intermedio",
    title: "Teorema del Resto y División Sintética",
    statement_latex:
      "Determine el resto de dividir el polinomio $P(x) = {{a}}x^3 - {{b}}x^2 + {{c}}x - {{d}}$ entre $(x - {{r}})$.",
    params_config: {
      a: { min: 2, max: 5 },
      b: { min: 1, max: 6 },
      c: { min: 1, max: 8 },
      d: { min: 1, max: 9 },
      r: { min: 1, max: 3 },
    },
    expressions_config: {
      r3: "r ^ 3",
      r2: "r ^ 2",
      resto: "a * (r ^ 3) - b * (r ^ 2) + c * r - d",
      dist1: "a * (r ^ 3) + b * (r ^ 2) + c * r - d",
      dist2: "resto + r",
      dist3: "resto - a",
    },
    answer_latex: "${{resto}}$",
    distractors_latex: ["${{dist1}}$", "${{dist2}}$", "${{dist3}}$"],
    steps_latex: [
      {
        title: "Aplicar el Teorema del Resto",
        content:
          "Al dividir $P(x)$ por $(x - {{r}})$, el resto es exactamente $R = P({{r}})$.",
      },
      {
        title: "Evaluar $x = {{r}}$ en el polinomio",
        content:
          "$$P({{r}}) = {{a}}({{r}})^3 - {{b}}({{r}})^2 + {{c}}({{r}}) - {{d}}$$",
      },
      {
        title: "Simplificar aritméticamente",
        content:
          "$$P({{r}}) = {{a}}({{r3}}) - {{b}}({{r2}}) + {{c}}({{r}}) - {{d}} = {{resto}}$$",
      },
    ],
  },
  {
    id: "seed-2",
    course: "Álgebra I",
    topic: "Teoría de Conjuntos",
    type: "proof",
    difficulty: "Avanzado",
    title: "Ley de De Morgan para Diferencia de Conjuntos",
    statement_latex:
      "Sean $A, B, C$ subconjuntos de un universo $U$. Demuestre formalmente que:\n$$A \\setminus (B \\cup C) = (A \\setminus B) \\cap (A \\setminus C)$$",
    answer_latex: "Demostración por doble inclusión ($\\subseteq$ y $\\supseteq$) $\\blacksquare$",
    distractors_latex: [
      "Solo válido si $B \\cap C = \\emptyset$",
      "Falso para conjuntos infinitos",
      "Equivale a $(A \\setminus B) \\cup (A \\setminus C)$",
    ],
    steps_latex: [
      {
        title: "Paso 1: Definición por elemento arbitrario",
        content:
          "Sea $x \\in U$ un elemento arbitrario. Por definición de diferencia de conjuntos:\n$$x \\in A \\setminus (B \\cup C) \\iff x \\in A \\land x \\notin (B \\cup C)$$",
      },
      {
        title: "Paso 2: Negación de la unión (Lógica Proposicional)",
        content:
          "Recordando que $x \\in (B \\cup C) \\iff (x \\in B \\lor x \\in C)$, negamos mediante De Morgan:\n$$x \\in A \\land \\neg(x \\in B \\lor x \\in C) \\iff x \\in A \\land (x \\notin B \\land x \\notin C)$$",
      },
      {
        title: "Paso 3: Idempotencia y asociatividad de $\\land$",
        content:
          "Como $p \\iff (p \\land p)$, reordenamos los términos:\n$$(x \\in A \\land x \\notin B) \\land (x \\in A \\land x \\notin C)$$",
      },
      {
        title: "Paso 4: Conclusión",
        content:
          "Por definición de diferencia e intersección:\n$$x \\in (A \\setminus B) \\cap (A \\setminus C) \\quad \\blacksquare$$",
      },
    ],
  },
  {
    id: "seed-3",
    course: "Introducción al Cálculo",
    topic: "Límites y Continuidad",
    type: "proof",
    difficulty: "Avanzado",
    title: "Demostración Formal de Límite Lineal ($\\varepsilon - \\delta$)",
    statement_latex:
      "Utilizando la definición formal $\\varepsilon - \\delta$, demuestre que:\n$$\\lim_{x \\to 3} (4x - 5) = 7$$",
    answer_latex: "Elección $\\delta = \\frac{\\varepsilon}{4} > 0 \\quad \\blacksquare$",
    distractors_latex: [
      "Elección $\\delta = 4\\varepsilon$",
      "Elección $\\delta = \\varepsilon - 5$",
      "El límite no existe en $x = 3$",
    ],
    steps_latex: [
      {
        title: "Paso 1: Plantear la definición formal",
        content:
          "Debemos probar que $\\forall \\varepsilon > 0, \\exists \\delta > 0$ tal que si $0 < |x - 3| < \\delta$, entonces $|(4x - 5) - 7| < \\varepsilon$.",
      },
      {
        title: "Paso 2: Acotar $|f(x) - L|$ en función de $|x - 3|$",
        content:
          "$$|(4x - 5) - 7| = |4x - 12| = |4(x - 3)| = 4|x - 3|$$",
      },
      {
        title: "Paso 3: Elección de $\\delta$ y verificación",
        content:
          "Dado $\\varepsilon > 0$, escogemos $\\delta = \\frac{\\varepsilon}{4} > 0$. Si $0 < |x - 3| < \\delta$, entonces:\n$$|(4x - 5) - 7| = 4|x - 3| < 4\\delta = 4\\left(\\frac{\\varepsilon}{4}\\right) = \\varepsilon \\quad \\blacksquare$$",
      },
    ],
  },
  {
    id: "seed-4",
    course: "Cálculo I",
    topic: "Derivadas",
    type: "parametric",
    difficulty: "Básico",
    title: "Derivada Polinómica Evaluada en un Punto",
    statement_latex:
      "Sea la función $f(x) = {{a}}x^{{{n}}} + {{b}}x^2 - {{c}}$. Calcule el valor de $f'({{x0}})$.",
    params_config: {
      a: { min: 2, max: 6 },
      n: { min: 3, max: 4 },
      b: { min: 2, max: 7 },
      c: { min: 1, max: 15 },
      x0: { min: 1, max: 3 },
    },
    expressions_config: {
      an: "a * n",
      n1: "n - 1",
      b2: "2 * b",
      ans: "a * n * (x0 ^ (n - 1)) + 2 * b * x0",
      d1: "a * (x0 ^ n) + b * (x0 ^ 2) - c",
      d2: "ans + c",
      d3: "a * n * (x0 ^ (n - 1))",
    },
    answer_latex: "${{ans}}$",
    distractors_latex: ["${{d1}}$", "${{d2}}$", "${{d3}}$"],
    steps_latex: [
      {
        title: "Derivar término a término",
        content:
          "Aplicando $\\frac{d}{dx}(x^k) = kx^{k-1}$ y $\\frac{d}{dx}(C) = 0$:\n$$f'(x) = {{an}}x^{{{n1}}} + {{b2}}x$$",
      },
      {
        title: "Evaluar en $x = {{x0}}$",
        content:
          "$$f'({{x0}}) = {{an}}({{x0}})^{{{n1}}} + {{b2}}({{x0}}) = {{ans}}$$",
      },
    ],
  },
  {
    id: "seed-5",
    course: "Cálculo II",
    topic: "Integrales Definidas y Aplicaciones",
    type: "parametric",
    difficulty: "Intermedio",
    title: "Área bajo una Parábola",
    statement_latex:
      "Calcule el valor de la integral definida:\n$$I = \\int_{0}^{{{b}}} {{k}}x^2 \\, dx$$",
    params_config: {
      k: { choices: [3, 6, 9, 12] },
      b: { min: 2, max: 5 },
    },
    expressions_config: {
      k3: "k / 3",
      ans: "(k / 3) * (b ^ 3)",
      d1: "k * (b ^ 2)",
      d2: "(k / 3) * (b ^ 2)",
      d3: "k * (b ^ 3)",
    },
    answer_latex: "${{ans}}$",
    distractors_latex: ["${{d1}}$", "${{d2}}$", "${{d3}}$"],
    steps_latex: [
      {
        title: "Encontrar la primitiva $F(x)$",
        content:
          "$$F(x) = \\int {{k}}x^2 \\, dx = \\frac{{{k}}}{3}x^3 = {{k3}}x^3$$",
      },
      {
        title: "Aplicar Segundo Teorema Fundamental del Cálculo",
        content:
          "$$I = F({{b}}) - F(0) = {{k3}}({{b}})^3 - 0 = {{ans}}$$",
      },
    ],
  },
  {
    id: "seed-6",
    course: "Geometría I",
    topic: "Triángulos",
    type: "proof",
    difficulty: "Intermedio",
    title: "Suma de Ángulos Interiores de un Triángulo (Postulado de las Paralelas)",
    statement_latex:
      "Dado un triángulo $\\triangle ABC$ en el plano euclidiano, demuestre usando el Quinto Postulado de Euclides que:\n$$\\alpha + \\beta + \\gamma = 180^\\circ$$",
    answer_latex: "Demostración mediante recta paralela por el vértice $C$ $\\blacksquare$",
    distractors_latex: [
      "Solo se cumple en triángulos isósceles",
      "Requiere el Teorema de Pitágoras",
      "La suma es $360^\\circ$",
    ],
    steps_latex: [
      {
        title: "Paso 1: Construcción auxiliar",
        content:
          "Por el vértice $C$, trazamos la única recta $\\overleftrightarrow{XY}$ paralela al lado $\\overline{AB}$ (Postulado de las Paralelas).",
      },
      {
        title: "Paso 2: Ángulos alternos internos",
        content:
          "Al cortar las paralelas $\\overleftrightarrow{XY} \\parallel \\overline{AB}$ con las transversales $\\overline{AC}$ y $\\overline{BC}$, se cumple:\n$$\\angle XCA = \\alpha \\quad \\text{y} \\quad \\angle YCB = \\beta$$",
      },
      {
        title: "Paso 3: Ángulo extendido",
        content:
          "Los ángulos sobre la recta $\\overleftrightarrow{XY}$ en el vértice $C$ forman un ángulo llano:\n$$\\angle XCA + \\gamma + \\angle YCB = 180^\\circ \\implies \\alpha + \\gamma + \\beta = 180^\\circ \\quad \\blacksquare$$",
      },
    ],
  },
  {
    id: "seed-7",
    course: "Geometría II",
    topic: "Circunferencias",
    type: "parametric",
    difficulty: "Intermedio",
    title: "Teorema de las Cuerdas Secantes",
    statement_latex:
      "En una circunferencia, dos cuerdas $\\overline{AB}$ y $\\overline{CD}$ se intersecan en un punto interior $P$. Si $AP = {{ap}}$, $PB = {{pb}}$ y $CP = {{cp}}$, determine la longitud del segmento $PD$.",
    params_config: {
      cp: { choices: [2, 3, 4] },
      pd_target: { min: 4, max: 10 },
      ap: { choices: [2, 4, 6] },
    },
    expressions_config: {
      pb: "(cp * pd_target) / ap",
      ans: "pd_target",
      d1: "ap + pb - cp",
      d2: "cp + ap",
      d3: "pd_target + 2",
    },
    answer_latex: "$PD = {{ans}}$",
    distractors_latex: ["$PD = {{d1}}$", "$PD = {{d2}}$", "$PD = {{d3}}$"],
    steps_latex: [
      {
        title: "Enunciar el Teorema de las Cuerdas",
        content:
          "El producto de los segmentos determinados en cada cuerda es constante:\n$$AP \\cdot PB = CP \\cdot PD$$",
      },
      {
        title: "Sustituir y despejar $PD$",
        content:
          "$$({{ap}}) \\cdot ({{pb}}) = ({{cp}}) \\cdot PD \\implies PD = \\frac{{{ap}} \\cdot {{pb}}}{{{cp}}} = {{ans}}$$",
      },
    ],
  },
];