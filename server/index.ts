import express from "express";
import bodyParser = require("body-parser");
import { tempData } from "./temp-data";
import { serverAPIPort, APIPath, APIRootPath } from "@fed-exam/config";
import { Ticket } from "../client/src/api";

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
 * The type represents the search values given by the user
 * values:
 * search - The string to search in the text
 * bDate - Get tickets before this date
 * aDate - Get tickets after this date
 * from - Get tickets from this email
 * labels - Get tickets with these labels
 * 
 * example - before:31/08/2021 after:01/08/2021 from:matan.noach@gmail.com labels:corvid,Guidelines hello world
 * will create the following object: 
 * {search: "hello world", bDate:31/08/2021, aDate:01/08/2021, from:matan.noach@gmail.com, labels:['corvid','Guidelines'] }
 */
type SearchValues={
  search:string;
  bDate?:number;
  aDate?:number;
  from?:string;
  labels?:string[];
};
/**
 * The function parses a search line, parses it and returns the SearchValues objects represents it 
 * @param search - The search line
 * @returns - A SearchValues object
 */
function parseSearch(search:string):SearchValues{
  var searchValues:SearchValues = {search:""};
  // parse the line by " " to get the search options
  const options: string[] = search.split(" ");
  search = "";
  // for each option in the line
  for (let option of options) {
    // try splitting each option with ':'
    const values: string[] = option.split(':');
    // if there are 2 values found - might be an option:value
    if (values.length == 2) {
      // check which option it is and add it to the object
      if (values[0] === "before") {
        searchValues.bDate = new Date(values[1]).getTime();
      } else if (values[0] === "after") {
        searchValues.aDate = new Date(values[1]).getTime();
      } else if (values[0] === "from") {
        searchValues.from = values[1];
      } else if (values[0] === "labels") {
        searchValues.labels = values[1].split(",");
      }else{
        // if none of the above, then it's part of the search
        values.map((word) => (search = search.concat(word+":")));
        search = search.slice(0, search.length - 1);
        search+=" ";
      }
    } else {
      values.map((word) => (search = search.concat(word + " ")));
    }
  }
  // slice the last " " from the search
  searchValues.search = search.slice(0, search.length - 1);
  console.log(searchValues)
  return searchValues;
}
/**
 * The function gets a search line and filters the tickets by it
 * @param tickets - An array of tickets to filter
 * @param search - The search line given by the user
 * @returns - A filtered tickets
 * NOTE - if there is no search inputs, returns the original tickets
 */
function filterTickets(tickets: Ticket[], search: string) {
  if (search !== "") {
    // parse the search line into SearchValues object
    const searchValues:SearchValues = parseSearch(search);
    // filter the tickets by SearchValues
    return tickets.filter((t) => {
      var flag: Boolean = true;
      if (
        (t.title.toLowerCase() + t.content.toLowerCase()).includes(
          searchValues.search.toLowerCase()
        )
      ) {
        if (searchValues.bDate && t.creationTime > searchValues.bDate) {
          flag = false;
        }
        if (searchValues.aDate && t.creationTime < searchValues.aDate) {
          flag = false;
        }
        if (searchValues.from && t.userEmail !== searchValues.from) {
          flag = false;
        }
        if (searchValues.labels) {
          if (
            !t.labels ||
            !searchValues.labels.every((label) => t.labels?.includes(label))
          ) {
            flag = false;
          }
        }
        if (flag) {
          return t;
        }
      }
    });
  } else {
    return tickets;
  }
}
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
  // extract the values from the URI
  const page: number = parseInt(req.query.page as string);
  const sortBy: string = req.query.sortBy as string;
  const asc: number = parseInt(req.query.asc as string);
  const search: string = req.query.search as string;
  // filter the data by search option
  const filteredData = filterTickets(tempData, search);
  // sort the data
  const sortedData = sortTickets(filteredData, sortBy, asc);
  // get the data size and max number of pages
  const dataSize = sortedData.length;
  const maxPage = Math.ceil(sortedData.length / PAGE_SIZE);
  // slice a page from the data
  const paginatedData = sortedData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  // return a json file of the data, data size and max page number
  res.json({ data: paginatedData, dataSize: dataSize, maxPage: maxPage });
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
      // add the label to array
      t.labels.push(label);
    } else {
      // create a new array with new label
      t.labels = [label];
    }
    // write the new data to the DB and send the label array to the client on success
    fs.writeFile(fileName, JSON.stringify(tempData, null, 2), (err: string) => {
      if (err) throw err;
      console.log("file has been updated!");
      res.send(t.labels);
    });
  } else {
    console.log("Ticket was not found!");
  }
});
app.put(APIPath + "/:id/title/:title", (req, res) => {
  // extract id and label the data from the URL
  const id: string = req.params.id as string;
  const title: string = req.params.title as string;
  // find the ticket by id
  const t = tempData.find((t) => t.id === id);
  if (t) {
    t.title = title;
    // write the new data to the DB and send the title to the client on success
    fs.writeFile(fileName, JSON.stringify(tempData, null, 2), (err: string) => {
      if (err) throw err;
      console.log("file has been updated!");
      res.send(t.title);
    });
  } else {
    console.log("Ticket was not found!");
  }
});
app.listen(serverAPIPort);
console.log("server running", serverAPIPort);
