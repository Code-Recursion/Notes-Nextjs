import Notes from "@/components/Notes/Notes";
import { UserType } from "@/lib/types";
import React, { useEffect, useState } from "react";

const NotesPage = () => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedUserJSON = localStorage.getItem("loggedNoteappUser");
      if (loggedUserJSON) {
    const user: UserType = JSON.parse(loggedUserJSON);
        setUser(user);
      } else {
        console.log("Not logged in, redirecting to /");
        window.location.href = "/";
      }
    }
  }, []);

  if (!user) return null; // Don't render until we know

  return (
    <div>
      <Notes />
    </div>
  );
};

export default NotesPage;
