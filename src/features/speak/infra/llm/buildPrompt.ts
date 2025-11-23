

export function buildPrompt(params: {
  userText: string; scenario: string; level: "B1";
  history: Array<{ role:'user'|'ai'; text: string }>;
}) {
  const last5 = params.history.slice(-5);
  const hist = last5
    .map(h => `${h.role === 'user' ? 'Utilisateur' : 'Tuteur'} : ${h.text.replace(/\r?\n/g,' ')}`)
    .join('\n');

  return `
[contract:speak-v1]
Tu es un tuteur de français bienveillant et expert.
Scénario : "${params.scenario}". Niveau : ${params.level}.
Historique (5 derniers échanges) :
${hist}

Nouvelle phrase de l'utilisateur : """${params.userText}"""

Tâches :
1) Pour chaque correction, ajoute 'severity' = 'minor' ou 'major'.
2) Ajoute "modelUserLevelGuess" (A1–C2) = estimation INDÉPENDANTE du niveau CEFR de l'utilisateur basée UNIQUEMENT sur ses 2 dernières phrases.
3) Ajoute "newLevel" (A1–C2 ou null) = niveau d'exercice que tu recommandes maintenant. 
   - Monte d'un cran si l'utilisateur semble À L'AISE et autonome au-dessus du niveau courant.
   - Reste null si tu n'as pas d'ajustement clair à proposer.
4) Réponds naturellement pour continuer la conversation (max 2 parties).
5) Corrige uniquement les erreurs importantes, avec une brève explication.
6) Donne EXACTEMENT deux réponses possibles que l’utilisateur pourrait dire (tableau de 2 chaînes) + un court "reasoning".
7) Sélectionne 1–2 "keyPhrases" à mémoriser.
Réponds uniquement avec le contenu structuré demandé (JSON), sans texte additionnel.
`.trim();
}
