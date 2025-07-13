import React, { useState, useEffect } from "react";
import noteService from "@/services/noteService";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { INote } from "@/lib/types";
import { Textarea } from "../ui/textarea";
import { FormField } from "../ui/form";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// import Star from "@/assets/star"
import StarFilled from "@/assets/start-filled";
import Star from "@/assets/star";
import EditIcon from "@/assets/EditIcon";
import DeleteIcon from "@/assets/DeleteIcon";
import { Divide } from "lucide-react";
import { Separator } from "../ui/separator";

interface UserType {
  userId: string;
  name?: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<INote[]>([]);
  const [newNote, setNewNote] = useState<string>("");
  const [showAll, setShowAll] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [invalidNote, setInvalidNote] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [noteToEdit, setNoteToEdit] = useState<INote | null>(null);
  const [isImportant, setIsImportant] = useState<boolean>(false);

  // Set user on initial mount
  useEffect(() => {
    const userData = window?.localStorage?.getItem("loggedNoteappUser");
    if (userData) {
      const parsedUser: UserType = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

  // Fetch notes once user is available
  useEffect(() => {
    if (user) {
      noteService.getAll(user.userId).then((data: INote[]) => setNotes(data));
    }
  }, [user]);

  const fetchUserNotes = () => {
    if (user) {
      noteService.getAll(user.userId).then((data: INote[]) => setNotes(data));
    }
  };

  const addUserNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    if (newNote.trim() === "") {
      setErrorMessage("Note can't be empty");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    if (newNote.length < 6) {
      setInvalidNote("Note content can't be less than 5 characters");
      setTimeout(() => setInvalidNote(null), 5000);
      return;
    }

    const noteObj = {
      content: newNote,
      createdAt: new Date().toISOString(),
      important: false,
      user: user.userId,
    };

    try {
      const note: INote = await noteService.create(noteObj);
      setNotes((prev) => [...prev, note]);
      setNewNote("");
      setSuccessMessage(`Note: "${newNote}" added`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      setErrorMessage("Note creation failed!");
      console.log("error", error);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleNewNote = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewNote(event.target.value);
  };

  const toggleImportanceOf = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const changedNote = { ...note, important: !note.important };

    noteService
      .update(id, changedNote)
      .then((updated) =>
        setNotes((prev) => prev.map((n) => (n.id !== id ? n : updated)))
      )
      .catch(() => {
        setErrorMessage("Failed to toggle importance");
        setTimeout(() => setErrorMessage(null), 5000);
      });
  };

  const handleDelete = (id: string) => {
    noteService
      .remove(id)
      .then(() => {
        fetchUserNotes();
        setSuccessMessage("Note deleted!");
        setTimeout(() => setSuccessMessage(null), 5000);
      })
      .catch(() => {
        setErrorMessage("Note was already deleted from server");
        setTimeout(() => setErrorMessage(null), 5000);
      });
  };

  const handleEditClick = (note: INote) => {
    setEditModalOpen(true);
    setNoteToEdit(note);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteToEdit) return;
    setEditModalOpen(false);
    try {
      await noteService.update(noteToEdit.id, noteToEdit);
      fetchUserNotes();
    } catch {
      setErrorMessage("Update failed");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const notesToShow = showAll ? notes : notes.filter((n) => n.important);

  const Note: React.FC<{
    note: INote;
    toggleImportance: (id: string) => void;
    handleDelete: () => void;
    handleEditClick: () => void;
  }> = ({ note, toggleImportance, handleDelete, handleEditClick }) => {
    // const Logo = note.important ? <StarIcon fill="#d3d3d3" /> : <StarIcon />;
    const Logo = note.important ? <StarFilled /> : <Star />;
    return (
      <div className="flex flex-col bg-card text-card-foreground border border-border rounded-md p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {note.title}
              </h4>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span onClick={() => toggleImportance(note.id)}>{Logo}</span>
                <button
                  onClick={handleEditClick}
                  className="text-muted-foreground hover:text-orange-300 transition-colors"
                  aria-label="Delete note"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete note"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
            <Separator className="w-full my-2" />
            <div className="flex items-center">{note.content}</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground self-end">
          Created: {new Date(note.createdAt).toDateString()}
        </div>
      </div>
    );
  };

  const AlertBox: React.FC<{
    type: "error" | "success" | "warning";
    message: string | null;
  }> = ({ type, message }) =>
    message ? (
      <div className={`${type}`}>
        <p>{message}</p>
      </div>
    ) : null;

  const noteSchema = z.object({
    content: z.string().min(5, "Note must be at least 5 characters"),
    title: z.string().min(1, "Title is required"),
    important: z.boolean(),
  });

  type NoteFormValues = z.infer<typeof noteSchema>;

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
      content: "",
      title: "",
      important: false,
    },
  });

  return (
    <div className="mx-4 md:mx-auto md:w-[60vw] mb-16">
      <h1 className="text-[54px]">Notes</h1>
      <AlertBox type="error" message={errorMessage} />
      <AlertBox type="success" message={successMessage} />
      <AlertBox type="warning" message={invalidNote} />
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <Input
              value={noteToEdit?.content || ""}
              onChange={(e) =>
                setNoteToEdit((prev) =>
                  prev ? { ...prev, content: e.target.value } : null
                )
              }
              autoFocus
            />
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add note</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(async (data) => {
              if (!user) return;
              try {
                await noteService.create({
                  ...data,
                  user: user.userId,
                  createdAt: new Date().toISOString(),
                });
                fetchUserNotes();
                reset(); // reset form after submit
                setAddModalOpen(false);
                setSuccessMessage("Note added successfully");
              } catch (err) {
                setErrorMessage("Failed to add note");
              }
            })}
            className="flex flex-col gap-4"
          >
            <Input {...register("title")} placeholder="title" autoFocus />
            {errors.content && (
              <p className="text-sm text-red-500">{errors?.title?.message}</p>
            )}
            <Textarea
              {...register("content")}
              placeholder="Note content"
              autoFocus
            />
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
                  setAddModalOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
          {/* <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <Input
              value={noteToEdit?.content || ""}
              onChange={(e) =>
                setNoteToEdit((prev) =>
                  prev ? { ...prev, content: e.target.value } : null
                )
              }
              autoFocus
            />
            <Textarea
              cols={5}
              minLength={5}
              name="content"
              placeholder="Content"
              required
              className="w-full"
              rows={4}
              value={noteToEdit?.content || ""}
              onChange={(e) =>
                setNoteToEdit((prev) =>
                  prev ? { ...prev, content: e.target.value } : null
                )
              }
              autoFocus
            />
            <div className="flex justify-between">
              <Label>Important </Label>
              <Switch
                checked={isImportant}
                onCheckedChange={() => {
                  setIsImportant((prev) => !prev);
                }}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button>Save</Button>
            </DialogFooter>
          </form> */}
        </DialogContent>
      </Dialog>

      <form className="flex gap-2" onSubmit={addUserNote}>
        <Input value={newNote} onChange={handleNewNote} />
        <Button>save</Button>
      </form>
      <div className="flex gap-4 my-4">
        <Button
          variant="default"
          onClick={() => setAddModalOpen(true)}
          type="button"
        >
          Add Note
        </Button>
        <Button variant="secondary" onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </Button>
      </div>

      <ul className="flex flex-col gap-2 mt-4">
        {notesToShow.map((note) => (
          <Note
            key={note.id}
            note={note}
            toggleImportance={toggleImportanceOf}
            handleDelete={() => handleDelete(note.id)}
            handleEditClick={() => handleEditClick(note)}
          />
        ))}
      </ul>
    </div>
  );
};

export default Notes;
