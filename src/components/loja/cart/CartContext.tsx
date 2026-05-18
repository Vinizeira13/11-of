"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  type RefObject,
} from "react";
import { toast } from "sonner";
import {
  addToCartAction,
  removeFromCartAction,
  updateCartQtyAction,
} from "@/app/_actions/cart";
import type { CartLine } from "@/lib/cart";
import { cartLineKey } from "@/lib/personalization";
import type { Product } from "@/lib/catalog";
import { bumpCart, flyToCart } from "@/lib/fly-to-cart";

type CartState = { lines: CartLine[] };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  isOpen: boolean;
  products: Product[];
  cartButtonRef: RefObject<HTMLButtonElement | null>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (
    variantId: string,
    qty?: number,
    personalization?: string,
  ) => Promise<boolean>;
  addWithFlight: (
    variantId: string,
    qty: number,
    flight: { fromEl: HTMLElement; imageSrc: string },
    personalization?: string,
  ) => Promise<boolean>;
  updateQty: (
    variantId: string,
    personalization: string | null,
    qty: number,
  ) => Promise<void>;
  remove: (
    variantId: string,
    personalization: string | null,
  ) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

type OptimisticAction =
  | { type: "set"; lines: CartLine[] }
  | { type: "add"; variantId: string; qty: number; personalization?: string }
  | { type: "updateQty"; key: string; qty: number }
  | { type: "remove"; key: string };

function reducer(state: CartState, action: OptimisticAction): CartState {
  switch (action.type) {
    case "set":
      return { lines: action.lines };
    case "add": {
      const incoming: CartLine = action.personalization
        ? {
            variantId: action.variantId,
            qty: action.qty,
            personalization: action.personalization,
          }
        : { variantId: action.variantId, qty: action.qty };
      const key = cartLineKey(incoming);
      const idx = state.lines.findIndex((l) => cartLineKey(l) === key);
      if (idx >= 0) {
        return {
          lines: state.lines.map((l, i) =>
            i === idx ? { ...l, qty: l.qty + action.qty } : l,
          ),
        };
      }
      return { lines: [...state.lines, incoming] };
    }
    case "updateQty":
      return {
        lines:
          action.qty === 0
            ? state.lines.filter((l) => cartLineKey(l) !== action.key)
            : state.lines.map((l) =>
                cartLineKey(l) === action.key
                  ? { ...l, qty: action.qty }
                  : l,
              ),
      };
    case "remove":
      return {
        lines: state.lines.filter((l) => cartLineKey(l) !== action.key),
      };
  }
}

export function CartProvider({
  initialLines,
  products,
  children,
}: {
  initialLines: CartLine[];
  products: Product[];
  children: React.ReactNode;
}) {
  const [baseLines, setBaseLines] = useState<CartLine[]>(initialLines);
  const [isOpen, setIsOpen] = useState(false);
  const [state, dispatch] = useOptimistic<CartState, OptimisticAction>(
    { lines: baseLines },
    reducer,
  );
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const runAdd = useCallback(
    async (
      variantId: string,
      qty: number,
      openOnSuccess: boolean,
      personalization?: string,
    ): Promise<boolean> => {
      let success = true;
      await new Promise<void>((resolve) => {
        startTransition(async () => {
          dispatch({ type: "add", variantId, qty, personalization });
          try {
            const res = await addToCartAction(variantId, qty, personalization);
            if (res.ok) {
              setBaseLines(res.lines);
            } else {
              success = false;
              toast.error(res.error);
            }
          } catch {
            success = false;
            toast.error("Não deu pra adicionar agora. Tenta de novo.");
          } finally {
            resolve();
          }
        });
      });
      if (success && openOnSuccess) setIsOpen(true);
      return success;
    },
    [dispatch],
  );

  const add = useCallback(
    (variantId: string, qty: number = 1, personalization?: string) =>
      runAdd(variantId, qty, true, personalization),
    [runAdd],
  );

  const addWithFlight = useCallback(
    async (
      variantId: string,
      qty: number,
      flight: { fromEl: HTMLElement; imageSrc: string },
      personalization?: string,
    ) => {
      const toEl = cartButtonRef.current;
      if (!toEl) return runAdd(variantId, qty, true, personalization);

      flyToCart({
        fromEl: flight.fromEl,
        toEl,
        imageSrc: flight.imageSrc,
        onLand: () => {
          bumpCart(toEl);
          setIsOpen(true);
        },
      });
      return runAdd(variantId, qty, false, personalization);
    },
    [runAdd],
  );

  const updateQty = useCallback(
    async (
      variantId: string,
      personalization: string | null,
      qty: number,
    ) => {
      const key = cartLineKey({
        variantId,
        personalization: personalization ?? undefined,
      });
      await new Promise<void>((resolve) => {
        startTransition(async () => {
          dispatch({ type: "updateQty", key, qty });
          try {
            const res = await updateCartQtyAction(
              variantId,
              personalization,
              qty,
            );
            if (res.ok) setBaseLines(res.lines);
            else toast.error(res.error);
          } catch {
            toast.error("Não deu pra atualizar agora. Tenta de novo.");
          } finally {
            resolve();
          }
        });
      });
    },
    [dispatch],
  );

  const remove = useCallback(
    async (variantId: string, personalization: string | null) => {
      const key = cartLineKey({
        variantId,
        personalization: personalization ?? undefined,
      });
      await new Promise<void>((resolve) => {
        startTransition(async () => {
          dispatch({ type: "remove", key });
          try {
            const res = await removeFromCartAction(variantId, personalization);
            if (res.ok) setBaseLines(res.lines);
          } catch {
            toast.error("Não deu pra remover agora. Tenta de novo.");
          } finally {
            resolve();
          }
        });
      });
    },
    [dispatch],
  );

  const count = useMemo(
    () => state.lines.reduce((s, l) => s + l.qty, 0),
    [state.lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      count,
      isOpen,
      products,
      cartButtonRef,
      open,
      close,
      toggle,
      add,
      addWithFlight,
      updateQty,
      remove,
    }),
    [
      state.lines,
      count,
      isOpen,
      products,
      open,
      close,
      toggle,
      add,
      addWithFlight,
      updateQty,
      remove,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
