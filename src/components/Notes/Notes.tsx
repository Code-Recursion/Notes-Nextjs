import React, { useState, useEffect } from "react";
import noteService from "@/services/noteService";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Pencil, StarIcon, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { INote } from "@/lib/types";

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
  const [noteToEdit, setNoteToEdit] = useState<INote | null>(null);

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
    const Logo = note.important ? <StarIcon fill="#d3d3d3" /> : <StarIcon />;
    return (
      <div className="flex flex-col bg-card text-card-foreground border border-border rounded-md p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center">
            <Checkbox id={note.id} />
            <Label className="pl-2" htmlFor={note.id}>
              {note.content}
            </Label>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span onClick={() => toggleImportance(note.id)}>{Logo}</span>
            <Pencil
              size={16}
              className="cursor-pointer hover:text-primary"
              onClick={handleEditClick}
            />
            <Trash2
              size={16}
              className="cursor-pointer hover:text-destructive"
              onClick={handleDelete}
            />
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

      <form className="flex gap-2" onSubmit={addUserNote}>
        <Input value={newNote} onChange={handleNewNote} />
        <Button>save</Button>
      </form>

      <Button
        variant="secondary"
        className="my-2"
        onClick={() => setShowAll(!showAll)}
      >
        show {showAll ? "important" : "all"}
      </Button>

      <ul className="flex flex-col gap-2">
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
