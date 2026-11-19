"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Box,
  CalendarDays,
  MessageSquare,
  MoreVertical,
  ShoppingCart,
  Tag,
} from "lucide-react";

import type { ProductDB } from "@/lib/products-db";
import type { Category } from "@/lib/categories";
import type { CustomerMessage } from "@/lib/messages";
import type { Order } from "@/lib/orders";

/* ==========================================
   GRAPHIQUE D'ÉVOLUTION
========================================== */

const chartValues = [
  25, 57, 42, 81, 91, 112, 84, 103, 76, 115, 96, 135, 110, 170,
];

function VisitsChart() {
  const points = chartValues.map((value, index) => {
    const x = 12 + (index / (chartValues.length - 1)) * 576;
    const y = 170 - (value / 200) * 155;
    return `${x},${y}`;
  });

  const linePoints = points.join(" ");
  const fillPoints = `12,170 ${linePoints} 588,170`;

  return (
    <div className="w-full">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-4 text-[10px] text-[#929086]">
          <span>200</span>
          <span>150</span>
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>

        <svg
          viewBox="0 0 600 180"
          className="ml-6 w-[calc(100%-24px)]"
          role="img"
          aria-label="Graphique de visites des 30 derniers jours"
        >
          <defs>
            <linearGradient id="rw-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#819D6A" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#819D6A" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[15, 55, 95, 135, 170].map((y) => (
            <line
              key={y}
              x1="12"
              y1={y}
              x2="588"
              y2={y}
              stroke="#E7E6DE"
              strokeWidth="1"
            />
          ))}

          <polygon points={fillPoints} fill="url(#rw-chart-fill)" />

          <polyline
            points={linePoints}
            fill="none"
            stroke="#405B31"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="ml-6 mt-2 flex justify-between text-[10px] text-[#827D73]">
        <span>J-30</span>
        <span>J-25</span>
        <span>J-20</span>
        <span>J-15</span>
        <span>J-10</span>
        <span>J-5</span>
        <span>Aujourd&apos;hui</span>
      </div>
    </div>
  );
}

function formatRelativeDate(dateStr?: string | Date): string {
  if (!dateStr) return "Récemment";
  const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Récemment";

  return new Intl.DateTimeFormat("fr-TN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/* ==========================================
   TABLEAU DE BORD
========================================== */

export default function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [currentMonthLabel, setCurrentMonthLabel] = useState("—");

  const [products, setProducts] = useState<ProductDB[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");

    const label = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(new Date());
    setCurrentMonthLabel(label.charAt(0).toUpperCase() + label.slice(1));
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        const [prodRes, catRes, msgRes, ordRes] = await Promise.all([
          fetch("/api/admin/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/messages", { cache: "no-store" }),
          fetch("/api/orders", { cache: "no-store" }),
        ]);

        const [prodData, catData, msgData, ordData] = await Promise.all([
          prodRes.json() as Promise<{
            success?: boolean;
            products?: ProductDB[];
          }>,
          catRes.json() as Promise<{
            success?: boolean;
            categories?: Category[];
          }>,
          msgRes.json() as Promise<{
            success?: boolean;
            messages?: CustomerMessage[];
          }>,
          ordRes.json() as Promise<{ success?: boolean; orders?: Order[] }>,
        ]);

        if (!active) return;

        if (prodData.success && Array.isArray(prodData.products)) {
          setProducts(prodData.products);
        }
        if (catData.success && Array.isArray(catData.categories)) {
          setCategories(catData.categories);
        }
        if (msgData.success && Array.isArray(msgData.messages)) {
          setMessages(msgData.messages);
        }
        if (ordData.success && Array.isArray(ordData.orders)) {
          setOrders(ordData.orders);
        }
      } catch (err) {
        console.error("Erreur chargement tableau de bord:", err);
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    }

    void loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "En attente"
  ).length;
  const publishedProductsCount = products.filter(
    (p) => p.status === "Publié"
  ).length;

  const statistics = [
    {
      title: "Produits",
      value: loaded ? String(products.length) : "—",
      change: loaded ? `${publishedProductsCount} publiés` : "",
      description: "au total",
      icon: Box,
      background: "bg-[#405B31]",
      iconBackground: "bg-[#718B56]/60",
      changeColor: "text-[#B9E8A2]",
      href: "/admin/produits",
    },
    {
      title: "Catégories",
      value: loaded ? String(categories.length) : "—",
      change: "",
      description: "actives",
      icon: Tag,
      background: "bg-[#F1DFC5]",
      iconBackground: "bg-[#E5C9A1]",
      changeColor: "text-[#405033]",
      href: "/admin/categories",
    },
    {
      title: "Messages",
      value: loaded ? String(messages.length) : "—",
      change:
        loaded && unreadMessagesCount > 0
          ? `${unreadMessagesCount} non lu${unreadMessagesCount > 1 ? "s" : ""}`
          : "",
      description: "reçus",
      icon: MessageSquare,
      background: "bg-[#87512E]",
      iconBackground: "bg-[#AD754B]/70",
      changeColor: "text-[#F2A875]",
      href: "/admin/messages",
    },
    {
      title: "Commandes",
      value: loaded ? String(orders.length) : "—",
      change:
        loaded && pendingOrdersCount > 0
          ? `${pendingOrdersCount} en attente`
          : "",
      description: "au total",
      icon: ShoppingCart,
      background: "bg-[#37332F]",
      iconBackground: "bg-[#686059]/70",
      changeColor: "text-[#A9E0A1]",
      href: "/admin/commandes",
    },
  ];

  const recentProducts = useMemo(() => {
    const matching = products.filter((product) =>
      product.name
        .toLocaleLowerCase("fr")
        .includes(query.toLocaleLowerCase("fr").trim())
    );

    return matching.slice(0, 4);
  }, [products, query]);

  const activities = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      description: string;
      timestamp: number;
      icon: typeof MessageSquare;
    }> = [];

    for (const order of orders.slice(0, 3)) {
      items.push({
        id: `ord-${order.id}`,
        title: `Commande ${order.reference} — ${order.customerName}`,
        description: `${order.status} • ${formatRelativeDate(order.createdAt)}`,
        timestamp: new Date(order.createdAt).getTime() || 0,
        icon: ShoppingCart,
      });
    }

    for (const msg of messages.slice(0, 3)) {
      items.push({
        id: `msg-${msg.id}`,
        title: `Message de ${msg.name} (${msg.source})`,
        description: `${msg.subject} • ${formatRelativeDate(msg.createdAt)}`,
        timestamp: new Date(msg.createdAt).getTime() || 0,
        icon: MessageSquare,
      });
    }

    for (const prod of products.slice(0, 2)) {
      items.push({
        id: `prod-${prod.id}`,
        title: `Produit : ${prod.name}`,
        description: `${prod.category} • ${formatRelativeDate(prod.createdAt)}`,
        timestamp: prod.createdAt ? new Date(prod.createdAt).getTime() : 0,
        icon: Tag,
      });
    }

    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);
  }, [orders, messages, products]);

  return (
    <div className="min-h-screen bg-[#F7F2E8]">
      {/* EN-TÊTE DU DASHBOARD */}
      <section
        className="relative overflow-hidden border-b border-[#E6DDCE] bg-[#F7F2E8]"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              #F7F2E8 0%,
              rgba(247,242,232,.94) 37%,
              rgba(247,242,232,.38) 75%,
              rgba(247,242,232,.06) 100%
            ),
            url('/images/hero.jpg')
          `,
          backgroundPosition: "center, right center",
          backgroundSize: "cover",
        }}
      >
        <div className="mx-auto flex min-h-[160px] max-w-[1600px] flex-col justify-between gap-6 px-6 py-8 md:flex-row md:items-center md:px-9">
          <div>
            <h1 className="mb-3 font-serif text-4xl font-semibold text-[#29271F] md:text-[49px]">
              Tableau de bord
            </h1>

            <p className="text-sm text-[#706C62] md:text-base">
              Bienvenue sur votre espace d&apos;administration RadiWood.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 self-start rounded-xl border border-[#E8E0D4] bg-[#FFFCF7] px-5 py-3 text-sm shadow-sm md:self-center">
            <CalendarDays size={19} className="text-[#405033]" />

            <span className="font-medium">{currentMonthLabel}</span>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <div className="mx-auto max-w-[1600px] space-y-6 px-5 py-7 md:px-9">
        {/* INDICATEUR CONNEXION */}
        <div className="flex items-center gap-2 text-xs text-[#797267]">
          <span className="h-2 w-2 rounded-full bg-[#405B31]" />
          Données synchronisées avec la base de données RadiWood
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((stat) => {
            const Icon = stat.icon;
            const isLight = stat.title === "Catégories";

            return (
              <Link
                key={stat.title}
                href={stat.href}
                className={`${stat.background} flex min-h-[155px] items-center gap-5 rounded-xl border border-[#E7DFD4] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  isLight ? "text-[#29271F]" : "text-[#F7F2E8]"
                }`}
              >
                <div
                  className={`${stat.iconBackground} flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full`}
                >
                  <Icon size={34} strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-sm font-semibold">{stat.title}</p>

                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <strong className="text-[36px] leading-none">
                      {stat.value}
                    </strong>

                    {stat.change && (
                      <span className={`text-xs font-bold ${stat.changeColor}`}>
                        {stat.change}
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-2 text-xs ${
                      isLight ? "text-[#766D5F]" : "text-[#F7F2E8]/75"
                    }`}
                  >
                    {stat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* PRODUITS ET ANALYTICS */}
        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[1.8fr_1fr]">
          {/* PRODUITS RÉCENTS */}
          <section className="min-w-0 rounded-xl border border-[#EEE6DB] bg-[#FFFCF7] p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-serif text-[24px] font-semibold">
                Produits récents
              </h2>

              <Link
                href="/admin/produits"
                className="flex items-center gap-2 text-xs font-semibold text-[#405033] hover:underline"
              >
                Voir tous
                <ArrowRight size={16} />
              </Link>
            </div>

            {query && (
              <p className="mb-4 text-xs text-[#7B766B]">
                Recherche : {query}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {loaded &&
                recentProducts.map((product) => (
                  <article
                    key={product.id}
                    className="min-w-0 overflow-hidden rounded-lg border border-[#F0E8DD] bg-white"
                  >
                    <div className="h-[190px] overflow-hidden bg-[#E9DDCA]">
                      <img
                        src={product.image || "/images/plateau.jpg"}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="p-3">
                      <div className="mb-2 flex items-start justify-between gap-1">
                        <h3 className="min-h-[40px] text-[13px] font-semibold leading-5">
                          {product.name}
                        </h3>

                        <Link
                          href="/admin/produits"
                          aria-label={`Gérer ${product.name}`}
                          className="shrink-0 text-[#6D6D63] hover:text-[#29271F]"
                        >
                          <MoreVertical size={16} />
                        </Link>
                      </div>

                      <p className="mb-3 text-sm font-semibold">
                        {product.price.toLocaleString("fr-TN")} TND
                      </p>

                      <div
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold ${
                          product.status === "Publié"
                            ? "bg-[#E5F2DF] text-[#317230]"
                            : "bg-[#FFF0D6] text-[#98651A]"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            product.status === "Publié"
                              ? "bg-[#39A23E]"
                              : "bg-[#D9821E]"
                          }`}
                        />

                        {product.status}
                      </div>
                    </div>
                  </article>
                ))}

              {loaded && recentProducts.length === 0 && (
                <p className="col-span-full py-12 text-center text-sm text-[#77736B]">
                  {query
                    ? "Aucun produit ne correspond à cette recherche."
                    : "Aucun produit enregistré pour le moment."}
                </p>
              )}

              {!loaded && (
                <p className="col-span-full py-12 text-center text-sm text-[#77736B]">
                  Chargement des produits récents...
                </p>
              )}
            </div>
          </section>

          {/* ANALYTICS + ACTIVITÉ */}
          <div className="flex min-w-0 flex-col gap-5">
            {/* CHART */}
            <section className="rounded-xl border border-[#EEE6DB] bg-[#FFFCF7] p-5 shadow-sm">
              <h2 className="mb-6 text-[17px] font-semibold">
                Vues du site
                <span className="ml-2 text-xs font-normal text-[#77736B]">
                  (30 derniers jours)
                </span>
              </h2>

              <VisitsChart />
            </section>

            {/* ACTIVITÉ */}
            <section className="flex-1 rounded-xl border border-[#EEE6DB] bg-[#FFFCF7] p-5 shadow-sm">
              <h2 className="mb-6 text-[18px] font-semibold">
                Activité récente
              </h2>

              <div className="space-y-5">
                {loaded &&
                  activities.map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5E9D1] text-[#8E692E]">
                          <Icon size={20} strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="mb-1 truncate text-[13px] font-semibold leading-5">
                            {activity.title}
                          </p>

                          <p className="text-[12px] text-[#8C867C]">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                {loaded && activities.length === 0 && (
                  <p className="text-xs text-[#8C867C]">
                    Aucune activité récente enregistrée.
                  </p>
                )}

                {!loaded && (
                  <p className="text-xs text-[#8C867C]">
                    Chargement de l&apos;activité...
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* BAS DU TABLEAU DE BORD */}
        <section className="rounded-xl border border-[#EEE6DB] bg-[#FFFCF7] p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="mb-1 font-serif text-[22px] font-semibold">
                Gérez vos créations RadiWood
              </h2>

              <p className="text-xs leading-6 text-[#817A70]">
                Organisez votre catalogue, vos catégories et les demandes
                clients.
              </p>
            </div>

            <Link
              href="/admin/produits"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#405033] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#526442]"
            >
              Gérer les produits
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}