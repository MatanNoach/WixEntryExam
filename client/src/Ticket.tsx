import React from "react";
import "./App.scss";
import { createApiClient, Ticket } from "./api";
import { Button, Chip, Fab } from "@material-ui/core";

type CustomProps = {
  t: Ticket;
};
type CustomState = {
  title: string;
  labels?: string[];
};
const api = createApiClient();
/**
 *
 */
export class CustomTicket extends React.PureComponent<
  CustomProps,
  CustomState
> {
  constructor(props: CustomProps) {
    super(props);
    this.state = {
      title: this.props.t.title,
      labels: props.t.labels ? props.t.labels : undefined
    };
  }
  componentDidUpdate(prevProp: CustomProps, prevState: CustomState) {
    // updates the title only when props changed in the father component
    // prevProp.t !== this.props.t - checks if the father component has changed props (like changing order)
    // this.state !== this.props.t - checks if the component itself changed a state
    if (
      prevProp.t.title !== this.props.t.title &&
      this.state.title !== this.props.t.title
    ) {
      this.setState({ title: this.props.t.title });
    }
    if (
      prevProp.t.labels !== this.props.t.labels &&
      this.state.title !== this.props.t.title
    ) {
      this.setState({ labels: this.props.t.labels });
    }    
  }
  changeTitle = async () => {
    // get a new title
    var newTitle = String(prompt("Type new title", this.state.title));
    // set the new title if it's not null, empty or the same as the current title
    if (newTitle !== "null" && newTitle !== this.state.title && newTitle!=="") {
      this.setState({title: await api.changeTitle (this.props.t.id, newTitle) });
    }
  };
  // the function handles the delete command and updates the labels in the ticket
  handleDelete = async (label: string) => {
    this.setState({
      labels: await api.deleteLabel(this.props.t.id, label),
    });
  };
  handleAdd = async () => {
    // get a new label
    var newLabel = String(prompt("Type new label"));
    // add the new label if it's not null or empty
    if (newLabel !== "null"&&newLabel!=="") {
      this.setState({labels: await api.addLabel(this.props.t.id, newLabel)});
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
            <div style={{ float: "right" }}>
              <Fab
                size="small"
                color="primary"
                onClick={() => this.handleAdd()}
              >
                +
              </Fab>
            </div>
            {this.state.labels?.map((label) => (
              <Chip
                color="primary"
                variant="outlined"
                onDelete={() => this.handleDelete(label)}
                label={label}
              ></Chip>
            ))}
          </div>
        </footer>
      </li>
    );
  }
}
export default CustomTicket;
