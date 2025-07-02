import React, { useState } from "react";

type LoginFormProps = {
  handleLogin: (credentials: { username: string; password: string }) => void;
  toggleForm: () => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ handleLogin, toggleForm }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleLogin({ username, password });
    setUsername("");
    setPassword("");
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p className="toggle-form">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={toggleForm}>
          Register here
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
