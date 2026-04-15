export type MockVariant = {
  id: string;
  size: "P" | "M" | "G" | "GG" | "XGG";
  stockQty: number;
};

export type MockProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  compareAtCents: number | null;
  images: string[];
  variants: MockVariant[];
};

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "p1",
    slug: "jersey-noir-01",
    name: "Jersey Noir 01",
    description:
      "Jersey de algodão pesado, silhueta oversize. Costura reforçada nos ombros e barra reta. Edição limitada.",
    category: "jersey",
    priceCents: 24900,
    compareAtCents: 29900,
    images: [img("photo-1521572163474-6864f9cf17ab"), img("photo-1620799140408-edc6dcb6d633")],
    variants: [
      { id: "p1-p", size: "P", stockQty: 4 },
      { id: "p1-m", size: "M", stockQty: 2 },
      { id: "p1-g", size: "G", stockQty: 6 },
      { id: "p1-gg", size: "GG", stockQty: 0 },
    ],
  },
  {
    id: "p2",
    slug: "jersey-bone-02",
    name: "Jersey Bone 02",
    description:
      "Tom bege quente, gola redonda dupla. Tecido com leve textura. Pensado pra cair bem no corpo.",
    category: "jersey",
    priceCents: 22900,
    compareAtCents: null,
    images: [img("photo-1622445275576-721325763afe"), img("photo-1576566588028-4147f3842f27")],
    variants: [
      { id: "p2-p", size: "P", stockQty: 3 },
      { id: "p2-m", size: "M", stockQty: 5 },
      { id: "p2-g", size: "G", stockQty: 4 },
      { id: "p2-gg", size: "GG", stockQty: 2 },
    ],
  },
  {
    id: "p3",
    slug: "jersey-cobre-03",
    name: "Jersey Cobre 03",
    description:
      "Cobre fosco com gola V. Acabamento à mão na barra. Para usar em camadas ou solto.",
    category: "jersey",
    priceCents: 27900,
    compareAtCents: 32900,
    images: [img("photo-1583743814966-8936f5b7be1a"), img("photo-1542060748-10c28b62716f")],
    variants: [
      { id: "p3-p", size: "P", stockQty: 0 },
      { id: "p3-m", size: "M", stockQty: 1 },
      { id: "p3-g", size: "G", stockQty: 3 },
      { id: "p3-gg", size: "GG", stockQty: 4 },
    ],
  },
  {
    id: "p4",
    slug: "jersey-grafite-04",
    name: "Jersey Grafite 04",
    description:
      "Grafite escuro, manga curta com punho. Opção mais ajustada da coleção.",
    category: "jersey",
    priceCents: 21900,
    compareAtCents: null,
    images: [img("photo-1588117260148-b47818741c74"), img("photo-1503342217505-b0a15ec3261c")],
    variants: [
      { id: "p4-p", size: "P", stockQty: 6 },
      { id: "p4-m", size: "M", stockQty: 4 },
      { id: "p4-g", size: "G", stockQty: 5 },
      { id: "p4-gg", size: "GG", stockQty: 3 },
    ],
  },
  {
    id: "p5",
    slug: "jersey-marfim-05",
    name: "Jersey Marfim 05",
    description:
      "Marfim quente, modelagem reta. Algodão peruano. Apenas 30 unidades.",
    category: "jersey",
    priceCents: 31900,
    compareAtCents: 35900,
    images: [img("photo-1556905055-8f358a7a47b2"), img("photo-1591047139829-d91aecb6caea")],
    variants: [
      { id: "p5-p", size: "P", stockQty: 1 },
      { id: "p5-m", size: "M", stockQty: 1 },
      { id: "p5-g", size: "G", stockQty: 2 },
      { id: "p5-gg", size: "GG", stockQty: 0 },
    ],
  },
  {
    id: "p6",
    slug: "jersey-onix-06",
    name: "Jersey Ônix 06",
    description:
      "Preto profundo, malha encorpada. Bordado discreto na manga esquerda.",
    category: "jersey",
    priceCents: 25900,
    compareAtCents: null,
    images: [img("photo-1565693413579-8a73fcf3a99e"), img("photo-1554568218-0f1715e72254")],
    variants: [
      { id: "p6-p", size: "P", stockQty: 5 },
      { id: "p6-m", size: "M", stockQty: 7 },
      { id: "p6-g", size: "G", stockQty: 4 },
      { id: "p6-gg", size: "GG", stockQty: 2 },
      { id: "p6-xgg", size: "XGG", stockQty: 1 },
    ],
  },
];

export function findMockProduct(slug: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}
