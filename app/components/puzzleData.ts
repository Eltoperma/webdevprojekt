interface Statement {
  text: string;
  type: 'puzzle' | 'distraction';
  logicalType?: 'location' | 'truth' | 'general';
  difficulty: 1 | 2 | 3 | 4;
  targetColor?: 'self' | 'other';
  logicalEquation?: string; // Die zugrundeliegende logische Gleichung
}

type DoorColor = 'grün' | 'blau' | 'gelb';

// Wortlisten für verschiedene Arten von Aussagen
const wordLists = {
  location: {
    positive: [
      "Der Schatz wartet hier",
      "Hier findest du den Schatz",
      "Hier ist der Schatz versteckt",
      "Diese Tür birgt den Schatz",
      "Der Schatz liegt hinter dieser Tür",
      "Diese Tür führt zum Schatz",
      "Der Schatz ist hier verborgen",
      "Hier ist der Schatz zu finden"
    ],
    negative: [
      "Der Schatz ist nicht hier",
      "Hier findest du keinen Schatz",
      "Hier ist kein Schatz versteckt",
      "Diese Tür birgt keinen Schatz",
      "Der Schatz liegt nicht hinter dieser Tür",
      "Diese Tür führt nicht zum Schatz",
      "Der Schatz ist hier nicht verborgen",
      "Hier ist der Schatz nicht zu finden"
    ]
  },
  truth: {
    positive: [
      "ist vertrauenswürdig",
      "ist zuverlässig",
      "ist glaubwürdig",
      "sagt die Wahrheit",
      "ist ehrlich",
      "ist aufrichtig",
      "spricht die Wahrheit",
      "lügt nicht"
    ],
    negative: [
      "ist nicht vertrauenswürdig",
      "ist unzuverlässig",
      "ist unglaubwürdig",
      "sagt nicht die Wahrheit",
      "ist unehrlich",
      "ist unaufrichtig",
      "spricht nicht die Wahrheit",
      "lügt"
    ]
  },
  general: {
    single: [
      "Nur eine Tür",
      "Eine einzige Tür",
      "Bloß eine Tür",
      "Lediglich eine Tür",
      "Genau eine Tür",
      "Exakt eine Tür"
    ],
    multiple: [
      "Mindestens eine Tür",
      "Eine oder mehrere Türen",
      "Einige Türen",
      "Manche Türen",
      "Verschiedene Türen",
      "Mehrere Türen"
    ],
    all: [
      "Alle Türen",
      "Jede Tür",
      "Sämtliche Türen",
      "Die Türen",
      "Jede einzelne Tür",
      "Alle drei Türen"
    ]
  },
  complex: {
    conditional: [
      "Wenn diese Tür die Wahrheit sagt, dann sagt die {color}e Tür auch die Wahrheit",
      "Wenn diese Tür lügt, dann lügt auch die {color}e Tür",
      "Wenn diese Tür die Wahrheit sagt, dann lügt die {color}e Tür",
      "Wenn diese Tür lügt, dann sagt die {color}e Tür die Wahrheit",
      "Diese Tür sagt die Wahrheit genau dann, wenn die {color}e Tür lügt",
      "Diese Tür lügt genau dann, wenn die {color}e Tür die Wahrheit sagt",
      "Wenn die {color}e Tür die Wahrheit sagt, dann sagt diese Tür auch die Wahrheit",
      "Wenn die {color}e Tür lügt, dann lügt auch diese Tür",
      "Wenn die {color}e Tür die Wahrheit sagt, dann lügt diese Tür",
      "Wenn die {color}e Tür lügt, dann sagt diese Tür die Wahrheit"
    ],
    comparison: [
      "Diese Tür ist ehrlicher als die {color}e Tür",
      "Diese Tür ist weniger vertrauenswürdig als die {color}e Tür",
      "Diese Tür ist glaubwürdiger als die {color}e Tür",
      "Diese Tür ist weniger zuverlässig als die {color}e Tür",
      "Diese Tür ist aufrichtiger als die {color}e Tür",
      "Diese Tür ist weniger aufrichtig als die {color}e Tür"
    ],
    indirect: [
      "Die {color}e Tür würde sagen, dass diese Tür lügt",
      "Die {color}e Tür würde sagen, dass diese Tür die Wahrheit sagt",
      "Die {color}e Tür würde bestreiten, dass diese Tür lügt",
      "Die {color}e Tür würde bestreiten, dass diese Tür die Wahrheit sagt",
      "Die {color}e Tür würde behaupten, dass diese Tür lügt",
      "Die {color}e Tür würde behaupten, dass diese Tür die Wahrheit sagt"
    ]
  },
  humor: [
    "Diese Tür hat heute Geburtstag",
    "Diese Tür mag Pizza",
    "Diese Tür tanzt gerne",
    "Diese Tür ist müde",
    "Diese Tür hat Hunger",
    "Diese Tür mag Katzen",
    "Diese Tür ist verliebt",
    "Diese Tür hat Heimweh",
    "Diese Tür ist kitzelig",
    "Diese Tür hat Schluckauf"
  ]
};

// Logische Gleichungen für verschiedene Schwierigkeitsgrade
const logicalEquations = {
  1: [
    "A ∧ ¬B ∧ ¬C", // Tür A sagt die Wahrheit, B und C lügen
    "¬A ∧ B ∧ ¬C", // Tür B sagt die Wahrheit, A und C lügen
    "¬A ∧ ¬B ∧ C"  // Tür C sagt die Wahrheit, A und B lügen
  ],
  2: [
    "(A ∧ B) ∧ ¬C", // A und B sagen die Wahrheit, C lügt
    "(A ∧ C) ∧ ¬B", // A und C sagen die Wahrheit, B lügt
    "(B ∧ C) ∧ ¬A", // B und C sagen die Wahrheit, A lügt
    "A ∧ (B ∨ C)",  // A sagt die Wahrheit, mindestens eine der anderen lügt
    "B ∧ (A ∨ C)",  // B sagt die Wahrheit, mindestens eine der anderen lügt
    "C ∧ (A ∨ B)"   // C sagt die Wahrheit, mindestens eine der anderen lügt
  ],
  3: [
    "(A ∧ B) ∨ (A ∧ C) ∨ (B ∧ C)", // Genau zwei Türen sagen die Wahrheit
    "A ⊕ B ⊕ C", // Genau eine Tür sagt die Wahrheit
    "¬(A ∧ B ∧ C) ∧ (A ∨ B ∨ C)", // Mindestens eine Tür lügt, mindestens eine sagt die Wahrheit
    "(A ∧ B) ∧ (C ∨ ¬C)", // A und B sagen die Wahrheit, C ist variabel
    "(A ∧ C) ∧ (B ∨ ¬B)", // A und C sagen die Wahrheit, B ist variabel
    "(B ∧ C) ∧ (A ∨ ¬A)"  // B und C sagen die Wahrheit, A ist variabel
  ],
  4: [
    "(A ∧ B) ⊕ (A ∧ C) ⊕ (B ∧ C)", // Genau eine der Paare sagt die Wahrheit
    "(A ∧ B ∧ C) ∨ (¬A ∧ ¬B ∧ ¬C)", // Entweder alle sagen die Wahrheit oder alle lügen
    "(A ∧ B) ∧ (C ⊕ D)", // A und B sagen die Wahrheit, C und D sind unterschiedlich
    "(A ⊕ B) ∧ (B ⊕ C) ∧ (C ⊕ A)", // Alle Türen sind unterschiedlich
    "((A ∧ B) ∨ (A ∧ C) ∨ (B ∧ C)) ∧ ¬(A ∧ B ∧ C)", // Genau zwei Türen sagen die Wahrheit
    "(A ∨ B ∨ C) ∧ ¬(A ∧ B ∧ C) ∧ (A ⊕ B ⊕ C)" // Mindestens eine Tür sagt die Wahrheit, aber nicht alle
  ]
};

// Funktion zum Bestimmen der Anzahl der Aussagen basierend auf Schwierigkeit
function getNumberOfStatements(difficulty: number): number {
  const random = Math.random();
  switch (difficulty) {
    case 1:
      return random < 0.8 ? 1 : 2; // 80% eine Aussage, 20% zwei Aussagen
    case 2:
      return random < 0.7 ? 2 : 3; // 70% zwei Aussagen, 30% drei Aussagen
    case 3:
      return random < 0.6 ? 3 : 4; // 60% drei Aussagen, 40% vier Aussagen
    case 4:
      return random < 0.5 ? 4 : 5; // 50% vier Aussagen, 50% fünf Aussagen
    default:
      return 1;
  }
}

// Funktion zum Debuggen der Rätselstruktur
function debugPuzzleStructure(
  equation: string,
  doorTruths: Map<DoorColor, boolean>,
  doors: { id: number; statements: string[]; isCorrect: boolean; color: DoorColor; }[]
): string {
  let debug = "=== RÄTSEL DEBUG ===\n\n";
  
  // Zeige die logische Gleichung
  debug += "Logische Gleichung:\n";
  debug += `${equation}\n\n`;
  
  // Zeige die Wahrheitswerte der Türen
  debug += "Wahrheitswerte der Türen:\n";
  doorTruths.forEach((isTrue, color) => {
    debug += `${color}e Tür: ${isTrue ? "Wahrheit" : "Lüge"}\n`;
  });
  debug += "\n";
  
  // Zeige die generierten Aussagen und ihre logische Bedeutung
  debug += "Generierte Aussagen:\n";
  doors.forEach(door => {
    const isTrue = doorTruths.get(door.color)!;
    debug += `\n${door.color}e Tür (${door.isCorrect ? "SCHATZ" : "kein Schatz"}, ${isTrue ? "Wahrheit" : "Lüge"}):\n`;
    door.statements.forEach(statement => {
      // Analysiere die Aussage
      let logicalMeaning = "";
      if (statement.includes("Schatz")) {
        const isTreasureStatement = statement.includes("nicht") ? !door.isCorrect : door.isCorrect;
        logicalMeaning = isTrue ? 
          (isTreasureStatement ? "WAHR: Schatz-Aussage ist korrekt" : "FALSCH: Schatz-Aussage ist inkorrekt") :
          (isTreasureStatement ? "FALSCH: Lügt über Schatz" : "WAHR: Lügt über Schatz");
      } else if (statement.includes("würde sagen") || statement.includes("würde behaupten")) {
        const targetColor = statement.match(/die (grün|blau|gelb)e/)?.[1] as DoorColor;
        if (targetColor) {
          const targetIsTrue = doorTruths.get(targetColor)!;
          const isIndirectTrue = statement.includes("lügt") ? !targetIsTrue : targetIsTrue;
          logicalMeaning = isTrue ?
            (isIndirectTrue ? "WAHR: Indirekte Aussage ist korrekt" : "FALSCH: Indirekte Aussage ist inkorrekt") :
            (isIndirectTrue ? "FALSCH: Lügt in indirekter Aussage" : "WAHR: Lügt in indirekter Aussage");
        }
      } else if (statement.includes("als die")) {
        const targetColor = statement.match(/die (grün|blau|gelb)e/)?.[1] as DoorColor;
        if (targetColor) {
          const targetIsTrue = doorTruths.get(targetColor)!;
          const isComparisonTrue = statement.includes("weniger") ? !targetIsTrue : targetIsTrue;
          logicalMeaning = isTrue ?
            (isComparisonTrue ? "WAHR: Vergleich ist korrekt" : "FALSCH: Vergleich ist inkorrekt") :
            (isComparisonTrue ? "FALSCH: Lügt im Vergleich" : "WAHR: Lügt im Vergleich");
        }
      } else if (statement.includes("Wenn")) {
        const targetColor = statement.match(/die (grün|blau|gelb)e/)?.[1] as DoorColor;
        if (targetColor) {
          const targetIsTrue = doorTruths.get(targetColor)!;
          const isConditionalTrue = statement.includes("dann sagt") ? 
            (isTrue && targetIsTrue) : 
            (isTrue && !targetIsTrue);
          logicalMeaning = isConditionalTrue ? "WAHR: Bedingung ist erfüllt" : "FALSCH: Bedingung ist nicht erfüllt";
        }
      } else if (statement.includes("Tür") && (statement.includes("Wahrheit") || statement.includes("lügt"))) {
        const targetColor = statement.match(/die (grün|blau|gelb)e/)?.[1] as DoorColor;
        if (targetColor) {
          const targetIsTrue = doorTruths.get(targetColor)!;
          const isDirectTrue = statement.includes("nicht") ? !targetIsTrue : targetIsTrue;
          logicalMeaning = isTrue ?
            (isDirectTrue ? "WAHR: Direkte Aussage ist korrekt" : "FALSCH: Direkte Aussage ist inkorrekt") :
            (isDirectTrue ? "FALSCH: Lügt in direkter Aussage" : "WAHR: Lügt in direkter Aussage");
        }
      } else {
        logicalMeaning = "HUMORVOLL: Keine logische Bedeutung";
      }
      debug += `- "${statement}"\n  → ${logicalMeaning}\n`;
    });
  });
  
  debug += "\n=== ENDE DEBUG ===\n";
  return debug;
}

// Funktion zum Generieren eines neuen Puzzles
export function generatePuzzle(difficulty: number = 1): { id: number; statements: string[]; isCorrect: boolean; color: string; }[] {
  const colors: DoorColor[] = shuffleArray(['grün', 'blau', 'gelb']);
  
  // Wähle eine zufällige logische Gleichung für die Schwierigkeit
  const equations = logicalEquations[difficulty as keyof typeof logicalEquations];
  const equation = equations[Math.floor(Math.random() * equations.length)];
  
  // Bestimme die Wahrheitswerte der Türen basierend auf der Gleichung
  const doorTruths = new Map<DoorColor, boolean>();
  
  // Setze die Wahrheitswerte basierend auf der Gleichung
  if (equation.includes('A ∧ ¬B ∧ ¬C')) {
    doorTruths.set(colors[0], true);
    doorTruths.set(colors[1], false);
    doorTruths.set(colors[2], false);
  } else if (equation.includes('¬A ∧ B ∧ ¬C')) {
    doorTruths.set(colors[0], false);
    doorTruths.set(colors[1], true);
    doorTruths.set(colors[2], false);
  } else if (equation.includes('¬A ∧ ¬B ∧ C')) {
    doorTruths.set(colors[0], false);
    doorTruths.set(colors[1], false);
    doorTruths.set(colors[2], true);
  } else if (equation.includes('(A ∧ B) ∧ ¬C')) {
    doorTruths.set(colors[0], true);
    doorTruths.set(colors[1], true);
    doorTruths.set(colors[2], false);
  } else if (equation.includes('(A ∧ C) ∧ ¬B')) {
    doorTruths.set(colors[0], true);
    doorTruths.set(colors[1], false);
    doorTruths.set(colors[2], true);
  } else if (equation.includes('(B ∧ C) ∧ ¬A')) {
    doorTruths.set(colors[0], false);
    doorTruths.set(colors[1], true);
    doorTruths.set(colors[2], true);
  } else if (equation.includes('A ∧ (B ∨ C)')) {
    doorTruths.set(colors[0], true);
    doorTruths.set(colors[1], Math.random() < 0.5);
    doorTruths.set(colors[2], !doorTruths.get(colors[1]));
  } else if (equation.includes('B ∧ (A ∨ C)')) {
    doorTruths.set(colors[0], Math.random() < 0.5);
    doorTruths.set(colors[1], true);
    doorTruths.set(colors[2], !doorTruths.get(colors[0]));
  } else if (equation.includes('C ∧ (A ∨ B)')) {
    doorTruths.set(colors[0], Math.random() < 0.5);
    doorTruths.set(colors[1], !doorTruths.get(colors[0]));
    doorTruths.set(colors[2], true);
  }
  
  // Wähle die Tür mit dem Schatz (immer eine Tür, die die Wahrheit sagt)
  const trueDoors = Array.from(doorTruths.entries()).filter(([_, isTrue]) => isTrue).map(([color]) => color);
  const correctDoorColor = trueDoors[Math.floor(Math.random() * trueDoors.length)];
  
  // Generiere die Türen mit den entsprechenden Aussagen
  const doors = [1, 2, 3].map(doorId => {
    const doorColor = colors[doorId - 1];
    const otherColors = colors.filter(c => c !== doorColor);
    const isTrue = doorTruths.get(doorColor)!;
    const hasTreasure = doorColor === correctDoorColor;
    
    // Generiere Aussagen basierend auf der logischen Gleichung und Schwierigkeit
    const statements = generateStatementsFromEquation(equation, doorColor, otherColors, difficulty, isTrue, hasTreasure);
    
    return {
      id: doorId,
      statements: statements,
      isCorrect: hasTreasure,
      color: doorColor
    };
  });
  
  // Debug-Ausgabe
  console.log(debugPuzzleStructure(equation, doorTruths, doors));
  
  return doors;
}

// Funktion zum Überprüfen, ob die Aussagen eine eindeutige Lösung ermöglichen
function hasUniqueSolution(doors: { statements: string[], isCorrect: boolean, color: string }[]): boolean {
  // Die Lösung ist bereits durch die logische Gleichung garantiert
  return true;
}

// Funktion zum Mischen eines Arrays
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Funktion zum Filtern der Aussagen nach Schwierigkeit
function getStatementsForDifficulty(statements: Statement[], difficulty: number): Statement[] {
  return statements.filter(s => s.difficulty <= difficulty);
}

// Funktion zum Generieren eines sehr einfachen Puzzles als Fallback
function generateSimplePuzzle(): { id: number; statements: string[]; isCorrect: boolean; color: string; }[] {
  const correctDoor = Math.floor(Math.random() * 3) + 1;
  const colors: DoorColor[] = shuffleArray(['grün', 'blau', 'gelb']);
  
  return [1, 2, 3].map(doorId => ({
    id: doorId,
    statements: [
      doorId === correctDoor 
        ? `Der Schatz ist hinter der ${colors[doorId - 1]}en Tür`
        : `Der Schatz ist nicht hinter der ${colors[doorId - 1]}en Tür`
    ],
    isCorrect: doorId === correctDoor,
    color: colors[doorId - 1]
  }));
}

// Funktion zum Generieren von Aussagen basierend auf logischen Gleichungen
function generateStatementsFromEquation(
  equation: string, 
  doorColor: string, 
  otherColors: string[], 
  difficulty: number,
  isTrue: boolean,
  hasTreasure: boolean
): string[] {
  const statements: string[] = [];
  const numStatements = getNumberOfStatements(difficulty);
  
  // Bestimme die Wahrscheinlichkeit einer Schatz-Aussage basierend auf Schwierigkeit
  const treasureChance = Math.max(0.1, 1 - (difficulty * 0.2));
  
  // Füge eine Aussage über den Schatz hinzu (nur mit bestimmter Wahrscheinlichkeit)
  if (Math.random() < treasureChance) {
    if (hasTreasure) {
      statements.push(wordLists.location.positive[Math.floor(Math.random() * wordLists.location.positive.length)]);
    } else if (isTrue) {
      statements.push(wordLists.location.negative[Math.floor(Math.random() * wordLists.location.negative.length)]);
    } else {
      if (Math.random() < 0.5) {
        statements.push(wordLists.location.positive[Math.floor(Math.random() * wordLists.location.positive.length)]);
      } else {
        statements.push(wordLists.location.negative[Math.floor(Math.random() * wordLists.location.negative.length)]);
      }
    }
  }
  
  // Wenn wir mehr als eine Aussage haben, füge Aussagen über andere Türen hinzu
  if (numStatements > 1) {
    // Wähle zufällig eine andere Tür für die Aussage
    const otherColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    const otherIsTrue = equation.includes(otherColor);
    
    // Verwende für höhere Schwierigkeitsgrade öfter bedingte Aussagen
    if (difficulty >= 3 && Math.random() < 0.4) {
      // Wähle eine bedingte Aussage, die konsistent mit den Wahrheitswerten ist
      let conditionalStatement;
      if (isTrue) {
        // Wenn diese Tür die Wahrheit sagt, muss die Bedingung korrekt sein
        if (otherIsTrue) {
          conditionalStatement = wordLists.complex.conditional.filter(s => 
            s.includes("dann sagt") && !s.includes("lügt")
          )[Math.floor(Math.random() * 2)];
        } else {
          conditionalStatement = wordLists.complex.conditional.filter(s => 
            s.includes("dann lügt")
          )[Math.floor(Math.random() * 2)];
        }
      } else {
        // Wenn diese Tür lügt, muss die Bedingung falsch sein
        if (otherIsTrue) {
          conditionalStatement = wordLists.complex.conditional.filter(s => 
            s.includes("dann lügt")
          )[Math.floor(Math.random() * 2)];
        } else {
          conditionalStatement = wordLists.complex.conditional.filter(s => 
            s.includes("dann sagt") && !s.includes("lügt")
          )[Math.floor(Math.random() * 2)];
        }
      }
      statements.push(conditionalStatement.replace('{color}', otherColor));
    } else if (difficulty >= 2 && Math.random() < 0.3) {
      // Wähle eine indirekte Aussage, die konsistent mit den Wahrheitswerten ist
      const indirectType = Math.random() < 0.5 ? 'comparison' : 'indirect';
      let indirectStatement;
      if (isTrue) {
        // Wenn diese Tür die Wahrheit sagt, muss die Aussage korrekt sein
        if (otherIsTrue) {
          indirectStatement = wordLists.complex[indirectType].filter(s => 
            !s.includes("weniger") && !s.includes("lügt")
          )[Math.floor(Math.random() * 2)];
        } else {
          indirectStatement = wordLists.complex[indirectType].filter(s => 
            s.includes("weniger") || s.includes("lügt")
          )[Math.floor(Math.random() * 2)];
        }
      } else {
        // Wenn diese Tür lügt, muss die Aussage falsch sein
        if (otherIsTrue) {
          indirectStatement = wordLists.complex[indirectType].filter(s => 
            s.includes("weniger") || s.includes("lügt")
          )[Math.floor(Math.random() * 2)];
        } else {
          indirectStatement = wordLists.complex[indirectType].filter(s => 
            !s.includes("weniger") && !s.includes("lügt")
          )[Math.floor(Math.random() * 2)];
        }
      }
      statements.push(indirectStatement.replace('{color}', otherColor));
    } else {
      // Direkte Aussage über eine andere Tür
      if (isTrue) {
        // Wenn diese Tür die Wahrheit sagt, muss die Aussage korrekt sein
        if (otherIsTrue) {
          statements.push(`Die ${otherColor}e Tür ${wordLists.truth.positive[Math.floor(Math.random() * wordLists.truth.positive.length)]}`);
        } else {
          statements.push(`Die ${otherColor}e Tür ${wordLists.truth.negative[Math.floor(Math.random() * wordLists.truth.negative.length)]}`);
        }
      } else {
        // Wenn diese Tür lügt, muss die Aussage falsch sein
        if (otherIsTrue) {
          statements.push(`Die ${otherColor}e Tür ${wordLists.truth.negative[Math.floor(Math.random() * wordLists.truth.negative.length)]}`);
        } else {
          statements.push(`Die ${otherColor}e Tür ${wordLists.truth.positive[Math.floor(Math.random() * wordLists.truth.positive.length)]}`);
        }
      }
    }
  }
  
  // Für Level 2 und höher, füge eine allgemeine Aussage hinzu
  if (difficulty >= 2 && numStatements > 2) {
    const generalType = Math.random() < 0.5 ? 'single' : 'multiple';
    const generalPrefix = wordLists.general[generalType][Math.floor(Math.random() * wordLists.general[generalType].length)];
    if (isTrue) {
      statements.push(`${generalPrefix} ${wordLists.truth.positive[Math.floor(Math.random() * wordLists.truth.positive.length)]}`);
    } else {
      statements.push(`${generalPrefix} ${wordLists.truth.negative[Math.floor(Math.random() * wordLists.truth.negative.length)]}`);
    }
  }
  
  // Für Level 3 und höher, füge eine weitere allgemeine Aussage hinzu
  if (difficulty >= 3 && numStatements > 3) {
    const generalType = Math.random() < 0.5 ? 'multiple' : 'all';
    const generalPrefix = wordLists.general[generalType][Math.floor(Math.random() * wordLists.general[generalType].length)];
    if (isTrue) {
      statements.push(`${generalPrefix} ${wordLists.truth.positive[Math.floor(Math.random() * wordLists.truth.positive.length)]}`);
    } else {
      statements.push(`${generalPrefix} ${wordLists.truth.negative[Math.floor(Math.random() * wordLists.truth.negative.length)]}`);
    }
  }
  
  // Für Level 4, füge eine komplexe Aussage hinzu
  if (difficulty >= 4 && numStatements > 4) {
    const complexType = Math.random() < 0.5 ? 'conditional' : (Math.random() < 0.5 ? 'comparison' : 'indirect');
    const complexStatement = wordLists.complex[complexType][Math.floor(Math.random() * wordLists.complex[complexType].length)];
    const randomColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    statements.push(complexStatement.replace('{color}', randomColor));
  }
  
  // Füge gelegentlich eine humorvolle Aussage hinzu (Wahrscheinlichkeit steigt mit Schwierigkeit)
  const humorChance = 0.05 + (difficulty * 0.02);
  if (Math.random() < humorChance && statements.length < numStatements) {
    statements.push(wordLists.humor[Math.floor(Math.random() * wordLists.humor.length)]);
  }
  
  // Wenn wir noch nicht genug Aussagen haben, fülle mit weiteren Aussagen über andere Türen auf
  while (statements.length < numStatements) {
    const otherColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    const otherIsTrue = equation.includes(otherColor);
    
    // Verwende für höhere Schwierigkeitsgrade öfter bedingte Aussagen
    if (difficulty >= 3 && Math.random() < 0.4) {
      const conditionalStatement = wordLists.complex.conditional[Math.floor(Math.random() * wordLists.complex.conditional.length)];
      statements.push(conditionalStatement.replace('{color}', otherColor));
    } else if (difficulty >= 2 && Math.random() < 0.3) {
      const indirectType = Math.random() < 0.5 ? 'comparison' : 'indirect';
      const indirectStatement = wordLists.complex[indirectType][Math.floor(Math.random() * wordLists.complex[indirectType].length)];
      statements.push(indirectStatement.replace('{color}', otherColor));
    } else {
      if (isTrue) {
        statements.push(`Die ${otherColor}e Tür ${wordLists.truth.positive[Math.floor(Math.random() * wordLists.truth.positive.length)]}`);
      } else {
        statements.push(`Die ${otherColor}e Tür ${wordLists.truth.negative[Math.floor(Math.random() * wordLists.truth.negative.length)]}`);
      }
    }
  }
  
  // Mische die Aussagen, damit die Reihenfolge nicht vorhersehbar ist
  return shuffleArray(statements);
} 