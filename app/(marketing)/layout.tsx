// Landing page layout — no app navbar, no splash screen, completely standalone.
// This is intentionally minimal so the marketing site feels like a separate product.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
