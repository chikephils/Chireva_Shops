import axios from "axios";
import { server } from "../server";

const api = axios.create({
  baseURL: server,
});

export default api;
