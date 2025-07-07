import axios from "axios";
const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002/api/notes";

const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials);
  return response.data;
};

const loginService = {
  login,
};
export default loginService;
