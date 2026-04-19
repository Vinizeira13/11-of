import { gsap } from "gsap";

type FlyOptions = {
  fromEl: HTMLElement;
  toEl: HTMLElement;
  imageSrc: string;
  onLand?: () => void;
};

export function flyToCart({ fromEl, toEl, imageSrc, onLand }: FlyOptions): void {
  if (typeof window === "undefined") return;

  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();
  if (fromRect.width === 0 || toRect.width === 0) {
    onLand?.();
    return;
  }

  const ghost = document.createElement("img");
  ghost.src = imageSrc;
  ghost.alt = "";
  ghost.ariaHidden = "true";
  ghost.style.cssText = [
    "position:fixed",
    `left:${fromRect.left}px`,
    `top:${fromRect.top}px`,
    `width:${fromRect.width}px`,
    `height:${fromRect.height}px`,
    "object-fit:cover",
    "border-radius:16px",
    "pointer-events:none",
    "z-index:80",
    "box-shadow:0 20px 40px -12px rgba(0,0,0,.35)",
    "will-change:transform,opacity",
  ].join(";");
  document.body.appendChild(ghost);

  const fromCx = fromRect.left + fromRect.width / 2;
  const fromCy = fromRect.top + fromRect.height / 2;
  const toCx = toRect.left + toRect.width / 2;
  const toCy = toRect.top + toRect.height / 2;
  const deltaX = toCx - fromCx;
  const deltaY = toCy - fromCy;

  const targetSize = Math.max(toRect.width, toRect.height) * 0.9;
  const scale = targetSize / fromRect.width;

  const tl = gsap.timeline({
    onComplete: () => {
      ghost.remove();
      onLand?.();
    },
  });

  tl.to(ghost, {
    duration: 0.35,
    scale: 1.05,
    ease: "power2.out",
    transformOrigin: "50% 50%",
  })
    .to(ghost, {
      duration: 0.75,
      x: deltaX,
      y: deltaY - Math.min(140, Math.abs(deltaY) * 0.25),
      scale: scale * 1.1,
      ease: "power2.in",
      transformOrigin: "50% 50%",
    })
    .to(
      ghost,
      {
        duration: 0.25,
        y: deltaY,
        scale,
        opacity: 0.2,
        ease: "power1.in",
      },
      ">-0.05",
    );
}

export function bumpCart(el: HTMLElement): void {
  gsap.fromTo(
    el,
    { scale: 1 },
    {
      keyframes: [
        { scale: 1.25, duration: 0.14, ease: "power2.out" },
        { scale: 0.92, duration: 0.12, ease: "power2.inOut" },
        { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.45)" },
      ],
    },
  );
}
