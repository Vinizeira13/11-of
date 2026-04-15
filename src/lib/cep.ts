export type CepLookup = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

export async function fetchCEP(rawCep: string): Promise<CepLookup | null> {
  const cep = rawCep.replace(/\D/g, "");
  if (cep.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.erro) return null;
  return {
    cep: data.cep,
    logradouro: data.logradouro,
    bairro: data.bairro,
    localidade: data.localidade,
    uf: data.uf,
  };
}
