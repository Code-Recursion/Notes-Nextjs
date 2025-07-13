import axios from "axios";

// This URL will be dynamically set depending on environment
const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notes`;

// const baseUrl = "/api/notes";
// const baseUrl = "https://notes-be-dw7g.onrender.com/api/notes";

let token = null;

const setToken = (newToken) => {
  token = `bearer ${newToken}`;
};

// const addNote = async (data) => {
//   const config = {
//     headers: { Authorization: token },
//   };

//   const response = await axios.post(baseUrl, data, config);
//   return response.data;
// };

const getAll = (userId) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.get(baseUrl + "/user/" + userId, config);
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
