import axios from "axios";

// This URL will be dynamically set depending on environm
const baseUrl = `${process.env.NEXT_PUBLIC_API_VERCEL_BE_BASE_URL}/api/notes`;

let token = null;

const setToken = (newToken) => {
  token = `bearer ${newToken}`;
};

const getAll = (userId, sortBy) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.get(
    `${baseUrl}/user/${userId}?sortBy=${sortBy}`,
    config
  );
  return request.then((res) => res.data);
};

const create = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.post(baseUrl, newObject, config);
  return response.data;
};

const update = (id, newObject) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.put(`${baseUrl}/${id}`, newObject, config);
  return request.then((res) => res.data);
};

const remove = (id) => {
  const config = {
    headers: { Authorization: token },
  };

  const request = axios.delete(`${baseUrl}/${id}`, config);
  return request.then((res) => res.data);
};

const noteService = {
  getAll,
  create,
  update,
  remove,
  setToken,
};

export default noteService;
