import React, { useState, useEffect } from "react";
import noteService from "@/services/noteService";
// import StarFilled from "@/assets/start-filled";
// import Star from "@/assets/star";
// import EditIcon from "@/assets/EditIcon";
// import DeleteIcon from "@/assets/DeleteIcon";
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

  useEffect(() => {
    const userData = window?.localStorage?.getItem("loggedNoteappUser");
    if (userData) {
      const parsedUser: UserType = JSON.parse(userData);
      setUser(parsedUser);
      noteService
        .getAll(parsedUser.userId)
        .then((data: INote[]) => setNotes(data));
    }
  }, []);

  const fetchUserNotes = () => {
    if (user) {
      noteService.getAll(user.userId).then((data: INote[]) => setNotes(data));
    }
  };

  const addUserNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userData = window?.localStorage?.getItem("loggedNoteappUser");
    const user: UserType = userData ? JSON.parse(userData) : null;

    if (!user) return;

    const noteObj = {
      content: newNote,
      createdAt: new Date().toISOString(),
      important: false,
      user: user.userId,
    };

    if (newNote === "") {
      setErrorMessage("Note can't be empty");
      setTimeout(() => setErrorMessage(null), 5000);
    } else if (newNote.length < 6) {
      setInvalidNote("Note content can't be less than 5 characters");
      setTimeout(() => setInvalidNote(null), 5000);
    } else {
      try {
        const note: INote = await noteService.create(noteObj);
        setNotes((prev) => [...prev, note]);
        setNewNote("");
        setSuccessMessage(`Note : "${newNote}" successfully added`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (error) {
        console.log("error while adding note", error);
        setErrorMessage("Note creation failed!");
        setTimeout(() => setErrorMessage(null), 5000);
      }
    }
  };

  const handleNewNote = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewNote(event.target.value);
  };

  const notesToShow = showAll ? notes : notes.filter((note) => note.important);
  const toggleImportanceOf = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const changedNote = { ...note, important: !note.important };

    noteService
      .update(id, changedNote)
      .then((data: INote) =>
        setNotes((prev) => prev.map((note) => (note.id !== id ? note : data)))
      )
      .catch(() => {
        setErrorMessage("Failed to toggle the importance");
        setTimeout(() => setErrorMessage(null), 5000);
        setNotes((prev) => prev.filter((n) => n.id !== id));
      });
  };

  const handleDelete = (id: string) => {
    noteService
      .remove(id)
      .then(() => {
        fetchUserNotes();
        setSuccessMessage("Note is successfully deleted!");
        setTimeout(() => setSuccessMessage(null), 5000);
      })
      .catch(() => {
        setErrorMessage("Note was already deleted from the server");
        setTimeout(() => setErrorMessage(null), 5000);
      });
  };

  const handleEditClick = (note: INote) => {
    setEditModalOpen(true);
    setNoteToEdit(note);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditModalOpen(false);
    noteService.update(noteToEdit?.id, noteToEdit);
    fetchUserNotes();
  };

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
          {/* Left: Content */}
          <div className="flex items-center">
            <Checkbox id={note.id} />
            <Label className="pl-[8px]" htmlFor={note.id}>
              {note.content}
            </Label>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 text-muted-foreground">
            {/* <Logo
              size={16}
              className="cursor-pointer hover:text-primary"
              onClick={handleEditClick}
            /> */}
            <span
              onClick={() => {
                toggleImportance(note?.id);
              }}
            >
              {Logo}
            </span>
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
          Created: {new Date(note?.createdAt).toDateString()}
        </div>
      </div>
    );
  };

  const Notification: React.FC<{ message: string | null }> = ({ message }) =>
    message ? (
      <div className="error">
        <p>{message}</p>
      </div>
    ) : null;

  const Success: React.FC<{ message: string | null }> = ({ message }) =>
    message ? (
      <div className="success">
        <p>{message}</p>
      </div>
    ) : null;

  const Error: React.FC<{ message: string | null }> = ({ message }) =>
    message ? (
      <div className="warning">
        <p>{message}</p>
      </div>
    ) : null;

  return (
    <div className="mx-[16px] m-0 md:w-[60vw] md:mx-auto mb-[60px]">
      <h1 className="text-[54px]">Notes</h1>

      <Notification message={errorMessage} />
      <Success message={successMessage} />
      <Error message={invalidNote} />

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <Input
              value={noteToEdit?.content}
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

      <form className="flex gap-[8px]" onSubmit={addUserNote}>
        <Input value={newNote} onChange={handleNewNote} />
        <Button>save</Button>
      </form>

      <Button
        variant="secondary"
        className="my-[8px]"
        onClick={() => setShowAll(!showAll)}
      >
        show {showAll ? "important" : "All"}
      </Button>

      <ul className="flex flex-col gap-[8px]">
        {notesToShow.map((note) => (
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
            handleDelete={() => handleDelete(note.id)}
            handleEditClick={() => handleEditClick(note)}
          />
        ))}
      </ul>
    </div>
  );
};

export default Notes;
