"use client";

import { useActionState, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createOrderAction } from "@/app/_actions/checkout";
import { maskCPF } from "@/lib/cpf";
import { maskCEP, fetchCEP } from "@/lib/cep";

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(createOrderAction, {});
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [cepLookupPending, startCepLookup] = useTransition();

  const fieldErrors = state.fieldErrors ?? {};

  function handleCepLookup() {
    startCepLookup(async () => {
      const result = await fetchCEP(cep);
      if (!result) {
        toast.error("CEP não encontrado.");
        return;
      }
      setLogradouro(result.logradouro);
      setBairro(result.bairro);
      setCidade(result.localidade);
      setUf(result.uf);
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state.formError && (
        <Alert variant="destructive">
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      )}

      <FieldSet>
        <FieldLegend>Contato</FieldLegend>
        <FieldGroup>
          <Field data-invalid={!!fieldErrors.email || undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              aria-invalid={!!fieldErrors.email || undefined}
              placeholder="voce@email.com"
            />
            <FieldDescription>
              Enviamos rastreio e atualizações do pedido por aqui.
            </FieldDescription>
            {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
          </Field>

          <Field data-invalid={!!fieldErrors.phone || undefined}>
            <FieldLabel htmlFor="phone">Telefone</FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel-national"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              aria-invalid={!!fieldErrors.phone || undefined}
            />
            {fieldErrors.phone && <FieldError>{fieldErrors.phone}</FieldError>}
          </Field>
        </FieldGroup>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend>Dados pessoais</FieldLegend>
        <FieldGroup>
          <Field data-invalid={!!fieldErrors.name || undefined}>
            <FieldLabel htmlFor="name">Nome completo</FieldLabel>
            <Input
              id="name"
              name="name"
              required
              autoComplete="name"
              placeholder="Como no RG"
              aria-invalid={!!fieldErrors.name || undefined}
            />
            {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
          </Field>

          <Field data-invalid={!!fieldErrors.cpf || undefined}>
            <FieldLabel htmlFor="cpf">CPF</FieldLabel>
            <Input
              id="cpf"
              name="cpf"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              aria-invalid={!!fieldErrors.cpf || undefined}
            />
            <FieldDescription>Exigido pela operadora PIX.</FieldDescription>
            {fieldErrors.cpf && <FieldError>{fieldErrors.cpf}</FieldError>}
          </Field>
        </FieldGroup>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend>Endereço de entrega</FieldLegend>
        <FieldGroup>
          <Field data-invalid={!!fieldErrors.cep || undefined}>
            <FieldLabel htmlFor="cep">CEP</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="cep"
                name="cep"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(maskCEP(e.target.value))}
                aria-invalid={!!fieldErrors.cep || undefined}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  onClick={handleCepLookup}
                  disabled={cep.replace(/\D/g, "").length !== 8 || cepLookupPending}
                >
                  <Search data-icon="inline-start" />
                  {cepLookupPending ? "Buscando…" : "Buscar"}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {fieldErrors.cep && <FieldError>{fieldErrors.cep}</FieldError>}
          </Field>

          <Field data-invalid={!!fieldErrors.logradouro || undefined}>
            <FieldLabel htmlFor="logradouro">Endereço</FieldLabel>
            <Input
              id="logradouro"
              name="logradouro"
              required
              autoComplete="address-line1"
              placeholder="Rua, avenida…"
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
              aria-invalid={!!fieldErrors.logradouro || undefined}
            />
            {fieldErrors.logradouro && (
              <FieldError>{fieldErrors.logradouro}</FieldError>
            )}
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!fieldErrors.numero || undefined}>
              <FieldLabel htmlFor="numero">Número</FieldLabel>
              <Input
                id="numero"
                name="numero"
                required
                inputMode="numeric"
                placeholder="123"
                aria-invalid={!!fieldErrors.numero || undefined}
              />
              {fieldErrors.numero && <FieldError>{fieldErrors.numero}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
              <Input
                id="complemento"
                name="complemento"
                autoComplete="address-line2"
                placeholder="Apto, bloco… (opcional)"
              />
            </Field>
          </div>

          <Field data-invalid={!!fieldErrors.bairro || undefined}>
            <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
            <Input
              id="bairro"
              name="bairro"
              required
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              aria-invalid={!!fieldErrors.bairro || undefined}
            />
            {fieldErrors.bairro && <FieldError>{fieldErrors.bairro}</FieldError>}
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">
            <Field data-invalid={!!fieldErrors.cidade || undefined}>
              <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
              <Input
                id="cidade"
                name="cidade"
                required
                autoComplete="address-level2"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                aria-invalid={!!fieldErrors.cidade || undefined}
              />
              {fieldErrors.cidade && <FieldError>{fieldErrors.cidade}</FieldError>}
            </Field>
            <Field data-invalid={!!fieldErrors.uf || undefined}>
              <FieldLabel htmlFor="uf">UF</FieldLabel>
              <Input
                id="uf"
                name="uf"
                required
                maxLength={2}
                autoComplete="address-level1"
                placeholder="SP"
                value={uf}
                onChange={(e) => setUf(e.target.value.toUpperCase())}
                aria-invalid={!!fieldErrors.uf || undefined}
              />
              {fieldErrors.uf && <FieldError>{fieldErrors.uf}</FieldError>}
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="h-12 w-full rounded-full text-base font-medium"
      >
        {isPending ? "Gerando PIX…" : "Pagar com PIX"}
      </Button>
    </form>
  );
}
