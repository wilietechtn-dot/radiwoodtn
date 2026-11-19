export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export const defaultCategories: Category[] = [
  {
    id: "plateaux",
    name: "Plateaux",
    description: "Plateaux artisanaux en bois d'olivier",
    image: "/images/plateau.jpg",
  },
  {
    id: "miroirs",
    name: "Miroirs",
    description: "Miroirs au contour naturel",
    image: "/images/miroir.jpg",
  },
  {
    id: "art-table",
    name: "Art de la table",
    description: "Service et convivialité",
    image: "/images/table.jpg",
  },
  {
    id: "decoration",
    name: "Décoration",
    description: "Objets décoratifs uniques",
    image: "/images/decoration.jpg",
  },
  {
    id: "sur-mesure",
    name: "Sur mesure",
    description: "Créations personnalisées",
    image: "/images/table.jpg",
  },
];