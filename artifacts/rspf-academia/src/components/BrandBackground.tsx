import srmaLogo from "@assets/IMG-20260806-WA0015_1787445073917.jpg";

export const SRMA_LOGO = srmaLogo;

export default function BrandBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      <img
        src={SRMA_LOGO}
        alt=""
        className="absolute left-1/2 top-1/2 h-[min(76vw,920px)] w-[min(76vw,920px)] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover opacity-[0.035] blur-[0.2px]"
      />
    </div>
  );
}