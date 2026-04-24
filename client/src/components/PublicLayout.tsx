import PublicNav from "./PublicNav";
import PublicFooter from "./PublicFooter";

interface PublicLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function PublicLayout({ children, fullWidth }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main id="main-content" className="flex-1" role="main" aria-label="Main content">{children}</main>
      <PublicFooter />
    </div>
  );
}
