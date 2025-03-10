import { Button } from "../ui/button";

interface UpdateButtonProps {
  onClick: () => void;
}

const UpdateButton = ({ onClick }: UpdateButtonProps) => (
  <Button size="lg" className="text-lg" onClick={onClick}>
    Update
  </Button>
);

export default UpdateButton;