import {
    Lock,
    Shield,
    Fingerprint,
    FileKey,
    KeyRound,
    KeySquare,
    Atom,
    Sparkles,
    FileText,
    User2,
    Key,
    Star,
} from "lucide-react";

export const navSections = [
    {
        title: "Confidentialité",
        items: [
            { title: "Index Confidentialité", to: "/crypto/confidentiality", color: "#FFCDD2", icon: Lock },
            { title: "Chiffrement Asymétrique", to: "/crypto/confidentiality/pair", color: "#F8BBD0", icon: KeyRound },
            { title: "Chiffrement Symétrique", to: "/crypto/confidentiality/aes", color: "#E1BEE7", icon: Key },
            { title: "Enveloppement de Clé", to: "/crypto/confidentiality/wrap", color: "#D1C4E9", icon: FileKey },
            { title: "Désenveloppement de Clé", to: "/crypto/confidentiality/unwrap", color: "#C5CAE9", icon: FileKey },
        ],
    },
    {
        title: "Intégrité",
        items: [
            { title: "Index Intégrité", to: "/crypto/integrity", color: "#C8E6C9", icon: Shield },
            { title: "Hachage sans Clé", to: "/crypto/integrity/hash", color: "#A5D6A7", icon: Atom },
            { title: "Hachage avec Clé", to: "/crypto/integrity/hmac", color: "#81C784", icon: Atom },
        ],
    },
    {
        title: "Authenticité",
        items: [
            { title: "Index Authenticité", to: "/crypto/authenticity", color: "#BBDEFB", icon: Fingerprint },
            { title: "Signer", to: "/crypto/authenticity/sign", color: "#90CAF9", icon: Sparkles },
            { title: "Vérifier", to: "/crypto/authenticity/verify", color: "#64B5F6", icon: Shield },
        ],
    },
    {
        title: "Non-répudiation",
        items: [
            { title: "Index Non-répudiation", to: "/crypto/non-repudiation", color: "#FFE0B2", icon: FileText },
            // Ajoute ici les futurs items comme "Audit", "Timestamp", "PKI" quand ils seront disponibles
        ],
    },
    {
        title: "Gestion des clés",
        items: [
            { title: "Index Gestion des clés", to: "/crypto/keys", color: "#B3E5FC", icon: FileKey },
            { title: "Liste des une clé", to: "/crypto/keys/list", color: "#81D4FA", icon: KeySquare },
            { title: "Dériver une clé symétrique", to: "/crypto/keys/pbe", color: "#03A9F4", icon: Lock },
            { title: "Générer une clé", to: "/crypto/keys/generate", color: "#0288D1", icon: Sparkles },
            { title: "Partagées une clé", to: "/crypto/keys/shared", color: "#0277BD", icon: FileKey },
        ],
    },
];

export const decouverteSection = {
    items: [
        {
            title: "Services de sécurité",
            description: "Confidentialité, Intégrité, Authenticité, Non-répudiation",
            to: "/crypto",
            color: "#FFE082",
            icon: Star,
        },
        {
            title: "Systèmes cryptographiques",
            description: "Symétrique (AES) vs Asymétrique (RSA)",
            to: "/crypto/confidentiality/pair",
            color: "#B3E5FC",
            icon: KeyRound,
        },
        {
            title: "Primitives de chiffrement",
            description: "Par bloc, par flot, RSA",
            to: "/crypto/confidentiality/aes",
            color: "#FFCDD2",
            icon: Lock,
        },
        {
            title: "Primitives de hachage",
            description: "Avec ou sans clé (HMAC, SHA)",
            to: "/crypto/integrity/hash",
            color: "#C8E6C9",
            icon: Atom,
        },
        {
            title: "Primitives de signature",
            description: "Avec ou sans hachage",
            to: "/crypto/authenticity/sign",
            color: "#BBDEFB",
            icon: Fingerprint,
        },
        {
            title: "Non-répudiation",
            description: "Preuve irréfutable via signature et horodatage",
            to: "/crypto/non-repudiation",
            color: "#FFE0B2",
            icon: FileText,
        },
    ],
};

export function getSectionWidth(title: string) {
    switch (title) {
        case "Confidentialité":
            return "w-[50rem]";

        case "Authenticité":
            return "w-[30rem]";

        case "Gestion des clés":
            return "w-[45rem]";
        case "Intégrité":
            return "w-[50rem]";
        case "Non-répudiation":
            return "w-[30rem]";
        default:
            return "w-[30rem]";
    }
}

let lastDirections: Record<string, string> = {};

export function getRandomDirection(sectionTitle?: string) {
    const directions = ["left", "right", "up", "down"];

    // éviter la même direction deux fois d’affilée pour la même section
    const last = lastDirections[sectionTitle || "default"];
    let random: string;
    do {
        random = directions[Math.floor(Math.random() * directions.length)];
    } while (random === last);

    lastDirections[sectionTitle || "default"] = random;

    const distance =
        sectionTitle === "Matières"
            ? 120
            : sectionTitle === "Niveaux"
                ? 80
                : 60;

    switch (random) {
        case "left":
            return { initial: { x: -distance, opacity: 0 }, animate: { x: 0, opacity: 1 } };
        case "right":
            return { initial: { x: distance, opacity: 0 }, animate: { x: 0, opacity: 1 } };
        case "up":
            return { initial: { y: -distance, opacity: 0 }, animate: { y: 0, opacity: 1 } };
        case "down":
            return { initial: { y: distance, opacity: 0 }, animate: { y: 0, opacity: 1 } };
        default:
            return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    }
}

export const explorerColor = "oklch(79.2% 0.209 151.711)"; // Couleur douce pour fond Explorer

// === Section Explorer (statique) ===
export const explorerSection = {
    title: "Explorer",
    items: [
        { title: "Accéder aux services", to: "/crypto", color: explorerColor, icon: KeySquare },
        { title: "Mon espace personel..", to: "/user", color: explorerColor, icon: User2 }
    ],
};