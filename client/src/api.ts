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
  getTickets: (sortBy: string,isAsc:number) => Promise<Ticket[]>;
};
function sortTickets(data: Ticket[], sortBy: string,isAsc:number) {
  if (sortBy == "email") {
    data.sort(function (a, b) {
      var aEmail = a.userEmail.toUpperCase();
      var bEmail = b.userEmail.toUpperCase();
      if (aEmail > bEmail) {
        return 1*isAsc;
      } else if (aEmail < bEmail) {
        return -1*isAsc;
      }
      return 0;
    });
  } else if (sortBy == "date") {
    data.sort((a, b) => (a.creationTime - b.creationTime)*isAsc);
  } else if (sortBy == "title") {
    data.sort(function (a, b) {
      var aTitle = a.title.toUpperCase();
      var bTitle = b.title.toUpperCase();
      if (aTitle > bTitle) {
        return 1*isAsc;
      } else if (aTitle < bTitle) {
        return -1*isAsc;
      }
      return 0;
    });
  }
  return data;
}
export const createApiClient = (): ApiClient => {
  return {
    getTickets: (sortBy: string,isAsc:number) => {
      var data: Promise<Ticket[]> = axios
        .get(APIRootPath)
        .then((res) => sortTickets(res.data, sortBy,isAsc));
      return data;
    },
  };
};
