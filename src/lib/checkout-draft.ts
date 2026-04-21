/**
 * LocalStorage draft persistence for the checkout form. Buyers who bounce
 * and return don't have to retype — their last session is pre-filled.
 *
 * Intentionally omits CPF from the persisted keys (sensitive, not worth the
 * recurrence). Everything else is either non-sensitive (email, city, state)
 * or already stored elsewhere (CEP via DeliveryEstimate).
 */
const KEY = "11of:checkout-draft";

export type CheckoutDraft = {
  email?: string;
  phone?: string;
  name?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  notes?: string;
};

export function loadDraft(): CheckoutDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CheckoutDraft) : {};
  } catch {
    return {};
  }
}

export function saveDraft(patch: CheckoutDraft) {
  if (typeof window === "undefined") return;
  try {
    const current = loadDraft();
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ ...current, ...patch }),
    );
  } catch {
    /* quota errors etc — best-effort */
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}
