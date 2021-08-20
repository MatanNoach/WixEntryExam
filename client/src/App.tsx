import React, { useState } from "react";

import "./App.scss";
import { createApiClient, Ticket } from "./api";
import CustomTicket from "./Ticket";
import {Button} from "@material-ui/core";
export type AppState = {
  tickets?: Ticket[];
  search: string;
  sortBy: string;
  asc: number;
  page: number;
  maxPage:number;
  dataSize:number;
};
const PAGE_SIZE:number = 20;
const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {
  state: AppState = {
    search: "",
    sortBy: "none",
    asc: 1,
    page: 1,
    maxPage:0,
    dataSize:0
  };
  searchDebounce: any = null;

  async componentDidMount() {
    this.setState({
      tickets: await api.getTickets(
        this.state.page,
        this.state.sortBy,
        this.state.asc,
        (newDataSize:number,newMaxPage:number)=>this.setState({maxPage:newMaxPage,dataSize:newDataSize})
      ),
    });
    console.log("datasize: ",this.state.dataSize)
    console.log("maxPage: ",this.state.maxPage)
  }
  sortTickets = (sortType: string) => {
    if (this.state.sortBy !== sortType) {
      this.setState({ sortBy: sortType, asc: 1 });
    } else {
      this.setState((prevState: AppState) => {
        return { asc: prevState.asc * -1 };
      });
    }
  };
  renderTickets = (tickets: Ticket[]) => {    
    const filteredTickets = tickets.filter((t) =>
      (t.title.toLowerCase() + t.content.toLowerCase()).includes(
        this.state.search.toLowerCase()
      )
    );    
    return (
      <ul className="tickets" id="all_tickets">
        {filteredTickets.map((ticket) => (
          <CustomTicket t={ticket}></CustomTicket>
        ))}
      </ul>
    );
  };

  onSearch = async (val: string, newPage?: number) => {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(async () => {
      this.setState({
        search: val,
      });
    }, 300);
  };

  async componentDidUpdate(prevProp: AppState, prevState: AppState) {    
    // if something has changed in the state
    if (
      prevState.sortBy !== this.state.sortBy ||
      prevState.asc !== this.state.asc ||
      prevState.page !== this.state.page
    ) {
      // get the new tickets according to the state values
      this.setState({ tickets: await api.getTickets(this.state.page,this.state.sortBy,this.state.asc)});
    }
  }
  showResultsNum(){
    const { tickets } = this.state;
    const bottomNum = tickets ? PAGE_SIZE*(this.state.page-1): 0;
    const topNum = tickets ? tickets.length+PAGE_SIZE*(this.state.page-1): 0;
    const result = "Showing "+bottomNum+"-"+topNum+" results out of "+this.state.dataSize;    
    return result;
  }
  render() {
    const { tickets } = this.state;
    return (
      <main>
        <h1>Tickets List</h1>
        <header>
          <input
            type="search"
            placeholder="Search..."
            onChange={(e) => this.onSearch(e.target.value)}
          />
        </header>
        {tickets ? (
          <div className="results">{this.showResultsNum()}</div>
        ) : null}
        <div className="buttons">
          <div className="sort_buttons">
            <Button
              variant="contained"
              color={this.state.sortBy === "date" ? "secondary" : "primary"}
              onClick={() => this.sortTickets("date")}
            >
              Sort By Date
            </Button>
            &nbsp;
            <Button
              variant="contained"
              color={this.state.sortBy === "title" ? "secondary" : "primary"}
              onClick={() => this.sortTickets("title")}
            >
              Sort By Title
            </Button>
            &nbsp;
            <Button
              variant="contained"
              color={this.state.sortBy === "email" ? "secondary" : "primary"}
              onClick={() => this.sortTickets("email")}
            >
              Sort By Email
            </Button>
          </div>
          <div className="page_buttons" style={{ float: "right" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (this.state.page > 1) {
                  this.setState((prevState: AppState) => {
                    return { page: prevState.page - 1 };
                  });
                }
              }}
            >
              previous
            </Button>
            &nbsp;
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if(this.state.page<this.state.maxPage){
                this.setState((prevState: AppState) => {
                  return { page: prevState.page + 1 };
                });
              }
              }}
            >
              next
            </Button>
          </div>
        </div>
        <ul className="ticket_list"></ul>
        {/* Calls the function that renders the tickets */}
        {tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
      </main>
    );
  }
}

export default App;
