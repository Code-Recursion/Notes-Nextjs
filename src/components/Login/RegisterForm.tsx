import React, { useState } from "react";

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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleRegister({ username, name, password });
    setUsername("");
    setName("");
    setPassword("");
  };

  return (
    <div className="login-form">
      <h2>Register</h2>
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
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
        <button type="submit">Register</button>
      </form>
      <p className="toggle-form">
        Already have an account?{" "}
        <button type="button" onClick={toggleForm}>
          Login here
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
