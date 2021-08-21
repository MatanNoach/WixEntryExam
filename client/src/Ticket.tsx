import React from "react";
import "./App.scss";
import { createApiClient, Ticket } from "./api";
import { Button, Chip, Fab, Link } from "@material-ui/core";

type CustomProps = {
  t: Ticket;
};
type CustomState = {
  title: string;
  labels?: string[];
  shouldTruncate: Boolean;
  isTruncated?: Boolean;
};
const api = createApiClient();
/**
 * A Component of custom ticket
 */
export class CustomTicket extends React.PureComponent<
  CustomProps,
  CustomState
> {
  constructor(props: CustomProps) {
    super(props);
    this.state = {
      title: this.props.t.title,
      labels: props.t.labels ? props.t.labels : undefined,
      shouldTruncate: false,
      isTruncated: false,
    };
  }
  componentDidMount(){
    this.checkShouldTruncate();
  }
  componentDidUpdate(prevProp: CustomProps, prevState: CustomState) {
    // checks if the father component has changed props (like changing order)
    if (prevProp.t.id !== this.props.t.id){
      this.setState({ title: this.props.t.title, labels: this.props.t.labels,shouldTruncate: false,isTruncated: false},()=>this.checkShouldTruncate());
    }
  }
  changeTitle = async () => {
    // get a new title
    var newTitle = String(prompt("Type new title", this.state.title));
    // set the new title if it's not null, empty or the same as the current title
    if (
      newTitle !== "null" &&
      newTitle !== this.state.title &&
      newTitle !== ""
    ) {
      this.setState({
        title: await api.changeTitle(this.props.t.id, newTitle),
      });
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
    if (newLabel !== "null" && newLabel !== "") {
      this.setState({ labels: await api.addLabel(this.props.t.id, newLabel) });
    }
  };
  /**
   * The function checks if the ticket's content should  be truncated
   */
  checkShouldTruncate = () => {
    if (!this.state.shouldTruncate) {
      // get the content
      const content = document.getElementById("c-"+this.props.t.id);
      if (content) {
        // get the font size - represents a line
        const fontSize = parseInt(content.style.fontSize);
        const maxLines: number = 3;
        // get the height of the whole content
        const pHeight = content.offsetHeight;
        // if the content height is larger then 3 lines, the content should be truncated
        if (fontSize * maxLines < pHeight) {
          this.setState({ isTruncated:true,shouldTruncate: true });
        }
      }
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
        <h5 className="title" id={"t-"+this.props.t.id}>
          {this.state.title}
        </h5>
        {/* Task 1a + 1d - Display the ticket's content and show more/show less option*/}
        <div id={"cd-"+this.props.t.id} style={{height:this.state.isTruncated?"80px":"auto",overflow:this.state.isTruncated?"hidden":"initial"}}>
        <p id={"c-"+this.props.t.id} style={{fontSize:"16px"}}>{this.props.t.content}</p>
        </div>
        <Link style={{visibility:this.state.shouldTruncate? "visible":"hidden"}} 
        onClick={()=>this.setState((prevState:CustomState)=>{return {isTruncated:!prevState.isTruncated}})}>
          {this.state.isTruncated? "show more":"show less"}
        </Link>
        <footer>
          <div className="meta-data">
            By {this.props.t.userEmail} | {" "}
            {new Date(this.props.t.creationTime).toLocaleString()}
          </div>
          {/* Task 1c - Display ticket's labels*/}
          <div style={{ float: "right", fontSize: 10 }}>
            <div style={{ float: "right" }}>
              {/* Task 3 - add/delete label option*/}
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
