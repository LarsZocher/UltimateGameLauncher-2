import React, { Component } from "react";
const e = React.createElement;

export class Test extends Component {
    render() {
        return (
            'button',
            { onClick: () => this.setState({ liked: true }) },
            'Like'
        );
    }
}