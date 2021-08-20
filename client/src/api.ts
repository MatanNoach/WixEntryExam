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
    isAsc: number,
    callback?: Function
  ) => Promise<Ticket[]>,
};


export const createApiClient = (): ApiClient => {

  return {
    getTickets: (page: number, sortBy: string, asc: number, callback?: Function) => {
      const request: string =
        APIRootPath + "/?page=" + page + "&sortBy=" + sortBy + "&asc=" + asc;
      console.log(request);
      var data: Promise<Ticket[]> = axios.get(request).then((res) => {
        if(callback){
          callback(res.data.dataSize,res.data.maxPage);
        }
        return res.data.data;
      });
      return data;
    },    
  };
};
