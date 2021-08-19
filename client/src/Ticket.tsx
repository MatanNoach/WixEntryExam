import React from "react";

import "./App.scss";
import { Ticket } from "./api";

type CustomProps = {
  t: Ticket;
};

export class CustomTicket extends React.PureComponent<CustomProps, {}> {
  state: Ticket = this.props.t;

  render() {
    return (
      <li key={this.state.id} id="li" className="ticket">
        <h5 className="title" id={this.state.id}>
          {this.state.title}
          {/* Task 1b - Rename button*/}
          <button
            className="button"
            style={{ float: "right" }}
            onClick={() => {
              // get a new title
              var newTitle = String(prompt("Type new title", this.state.title));
              // set the new title if it's not null or the same as the current title
              if (newTitle !== "null" && newTitle !== this.state.title) {
                this.state.title = newTitle;
                // TODO: add here a server-side manipulation
                // TODO (maybe): replace forceUpdate() with setState()
                this.forceUpdate();
              }
            }}
          >
            Rename
          </button>
        </h5>

        {/* Task 1a - Display the ticket's content*/}
        <span>{this.state.content}</span>

        <footer>
          <div className="meta-data">
            By {this.state.userEmail} |{" "}
            {new Date(this.state.creationTime).toLocaleString()}
          </div>
          {/* Task 1c - Display labels in the tickets*/}
          <div style={{ float: "right" }}>
            {this.state.labels?.map((label) => (
              <button disabled>{label}</button>
            ))}
          </div>
        </footer>
      </li>
    );
  }
}
export default CustomTicket;
