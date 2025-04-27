import { Loader2 } from "lucide-react";

export default function ProcessingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in-50 duration-300">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        <h2 className="text-xl font-bold text-primary drop-shadow-md">{message || "Estamos procesando tu INE"}</h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Esto puede tardar unos segundos.<br />Por favor, no cierres la aplicación ni cambies de pantalla.
        </p>
      </div>
    </div>
  );
}
