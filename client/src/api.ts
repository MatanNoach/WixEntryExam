import axios from "axios";
import { APIRootPath } from "@fed-exam/config";

export type Ticket = {
  id: string;
  title: string;
  content: string;
  creationTime: number;
  userEmail: string;
  labels?: string[];
};

export type ApiClient = {
  getTickets: (
    page: number,
    sortBy: string,
    isAsc: number
  ) => Promise<Ticket[]>;
};

export const createApiClient = (): ApiClient => {
  return {
    getTickets: (page: number, sortBy: string, asc: number) => {
      const request: string =
        APIRootPath + "/?page=" + page + "&sortBy=" + sortBy + "&asc=" + asc;
      console.log(request);
      var data: Promise<Ticket[]> = axios.get(request).then((res) => res.data);
      return data;
    },
  };
};
