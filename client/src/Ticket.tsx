import React from "react";

import "./App.scss";
import { Ticket } from "./api";
import { Button, Chip } from "@material-ui/core";

type CustomProps = {
  t: Ticket;
};
/**
 * 
 */
export class CustomTicket extends React.PureComponent<CustomProps,{ title: string }> {
  constructor(props: CustomProps) {
    super(props);    
    this.state = {
      title: this.props.t.title,
    };
  }
  componentDidUpdate(prevProp: CustomProps, prevState: {title:string}){
    // updates the title only when props changed in the father component
    if(prevProp.t.title!==this.props.t.title&&this.state.title!==this.props.t.title){
      this.setState({title:this.props.t.title})
    }
  }
  changeTitle = () => {
    // get a new title
    var newTitle = String(prompt("Type new title", this.state.title));
    // set the new title if it's not null or the same as the current title
    if (newTitle !== "null" && newTitle !== this.state.title) {
      this.setState({ title: newTitle });
      // TODO: add here a server-side manipulation
    }
  };
  render() {
    return (
      <li key={this.props.t.id} id="li" className="ticket">
        {/* Task 1b - Rename button*/}
        <Button
          color="primary"
          variant="contained"
          style={{ float: "right", fontSize: 12 }}
          onClick={() => this.changeTitle()}
        >
          Rename
        </Button>
        <h5 className="title" id={this.props.t.id}>
          {this.state.title}
        </h5>

        {/* Task 1a - Display the ticket's content*/}
        <span>{this.props.t.content}</span>

        <footer>
          <div className="meta-data">
            By {this.props.t.userEmail} |{" "}
            {new Date(this.props.t.creationTime).toLocaleString()}
          </div>
          {/* Task 1c - Display labels in the tickets*/}
          <div style={{ float: "right", fontSize: 10 }}>
            {this.props.t.labels?.map((label) => (
              <Chip color="primary" label={label}></Chip>
            ))}
          </div>
        </footer>
      </li>
    );
  }
}
export default CustomTicket;
