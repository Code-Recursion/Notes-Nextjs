import React, { useEffect } from "react";
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
  title: z.string().min(5, "Note Title must be at least 5 characters"),
  content: z.string().min(5, "Note Content must be at least 5 characters"),
  important: z.boolean(),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

// Props Interface
interface AddEditNoteModalProps {
  noteData: NoteFormValues | null;
  addEditModalOpen: boolean;
  setAddEditModalOpen: (open: boolean) => void;
  handleNoteSubmit: (data: NoteFormValues) => void;
  noteModalType: string;
}

const AddEditNoteModal: React.FC<AddEditNoteModalProps> = ({
  noteData,
  addEditModalOpen,
  setAddEditModalOpen,
  handleNoteSubmit,
  noteModalType,
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

  useEffect(() => {
    if (noteModalType === "EDIT" && noteData) {
      reset(noteData);
    } else if (noteModalType === "CREATE") {
      reset({
        title: "",
        content: "",
        important: false,
      });
    }
  }, [noteData, noteModalType, reset]);

  return (
    <Dialog open={addEditModalOpen} onOpenChange={setAddEditModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {noteModalType === "CREATE" ? "Create" : "Update"} note
          </DialogTitle>
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
