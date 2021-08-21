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
    search: string,
    page: number,
    sortBy: string,
    isAsc: number,
    callback?: Function
  ) => Promise<Ticket[]>,
  deleteLabel:(
    id:string,
    label:string
  ) =>Promise<string[]>,
  addLabel:(
    id:string,
    label:string
  )=>Promise<string[]>,
  changeTitle:(
    id:string,
    newTitle:string
  )=>Promise<string>,
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
    getTickets: (search:string,page: number, sortBy: string, asc: number, callback?: Function) => {
      // create the URI
      const request: string =
        APIRootPath +"?search="+search+ "&page=" + page + "&sortBy=" + sortBy + "&asc=" + asc;
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
    deleteLabel:(id:string,label:string):Promise<string[]>=>{
      // Create the URI
      const request: string =APIRootPath + "/"+id+"/labels/"+ label;
      console.log(request);
      // Call the DELETE command and return the labels
      var labels:Promise<string[]> = axios.delete(request).then((res)=>res.data);
      return labels;
    },
    /**
     * The function adds a label to a ticket
     * @param id - The ticket's id
     * @param label - The label to add
     * @returns - A promise of the new labels array
     */
    addLabel:(id:string,label:string):Promise<string[]>=>{
      // Create the URI
      const request: string =APIRootPath + "/"+id+"/labels/"+ label;
      console.log(request);
      // Call the POST command and return the labels
      var labels:Promise<string[]> = axios.put(request).then((res)=>res.data);
      return labels;
    },
    /**
     * The function changes a ticket's title
     * @param id - The ticket's id
     * @param newTitle - The new title
     * @returns - A promise of the new title
     */
    changeTitle:(id:string,newTitle:string):Promise<string>=>{
      // Create the URI
      const request: string = APIRootPath + "/"+id+"/title/"+ newTitle;
      console.log(request);
      // Call the POST command and return the title
      var title:Promise<string> = axios.put(request).then((res)=>res.data);
      return title;
    }
  };
};
