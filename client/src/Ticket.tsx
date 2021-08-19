import React from 'react';

import './App.scss';
import {Ticket} from './api';

type CustomProps={
    t:Ticket;
}

export class CustomTicket extends React.PureComponent<CustomProps,{}> {
    constructor(props:CustomProps){
        super(props);
    }
    state:Ticket = this.props.t;
    render(){
        return (
            <li key={this.state.id} id="li" className='ticket'>				
				<h5 className='title' id={this.state.id}>{this.state.title}
                {// Task 2 - Create a button that renames the ticket's title
                }
				<button className="button" style={{float:'right'}}
				onClick={()=>{					
                    // get a new title
                    var newTitle = String(prompt("Type new title",this.state.title))
                    // set the new title if it's not null or the same as the current title
                    if(newTitle!="null"&&newTitle!=this.state.title){
                        this.state.title = newTitle;
                        //maybe add here a server-side manipulation
                        this.forceUpdate();
                    }                										
				}}
				>Rename</button>
				</h5>
				{//Task 1a - add the content to the ticket
				}
				<span>{this.state.content}</span>
				<footer>
					<div className='meta-data'>By {this.state.userEmail} | { new Date(this.state.creationTime).toLocaleString()}</div>
				</footer>
			</li>
        );
    }
}
export default CustomTicket;
