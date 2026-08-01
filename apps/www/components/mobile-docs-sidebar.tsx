import { DocsSidebar } from "@/components/docs-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function MobileDocsSidebar() {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    console.log("open", open);

    setOpen(true);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={handleClick}
        >
          <DotsThreeIcon className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Documentation</SheetTitle>
        </SheetHeader>
        <div onClick={() => setOpen(false)}>
          <DocsSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}
