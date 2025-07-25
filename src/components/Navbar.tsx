"use client";

import * as React from "react";
import { NavigationMenuItem } from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ModeToggle } from "./ui/dark-mode-toggle";
import { UserType } from "@/lib/types";

type NavbarProps = {
  user: UserType | null;
};

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const handleLogout = () => {
    localStorage.removeItem("loggedNoteappUser");
    window.location.reload(); // or redirect to login
  };

  return (
    <div className="flex justify-between md:w-[60vw] md:mx-auto mx-[8px] py-[16px] items-center">
      {user ? (
        <NavigationMenuItem className="list-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarFallback>
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="mt-2">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </NavigationMenuItem>
      ) : (
        "Notes"
      )}
      <NavigationMenuItem className="list-none">
        <ModeToggle />
      </NavigationMenuItem>
    </div>
  );
};

export default Navbar;
