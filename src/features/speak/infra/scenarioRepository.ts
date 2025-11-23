import { Scenario } from '../domain/Scenario';

export const scenarioRepository: Scenario[] = [
  new Scenario(
    'cafe_ordering',
    'Commander au café',
    'Pratiquez comment commander un café à Paris avec un serveur amical.',
    undefined,
    ['cafe', 'ordering'],
    'Serveur de café amical',
    `Tu joues le rôle d'un serveur dans un café parisien. Engage-toi dans une conversation polie et naturelle avec l'apprenant, puis guide-le vers la commande d'une boisson et un échange amical.`,
    ['Bonjour, que désirez-vous ?', 'Avec du sucre ou du lait ?', 'Vous voulez autre chose ?']
  ),
  new Scenario(
    'doctor_visit',
    'Chez le médecin',
    'Expliquez vos symptômes et recevez des conseils de votre médecin.',
    undefined,
    ['health', 'doctor'],
    'Médecin attentif',
    `Tu es un médecin accueillant. Pose des questions simples sur les symptômes et propose des conseils appropriés.`
  ),
  new Scenario(
    'free_discussion',
    'Discussion libre',
    'Parlez de n’importe quel sujet choisi par l’utilisateur avec un partenaire personnalisé.',
    undefined,
    ['free_talk'],
    'Partenaire de conversation personnalisé',
    `Tu es un ami ou collègue de l'apprenant. Engage une conversation naturelle selon le contexte qu'il a fourni.`
  ),
  new Scenario('airport_checkin','À l’aéroport – enregistrement',
    'Vérifier bagages, documents, et questions standards au comptoir.',
    undefined, ['voyage','aéroport'], 'Agent d’enregistrement',
    `Tu es un agent d'enregistrement. Pose les questions habituelles (bagages, pièce d'identité, destination, siège).`,
    ['Bonjour, vos documents s’il vous plaît.', 'Avez-vous des bagages à enregistrer ?']
  ),
  new Scenario('hotel_checkin','À l’hôtel – check-in',
    'Faire le check-in, demander le petit-déjeuner, résoudre un souci de chambre.',
    undefined, ['hôtel','réception'], 'Réceptionniste',
    `Tu es un réceptionniste poli. Garde un ton professionnel et serviable.`
  ),
  new Scenario('metro_directions','Au métro – demander un itinéraire',
    'Acheter un ticket et confirmer le bon trajet.',
    undefined, ['transport','itinéraire'], 'Agent RATP',
    `Tu es un agent qui aide à trouver le bon métro et la correspondance.`
  ),
  new Scenario('supermarket_return','Supermarché – retour d’un article',
    'Expliquer un problème et demander un remboursement/échange.',
    undefined, ['courses','SAV'], 'Employé service client',
    `Tu es l’employé du service client. Demande le ticket, explique les options.`
  ),
  new Scenario('bank_account','Banque – ouvrir un compte',
    'Parler justificatifs, type de compte, frais et carte.',
    undefined, ['banque'], 'Conseiller bancaire',
    `Tu es un conseiller. Explique calmement les étapes et les documents.`
  ),
  new Scenario('job_interview','Entretien d’embauche (A2/B1)',
    'Répondre à des questions simples, parler d’expériences et de motivation.',
    undefined, ['travail','RH'], 'Recruteur bienveillant',
    `Tu es un recruteur. Pose des questions de base, donne un retour bref et constructif.`
  ),
  new Scenario('colocation_rules','Colocation – règles & planning',
    'Discuter ménage, bruit, invités, partage des charges.',
    undefined, ['colocation','vie-quotidienne'], 'Colocataire',
    `Tu es un colocataire calme. Clarifie les règles avec diplomatie.`
  ),
  new Scenario('prefecture','Préfecture – rendez-vous administratif',
    'Poser des questions, fournir des justificatifs, clarifier la procédure.',
    undefined, ['administration'], 'Agent de préfecture',
    `Tu es un agent. Donne des réponses précises et empathiques.`
  ),
  new Scenario('gym_membership','Salle de sport – abonnement',
    'Comparer formules, demander conseils, résilier si besoin.',
    undefined, ['sport','loisir'], 'Employé salle de sport',
    `Tu es un employé serviable. Décris offres, horaires, essai.`
  ),
  new Scenario('bookshop_order','Librairie – commander un livre',
    'Demander la disponibilité, commander, délais et retrait.',
    undefined, ['culture','achat'], 'Libraire',
    `Tu es un libraire. Demande titre/auteur, propose alternatives.`
  ),
  new Scenario('pharmacy','Pharmacie – expliquer un symptôme',
    'Décrire symptômes, demander un conseil ou un produit.',
    undefined, ['santé','pharmacie'], 'Pharmacien',
    `Tu es un pharmacien prudent. Pose des questions et propose des options adaptées.`
  ),
  new Scenario('restaurant_allergy','Restaurant – allergie / menu du jour',
    'Commander en signalant une allergie ou restriction.',
    undefined, ['resto','allergie'], 'Serveur',
    `Tu es un serveur attentif. Propose des alternatives sûres.`
  ),
  new Scenario('lost_parcel','Livraison – colis perdu',
    'Expliquer le problème, vérifier suivi, ouvrir réclamation.',
    undefined, ['livraison','SAV'], 'Support livraison',
    `Tu es le support. Reste poli, vérifie numéro et adresse.`
  )
];
