import axios from "axios";
const baseUrl = `${process.env.NEXT_PUBLIC_API_VERCEL_BE_BASE_URL}/api/login`;

const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials);
  return response.data;
};

const loginService = {
  login,
};
export default loginService;
