import { Sheet } from "@silk-hq/components";
import { HomeIcon, CreditCardIcon, UserIcon, SettingsIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function TopNavMenu() {
  const [location, setLocation] = useLocation();
  const handleNav = (route: string) => setLocation(route);

  return (
    <Sheet.Root license="commercial">
      <Sheet.Trigger asChild>
        <button
          className="ml-2 bg-background border rounded-full p-2 shadow-md hover:bg-accent transition-colors"
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </button>
      </Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.View nativeEdgeSwipePrevention={true}>
          <Sheet.Backdrop themeColorDimming="auto" />
          <Sheet.Content className="rounded-t-3xl shadow-2xl p-0 overflow-hidden bg-white">
            <Sheet.BleedingBackground className="rounded-t-3xl bg-white" />
            <div className="py-6 px-4">
              <div className="mb-4 text-center">
                <span className="block text-lg font-semibold text-primary">Menú de navegación</span>
                <span className="block text-xs text-muted-foreground">Selecciona una sección</span>
              </div>
              <div className="flex justify-between gap-3">
                <div className="flex flex-col items-center flex-1">
                  <button className="flex items-center justify-center aspect-square w-[64px] rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors shadow-sm p-2" onClick={() => handleNav("/home")}> <HomeIcon className="h-7 w-7 text-primary" /> </button>
                  <span className="text-xs font-medium text-primary mt-2">Inicio</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <button className="flex items-center justify-center aspect-square w-[64px] rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors shadow-sm p-2" onClick={() => handleNav("/loans")}> <CreditCardIcon className="h-7 w-7 text-primary" /> </button>
                  <span className="text-xs font-medium text-primary mt-2">Préstamos</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <button className="flex items-center justify-center aspect-square w-[64px] rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors shadow-sm p-2" onClick={() => handleNav("/profile")}> <UserIcon className="h-7 w-7 text-primary" /> </button>
                  <span className="text-xs font-medium text-primary mt-2">Perfil</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <button className="flex items-center justify-center aspect-square w-[64px] rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors shadow-sm p-2" onClick={() => handleNav("/settings")}> <SettingsIcon className="h-7 w-7 text-primary" /> </button>
                  <span className="text-xs font-medium text-primary mt-2">Ajustes</span>
                </div>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
}
