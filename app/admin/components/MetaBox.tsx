'use client';

import { useState, type ReactNode } from 'react';

export function MetaBox({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{ background: '#fff', border: '1px solid #c3c4c7', boxShadow: '0 1px 1px rgba(0,0,0,0.04)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
        style={{ background: '#f6f7f7', borderBottom: open ? '1px solid #c3c4c7' : 'none' }}
      >
        <span className="text-[13px] font-semibold text-[#1d2327]">{title}</span>
        <span className="text-[#646970] text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-3 text-[13px] text-[#1d2327]">{children}</div>}
    </div>
  );
}
