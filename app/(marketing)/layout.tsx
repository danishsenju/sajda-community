// Syne is now loaded globally in app/layout.tsx — no need to load it here.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh' }}>{children}</div>
}
