import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ILAYOUT_VIEW_TYPE } from "@/types/note";
import { LayoutList, LayoutGrid, LayoutDashboard } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LayoutViewToggle({
  layoutView,
  setLayoutView,
}: {
  layoutView: string;
  setLayoutView: (val: ILAYOUT_VIEW_TYPE) => void;
}) {
  return (
    <div className="items-center hidden sm:flex gap-4">
      <ToggleGroup
        type="single"
        value={layoutView}
        onValueChange={(val) => val && setLayoutView(val as ILAYOUT_VIEW_TYPE)}
        className="border rounded-lg"
      >
        <ToggleGroupItem value="list" aria-label="List View">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <LayoutList className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>List View</TooltipContent>
          </Tooltip>
        </ToggleGroupItem>

        <ToggleGroupItem value="grid" aria-label="Grid View">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <LayoutGrid className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Grid View</TooltipContent>
          </Tooltip>
        </ToggleGroupItem>

        <ToggleGroupItem value="bento" aria-label="Bento View">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <LayoutDashboard className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Bento View</TooltipContent>
          </Tooltip>
        </ToggleGroupItem>
      </ToggleGroup>

      <span className="text-sm text-muted-foreground">
        {layoutView.charAt(0).toUpperCase() + layoutView.slice(1)} view
      </span>
    </div>
  );
}
