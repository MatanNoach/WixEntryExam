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
  deleteLabel:(
    id:string,
    label:string
  ) =>Promise<string[]>
};


export const createApiClient = (): ApiClient => {

  return {
    /**
     * The function gets a sorted page of tickets from the server
     * @param page - The page to get
     * @param sortBy - The sorting type
     * @param asc - Positive if ascending order and negative otherwise
     * @param callback - An optional callback function
     * @returns - A Promise of Ticket array 
     */
    getTickets: (page: number, sortBy: string, asc: number, callback?: Function) => {
      // create the URL
      const request: string =
        APIRootPath + "?page=" + page + "&sortBy=" + sortBy + "&asc=" + asc;
      console.log(request);
      // Call the GET command and call the callback if exists
      var data: Promise<Ticket[]> = axios.get(request).then((res) => {
        if(callback){
          callback(res.data.dataSize,res.data.maxPage);
        }
        return res.data.data;
      });
      // return the data
      return data;
    },

    /**
     * The function deletes a label from the ticket
     * @param id - The ticket's id
     * @param label - The label to delete
     * @returns - A Promise of the new labels array
     */
    deleteLabel(id:string,label:string):Promise<string[]>{
      // Create the URL
      const request: string = APIRootPath + "/labels?id=" + id + "&label=" + label;
      console.log(request);
      // Call the DELETE command and return the labels
      var labels:Promise<string[]> = axios.delete(request).then((res)=>res.data);
      return labels;
    }
  };
};
