import express from "express";
import bodyParser = require("body-parser");
import { tempData } from "./temp-data";
import { serverAPIPort, APIPath, APIRootPath } from "@fed-exam/config";
import { Ticket } from "../client/src/api";
import e = require("express");

const fs = require("fs");

console.log("starting server", { serverAPIPort, APIPath });

const app = express();

const fileName: string = "data.json";

export const PAGE_SIZE = 20;
console.log("APIPath: ", APIPath);
console.log("APIRootPath: ", APIRootPath);

app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});
/**
 * The function sorts Tickets array inplace and returns the sorted Tickets
 * @param tickets - The tickets needs to be sorted
 * @param sortBy - The type of sorting.
 * NOTE - if sortBy is a type not implemented, the function returns the original given array
 * @param asc - positve if ascending order, and negative if descending
 * @returns - The sorted tickets
 */
function sortTickets(tickets: Ticket[], sortBy: string, asc: number) {
  if (sortBy == "email") {
    tickets.sort(function (a, b) {
      var aEmail = a.userEmail.toUpperCase();
      var bEmail = b.userEmail.toUpperCase();
      if (aEmail > bEmail) {
        return 1 * asc;
      } else if (aEmail < bEmail) {
        return -1 * asc;
      }
      return 0;
    });
  } else if (sortBy == "date") {
    tickets.sort((a, b) => (a.creationTime - b.creationTime) * asc);
  } else if (sortBy == "title") {
    tickets.sort(function (a, b) {
      var aTitle = a.title.toUpperCase();
      var bTitle = b.title.toUpperCase();
      if (aTitle > bTitle) {
        return 1 * asc;
      } else if (aTitle < bTitle) {
        return -1 * asc;
      }
      return 0;
    });
  }
  return tickets;
}
/**
 * The function gets a page of data from the DB, sorts it by user request and sends it to the client
 * The function also sends the max number of pages and the data size
 */
app.get(APIPath, (req, res) => {
  // extract the values from the URL
  const page: number = parseInt(req.query.page as string);
  const sortBy: string = req.query.sortBy as string;
  const asc: number = parseInt(req.query.asc as string);
  // get the data size and max number of pages
  const dataSize = tempData.length;
  const maxPage = Math.floor(tempData.length / PAGE_SIZE);
  // get the page slice from the data
  const paginatedData = tempData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  // sort the data
  const sortedData = sortTickets(paginatedData, sortBy, asc);
  // return a json file of the data, whole data size and max page number
  res.json({ data: sortedData, dataSize: dataSize, maxPage: maxPage });
});

/**
 * The function get a ticket id and label, and deletes the label from the ticket
 * The function sends the new label array or "undefined" if the label or ticket hasn't been found
 */
app.delete(APIPath + "/:id/labels/:label", (req, res) => {
  // extract id and label the data from the URL
  const id: string = req.params.id as string;
  const label: string = req.params.label as string;
  // find the ticket by id
  const t = tempData.find((t) => t.id === id);
  // if the ticket was found
  if (t) {
    // if the ticket has labels
    if (t.labels) {
      // search for the label, and delete it if found
      for (var i = 0; i < t.labels.length; i++) {
        if (t.labels[i] === label) {
          t.labels.splice(i, 1);
          // write the new data to the DB and send the label array to the client on success
          fs.writeFile(
            fileName,
            JSON.stringify(tempData, null, 2),
            (err: string) => {
              if (err) throw err;
              console.log("file has been updated!");
              res.send(t.labels);
            }
          );
          break;
        }
      }
    } else {
      console.log("Label array is empty!");
    }
  } else {
    console.log("Ticket was not found!");
  }
});
app.put(APIPath + "/:id/labels/:label", (req, res) => {
  // extract id and label the data from the URL
  const id: string = req.params.id as string;
  const label: string = req.params.label as string;
  // find the ticket by id
  const t = tempData.find((t) => t.id === id);
  if (t) {
    // if the ticket have an existing labels array
    if (t.labels) {
      t.labels.push(label);
    }else{ // create a new array with new label
      t.labels = [label]
    }
    // write the new data to the DB and send the label array to the client on success
    fs.writeFile(
      fileName,
      JSON.stringify(tempData, null, 2),
      (err: string) => {
        if (err) throw err;
        console.log("file has been updated!");
        res.send(t.labels);
      }
    );
  } else {
    console.log("Ticket was not found!");
  }
});
app.put(APIPath+"/:id/title/:title",(req,res)=>{
  // extract id and label the data from the URL
  const id: string = req.params.id as string;
  const title: string = req.params.title as string;
  // find the ticket by id
  const t = tempData.find((t) => t.id === id);
  if(t){
    t.title = title;
    // write the new data to the DB and send the title to the client on success
    fs.writeFile(
      fileName,
      JSON.stringify(tempData, null, 2),
      (err: string) => {
        if (err) throw err;
        console.log("file has been updated!");
        res.send(t.title);
      }
    );
  } else {
    console.log("Ticket was not found!");
  }
})
app.listen(serverAPIPort);
console.log("server running", serverAPIPort);
