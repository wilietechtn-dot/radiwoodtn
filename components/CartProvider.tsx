"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "radiwood_cart_v1";
const DELIVERY_FEE = 8; // Frais de livraison standard (TND)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Chargement initial du panier
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // Ignorer erreur de lecture
    }
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignorer erreur d'écriture
    }
  }, [items]);

  const addItem = useCallback(
    (product: Omit<CartItem, "quantity">, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id
              ? { ...i, quantity: i.quantity + Math.max(1, qty) }
              : i
          );
        }
        return [...prev, { ...product, quantity: Math.max(1, qty) }];
      });
      setIsOpen(true);
    },
    []
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalCount,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      totalCount,
      subtotal,
      isOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart doit être utilisé à l'intérieur de CartProvider");
  }
  return ctx;
}

/* ==========================================
   TIROIR DU PANIER & VALIDATION COMMANDE
========================================== */

function CartDrawer() {
  const {
    items,
    subtotal,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderRef, setOrderRef] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setError("");
      if (step === "success") {
        setStep("cart");
      }
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const total = subtotal > 0 ? subtotal + DELIVERY_FEE : 0;

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (customerName.trim().length < 2) {
      setError("Veuillez indiquer votre nom complet.");
      return;
    }

    if (phone.trim().length < 8) {
      setError("Veuillez indiquer un numéro de téléphone valide.");
      return;
    }

    if (address.trim().length < 5) {
      setError("Veuillez indiquer votre adresse de livraison.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
          deliveryFee: DELIVERY_FEE,
          source: "Site web",
          items: items.map((item) => ({
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        order?: { reference?: string };
      };

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Impossible d'enregistrer votre commande."
        );
      }

      setOrderRef(data.order?.reference || "");
      clearCart();
      setCustomerName("");
      setPhone("");
      setAddress("");
      setNotes("");
      setStep("success");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la commande."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex justify-end bg-black/50 backdrop-blur-xs"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Votre panier RadiWood"
        className="flex h-full w-full max-w-[440px] flex-col bg-[#FFFCF8] text-[#29271F] shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#E9E2D7] px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} className="text-[#405033]" />
            <h2 className="font-serif text-2xl font-semibold">
              {step === "cart"
                ? "Votre Panier"
                : step === "checkout"
                ? "Finaliser la commande"
                : "Commande confirmée"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="rounded-full bg-[#F1ECE2] p-2 transition hover:bg-[#E4DDD0]"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENU */}
        {step === "success" ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 rounded-full bg-[#E6F1DF] p-5 text-[#386B2C]">
              <CheckCircle2 size={46} />
            </div>

            <h3 className="mb-2 font-serif text-2xl font-semibold">
              Merci pour votre commande !
            </h3>

            {orderRef && (
              <p className="mb-3 rounded-full bg-[#EFE9DC] px-4 py-1 text-xs font-semibold text-[#405033]">
                Référence : {orderRef}
              </p>
            )}

            <p className="mb-8 text-sm leading-7 text-[#756F65]">
              Votre commande a bien été enregistrée dans notre atelier. Nous
              vous contacterons très prochainement par téléphone pour confirmer
              la livraison.
            </p>

            <button
              type="button"
              onClick={closeCart}
              className="rounded-full bg-[#405033] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#526442]"
            >
              Continuer la visite
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag size={48} className="mb-4 text-[#9AA58E]" />
            <p className="mb-2 font-serif text-2xl">Votre panier est vide</p>
            <p className="mb-6 text-sm text-[#817B70]">
              Découvrez nos créations artisanales en bois d&apos;olivier et
              ajoutez vos pièces favorites.
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="rounded-full bg-[#405033] px-7 py-3 text-sm font-semibold text-white"
            >
              Découvrir nos créations
            </button>
          </div>
        ) : step === "cart" ? (
          <>
            {/* LISTE DES ARTICLES */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-[#ECE4D8] bg-white p-3 shadow-2xs"
                >
                  <img
                    src={item.image || "/images/plateau.jpg"}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-lg bg-[#EFE8DC] object-cover"
                  />

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold">
                        {item.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Retirer ${item.name}`}
                        className="text-[#9E978B] transition hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-[#405033]">
                      {item.price.toLocaleString("fr-TN")} TND
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-lg border border-[#E2DBD0] bg-[#FAF7F1]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label="Diminuer la quantité"
                          className="p-1.5 hover:bg-[#EFE9DD]"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="Augmenter la quantité"
                          className="p-1.5 hover:bg-[#EFE9DD]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="ml-auto text-xs font-bold">
                        {(item.price * item.quantity).toLocaleString("fr-TN")}{" "}
                        TND
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PIED DU PANIER */}
            <div className="border-t border-[#E9E2D7] bg-[#F7F2E8] p-6">
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#756F65]">
                  <span>Sous-total</span>
                  <span>{subtotal.toLocaleString("fr-TN")} TND</span>
                </div>
                <div className="flex justify-between text-[#756F65]">
                  <span>Livraison (Tunisie)</span>
                  <span>{DELIVERY_FEE} TND</span>
                </div>
                <div className="flex justify-between border-t border-[#E4DDD0] pt-2 text-base font-bold text-[#29271F]">
                  <span>Total</span>
                  <span>{total.toLocaleString("fr-TN")} TND</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="w-full rounded-full bg-[#405033] py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#526442]"
              >
                Commander ({total.toLocaleString("fr-TN")} TND)
              </button>
            </div>
          </>
        ) : (
          /* FORMULAIRE DE COMMANDE */
          <form
            onSubmit={handleCheckout}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <p className="rounded-xl bg-[#F3EFE6] p-3.5 text-xs leading-5 text-[#5E584E]">
                Paiement à la livraison (Cash on Delivery) partout en Tunisie.
              </p>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex : Ahmed Ben Ali"
                  className="w-full rounded-xl border border-[#DDD7CC] bg-white px-4 py-3 text-sm outline-none focus:border-[#405033]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex : 20 123 456"
                  className="w-full rounded-xl border border-[#DDD7CC] bg-white px-4 py-3 text-sm outline-none focus:border-[#405033]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Adresse complète de livraison *
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rue, ville, gouvernorat..."
                  className="w-full rounded-xl border border-[#DDD7CC] bg-white px-4 py-3 text-sm outline-none focus:border-[#405033]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Notes ou précision (optionnel)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instructions de livraison, personnalisation..."
                  className="w-full rounded-xl border border-[#DDD7CC] bg-white px-4 py-3 text-sm outline-none focus:border-[#405033]"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-xs text-red-600"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-[#E9E2D7] bg-[#F7F2E8] p-6">
              <div className="flex justify-between text-sm font-bold">
                <span>Total à payer à la livraison</span>
                <span>{total.toLocaleString("fr-TN")} TND</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="rounded-full border border-[#D8D1C5] bg-white px-5 py-3.5 text-xs font-semibold"
                >
                  Retour
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full bg-[#405033] py-3.5 text-sm font-semibold text-white transition hover:bg-[#526442] disabled:opacity-60"
                >
                  {submitting ? "Envoi..." : "Confirmer la commande"}
                </button>
              </div>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}