import { Button } from "@/components/ui/button";
import { useTheme } from "@axi/core/theme";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      title="Toggle theme"
    >
      <div className="relative">
        <SunIcon className="h-[1.2rem] w-[1.2rem] transition-all dark:scale-0 scale-100 rotate-0 dark:-rotate-90" />
        <MoonIcon className="absolute top-0 left-0 h-[1.2rem] w-[1.2rem] transition-all dark:scale-100 scale-0 rotate-90 dark:rotate-0" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
