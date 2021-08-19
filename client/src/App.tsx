import React, { useState } from "react";

import "./App.scss";
import { createApiClient, Ticket } from "./api";
import CustomTicket from "./Ticket";

export type AppState = {
  tickets?: Ticket[];
  search: string;
  sortBy: string;
  isAsc:number;
};

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

  state: AppState = {
    search: "",
    sortBy: "none",
	isAsc: 1,
  };
  searchDebounce: any = null;

  async componentDidMount() {
    this.setState({
      tickets: await api.getTickets(this.state.sortBy,this.state.isAsc),
    });    
  }


  renderTickets = (tickets: Ticket[]) => {
    console.log("rendering tickets");
	// filtering option

    const filteredTickets = tickets.filter((t) =>
      (t.title.toLowerCase() + t.content.toLowerCase()).includes(
        this.state.search.toLowerCase()
      )
    );
	// log that verifies I am getting the sorted data
	console.log("Tickets in rednerTickets: ")
	{tickets.map((t)=>{
		console.log(t);
	})}
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
	// if the sortBy state is different
	console.log("compoenetDidUpdate: ")
	console.log("prevState: ",prevState)
	console.log("thisState: ",this.state)
    if ((prevState.sortBy !== this.state.sortBy)|| (prevState.isAsc !== this.state.isAsc)) {
		// perform getTickets and set the new tickets
		const tickets = await api.getTickets(this.state.sortBy,this.state.isAsc);
		this.setState({
		  tickets
		});
    }
  }
  render() {
    const { tickets } = this.state;
    console.log("tickets in render: ", tickets);
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
          <div className="results">Showing {tickets.length} results</div>
        ) : null}
        <button
          onClick={() => {
			  console.log("in date onClick()")
			  if(this.state.sortBy!=="date"){
				console.log("1")
            	this.setState({ sortBy: "date",isAsc:1 });
			  }else{
				console.log("2")
				this.setState({ isAsc: this.state.isAsc*-1 });
			  }
          }}
        >
          Sort By Date
        </button>
        <button
          onClick={() => {
            if(this.state.sortBy!=="title"){
            	this.setState({ sortBy: "title",isAsc:1 });
			  }else{
				this.setState({ isAsc: this.state.isAsc*-1 });
			  }
          }}
        >
          Sort By Title
        </button>
        <button
          onClick={() => {
            if(this.state.sortBy!=="email"){
            	this.setState({ sortBy: "email",isAsc:1 });
			  }else{
				this.setState({ isAsc: this.state.isAsc*-1 });
			  }
          }}
        >
          Sort By Email
        </button>
        <ul className="ticket_list"></ul>
		{/* Calls the function that renders the tickets */}
        {tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
      </main>
    );
  }
}

export default App;
