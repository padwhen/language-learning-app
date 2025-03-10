import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface EditableFieldProps {
  label: string;
  value: string;
  field: "name" | "username";
  isEditing: boolean;
  onEditClick: (field: "name" | "username") => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

const EditableField = ({ label, value, field, isEditing, onEditClick, onChange }: EditableFieldProps) => {
  return (
    <div>
      <h1 className="ml-4 font-bold">{label}</h1>
      <span className="flex flex-col md:flex-row justify-between mx-2 md:mx-4 my-2 items-center">
        {isEditing ? (
          <Input
            type="text"
            value={value}
            onChange={(event) => onChange(event, field)}
            className="w-3/4 focus:outline-blue-500 border border-gray-300 rounded-md px-2 py-1 text-lg"
          />
        ) : (
          <h1 className="md:text-xl text-lg text-center mb-2 md:mb-0">{value}</h1>
        )}
        <Button onClick={() => onEditClick(field)}>{isEditing ? "Save" : "Edit"}</Button>
      </span>
    </div>
  );
};

export default EditableField;