import { useEffect, useState } from "react";
import loginService from "../services/loginService";
import userService from "../services/userService";
import Notes from "@/components/Notes/Notes";
import RegisterForm from "@/components/Login/RegisterForm";
import LoginForm from "@/components/Login/LoginForm";
import Navbar from "@/components/Navbar";
import { Credentials, UserType } from "@/lib/types";
import { toast, Toaster } from "sonner";

export default function Home() {
  const [user, setUser] = useState<UserType | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedNoteappUser");
    if (loggedUserJSON) {
      const user: UserType = JSON.parse(loggedUserJSON);
      setUser(user);
    }
  }, []);

  const handleLogin = async (credentials: Credentials) => {
    setIsAuthLoading(true);
    try {
      const user: UserType = await loginService.login(credentials);
      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));
      setUser(user);
      toast.success(`Logged in successfully!`);
    } catch (exception) {
      console.log("erro while logging in", exception);
      toast.error(`${exception?.response?.data?.error}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (credentials: Credentials) => {
    setIsAuthLoading(true);
    try {
      await userService.register(credentials);
      const user: UserType = await loginService.login({
        username: credentials.username,
        password: credentials.password,
      });
      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));
      setUser(user);
      toast.success(`Registered successfully!`);
    } catch (exception) {
      console.log("exception.response?.data?.error", exception);
      toast.error(`Error while logging in!, ${exception?.message}`);
    } finally {
      setIsAuthLoading(true);
    }
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <>
      <Navbar user={user} />
      <Toaster closeButton duration={3000} expand />
      {user === null ? (
        <div className="p-[16px] md:p-0">
          {showLogin ? (
            <LoginForm handleLogin={handleLogin} toggleForm={toggleForm} />
          ) : (
            <RegisterForm
              handleRegister={handleRegister}
              toggleForm={toggleForm}
            />
          )}
        </div>
      ) : (
        <Notes />
      )}
    </>
  );
}
