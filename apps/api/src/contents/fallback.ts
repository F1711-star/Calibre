export type TechniqueKey =
  | 'none'
  | 'deformed_statistic'
  | 'invented_quote'
  | 'fake_urgency'
  | 'dubious_source'
  | 'spoofed_sender';

export type Highlight = {
  start: number;
  end: number;
  reason: string;
  text: string;
};

export type FallbackContent = {
  title: string;
  body: string;
  senderName: string;
  isReliable: boolean;
  technique: TechniqueKey;
  difficulty: number;
  highlights: Highlight[];
  explanation: string;
};

type FallbackEntry = Omit<FallbackContent, 'highlights'> & {
  highlightPhrases: Array<{ text: string; reason: string }>;
};

function makeHighlights(body: string, phrases: Array<{ text: string; reason: string }>): Highlight[] {
  return phrases.map(({ text, reason }) => {
    const start = body.indexOf(text);
    if (start === -1) {
      throw new Error(`Phrase de surlignage introuvable dans la banque de secours : "${text}"`);
    }
    return { start, end: start + text.length, reason, text };
  });
}

const entries: FallbackEntry[] = [
  {
    title: 'Maintenance du réseau vendredi',
    senderName: 'Service informatique',
    isReliable: true,
    technique: 'none',
    difficulty: 1,
    body: `Bonjour à toutes et à tous,

La maintenance du réseau aura lieu vendredi 25 octobre entre 18 h et 20 h. Les services internes seront indisponibles pendant cette période. Pensez à enregistrer votre travail avant 17 h 45.

Une sauvegarde de sécurité est prévue. Si vous constatez un problème après 20 h, contactez le service informatique à l'adresse support@calibre.test.

Bonne journée,
Le service informatique`,
    highlightPhrases: [],
    explanation:
      "Message factuel et daté. La source est identifiable, la plage horaire est précise et aucune urgence anormale n'est utilisée.",
  },
  {
    title: 'Compte rendu de la réunion projet',
    senderName: 'Secrétariat général',
    isReliable: true,
    technique: 'none',
    difficulty: 1,
    body: `Bonjour,

Voici le compte rendu de la réunion du 21 octobre.

Trois décisions ont été prises : reporter la livraison au 4 novembre, ajouter une phase de test de deux jours et confier la communication à l'équipe RH. Le prochain point est fixé au 28 octobre à 9 h.

Le compte rendu complet est disponible sur l'intranet.

Cordialement,
Le secrétariat général`,
    highlightPhrases: [],
    explanation:
      "Le message rapporte des décisions concrètes, avec des dates et un document de référence accessible. Le ton reste neutre.",
  },
  {
    title: 'Invitation à la réunion mensuelle',
    senderName: 'Camille Martin',
    isReliable: true,
    technique: 'none',
    difficulty: 1,
    body: `Bonjour,

La réunion mensuelle de l'équipe aura lieu mardi 29 octobre à 10 h en salle B12. L'ordre du jour est disponible sur l'intranet.

Merci de préparer vos points d'avancement et de signaler votre absence avant lundi.

Cordialement,
Camille`,
    highlightPhrases: [],
    explanation:
      "Invitation classique : date, heure, lieu et ordre du jour sont précis. Aucun procédé de pression ou de dissimulation n'est présent.",
  },
  {
    title: 'Nouveaux horaires de la cantine',
    senderName: 'Ressources humaines',
    isReliable: true,
    technique: 'none',
    difficulty: 1,
    body: `Bonjour,

À partir du lundi 4 novembre, la cantine sera ouverte de 11 h 45 à 13 h 45. Le service du soir reste inchangé.

Les menus de la semaine sont publiés chaque vendredi sur l'intranet. Pour toute question, écrivez à cantine@calibre.test.

Bien cordialement,
Le service RH`,
    highlightPhrases: [],
    explanation:
      "Information pratique, source claire et coordonnées de contact vérifiables. Le message ne cherche pas à provoquer une réaction immédiate.",
  },
  {
    title: 'Nouvelle procédure de demande de congés',
    senderName: 'Direction des ressources humaines',
    isReliable: true,
    technique: 'none',
    difficulty: 2,
    body: `Bonjour,

La procédure de demande de congés évolue au 1er novembre. Les demandes devront être déposées au moins quinze jours avant le départ et validées par le responsable d'équipe.

Le formulaire est disponible dans l'espace RH. Une note détaillée explique les exceptions pour les congés exceptionnels.

Cordialement,
La DRH`,
    highlightPhrases: [],
    explanation:
      "Le changement est annoncé avec une date, une règle claire et un document officiel. Le message invite à consulter une source interne fiable.",
  },
  {
    title: 'URGENT : votre compte expire dans 15 minutes',
    senderName: 'Support Calibre',
    isReliable: false,
    technique: 'fake_urgency',
    difficulty: 2,
    body: `URGENT : votre compte Calibre expire dans 15 minutes.

Cliquez immédiatement sur le lien ci-dessous pour éviter la suspension définitive de votre accès. Plus de 2 000 comptes ont déjà été désactivés aujourd'hui. Ne perdez pas votre progression !

Si vous ne réagissez pas maintenant, vos données seront supprimées.`,
    highlightPhrases: [
      { text: 'URGENT', reason: 'Appel à l’urgence' },
      { text: '15 minutes', reason: 'Délai artificiellement court' },
      { text: 'immédiatement', reason: 'Injonction pressante' },
      { text: 'suspension définitive', reason: 'Menace pour faire pression' },
      { text: '2 000 comptes', reason: 'Chiffre non sourcé' },
    ],
    explanation:
      "Le message crée une urgence artificielle avec un délai très court, une menace de suppression et un chiffre alarmant sans source. Un service légitime ne demande pas d'agir en quelques minutes par message.",
  },
  {
    title: 'Les ventes ont augmenté de 340 %',
    senderName: 'Direction commerciale',
    isReliable: false,
    technique: 'deformed_statistic',
    difficulty: 2,
    body: `Selon une étude interne, les ventes ont augmenté de 340 % en seulement trois jours.

Cette performance exceptionnelle prouve que notre nouvelle stratégie fonctionne. 97 % des clients recommanderaient nos services à leurs proches.

Ces résultats spectaculaires placent l'entreprise devant tous ses concurrents.`,
    highlightPhrases: [
      { text: 'étude interne', reason: 'Source non vérifiable' },
      { text: '340 %', reason: 'Chiffre spectaculaire' },
      { text: 'trois jours', reason: 'Période invraisemblable' },
      { text: '97 %', reason: 'Statistique sans méthode' },
    ],
    explanation:
      "Les chiffres sont spectaculaires mais aucune méthodologie, période ou source externe n'est fournie. Une augmentation de 340 % en trois jours devrait être documentée précisément avant d'être présentée comme une preuve.",
  },
  {
    title: 'Un expert anonyme prédit la faillite du concurrent',
    senderName: 'Veille stratégique',
    isReliable: false,
    technique: 'invented_quote',
    difficulty: 3,
    body: `Un expert reconnu, qui préfère rester anonyme, affirme que notre concurrent va fermer ses portes avant la fin du mois.

« C'est une certitude, ils ne passeront pas l'hiver », aurait-il déclaré. Plusieurs sources proches du dossier confirment cette information.

Aucune preuve n'est jointe, mais le témoignage serait fiable selon nos contacts.`,
    highlightPhrases: [
      { text: 'expert reconnu', reason: 'Autorité non identifiée' },
      { text: 'rester anonyme', reason: 'Source impossible à vérifier' },
      { text: 'aurait-il déclaré', reason: 'Citation non confirmée' },
      { text: 'sources proches du dossier', reason: 'Sources floues' },
    ],
    explanation:
      "La citation est attribuée à un expert anonyme et rapportée au conditionnel. Les « sources proches du dossier » ne sont pas identifiables. Une affirmation aussi grave doit être appuyée par des faits vérifiables.",
  },
  {
    title: 'Une étude confidentielle révèle...',
    senderName: 'Observatoire du management',
    isReliable: false,
    technique: 'dubious_source',
    difficulty: 2,
    body: `Une étude confidentielle, non publiée, révèle que 8 salariés sur 10 cachent des informations à leur manager.

Le document, que nous avons pu consulter, ne précise ni l'échantillon ni la date de l'enquête. Aucun organisme indépendant n'a pu vérifier ces résultats.

Nos sources assurent cependant que le phénomène est massif.`,
    highlightPhrases: [
      { text: 'confidentielle', reason: 'Document non public' },
      { text: 'non publiée', reason: 'Absence de relecture' },
      { text: "ne précise ni l'échantillon ni la date", reason: 'Méthode absente' },
      { text: "Aucun organisme indépendant", reason: 'Aucune vérification possible' },
    ],
    explanation:
      "L'étude est présentée comme confidentielle et non publiée, sans échantillon, date ni organisme de contrôle. Une source qui ne peut pas être vérifiée ne permet pas de tirer une conclusion aussi générale.",
  },
  {
    title: 'Connexion inhabituelle sur votre messagerie',
    senderName: 'Support IT <securite@calibre-support.net>',
    isReliable: false,
    technique: 'spoofed_sender',
    difficulty: 3,
    body: `Bonjour,

Nous avons détecté une connexion inhabituelle sur votre messagerie. Pour la sécurité de votre compte, merci de confirmer vos identifiants via le formulaire sécurisé ci-dessous.

Ce lien reste valable 30 minutes. Sans réponse, votre boîte sera bloquée.

Cordialement,
L'équipe sécurité`,
    highlightPhrases: [
      { text: 'connexion inhabituelle', reason: 'Prétexte alarmant' },
      { text: 'confirmer vos identifiants', reason: 'Demande de mot de passe' },
      { text: '30 minutes', reason: 'Pression temporelle' },
      { text: 'votre boîte sera bloquée', reason: 'Menace de blocage' },
    ],
    explanation:
      "L'adresse d'expédition n'utilise pas le domaine officiel calibre.test et le message demande de saisir ses identifiants via un lien. C'est une tentative d'hameçonnage avec usurpation de l'expéditeur.",
  },
  {
    title: 'Dernière chance : 3 places restantes',
    senderName: 'Formation continue',
    isReliable: false,
    technique: 'fake_urgency',
    difficulty: 2,
    body: `Dernière chance : l'offre se termine ce soir à minuit !

Seules 3 places restantes. Réservez maintenant et bénéficiez de 70 % de réduction. Aucune prolongation ne sera accordée.

Cliquez vite avant que le compteur ne soit réinitialisé.`,
    highlightPhrases: [
      { text: 'Dernière chance', reason: 'Rareté artificielle' },
      { text: 'ce soir à minuit', reason: 'Délai très court' },
      { text: '3 places restantes', reason: 'Rareté non vérifiable' },
      { text: 'Réservez maintenant', reason: 'Injonction pressante' },
      { text: 'Aucune prolongation', reason: 'Pression commerciale' },
    ],
    explanation:
      "Le message cumule rareté artificielle, délai imminent et forte réduction. Ces procédés visent à empêcher la réflexion. Aucun élément ne permet de vérifier le nombre de places restantes.",
  },
  {
    title: "L'absentéisme a chuté de 62 %",
    senderName: 'Ressources humaines',
    isReliable: false,
    technique: 'deformed_statistic',
    difficulty: 2,
    body: `Grâce au nouveau programme de bien-être, le taux d'absentéisme a chuté de 62 % en un mois.

La productivité a bondi de 75 %. Ces résultats remarquables sont visibles dans tous les services sans exception.

Le programme est donc un succès total.`,
    highlightPhrases: [
      { text: '62 %', reason: 'Chiffre précis sans source' },
      { text: 'en un mois', reason: 'Délai trop court' },
      { text: '75 %', reason: 'Second chiffre spectaculaire' },
      { text: 'sans exception', reason: 'Généralisation excessive' },
    ],
    explanation:
      "Les résultats sont présentés comme incontestables, mais sans données de départ, méthode de mesure ni source. Deux pourcentages spectaculaires en un mois devraient être confirmés par des indicateurs détaillés.",
  },
  {
    title: 'Un salarié bien informé évoque un plan de licenciement',
    senderName: 'Le Petit Journal interne',
    isReliable: false,
    technique: 'invented_quote',
    difficulty: 3,
    body: `Selon un salarié bien informé, la direction préparerait un plan de licenciement touchant la moitié des effectifs.

« Tout le monde est au courant, mais personne n'en parle », confie-t-il. La direction n'a pas répondu à nos sollicitations.

D'autres employés, qui souhaitent rester anonymes, confirment cette rumeur.`,
    highlightPhrases: [
      { text: 'un salarié bien informé', reason: 'Source vague' },
      { text: 'préparerait', reason: 'Conditionnel non vérifié' },
      { text: 'la moitié des effectifs', reason: 'Affirmation très grave' },
      { text: 'confie-t-il', reason: 'Citation non authentifiée' },
      { text: 'souhaitent rester anonymes', reason: 'Sources impossibles à contrôler' },
    ],
    explanation:
      "La rumeur repose sur des salariés anonymes et une citation non authentifiée. L'absence de réponse de la direction est utilisée comme confirmation. Une information aussi grave exige des documents ou des sources identifiables.",
  },
  {
    title: 'Un rapport indépendant classe notre entreprise parmi les plus polluantes',
    senderName: 'Collectif Transparence',
    isReliable: false,
    technique: 'dubious_source',
    difficulty: 3,
    body: `Un rapport indépendant classerait notre entreprise parmi les trois plus polluantes du secteur.

Le rapport n'est pas accessible au public et son auteur n'est pas identifié. Il serait fondé sur des données collectées en 2019.

Le collectif affirme que ces conclusions sont indiscutables.`,
    highlightPhrases: [
      { text: 'rapport indépendant', reason: 'Indépendance non prouvée' },
      { text: "n'est pas accessible au public", reason: 'Document non consultable' },
      { text: "son auteur n'est pas identifié", reason: 'Auteur inconnu' },
      { text: 'données collectées en 2019', reason: 'Données anciennes' },
      { text: 'indiscutables', reason: 'Argument d’autorité' },
    ],
    explanation:
      "Le rapport est présenté comme indépendant mais reste inaccessible et sans auteur identifié. Les données datent de 2019 et le caractère « indiscutable » est affirmé sans preuve. La source ne permet pas de vérifier le classement.",
  },
  {
    title: 'Votre colis est en attente : frais de douane à régler',
    senderName: 'Livraison Express <livraison@colis-suivi-info.com>',
    isReliable: false,
    technique: 'spoofed_sender',
    difficulty: 2,
    body: `Votre colis est en attente de livraison.

Des frais de douane de 1,99 € sont requis. Réglez immédiatement via le lien ci-dessous pour éviter le retour à l'expéditeur.

Ce message provient de livraison@colis-suivi-info.com. Conservez ce numéro de suivi : CLB-8842-FR.`,
    highlightPhrases: [
      { text: 'colis est en attente', reason: 'Prétexte courant' },
      { text: 'frais de douane', reason: 'Frais inattendu' },
      { text: '1,99 €', reason: 'Petit montant pour ne pas éveiller les soupçons' },
      { text: 'Réglez immédiatement', reason: 'Injonction pressante' },
      { text: 'colis-suivi-info.com', reason: 'Domaine non officiel' },
    ],
    explanation:
      "Le message imite un avis de livraison et renvoie vers un domaine qui n'appartient pas au transporteur. Le petit montant et l'urgence poussent à payer sans vérifier. Il faut se connecter au site officiel plutôt que suivre le lien.",
  },
];

export const FALLBACK_CONTENTS: FallbackContent[] = entries.map((entry) => ({
  title: entry.title,
  body: entry.body,
  senderName: entry.senderName,
  isReliable: entry.isReliable,
  technique: entry.technique,
  difficulty: entry.difficulty,
  highlights: makeHighlights(entry.body, entry.highlightPhrases),
  explanation: entry.explanation,
}));

export const TECHNIQUE_LABELS: Record<TechniqueKey, string> = {
  none: 'Aucune manipulation',
  deformed_statistic: 'Statistique déformée',
  invented_quote: 'Citation inventée',
  fake_urgency: 'Urgence artificielle',
  dubious_source: 'Source douteuse',
  spoofed_sender: 'Expéditeur usurpé',
};
