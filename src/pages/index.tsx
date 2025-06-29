import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import loginService from "../services/loginService";
import userService from "../services/userService";
import Notes from "@/components/Notes/Notes";
import RegisterForm from "@/components/Login/RegisterForm";
import LoginForm from "@/components/Login/LoginForm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedNoteappUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      // login.setToken(user.token);
    }
  }, []);
  console.log("userx", user);

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials);
      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));
      // noteService.setToken(user.token);
      setUser(user);
    } catch (exception) {
      setErrorMessage("Wrong credentials");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
    {
      user === null ? (
        showLogin ? (
          <LoginForm handleLogin={handleLogin} toggleForm={toggleForm} />
        ) : (
          <RegisterForm
            handleRegister={handleRegister}
            toggleForm={toggleForm}
          />
        )
      ) : (
        <div>
          <div className="user-info">
            <p>{user.name} logged in</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <Note />
        </div>
      );
    }
  };

  const handleRegister = async (credentials) => {
    try {
      await userService.register(credentials);
      const user = await loginService.login({
        username: credentials.username,
        password: credentials.password,
      });
      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));
      // noteService.setToken(user.token);
      setUser(user);
    } catch (exception) {
      setErrorMessage(exception.response?.data?.error || "Registration failed");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("loggedNoteappUser");
    setUser(null);
    // noteService.setToken(null);
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
    setErrorMessage(null);
  };

  return (
    <div className="bg-white text-black">
      <div className="">Hello World</div>
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
        <div>
          <div className="user-info">
            <p>{user.name} logged in</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <Notes />
        </div>
      )}
    </div>
  );
}
