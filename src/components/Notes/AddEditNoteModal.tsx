import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Zod schema and inferred type
const noteSchema = z.object({
  title: z.string().min(1, "Note Title is required"),
  content: z.string().min(1, "Note Content is required"),
  important: z.boolean(),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

// Props Interface
interface AddEditNoteModalProps {
  addEditModalOpen: boolean;
  setAddEditModalOpen: (open: boolean) => void;
  handleNoteSubmit: (data: NoteFormValues) => void;
}

const AddEditNoteModal: React.FC<AddEditNoteModalProps> = ({
  addEditModalOpen,
  setAddEditModalOpen,
  handleNoteSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      important: false,
    },
  });

  return (
    <Dialog open={addEditModalOpen} onOpenChange={setAddEditModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add note</DialogTitle>
          <DialogDescription>
            Fill in the fields to create a new note.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            handleNoteSubmit(data);
            reset(); // Reset after submit
            setAddEditModalOpen(false); // Close modal
          })}
          className="flex flex-col gap-4"
        >
          <Input {...register("title")} placeholder="Title" autoFocus />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}

          <Textarea {...register("content")} placeholder="Note content" />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content.message}</p>
          )}

          <div className="flex justify-between items-center">
            <Label htmlFor="important">Important</Label>
            <Switch
              checked={watch("important")}
              onCheckedChange={(val) => setValue("important", val)}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                reset();
                setAddEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditNoteModal;
