import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const ToolTip: React.FC<{trigger: JSX.Element; content: string; onClick?: () => void}> = ({ trigger, content, onClick }) => {
    return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
                <div onClick={onClick} className="inline-block p-1 rounded-full hover:bg-gray-200 hover:border-gray-200 border-transparent border-4">
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