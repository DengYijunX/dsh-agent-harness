import type { CSSProperties } from "react";

type BrandProps = { compact?: boolean; className?: string };

export function BrandMark({ compact = false, className = "" }: BrandProps) {
  return <svg className={`brand-mark ${compact ? "brand-mark-compact" : ""} ${className}`} viewBox="0 0 48 48" aria-hidden="true"><path className="brand-frame" d="M9 8h30v32H9z"/><path className="brand-route" d="M17 16v16M31 16v16M17 24h14"/><circle className="brand-node" cx="24" cy="24" r="3" /></svg>;
}

export function BrandLogo({ compact = false, className = "" }: BrandProps) {
  const style = { "--brand-logo-width": compact ? "28px" : "132px" } as CSSProperties;
  return <span className={`brand-lockup ${compact ? "brand-lockup-compact" : ""} ${className}`} style={style}><BrandMark compact={compact} /><b>Harness</b></span>;
}
