import React, { useState, useEffect } from "react";
import noteService from "@/services/noteService";
import { Button } from "@/components/ui/button";
import { INote } from "@/lib/types";
import StarFilled from "@/assets/start-filled";
import Star from "@/assets/star";
import EditIcon from "@/assets/EditIcon";
import DeleteIcon from "@/assets/DeleteIcon";
import { Separator } from "../ui/separator";
import Confirm from "../Confirm/Confirm";
import AddEditNoteModal, { NoteFormValues } from "./AddEditNoteModal";

interface UserType {
  userId: string;
  name?: string;
}
const NOTE_MODAL_TYPE = {
  CREATE: "CREATE",
  EDIT: "EDIT",
};

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<INote[]>([]);
  const [showAll, setShowAll] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [addEditModalOpen, setAddEditModalOpen] = useState<boolean>(false);
  const [noteToEdit, setNoteToEdit] = useState<NoteFormValues | null>(null);
  const [noteModalType, setNoteModalType] = useState<string>("CREATE");
  const [isConfirmOpen, setIsOpenConfirm] = useState<boolean>(false);
  const [noteToDelete, setNoteToDelete] = useState<string>("");

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

  // const addUserNote = async (noteData: NoteFormValues) => {
  //   if (!user) return;
  //   const noteObj = {
  //     user: user.userId,
  //     title: noteData.title,
  //     content: noteData.content,
  //     important: noteData.important,
  //   };

  //   try {
  //     let note: INote;
  //     if (noteModalType === NOTE_MODAL_TYPE.CREATE) {
  //       note = await noteService.create(noteObj);
  //     } else {
  //       await noteService.update(noteToEdit.id, noteToEdit);
  //     }
  //     setNotes((prev) => [...prev, note]);
  //     setSuccessMessage(`Note: "${noteData.title}" added`);
  //     setTimeout(() => setSuccessMessage(null), 5000);
  //     fetchUserNotes();
  //   } catch (error) {
  //     setErrorMessage("Note creation failed!");
  //     console.log("error", error);
  //     setTimeout(() => setErrorMessage(null), 5000);
  //   }
  // };

  const addUserNote = async (noteData: NoteFormValues) => {
    if (!user) return;

    const noteObj = {
      user: user.userId,
      title: noteData.title,
      content: noteData.content,
      important: noteData.important,
    };

    try {
      if (noteModalType === NOTE_MODAL_TYPE.CREATE) {
        const newNote = await noteService.create(noteObj);
        setNotes((prev) => [...prev, newNote]);
        setSuccessMessage(`Note: "${noteData.title}" added`);
      } else if (noteToEdit && "id" in noteToEdit) {
        const updatedNote = await noteService.update(noteToEdit.id, noteObj);
        setNotes((prev) =>
          prev.map((n) => (n.id === noteToEdit.id ? updatedNote : n))
        );
        setSuccessMessage(`Note: "${noteData.title}" updated`);
      }
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      setErrorMessage("Note operation failed!");
      console.log("error", error);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setNoteToEdit(null);
      fetchUserNotes();
    }
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
    fetchUserNotes();
  };

  const handleDelete = (id: string) => {
    if (!id) return;
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
    setAddEditModalOpen(true);
    setNoteModalType(NOTE_MODAL_TYPE.EDIT);
    setNoteToEdit(note);
  };

  // const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   if (!noteToEdit) return;
  //   setEditModalOpen(false);
  //   try {
  //     await noteService.update(noteToEdit.id, noteToEdit);
  //     fetchUserNotes();
  //   } catch {
  //     setErrorMessage("Update failed");
  //     setTimeout(() => setErrorMessage(null), 5000);
  //   }
  // };

  const notesToShow = showAll ? notes : notes.filter((n) => n.important);

  const renderNoteTimestamp = (createdAt: string, updatedAt: string) => {
    const created = new Date(createdAt);
    const updated = new Date(updatedAt);

    const isUpdated = created.getTime() !== updated.getTime();

    return (
      <div className="mt-2 text-xs text-muted-foreground self-end">
        {isUpdated
          ? `Updated: ${updated.toDateString()}`
          : `Created: ${created.toDateString()}`}
      </div>
    );
  };

  const Note: React.FC<{
    note: INote;
    toggleImportance: (id: string) => void;
    handleDelete: () => void;
    handleEditClick: () => void;
  }> = ({ note, toggleImportance, handleDelete, handleEditClick }) => {
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
                <button
                  onClick={() => toggleImportance(note.id)}
                  className="hover:text-yellow-300 cursor-pointer"
                >
                  {Logo}
                </button>
                <button
                  onClick={handleEditClick}
                  className="cursor-pointer text-muted-foreground hover:text-orange-300 transition-colors"
                  aria-label="Delete note"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={handleDelete}
                  className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
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
        {renderNoteTimestamp(note.createdAt, note.updatedAt)}
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
  const handleAddNoteCTA = () => {
    setNoteModalType(NOTE_MODAL_TYPE.CREATE);
    setAddEditModalOpen(true);
    setNoteToEdit(null);
  };
  return (
    <div className="mx-4 md:mx-auto md:w-[60vw] mb-16">
      <h1 className="text-[54px]">Notes</h1>

      <AlertBox type="error" message={errorMessage} />
      <AlertBox type="success" message={successMessage} />

      <AddEditNoteModal
        noteData={noteToEdit}
        addEditModalOpen={addEditModalOpen}
        setAddEditModalOpen={setAddEditModalOpen}
        handleNoteSubmit={addUserNote}
        noteModalType={noteModalType}
      />

      <Confirm
        isOpen={isConfirmOpen}
        handleClose={() => setIsOpenConfirm(false)}
        onConfirm={() => handleDelete(noteToDelete)}
        onCancel={() => setIsOpenConfirm(false)}
        title="Delete this note?"
        description="This note will be permanently removed. Are you sure?"
        confirmText="Delete"
        cancelText="Cancel"
      />
      <div className="flex gap-4 my-4">
        <Button variant="default" onClick={handleAddNoteCTA} type="button">
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
            handleDelete={() => {
              setNoteToDelete(note.id);
              setIsOpenConfirm(true);
            }}
            handleEditClick={() => handleEditClick(note)}
          />
        ))}
      </ul>
    </div>
  );
};

export default Notes;
