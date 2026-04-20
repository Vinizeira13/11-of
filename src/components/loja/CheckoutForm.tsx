"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Check, Lock, Mail, MapPin, Phone, Search, User } from "lucide-react";
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
import { isValidCPF, maskCPF } from "@/lib/cpf";
import { maskCEP, fetchCEP } from "@/lib/cep";
import { isLikelyValidEmail, suggestEmailFix } from "@/lib/email-hint";
import { loadDraft, saveDraft } from "@/lib/checkout-draft";
import { cn } from "@/lib/utils";

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

/** Green check rendered inside the input when a field has validated. */
function OkMark({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute right-3 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-turf/15 text-turf transition",
        show ? "opacity-100 scale-100" : "opacity-0 scale-75",
      )}
    >
      <Check className="size-3" />
    </span>
  );
}

export function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(createOrderAction, {});

  // Controlled fields (masked or hydrated)
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  // Ephemeral UI state
  const [emailTypo, setEmailTypo] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [cpfTouched, setCpfTouched] = useState(false);
  const [cepLookupPending, startCepLookup] = useTransition();
  const numeroRef = useRef<HTMLInputElement | null>(null);
  const hydrated = useRef(false);

  const fieldErrors = state.fieldErrors ?? {};

  // ------- Hydrate from localStorage once on mount -------
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const d = loadDraft();
    if (d.email) setEmail(d.email);
    if (d.phone) setPhone(d.phone);
    if (d.name) setName(d.name);
    if (d.cep) setCep(d.cep);
    if (d.logradouro) setLogradouro(d.logradouro);
    if (d.numero) setNumero(d.numero);
    if (d.complemento) setComplemento(d.complemento);
    if (d.bairro) setBairro(d.bairro);
    if (d.cidade) setCidade(d.cidade);
    if (d.uf) setUf(d.uf);
  }, []);

  // ------- Persist draft on change (debounced by natural re-render cadence) -------
  useEffect(() => {
    if (!hydrated.current) return;
    saveDraft({
      email,
      phone,
      name,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
    });
  }, [email, phone, name, cep, logradouro, numero, complemento, bairro, cidade, uf]);

  // ------- Derived validity -------
  const emailValid = emailTouched && isLikelyValidEmail(email);
  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const nameValid = name.trim().split(/\s+/).length >= 2;
  const cpfValid = cpfTouched && isValidCPF(cpf);
  const cpfBadlyFormed = cpfTouched && cpf.replace(/\D/g, "").length === 11 && !cpfValid;
  const cepValid = cep.replace(/\D/g, "").length === 8;

  function handleEmailBlur() {
    setEmailTouched(true);
    const hint = suggestEmailFix(email);
    setEmailTypo(hint);
  }

  function applyEmailFix() {
    if (!emailTypo) return;
    setEmail(emailTypo);
    setEmailTypo(null);
    toast.success("Email corrigido");
  }

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
      // jump to the next field the user must actually fill
      requestAnimationFrame(() => numeroRef.current?.focus());
      toast.success("Endereço encontrado", { description: `${result.localidade} · ${result.uf}` });
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
        <FieldLegend className="flex items-center gap-2">
          <Mail className="size-4 text-turf" aria-hidden />
          Contato
        </FieldLegend>
        <FieldGroup>
          <Field data-invalid={!!fieldErrors.email || undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={!!fieldErrors.email || undefined}
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailTypo) setEmailTypo(null);
                }}
                onBlur={handleEmailBlur}
                className={cn(emailValid && "pr-10")}
              />
              <OkMark show={emailValid} />
            </div>
            {emailTypo && (
              <button
                type="button"
                onClick={applyEmailFix}
                className="mt-1 inline-flex items-center gap-1.5 self-start rounded-full border border-turf/40 bg-turf/10 px-2.5 py-1 text-[11px] font-medium text-turf transition hover:bg-turf/20"
              >
                Você quis dizer{" "}
                <span className="font-semibold">{emailTypo}</span>?
              </button>
            )}
            <FieldDescription>
              Enviamos rastreio e atualizações do pedido por aqui.
            </FieldDescription>
            {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
          </Field>

          <Field data-invalid={!!fieldErrors.phone || undefined}>
            <FieldLabel htmlFor="phone">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5 text-muted-foreground" aria-hidden />
                Telefone / WhatsApp
              </span>
            </FieldLabel>
            <div className="relative">
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
                className={cn(phoneValid && "pr-10")}
              />
              <OkMark show={phoneValid} />
            </div>
            <FieldDescription>
              Se der algum problema, a gente chama direto no WhatsApp.
            </FieldDescription>
            {fieldErrors.phone && <FieldError>{fieldErrors.phone}</FieldError>}
          </Field>
        </FieldGroup>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend className="flex items-center gap-2">
          <User className="size-4 text-turf" aria-hidden />
          Dados pessoais
        </FieldLegend>
        <FieldGroup>
          <Field data-invalid={!!fieldErrors.name || undefined}>
            <FieldLabel htmlFor="name">Nome completo</FieldLabel>
            <div className="relative">
              <Input
                id="name"
                name="name"
                required
                autoComplete="name"
                placeholder="Como no RG"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!fieldErrors.name || undefined}
                className={cn(nameValid && "pr-10")}
              />
              <OkMark show={nameValid} />
            </div>
            {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
          </Field>

          <Field data-invalid={!!fieldErrors.cpf || cpfBadlyFormed || undefined}>
            <FieldLabel htmlFor="cpf">CPF</FieldLabel>
            <div className="relative">
              <Input
                id="cpf"
                name="cpf"
                required
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(maskCPF(e.target.value))}
                onBlur={() => setCpfTouched(true)}
                aria-invalid={!!fieldErrors.cpf || cpfBadlyFormed || undefined}
                className={cn(cpfValid && "pr-10")}
              />
              <OkMark show={cpfValid} />
            </div>
            <FieldDescription>
              {cpfBadlyFormed
                ? "CPF parece inválido — confere os dígitos."
                : "Exigido pela operadora PIX."}
            </FieldDescription>
            {fieldErrors.cpf && <FieldError>{fieldErrors.cpf}</FieldError>}
          </Field>
        </FieldGroup>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend className="flex items-center gap-2">
          <MapPin className="size-4 text-turf" aria-hidden />
          Endereço de entrega
        </FieldLegend>
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
                  disabled={!cepValid || cepLookupPending}
                >
                  <Search data-icon="inline-start" />
                  {cepLookupPending ? "Buscando…" : "Buscar"}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              <a
                href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                target="_blank"
                rel="noopener"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Não sei meu CEP
              </a>
            </FieldDescription>
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
                ref={numeroRef}
                id="numero"
                name="numero"
                required
                inputMode="numeric"
                placeholder="123"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
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
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
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

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-12 w-full rounded-full text-base font-medium"
        >
          {isPending ? "Gerando PIX…" : "Pagar com PIX"}
        </Button>
        <p className="inline-flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Lock className="size-3" aria-hidden />
          Dados criptografados em trânsito · LGPD · sem criar conta
        </p>
      </div>
    </form>
  );
}
