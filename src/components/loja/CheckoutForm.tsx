"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Check,
  ChevronDown,
  Lock,
  Mail,
  MapPin,
  Phone,
  StickyNote,
  User,
} from "lucide-react";
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
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createOrderAction } from "@/app/_actions/checkout";
import { isValidCPF, maskCPF } from "@/lib/cpf";
import { maskCEP, fetchCEP } from "@/lib/cep";
import { isLikelyValidEmail, suggestEmailFix } from "@/lib/email-hint";
import { loadDraft, saveDraft } from "@/lib/checkout-draft";
import { formatBRL } from "@/lib/money";
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

/** Tiny green check rendered inside the input when the field is valid. */
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

export function CheckoutForm({ totalCents }: { totalCents: number }) {
  const [state, formAction, isPending] = useActionState(createOrderAction, {});

  // Controlled fields
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
  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);

  // UI state
  const [emailTypo, setEmailTypo] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [cpfTouched, setCpfTouched] = useState(false);
  const [cepLookupPending, startCepLookup] = useTransition();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const numeroRef = useRef<HTMLInputElement | null>(null);
  const hydrated = useRef(false);
  const lastAutoLookup = useRef<string>("");

  const fieldErrors = state.fieldErrors ?? {};

  // -------- Auto-focus email on first mount (desktop only, avoid mobile zoom) --------
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      emailRef.current?.focus();
    }
  }, []);

  // -------- Hydrate from localStorage once on mount --------
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
    if (d.notes) {
      setNotes(d.notes);
      setNotesOpen(true);
    }
  }, []);

  // -------- Persist draft on change --------
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
      notes,
    });
  }, [
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
    notes,
  ]);

  // -------- Derived validity --------
  const emailValid = emailTouched && isLikelyValidEmail(email);
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneValid = phoneDigits.length >= 10;
  const nameValid = name.trim().split(/\s+/).length >= 2;
  const cpfValid = cpfTouched && isValidCPF(cpf);
  const cpfBadlyFormed =
    cpfTouched && cpf.replace(/\D/g, "").length === 11 && !cpfValid;
  const cepDigits = cep.replace(/\D/g, "");
  const cepValid = cepDigits.length === 8;
  const addressValid =
    cepValid &&
    logradouro.trim().length > 0 &&
    numero.trim().length > 0 &&
    bairro.trim().length > 0 &&
    cidade.trim().length > 0 &&
    uf.trim().length === 2;

  // -------- Progress % for submit area --------
  const requiredChecks = [
    emailValid,
    phoneValid,
    nameValid,
    cpfValid,
    addressValid,
  ];
  const filledCount = requiredChecks.filter(Boolean).length;
  const totalRequired = requiredChecks.length;
  const progressPct = Math.round((filledCount / totalRequired) * 100);

  // -------- Email handlers --------
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

  // -------- CEP auto-lookup on 8 digits --------
  async function runCepLookup(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    if (lastAutoLookup.current === digits) return;
    lastAutoLookup.current = digits;

    startCepLookup(async () => {
      const result = await fetchCEP(digits);
      if (!result) {
        toast.error("CEP não encontrado — confere os dígitos.");
        return;
      }
      setLogradouro(result.logradouro);
      setBairro(result.bairro);
      setCidade(result.localidade);
      setUf(result.uf);
      toast.success("Endereço encontrado", {
        description: `${result.localidade} · ${result.uf}`,
      });
      // jump to the field that actually needs input
      requestAnimationFrame(() => numeroRef.current?.focus());
    });
  }

  function handleCepChange(raw: string) {
    const masked = maskCEP(raw);
    setCep(masked);
    // Auto-lookup the moment we have 8 clean digits
    if (masked.replace(/\D/g, "").length === 8) {
      runCepLookup(masked);
    }
  }

  const submitLabel = useMemo(() => {
    if (isPending) return "Gerando PIX…";
    return `Pagar ${formatBRL(totalCents)} via PIX`;
  }, [isPending, totalCents]);

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
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={!!fieldErrors.email || undefined}
                placeholder="voce@gmail.com"
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
              {fieldErrors.email
                ? null
                : "Use o email que você checa todo dia — rastreio cai por aqui."}
            </FieldDescription>
            {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
          </Field>

          <Field data-invalid={!!fieldErrors.phone || undefined}>
            <FieldLabel htmlFor="phone">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5 text-muted-foreground" aria-hidden />
                Celular / WhatsApp
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
              {fieldErrors.phone
                ? null
                : "DDD + 9 dígitos. Avisamos do rastreio no WhatsApp."}
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
                placeholder="Caio Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!fieldErrors.name || undefined}
                className={cn(nameValid && "pr-10")}
              />
              <OkMark show={nameValid} />
            </div>
            <FieldDescription>
              {fieldErrors.name
                ? null
                : "Nome e sobrenome, igual no RG — sai na nota fiscal."}
            </FieldDescription>
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
                aria-invalid={
                  !!fieldErrors.cpf || cpfBadlyFormed || undefined
                }
                className={cn(cpfValid && "pr-10")}
              />
              <OkMark show={cpfValid} />
            </div>
            <FieldDescription>
              {fieldErrors.cpf || cpfBadlyFormed
                ? null
                : "11 dígitos sem pontos. Exigido pra emitir o PIX."}
            </FieldDescription>
            {(fieldErrors.cpf || cpfBadlyFormed) && (
              <FieldError>
                {fieldErrors.cpf ??
                  "Os dígitos não batem — confira o CPF."}
              </FieldError>
            )}
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
                onChange={(e) => handleCepChange(e.target.value)}
                aria-invalid={!!fieldErrors.cep || undefined}
              />
              <InputGroupAddon align="inline-end">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  {cepLookupPending ? (
                    "Buscando…"
                  ) : cepValid && cidade ? (
                    <>
                      <Check className="size-3 text-turf" aria-hidden />
                      ok
                    </>
                  ) : (
                    "auto-busca"
                  )}
                </span>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              {fieldErrors.cep
                ? null
                : "8 dígitos. Buscamos o endereço automaticamente. "}
              {!fieldErrors.cep && (
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Não sei meu CEP
                </a>
              )}
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
              placeholder="Rua, avenida, travessa…"
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
              aria-invalid={!!fieldErrors.logradouro || undefined}
            />
            {fieldErrors.logradouro ? (
              <FieldError>{fieldErrors.logradouro}</FieldError>
            ) : (
              <FieldDescription>
                Preenchido automaticamente pelo CEP — confira se tá certo.
              </FieldDescription>
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
              {fieldErrors.numero ? (
                <FieldError>{fieldErrors.numero}</FieldError>
              ) : (
                <FieldDescription>Use 's/n' se for sem número.</FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
              <Input
                id="complemento"
                name="complemento"
                autoComplete="address-line2"
                placeholder="Apto, bloco, referência…"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
              <FieldDescription>Opcional.</FieldDescription>
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
              {fieldErrors.uf ? (
                <FieldError>{fieldErrors.uf}</FieldError>
              ) : (
                <FieldDescription>Ex: SP, RJ, MG.</FieldDescription>
              )}
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      {/* Notes: collapsed by default — most buyers don't need it */}
      <div className="-mt-2">
        {notesOpen ? (
          <FieldSet>
            <FieldLegend className="flex items-center gap-2">
              <StickyNote className="size-4 text-turf" aria-hidden />
              Observações
              <button
                type="button"
                onClick={() => {
                  setNotesOpen(false);
                  setNotes("");
                }}
                className="ml-auto text-[11px] font-normal text-muted-foreground hover:text-foreground"
              >
                remover
              </button>
            </FieldLegend>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="order_notes" className="sr-only">
                  Observações
                </FieldLabel>
                <Textarea
                  id="order_notes"
                  name="order_notes"
                  rows={3}
                  maxLength={500}
                  placeholder="Camisa pra presente? Ligar antes de entregar? Horário de preferência?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <FieldDescription>
                  {notes.length}/500 · Qualquer recado pra o atendimento.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        ) : (
          <button
            type="button"
            onClick={() => setNotesOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ChevronDown className="size-3.5" />
            Adicionar observação (opcional)
          </button>
        )}
      </div>

      {/* Submit block: progress + CTA + implicit consent */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-muted-foreground">
            {filledCount}/{totalRequired} preenchido
          </span>
          <div
            className="h-1 w-24 overflow-hidden rounded-full bg-border/60"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-turf transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-12 w-full rounded-full text-base font-medium"
        >
          {submitLabel}
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          <Lock className="mr-1 inline size-3" aria-hidden />
          Ao clicar em Pagar você aceita os{" "}
          <a
            href="/termos"
            target="_blank"
            rel="noopener"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Termos
          </a>{" "}
          e a{" "}
          <a
            href="/privacidade"
            target="_blank"
            rel="noopener"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Política de Privacidade
          </a>{" "}
          · Dados criptografados · LGPD
        </p>
      </div>
    </form>
  );
}
