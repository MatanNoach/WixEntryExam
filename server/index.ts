import express from 'express';
import bodyParser = require('body-parser');
import { tempData } from './temp-data';
import { serverAPIPort, APIPath } from '@fed-exam/config';
import {Ticket} from '../client/src/api'

console.log('starting server', { serverAPIPort, APIPath });

const app = express();

const PAGE_SIZE = 20;

app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
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
function sortTickets(tickets: Ticket[], sortBy: string,asc:number) {
  if (sortBy == "email") {
    tickets.sort(function (a, b) {
      var aEmail = a.userEmail.toUpperCase();
      var bEmail = b.userEmail.toUpperCase();
      if (aEmail > bEmail) {
        return 1*asc;
      } else if (aEmail < bEmail) {
        return -1*asc;
      }
      return 0;
    });
  } else if (sortBy == "date") {
    tickets.sort((a, b) => (a.creationTime - b.creationTime)*asc);
  } else if (sortBy == "title") {
    tickets.sort(function (a, b) {
      var aTitle = a.title.toUpperCase();
      var bTitle = b.title.toUpperCase();
      if (aTitle > bTitle) {
        return 1*asc;
      } else if (aTitle < bTitle) {
        return -1*asc;
      }
      return 0;
    });
  }
  return tickets;
}

app.get(APIPath, (req, res) => {
  
  const page: number = parseInt(req.query.page as string);
  const sortBy: string = req.query.sortBy as string;
  const asc: number = parseInt(req.query.asc as string);
  console.log("page: "+page);
  console.log("sortBy: "+sortBy);
  console.log("asc: "+asc);
  const paginatedData = tempData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const sortedData = sortTickets(paginatedData,sortBy,asc);
  res.send(sortedData);
});

app.listen(serverAPIPort);
console.log('server running', serverAPIPort)

