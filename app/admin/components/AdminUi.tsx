import Link from 'next/link';
import type { ReactNode } from 'react';

const BRAND = '#2596be';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm mt-1.5 text-gray-500 max-w-2xl">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  href,
  onClick,
  children,
  type = 'button',
  disabled,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const cls =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white';
  const style = {
    background: 'linear-gradient(135deg, #2596be 0%, #1e7ea1 100%)',
    boxShadow: '0 2px 12px rgba(37,150,190,0.35)',
    color: '#ffffff',
  };

  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} style={style}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  onClick,
  children,
  type = 'button',
  disabled,
}: {
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
      style={{ border: '1px solid #e5e7eb' }}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
  padding = 'p-5',
}: {
  children: ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div
      className={`rounded-xl ${padding} ${className}`}
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'draft';
}) {
  const styles = {
    default: { bg: 'rgba(37,150,190,0.12)', color: '#1e7ea1' },
    success: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    warning: { bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
    draft: { bg: 'rgba(100,116,139,0.12)', color: '#64748b' },
  }[variant];

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide"
      style={{ background: styles.bg, color: styles.color }}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(37,150,190,0.1)', border: '1px solid rgba(37,150,190,0.2)' }}
      >
        <svg className="w-7 h-7" style={{ color: BRAND }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>
      {action}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:ring-2 bg-white"
      style={{ border: '1px solid #e5e7eb', '--tw-ring-color': 'rgba(37,150,190,0.3)' } as React.CSSProperties}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none resize-y transition-colors focus:ring-2 bg-white"
      style={{ border: '1px solid #e5e7eb' }}
    />
  );
}

export function AdminSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: BRAND, borderTopColor: 'transparent' }}
      />
    </div>
  );
}
