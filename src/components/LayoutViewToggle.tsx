import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ILAYOUT_VIEW_TYPE } from "@/types/note";
import { LayoutList, LayoutGrid, LayoutDashboard } from "lucide-react";

export function LayoutViewToggle({
  layoutView,
  setLayoutView,
}: {
  layoutView: string;
  setLayoutView: (val: ILAYOUT_VIEW_TYPE) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <ToggleGroup
        type="single"
        value={layoutView}
        onValueChange={(val) => val && setLayoutView(val as ILAYOUT_VIEW_TYPE)}
        className="border rounded-lg"
      >
        <ToggleGroupItem value="list" aria-label="List View">
          <LayoutList className="h-5 w-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="grid" aria-label="Grid View">
          <LayoutGrid className="h-5 w-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="bento" aria-label="Bento View">
          <LayoutDashboard className="h-5 w-5" />
        </ToggleGroupItem>
      </ToggleGroup>

      <span className="text-sm text-muted-foreground">
        {layoutView.charAt(0).toUpperCase() + layoutView.slice(1)} view
      </span>
    </div>
  );
}
