import { Button } from "@/components/ui/button"

export const SubmitButton: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
    return (
        <Button onClick={onSubmit} className="mt-4 w-full">
            Submit This Test
        </Button>
    )
}