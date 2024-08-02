import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GameOptions } from "@/types";

interface OptionsDialogProps {
    options: GameOptions;
    setOptions: (options: GameOptions) => void;
}

export const OptionsDialog: React.FC<OptionsDialogProps> = ({
    options, setOptions
}) => (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="ghost">Options</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogTitle>Game Options</DialogTitle>
        </DialogContent>
        <div className="flex items-center space-x-2">
            <Switch id="show-timer" 
                    checked={options.showTimer}
                    onCheckedChange={(checked) => setOptions({ ...options, showTimer: checked })}
            />
            <Label htmlFor="show-timer">Show Timer</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Switch id="allow-deselect"
                    checked={options.allowDeselect}
                    onCheckedChange={(checked) => setOptions({ ...options, allowDeselect: checked })}
            />
            <Label htmlFor="allow-deselect">Allow Card Deselection</Label>
        </div>
    </Dialog>
)