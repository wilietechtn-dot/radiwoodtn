"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Hand,
  Heart,
  Leaf,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";

import { useCart } from "@/components/CartProvider";

/* ==========================================
   TYPES & PRODUITS PAR DÉFAUT
========================================== */

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  dimensions?: string;
  materials?: string;
  badge?: string;
  featured?: boolean;
};

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Plateau Rivière Turquoise",
    description: "Bois d'olivier et résine époxy",
    category: "Plateaux & Planches",
    price: 320,
    image: "/images/plateau.jpg",
    badge: "Nouveau",
    featured: true,
  },
  {
    id: "prod-2",
    name: "Miroir Contour Naturel",
    description: "Une pièce unique pour un intérieur authentique",
    category: "Miroirs",
    price: 450,
    image: "/images/miroir.jpg",
    featured: true,
  },
  {
    id: "prod-3",
    name: "Planche Gourmande",
    description: "Idéale pour vos moments de partage",
    category: "Art de la table",
    price: 180,
    image: "/images/plateau.jpg",
  },
  {
    id: "prod-4",
    name: "Miroir Élégance",
    description: "Alliance du bois d'olivier et d'un design contemporain",
    category: "Miroirs",
    price: 420,
    image: "/images/miroir.jpg",
  },
  {
    id: "prod-5",
    name: "Plateau Décoratif",
    description: "Une touche d'exception pour votre intérieur",
    category: "Plateaux & Planches",
    price: 280,
    image: "/images/decoration.jpg",
  },
  {
    id: "prod-6",
    name: "Set de Bols en Olivier",
    description: "Pratiques et élégants pour le quotidien",
    category: "Art de la table",
    price: 120,
    image: "/images/table.jpg",
  },
  {
    id: "prod-7",
    name: "Création d'Ambiance",
    description: "Une décoration naturelle et chaleureuse",
    category: "Décoration",
    price: 350,
    image: "/images/decoration.jpg",
    badge: "Pièce unique",
  },
  {
    id: "prod-8",
    name: "Création sur mesure",
    description: "Une réalisation originale et personnalisée",
    category: "Sur mesure",
    price: 160,
    image: "/images/table.jpg",
  },
];

const DEFAULT_CATEGORIES = [
  { name: "Tous", icon: Grid2X2 },
  { name: "Plateaux & Planches", icon: Package },
  { name: "Miroirs", icon: Sparkles },
  { name: "Décoration", icon: Leaf },
  { name: "Art de la table", icon: Utensils },
  { name: "Sur mesure", icon: Heart },
];

function getCategoryIcon(name: string) {
  const normalized = name.toLowerCase();
  if (normalized === "tous") return Grid2X2;
  if (normalized.includes("plateau") || normalized.includes("planche"))
    return Package;
  if (normalized.includes("miroir")) return Sparkles;
  if (normalized.includes("table") || normalized.includes("bol"))
    return Utensils;
  if (normalized.includes("mesure")) return Heart;
  return Leaf;
}

/* ==========================================
   PRODUCT CARD
========================================== */

function ProductCard({
  product,
  onDetails,
}: {
  product: Product;
  onDetails: (product: Product) => void;
}) {
  const { addItem } = useCart();

  return (
    <article className="group overflow-hidden rounded-xl border border-[#e8e0d4] bg-[#FFFCF7] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* IMAGE */}
      <div className="relative h-[220px] overflow-hidden bg-[#e8dfd0] sm:h-[230px]">
        <img
          src={product.image || "/images/plateau.jpg"}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full border border-[#d6c49d] bg-[#405033] px-3 py-1 text-[11px] font-medium text-white shadow-sm">
            {product.badge}
          </span>
        )}

        {/* DETAIL HOVER */}
        <button
          type="button"
          onClick={() => onDetails(product)}
          aria-label={`Voir ${product.name}`}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFCF7] text-[#405033] opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100 focus:opacity-100"
        >
          <Search size={19} />
        </button>
      </div>

      {/* INFORMATIONS */}
      <div className="p-4">
        <h3 className="mb-1 font-serif text-[18px] font-semibold leading-snug text-[#29271F]">
          {product.name}
        </h3>

        <p className="line-clamp-2 min-h-[38px] text-[12px] leading-5 text-[#89837a]">
          {product.description}
        </p>

        <p className="mb-3 mt-2 text-[20px] font-bold text-[#29271F]">
          {product.price.toLocaleString("fr-TN")} TND
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDetails(product)}
            className="flex min-w-0 flex-1 items-center justify-center gap-3 rounded-full bg-[#F0E9DD] px-3 py-3 text-[12px] font-semibold text-[#29271F] transition hover:bg-[#e4d8c4]"
          >
            Voir le détail
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image || "/images/plateau.jpg",
              })
            }
            aria-label={`Ajouter ${product.name} au panier`}
            title="Ajouter au panier"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#405033] text-white transition hover:scale-105 hover:bg-[#526442]"
          >
            <ShoppingCart size={19} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ==========================================
   MODAL PRODUIT
========================================== */

function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem } = useCart();

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function handleAddToCart() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "/images/plateau.jpg",
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
        className="relative grid w-full max-w-[850px] grid-cols-1 overflow-hidden rounded-2xl bg-[#FFFCF7] shadow-2xl md:grid-cols-2"
      >
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#29271F] shadow-md"
        >
          <X size={20} />
        </button>

        {/* IMAGE */}
        <div className="h-[280px] bg-[#eee8dc] md:h-[440px]">
          <img
            src={product.image || "/images/plateau.jpg"}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* DETAILS */}
        <div className="flex flex-col justify-center p-7 md:p-10">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#657450]">
            {product.category}
          </p>

          <h2
            id="product-dialog-title"
            className="mb-4 font-serif text-3xl leading-tight text-[#29271F]"
          >
            {product.name}
          </h2>

          <p className="mb-5 text-sm leading-7 text-[#777168]">
            {product.description}
          </p>

          <div className="mb-6 border-y border-[#e6ddcf] py-5">
            <p className="mb-2 text-xs text-[#817a70]">Prix</p>

            <p className="font-serif text-3xl font-semibold">
              {product.price.toLocaleString("fr-TN")} TND
            </p>
          </div>

          <div className="mb-7 space-y-3">
            {product.dimensions && (
              <div className="flex items-center gap-3 text-sm">
                <Check size={17} className="text-[#405033]" />
                Dimensions : {product.dimensions}
              </div>
            )}

            {product.materials && (
              <div className="flex items-center gap-3 text-sm">
                <Check size={17} className="text-[#405033]" />
                Matériaux : {product.materials}
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Check size={17} className="text-[#405033]" />
              Artisanat tunisien authentique — Paiement à la livraison
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-3 rounded-full bg-[#405033] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#526442]"
          >
            <ShoppingBag size={19} />
            Ajouter au panier
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   PAGE BOUTIQUE
========================================== */

export default function CreationsPage() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [categoryList, setCategoryList] = useState(DEFAULT_CATEGORIES);

  const [category, setCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 8;

  /* CHARGEMENT DEPUIS MONGODB */
  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);

        const prodData = (await prodRes.json()) as {
          success?: boolean;
          products?: Array<Record<string, unknown>>;
        };

        const catData = (await catRes.json()) as {
          success?: boolean;
          categories?: Array<{ name: string }>;
        };

        if (!active) return;

        if (
          prodData.success &&
          Array.isArray(prodData.products) &&
          prodData.products.length > 0
        ) {
          setProducts(
            prodData.products.map((p) => ({
              id: String(p.id),
              name: String(p.name ?? ""),
              description: String(p.description ?? ""),
              category: String(p.category ?? ""),
              price: Number(p.price ?? 0),
              image: String(p.image ?? "/images/plateau.jpg"),
              images: Array.isArray(p.images)
                ? (p.images as string[])
                : undefined,
              dimensions:
                typeof p.dimensions === "string" ? p.dimensions : undefined,
              materials:
                typeof p.materials === "string"
                  ? p.materials
                  : typeof p.material === "string"
                    ? p.material
                    : undefined,
              badge: typeof p.badge === "string" ? p.badge : undefined,
              featured: Boolean(p.featured),
            }))
          );
        }

        if (
          catData.success &&
          Array.isArray(catData.categories) &&
          catData.categories.length > 0
        ) {
          setCategoryList([
            { name: "Tous", icon: Grid2X2 },
            ...catData.categories.map((c) => ({
              name: c.name,
              icon: getCategoryIcon(c.name),
            })),
          ]);
        }
      } catch {
        // Garde les données par défaut si hors ligne
      }
    }

    void loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  /* RECHERCHE VENANT DE LA NAVBAR */
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    setSearch(query.get("q") ?? "");

    const requestedCategory = query.get("categorie");

    const categoryMap: Record<string, string> = {
      plateaux: "Plateaux & Planches",
      miroirs: "Miroirs",
      decoration: "Décoration",
      "art-de-la-table": "Art de la table",
      "sur-mesure": "Sur mesure",
    };

    if (requestedCategory) {
      setCategory(categoryMap[requestedCategory] ?? requestedCategory);
    }
  }, []);

  /* FILTRAGE */
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory =
        category === "Tous" ||
        product.category.toLowerCase() === category.toLowerCase();

      const searchValue = search.toLocaleLowerCase().trim();

      const matchSearch =
        product.name.toLocaleLowerCase().includes(searchValue) ||
        product.description.toLocaleLowerCase().includes(searchValue);

      return matchCategory && matchSearch;
    });
  }, [products, category, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage)
  );

  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  function changeCategory(name: string) {
    setCategory(name);
    setCurrentPage(1);
  }

  function changePage(page: number) {
    setCurrentPage(page);

    document.getElementById("catalogue")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <div className="bg-[#F7F2E8] text-[#29271F]">
      {/* HERO BOUTIQUE */}
      <section
        className="relative flex min-h-[345px] items-center bg-cover bg-center md:min-h-[370px]"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(28,22,14,.88) 0%,
              rgba(28,22,14,.67) 36%,
              rgba(28,22,14,.05) 100%
            ),
            url('/images/hero.jpg')
          `,
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-12">
          <div className="max-w-[555px] text-white">
            <p className="mb-4 text-xs font-semibold tracking-[0.45em] text-[#DCC4A0]">
              NOS CRÉATIONS
            </p>

            <h1 className="mb-5 font-serif text-5xl leading-[1.02] md:text-[67px]">
              Boutique &
              <br />
              Collections
            </h1>

            <p className="max-w-[465px] font-serif text-lg leading-snug md:text-[22px]">
              Des pièces uniques en bois d&apos;olivier, façonnées à la main par
              des artisans tunisiens. Tradition, élégance et modernité se
              rencontrent pour sublimer votre intérieur et vos moments de
              partage.
            </p>
          </div>
        </div>
      </section>

      {/* FILTRES */}
      <section id="catalogue" className="scroll-mt-28 pt-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {categoryList.map((item) => {
                const Icon = item.icon;
                const active =
                  category.toLowerCase() === item.name.toLowerCase();

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => changeCategory(item.name)}
                    className={
                      "flex items-center gap-2 rounded-full border px-5 py-3 text-[12px] font-medium shadow-sm transition-all duration-200 " +
                      (active
                        ? "border-[#405033] bg-[#405033] text-white"
                        : "border-[#e6dfd3] bg-[#FFFCF7] text-[#3e3a31] hover:border-[#405033] hover:bg-[#eee8dc]")
                    }
                  >
                    <Icon size={17} />
                    {item.name}
                  </button>
                );
              })}
            </div>

            <p
              aria-live="polite"
              className="whitespace-nowrap text-xs text-[#817b71]"
            >
              {filteredProducts.length} création
              {filteredProducts.length !== 1 ? "s" : ""} disponible
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* SEARCH INDICATOR */}
          {search && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-[#e5ddcf] bg-white/70 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-[#625c51]">
                <Search size={17} />
                Recherche : <strong>{search}</strong>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="flex items-center gap-1 text-xs text-[#405033]"
              >
                Effacer
                <X size={16} />
              </button>
            </div>
          )}

          {/* PRODUCT GRID */}
          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDetails={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-[#e5dccd] bg-[#FFFCF7] px-6 text-center">
              <SlidersHorizontal size={40} className="mb-5 text-[#72815d]" />

              <h2 className="mb-3 font-serif text-2xl">
                Aucune création trouvée
              </h2>

              <p className="mb-6 text-sm text-[#797367]">
                Essayez une autre catégorie ou recherche.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  changeCategory("Tous");
                }}
                className="rounded-full bg-[#405033] px-6 py-3 text-sm text-white"
              >
                Voir toutes les créations
              </button>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-9 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => changePage(currentPage - 1)}
                className="rounded-full border border-[#e4dacb] p-3 disabled:opacity-30"
              >
                <ChevronLeft size={17} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => changePage(page)}
                    className={
                      "h-10 w-10 rounded-lg text-sm " +
                      (currentPage === page
                        ? "bg-[#405033] text-white"
                        : "bg-[#FFFCF7] text-[#405033]")
                    }
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => changePage(currentPage + 1)}
                className="rounded-full border border-[#e4dacb] p-3 disabled:opacity-30"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ARTISAN STORY */}
      <section className="mt-16 grid grid-cols-1 bg-[#405033] lg:grid-cols-2">
        <div className="min-h-[280px] overflow-hidden">
          <img
            src="/images/artisan.jpg"
            alt="Fabrication artisanale en bois d'olivier"
            className="h-full min-h-[280px] w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex items-center px-8 py-14 text-white lg:px-16">
          <div className="max-w-lg">
            <p className="mb-4 text-[11px] font-semibold tracking-[0.4em] text-[#DCC4A0]">
              UN SAVOIR-FAIRE UNIQUE
            </p>

            <h2 className="mb-5 font-serif text-3xl leading-tight md:text-[42px]">
              L&apos;âme de l&apos;artisanat tunisien
            </h2>

            <p className="mb-6 text-sm leading-7 text-[#ece6d9]">
              Chaque création RadiWood met à l&apos;honneur la beauté naturelle
              du bois d&apos;olivier et le travail artisanal. Des pièces
              authentiques, imaginées pour embellir votre quotidien.
            </p>

            <Link
              href="/histoire"
              className="inline-flex items-center gap-3 rounded-full border border-[#DCC4A0] px-6 py-3 text-xs font-semibold transition hover:bg-white/10"
            >
              Découvrir notre histoire
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* BRAND PROMISE */}
      <section className="bg-[#FFFCF7] py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1fr_1.4fr] lg:px-12">
          <div>
            <p className="mb-3 text-[11px] font-semibold tracking-[0.3em] text-[#526442]">
              LA SIGNATURE RADIOWOOD
            </p>

            <h2 className="font-serif text-3xl leading-tight md:text-4xl">
              Des créations inspirées
              <br />
              par la nature
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <Leaf size={29} className="text-[#405033]" />
              <strong className="font-serif text-base">Naturel</strong>
              <p className="text-xs leading-5 text-[#797367]">
                La beauté des formes et des veinures du bois.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Hand size={29} className="text-[#405033]" />
              <strong className="font-serif text-base">Artisanal</strong>
              <p className="text-xs leading-5 text-[#797367]">
                Un hommage aux gestes des artisans.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Sparkles size={29} className="text-[#405033]" />
              <strong className="font-serif text-base">Unique</strong>
              <p className="text-xs leading-5 text-[#797367]">
                Des pièces pleines de caractère.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}