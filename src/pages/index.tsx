import { useEffect, useState } from "react";
import loginService from "../services/loginService";
import userService from "../services/userService";
import RegisterForm from "@/components/Login/RegisterForm";
import LoginForm from "@/components/Login/LoginForm";
import { Credentials, UserType } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/router";

export default function Home() {
  const [user, setUser] = useState<UserType | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (credentials: Credentials) => {
    setIsAuthLoading(true);
    try {
      const user: UserType = await loginService.login(credentials);
      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));
      setUser(user);
      toast.success(`Logged in successfully!`);
      router.push("/notes");
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
        name: credentials.name,
      });
      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));
      setUser(user);
      toast.success(`Registered successfully!`);
      router.push("/notes");
    } catch (exception) {
      console.log("exception.response?.data?.error", exception);
      toast.error(
        `Error while logging in!, ${exception?.response?.data?.error}`
      );
    } finally {
      setIsAuthLoading(true);
    }
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <>
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
    </>
  );
}
