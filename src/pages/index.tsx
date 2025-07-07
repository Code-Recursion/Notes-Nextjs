import { useEffect, useState } from "react";
import loginService from "../services/loginService";
import userService from "../services/userService";
import Notes from "@/components/Notes/Notes";
import RegisterForm from "@/components/Login/RegisterForm";
import LoginForm from "@/components/Login/LoginForm";
import Navbar from "@/components/Navbar";
import { Credentials, UserType } from "@/lib/types";

export default function Home() {
  const [user, setUser] = useState<UserType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedNoteappUser");
    if (loggedUserJSON) {
      const user: UserType = JSON.parse(loggedUserJSON);
      setUser(user);
    }
  }, []);

  const handleLogin = async (credentials: Credentials) => {
    try {
      const user: UserType = await loginService.login(credentials);
      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));
      setUser(user);
    } catch (exception) {
      console.log("erro while logging in", exception);
      setErrorMessage("Wrong credentials");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const handleRegister = async (credentials: Credentials) => {
    try {
      await userService.register(credentials);
      const user: UserType = await loginService.login({
        username: credentials.username,
        password: credentials.password,
      });
      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));
      setUser(user);
    } catch (exception) {
      setErrorMessage("Registration failed");
      console.log("exception.response?.data?.error", exception);
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
    setErrorMessage(null);
  };

  return (
    <>
      <Navbar user={user} />
      {errorMessage && <div>{errorMessage}</div>}
      {user === null ? (
        showLogin ? (
          <LoginForm handleLogin={handleLogin} toggleForm={toggleForm} />
        ) : (
          <RegisterForm
            handleRegister={handleRegister}
            toggleForm={toggleForm}
          />
        )
      ) : (
        <Notes />
      )}
    </>
  );
}
