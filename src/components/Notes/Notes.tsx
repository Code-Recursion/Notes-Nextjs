import React, { useState, useEffect, useCallback } from "react";
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
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "../ui/input";
import ClearIcon from "@/assets/ClearIcon";
interface UserType {
  userId: string;
  name?: string;
}

interface LoadingStates {
  [noteId: string]: {
    toggleImportance?: boolean;
    delete?: boolean;
    edit?: boolean;
  };
}

const NOTE_MODAL_TYPE = {
  CREATE: "CREATE",
  EDIT: "EDIT",
};

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<INote[]>([]);
  const [showAll, setShowAll] = useState<boolean>(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [addEditModalOpen, setAddEditModalOpen] = useState<boolean>(false);
  const [noteToEdit, setNoteToEdit] = useState<
    (NoteFormValues & { id?: string }) | null
  >(null);
  const [noteModalType, setNoteModalType] = useState<string>("CREATE");
  const [isConfirmOpen, setIsOpenConfirm] = useState<boolean>(false);
  const [noteToDelete, setNoteToDelete] = useState<string>("");
  const [initialLoader, setInitialLoader] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [isCreatingNote, setIsCreatingNote] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [sortBy, setSortBy] = useState({
    value: "createdAt",
    text: "Created Date",
  });

  const handleDropDownChange = (val: string) => {
    console.log("selected", val);
    if (val === "createdAt") {
      setSortBy({ value: "createdAt", text: "Created Date" });
    } else if (val === "updatedAt") {
      setSortBy({ value: "updatedAt", text: "Last Updated" });
    }
  };

  const fetchUserNotes = useCallback(() => {
    console.log("");
    if (user) {
      noteService
        .getAll(user?.userId, sortBy.value)
        .then((data: INote[]) => {
          setNotes(data);
          setInitialLoader(false);
        })
        .catch(() => {
          toast.error("Failed to fetch notes.");
          setInitialLoader(false);
        });
    }
  }, [user, sortBy]);

  useEffect(() => {
    const userData = window?.localStorage?.getItem("loggedNoteappUser");
    if (userData) {
      const parsedUser: UserType = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

  // 2. Fetch notes once user is set
  useEffect(() => {
    if (user) {
      setInitialLoader(true);
      fetchUserNotes();
    }
  }, [user, fetchUserNotes]);

  const setNoteLoading = (
    noteId: string,
    operation: "toggleImportance" | "delete" | "edit",
    loading: boolean
  ) => {
    setLoadingStates((prev) => ({
      ...prev,
      [noteId]: {
        ...prev[noteId],
        [operation]: loading,
      },
    }));
  };

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
        setIsCreatingNote(true);
        const newNote = await noteService.create(noteObj);
        setNotes((prev) => [newNote, ...prev]);
        toast.success(`Note: "${noteData.title}" added`);
      } else if (noteToEdit && noteToEdit.id) {
        setNoteLoading(noteToEdit.id, "edit", true);
        const updatedNote = await noteService.update(noteToEdit.id, noteObj);
        setNotes((prev) =>
          prev.map((n) => (n.id === noteToEdit.id ? updatedNote : n))
        );
        toast.info(`Note: "${noteData.title}" updated`);
      }
      fetchUserNotes();
    } catch (error) {
      toast.error("Note operation failed!");
      console.log("error", error);
    } finally {
      if (noteToEdit && noteToEdit.id) {
        setNoteLoading(noteToEdit.id, "edit", false);
      }
      setIsCreatingNote(false);
      setNoteToEdit(null);
    }
  };

  console.log("notes", notes);
  const toggleImportanceOf = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const changedNote = { ...note, important: !note.important };
    setNoteLoading(id, "toggleImportance", true);
    try {
      await noteService.update(id, changedNote);
      fetchUserNotes();
    } catch {
      toast.error("Failed to toggle importance");
    } finally {
      setNoteLoading(id, "toggleImportance", false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;

    setNoteLoading(id, "delete", true);
    try {
      await noteService.remove(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note deleted!");
    } catch {
      toast.error("Note was already deleted from server!");
    } finally {
      setNoteLoading(id, "delete", false);
    }
  };

  const handleEditClick = (note: INote) => {
    setAddEditModalOpen(true);
    setNoteModalType(NOTE_MODAL_TYPE.EDIT);
    setNoteToEdit(note);
  };

  let notesToShow = showAll ? notes : notes.filter((n) => n.important);

  const normalizedSearch = searchText.trim().toLowerCase();

  function highlightText(text: string, search: string) {
    if (!search) return text;

    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  if (normalizedSearch) {
    notesToShow = notesToShow.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const content = item.content?.toLowerCase() || "";
      return (
        title.includes(normalizedSearch) || content.includes(normalizedSearch)
      );
    });
  }
  const renderNoteTimestamp = (createdAt: string, updatedAt: string) => {
    const created = new Date(createdAt);
    const updated = new Date(updatedAt);

    const isUpdated = created.getTime() !== updated.getTime();

    return (
      <div className="text-xs text-muted-foreground">
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
    isLoading: boolean;
  }> = ({
    note,
    toggleImportance,
    handleDelete,
    handleEditClick,
    isLoading,
  }) => {
    const Logo = note.important ? (
      <StarFilled className="size-4" />
    ) : (
      <Star className="size-4" />
    );
    const noteLoadingState = loadingStates[note.id] || {};

    if (isLoading) {
      return <NoteSkeletonDetailed />;
    }

    return (
      <div className="pb-[64px] relative flex flex-col bg-card text-card-foreground border border-border rounded-md p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <h4 className="scroll-m-20 text-xl font-medium tracking-tight">
                {highlightText(note.title, searchText)}
              </h4>
            </div>
            <Separator className="w-full my-2" />
            <div className="flex items-center text-sm clamp-10-lines overflow-hidden text-ellipsis">
              {highlightText(note.content, searchText)}
            </div>
          </div>
        </div>
        <div className="flex-col gap-[8px] items-end left-0 px-[12px] py-[8px] justify-between w-full flex absolute bottom-0 text-muted-foreground">
          <div className="flex gap-[8px]">
            <button
              onClick={() => toggleImportance(note.id)}
              className="hover:text-yellow-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={noteLoadingState.toggleImportance}
            >
              {noteLoadingState.toggleImportance ? (
                <div className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                Logo
              )}
            </button>
            <button
              onClick={handleEditClick}
              className="cursor-pointer text-muted-foreground hover:text-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Edit note"
              disabled={noteLoadingState.edit}
            >
              {noteLoadingState.edit ? (
                <div className="w-4 h-4 border-2 border-orange-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <EditIcon className="size-4" />
              )}
            </button>
            <button
              onClick={handleDelete}
              className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Delete note"
              disabled={noteLoadingState.delete}
            >
              {noteLoadingState.delete ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <DeleteIcon className="size-4" />
              )}
            </button>
          </div>
          {renderNoteTimestamp(note.createdAt, note.updatedAt)}
        </div>
      </div>
    );
  };

  const handleAddNoteCTA = () => {
    setNoteModalType(NOTE_MODAL_TYPE.CREATE);
    setAddEditModalOpen(true);
    setNoteToEdit(null);
  };

  const FilterNotes = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Sort By : {sortBy.text}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Sort Notes By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={sortBy.value}
            onValueChange={handleDropDownChange}
          >
            <DropdownMenuRadioItem value="createdAt">
              Created Date
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="updatedAt">
              Last Updated
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="mx-4 md:mx-auto md:w-[75vw] mb-16">
      <h1 className="text-[54px]">Notes</h1>

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
        isLoading={loadingStates[noteToDelete]?.delete || false}
      />
      <div className="relative">
        <Input
          placeholder="Start typing to search notes..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          className="pr-[24px]"
        />
        {searchText && (
          <span
            onClick={() => {
              setSearchText("");
            }}
            className="absolute cursor-pointer right-[8px] top-[6px]"
          >
            <ClearIcon />
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-4 my-4">
        <Button
          variant="default"
          onClick={handleAddNoteCTA}
          type="button"
          disabled={isCreatingNote}
        >
          {isCreatingNote ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </div>
          ) : (
            "Add Note"
          )}
        </Button>
        <Button variant="secondary" onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </Button>
        <FilterNotes />
      </div>

      {/* <ul className="grid lg:grid-cols-3 xl:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1 md:grid-cols-2 gap-[16px] mt-4"> */}
      <ul className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mt-4">
        {initialLoader &&
          [1, 2, 3, 4, 5, 6].map((item) => <NoteSkeleton key={item} />)}
        {isCreatingNote && <NoteSkeletonDetailed />}
        {!initialLoader &&
          notesToShow.map((note) => (
            <li className="break-inside-avoid" key={note.id}>
              <Note
                key={note.id}
                note={note}
                toggleImportance={toggleImportanceOf}
                handleDelete={() => {
                  setNoteToDelete(note.id);
                  setIsOpenConfirm(true);
                }}
                handleEditClick={() => handleEditClick(note)}
                isLoading={false}
              />
            </li>
          ))}
      </ul>
    </div>
  );
};

const NoteSkeleton = () => {
  return (
    <div className="flex items-center !p-[16px] space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
};
const NoteSkeletonDetailed = () => {
  return (
    <div className="flex items-center space-x-4 !p-[16px] border-solid border rounded-md">
      {/* <Skeleton className="h-12 w-12 rounded-full" /> */}
      <div className="flex justify-between gap-[16px] w-full">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="flex flex-col justify-between">
          <div className="flex gap-[8px]">
            <Skeleton className="h-4 w-[20px] rounded-full" />
            <Skeleton className="h-4 w-[20px] rounded-full" />
            <Skeleton className="h-4 w-[20px] rounded-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-[80px] mt-[8px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
