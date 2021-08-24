import React from "react";
import "./App.scss";
import { createApiClient, Ticket, TicketsData } from "./api";
import CustomTicket from "./Ticket";
import { Button } from "@material-ui/core";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";

export type AppState = {
  ticketsData?: TicketsData;
  search: string;
  sortBy: string;
  asc: number;
  page: number;
};
const PAGE_SIZE: number = 20;
const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {
  state: AppState = {
    search: "",
    sortBy: "none",
    asc: 1,
    page: 1,
  };
  searchDebounce: any = null;

  async componentDidMount() {
    this.setState({
      ticketsData: await api.getTickets(this.state),
    });
  }
  /**
   * The function calls the server to sort the tickets by sort type
   * @param sortType - The sorting type
   */
  sortTickets = (sortType: string) => {
    if (this.state.sortBy !== sortType) {
      this.setState({ sortBy: sortType, asc: 1, page: 1 });
    } else {
      this.setState((prevState: AppState) => {
        return { asc: prevState.asc * -1, page: 1 };
      });
    }
  };
  /**
   * The function replaces the search value in the search bar and set it's new state
   * @param value - The new search value
   */
  replaceSearchValue = (value: string) => {
    (document.getElementById("searchBar") as HTMLInputElement).value = value;
    this.setState({ search: value });
  };
  /**
   * The function updates the value in the search bar by another value given from the user
   * @param value - The value given from the user
   * @param type - The type of the value
   */
  updateValueInSearch = (value: string, type: string) => {
    var newSearch: string;
    if (type === "label") {
      // if 'labels:' already exist 
      if (this.state.search.includes("labels:")) {
        // get it's position in the string
        const startIndex = this.state.search.indexOf("labels:");
        var lastIndex = this.state.search.indexOf(" ", startIndex);
        if (lastIndex === -1) {
          lastIndex = this.state.search.length;
        }
        // get all labels already in the search
        var labels: string[] = this.state.search
          .slice(startIndex + "labels:".length, lastIndex)
          .split(",");
          // if the value is there - remove it
        if (labels.includes(value)) {
          labels = labels.filter((l) => l !== value);
          if (labels.length !== 0) {
            const newLabels: string = "labels:" + labels.join(",");
            newSearch = this.state.search.replace(
              this.state.search.slice(startIndex, lastIndex),
              newLabels
            );
          } else {
            newSearch =
              this.state.search.slice(0, startIndex) +
              this.state.search.slice(lastIndex + 1);
          }
        } else { // else - add the new label to the search
          const index = startIndex + "labels:".length;
          newSearch =
            this.state.search.slice(0, index) +
            value +
            "," +
            this.state.search.slice(index);
        }
      } else { // else - add the new label to the search
        newSearch = "labels:" + value + " " + this.state.search;
      }
      this.replaceSearchValue(newSearch);
    } else if (type === "email") { 
      // if an email already exists in the search bar
      if (this.state.search.includes("from:")) {
        // if it is the same as current email - remove it
        if (this.state.search.includes("from:" + value)) {
          const startIndex = this.state.search.indexOf("from:" + value);
          var lastIndex = this.state.search.indexOf(" ", startIndex);
          if (lastIndex === -1) {
            lastIndex = this.state.search.length;
          }
          newSearch =
            this.state.search.slice(0, startIndex) +
            this.state.search.slice(lastIndex + 1);
          this.replaceSearchValue(newSearch);
        } else { // else - print an error message to the user 
          alert("You can only search one email");
        }
      } else {// else - add the email to the search bar
        newSearch = "from:" + value + " " + this.state.search;
        this.replaceSearchValue(newSearch);
      }
    }
  };
  renderTickets = (tickets: Ticket[]) => {
    console.log("state in render: " + this.state);
    return (
      <ul className="tickets" id="tickets">
        {tickets.map((ticket) => (
          <CustomTicket
            t={ticket}
            setValueInSearch={this.updateValueInSearch}
          ></CustomTicket>
        ))}
      </ul>
    );
  };

  onSearch = async (val: string) => {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(async () => {
      this.setState({
        search: val,
        page: 1,
      });
    }, 300);
  };

  async componentDidUpdate(prevProp: AppState, prevState: AppState) {
    // if specific values have changed in the state
    if (
      prevState.search !== this.state.search ||
      prevState.page !== this.state.page ||
      prevState.sortBy !== this.state.sortBy ||
      prevState.asc !== this.state.asc
    ) {
      // get the new tickets according to the state values
      this.setState({ ticketsData: await api.getTickets(this.state) });
    }
  }
  /**
   * @returns - The function returns the propper line that displays the result
   */
  getResultsLine() {
    const { ticketsData: tickets } = this.state;
    const bottomNum = tickets ? PAGE_SIZE * (this.state.page - 1) + 1 : 1;
    const topNum = tickets?.data
      ? tickets.data.length + PAGE_SIZE * (this.state.page - 1)
      : 0;
    const result =
      "Showing " +
      bottomNum +
      "-" +
      topNum +
      " results out of " +
      this.state.ticketsData?.dataSize;
    return result;
  }
  render() {
    const tickets = this.state.ticketsData?.data;
    console.log("state: ", this.state);
    console.log("tickets: ", this.state.ticketsData?.data);
    return (
      <main>
        <h1>Tickets List</h1>
        <header>
          <input
            id="searchBar"
            type="search"
            placeholder="Search..."
            onChange={(e) => this.onSearch(e.target.value)}
          />
        </header>
        <div className="hint" style={{ fontSize: 12 }}>
          hint - you can use label filtering by clicking on the label
        </div>
        {/* Task 3 - Display result found to the user */}
        {tickets ? (
          <div className="results">{this.getResultsLine()}</div>
        ) : null}
        {/* Task 2a - Sorting option */}
        <div className="buttons">
          <div className="sort_buttons">
            <Button
              variant="contained"
              color={this.state.sortBy === "date" ? "secondary" : "primary"}
              onClick={() => this.sortTickets("date")}
            >
              Sort By Date
              {this.state.sortBy === "date" && this.state.asc === 1 ? (
                <ArrowUpwardIcon />
              ) : this.state.sortBy === "date" && this.state.asc === -1 ? (
                <ArrowDownwardIcon />
              ) : null}
            </Button>
            &nbsp;
            <Button
              variant="contained"
              color={this.state.sortBy === "title" ? "secondary" : "primary"}
              onClick={() => this.sortTickets("title")}
            >
              Sort By Title
              {this.state.sortBy === "title" && this.state.asc === 1 ? (
                <ArrowUpwardIcon />
              ) : this.state.sortBy === "title" && this.state.asc === -1 ? (
                <ArrowDownwardIcon />
              ) : null}
            </Button>
            &nbsp;
            <Button
              variant="contained"
              color={this.state.sortBy === "email" ? "secondary" : "primary"}
              onClick={() => this.sortTickets("email")}
            >
              Sort By Email
              {this.state.sortBy === "email" && this.state.asc === 1 ? (
                <ArrowUpwardIcon />
              ) : this.state.sortBy === "email" && this.state.asc === -1 ? (
                <ArrowDownwardIcon />
              ) : null}
            </Button>
          </div>
        </div>
        <div style={{ float: "right" }}>
          <div className="page_search">
            <input
              type="text"
              value={this.state.page}
              onChange={(e) => {
                if (e.target.value !== "") {
                  const newPage: number = parseInt(e.target.value);
                  console.log(newPage);
                  if (this.state.ticketsData) {
                    if (
                      newPage <= this.state.ticketsData.maxPage &&
                      newPage >= 1
                    ) {
                      this.setState({ page: newPage });
                    } else {
                      alert("Invalid page number!");
                    }
                  }
                }
              }}
              min="1"
              max={this.state.ticketsData?.maxPage}
            />
          </div>
          <div className="page_buttons">
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
                if (
                  this.state.page <
                  (this.state.ticketsData ? this.state.ticketsData.maxPage : 0)
                ) {
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
        {tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
      </main>
    );
  }
}

export default App;
