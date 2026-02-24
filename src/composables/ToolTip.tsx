import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import React from "react"

interface ToolTipProps {
  trigger: JSX.Element;
  content: string;
  onClick?: () => void;
}

export const ToolTip = React.forwardRef<HTMLDivElement, ToolTipProps>(
  ({ trigger, content, onClick }, ref) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              ref={ref}
              onClick={onClick} 
              className="inline-block p-1 rounded-full hover:bg-gray-200 hover:border-gray-200 border-transparent border-4"
            >
              {trigger}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
)

ToolTip.displayName = "ToolTip"