// apps/qilauncher/components/layout/MobileHeader.tsx
interface MobileHeaderProps {
  onToggleMenu: () => void;
}

export function MobileHeader({ onToggleMenu }: MobileHeaderProps) {
  return (
    <header className="md:hidden flex items-center justify-between p-4 glass border-b border-white/5">
      <button onClick={onToggleMenu} className="p-2 text-white">
        <span className="text-xl">☰</span>
      </button>
      <h1 className="text-lg font-semibold text-white">QiLauncher</h1>
      <div className="w-8"></div>
    </header>
  );
}

