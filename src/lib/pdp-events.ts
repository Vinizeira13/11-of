// Tiny client-side event bus used to wire the bottom StickyMobileCTA to
// the in-page AddToCartButton without lifting state to the PDP route.
//
// AddToCartButton dispatches `variant-changed` whenever the customer
// picks/unpicks a size (or changes personalization). StickyMobileCTA
// listens, and when the customer taps it with a size already selected,
// dispatches `request-add` — AddToCartButton picks it up and runs the
// same handleAdd path as the desktop button.

export const PDP_VARIANT_CHANGED = "11of:pdp:variant-changed";
export const PDP_REQUEST_ADD = "11of:pdp:request-add";

export type PdpVariantChangedDetail = {
  ready: boolean;
  sizeLabel: string | null;
};

export function emitVariantChanged(detail: PdpVariantChangedDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<PdpVariantChangedDetail>(PDP_VARIANT_CHANGED, { detail }),
  );
}

export function emitRequestAdd() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PDP_REQUEST_ADD));
}
