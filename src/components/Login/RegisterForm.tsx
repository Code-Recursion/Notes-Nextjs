import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EyeSlashIcon from "@/assets/EyeSlashIcon";
import EyeIcon from "@/assets/EyeIcon";

type RegisterFormProps = {
  handleRegister: (credentials: {
    username: string;
    name: string;
    password: string;
  }) => void;
  toggleForm: () => void;
};

const RegisterForm: React.FC<RegisterFormProps> = ({
  handleRegister,
  toggleForm,
}) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleRegister({ username, name, password });
    setUsername("");
    setName("");
    setPassword("");
    setRepeatPassword("");
  };

  return (
    <div className="grid place-items-center [height:calc(100vh-200px)] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-[8px] top-[4px]"
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Repeat Password</Label>
              <div className="relative">
                <Input
                  id="repeat-password"
                  type={showPassword ? "text" : "password"}
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  required
                />
                <div
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-[8px] top-[4px]"
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </div>
              </div>
            </div>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full">
                Register
              </Button>
              <CardAction className="mx-auto">
                <Button variant="link" onClick={toggleForm}>
                  Already have an account? Login
                </Button>
              </CardAction>
              {/* <Button variant="outline" className="w-full">
            Register with Google
          </Button> */}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
