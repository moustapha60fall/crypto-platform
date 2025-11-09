// // src/data/elevesData.ts
// import {
//     PenLine,
//     BookOpen,
//     Atom,
//     FlaskConical,
//     Landmark,
//     Globe,
//     Globe2,
//     Languages,
//     Coins,
//     FileText,
//     CheckSquare,
//     PlayCircle,
//     PencilLine,
//     FolderOpen,
//     ClipboardList,
// } from "lucide-react";

// // === Fonction pour choisir une icône selon la matière ===
// export const getMatiereIcon = (name: string) => {
//     const n = name.toLowerCase();
//     const mapping: Record<string, any> = {
//         math: PenLine,
//         franc: BookOpen,
//         franç: BookOpen,
//         chim: Atom,
//         physi: Atom,
//         science: FlaskConical,
//         techno: FlaskConical,
//         histoir: Landmark,
//         geogra: Globe,
//         géogra: Globe,
//         anglais: Languages,
//         english: Languages,
//         autochton: Globe2,
//         financ: Coins,
//         économ: Coins,
//     };
//     for (const key in mapping) if (n.includes(key)) return mapping[key];
//     return FileText;
// };

// // === Couleurs disponibles ===
// export const matiereColors = [
//     "#42A5F5", "#FF6B9D", "#AB47BC", "#66BB6A",
//     "#FF9800", "#26C6DA", "#26A69A", "#EF5350",
//     "#FF7043", "#43A047", "#78909C", "#FFA726",
// ];

// export const explorerColor = "oklch(55.2% 0.016 285.938)"; // Couleur douce pour fond Explorer
// export const niveauColor = "oklch(55.2% 0.016 285.938)";   // Couleur douce pour fond Niveaux

// export const getNiveauColor = (_nom: string, _index: number) => niveauColor;

// // === Section Explorer (statique) ===
// export const explorerSection = {
//     title: "Explorer",
//     items: [
//         { title: "Exercices", to: "/eleves/explorer/exercices", color: explorerColor, icon: CheckSquare },
//         { title: "Cours", to: "/eleves/explorer/cours", color: explorerColor, icon: FileText },
//         { title: "Vidéos", to: "/eleves/explorer/videos", color: explorerColor, icon: PlayCircle },
//         { title: "Devoirs", to: "/eleves/explorer/devoirs", color: explorerColor, icon: PencilLine },
//         { title: "Projets", to: "/eleves/explorer/projets", color: explorerColor, icon: FolderOpen },
//         { title: "Évaluations", to: "/eleves/explorer/evaluations", color: explorerColor, icon: ClipboardList },
//     ],
// };

// // === Hook dynamique pour construire les sections ===
// export const useElevesNavSections = () => {
//     const matieres = useSelector((state: RootState) => state.matieres.items);
//     const niveaux = useSelector((state: RootState) => state.niveaux.items);

//     const sections = [];

//     if (matieres.length > 0) {
//         sections.push({
//             title: "Matières",
//             items: matieres.map((m: any, i: number) => ({
//                 title: m.name,
//                 to: `/eleves/matieres/${m.id}`,
//                 color: m.couleur || matiereColors[i % matiereColors.length],
//                 icon: getMatiereIcon(m.name),
//             })),
//         });
//     }

//     if (niveaux.length > 0) {
//         sections.push({
//             title: "Niveaux",
//             items: niveaux.map((n: any, i: number) => ({
//                 title: n.nom,
//                 to: `/eleves/niveaux/${n.id}`,
//                 color: getNiveauColor(n.nom, i),
//                 icon: BookOpen,
//             })),
//         });
//     }

//     // Section statique Explorer
//     sections.push(explorerSection);

//     return sections;
// };

// // 🔹 Détermine la largeur du conteneur selon la section
// export const getSectionWidth = (title: string) => {
//     switch (title.toLowerCase()) {
//         case "matières":
//             return "w-[85rem]";
//         case "niveaux":
//             return "w-[50rem]";
//         case "explorer":
//             return "w-[25rem]";
//         default:
//             return "";
//     }
// };

// let lastDirections: Record<string, string> = {};

// export function getRandomDirection(sectionTitle?: string) {
//     const directions = ["left", "right", "up", "down"];

//     // éviter la même direction deux fois d’affilée pour la même section
//     const last = lastDirections[sectionTitle || "default"];
//     let random: string;
//     do {
//         random = directions[Math.floor(Math.random() * directions.length)];
//     } while (random === last);

//     lastDirections[sectionTitle || "default"] = random;

//     const distance =
//         sectionTitle === "Matières"
//             ? 120
//             : sectionTitle === "Niveaux"
//                 ? 80
//                 : 60;

//     switch (random) {
//         case "left":
//             return { initial: { x: -distance, opacity: 0 }, animate: { x: 0, opacity: 1 } };
//         case "right":
//             return { initial: { x: distance, opacity: 0 }, animate: { x: 0, opacity: 1 } };
//         case "up":
//             return { initial: { y: -distance, opacity: 0 }, animate: { y: 0, opacity: 1 } };
//         case "down":
//             return { initial: { y: distance, opacity: 0 }, animate: { y: 0, opacity: 1 } };
//         default:
//             return { initial: { opacity: 0 }, animate: { opacity: 1 } };
//     }
// }
