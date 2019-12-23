import React from 'react';

export default class Switch extends React.Component {

    state = {
        checked: false
    }

    constructor(props){
        super(props);
        if(props.checked)
            this.state.checked = props.checked;
    }

    toggleButton = () => {
        //console.trace();
        this.setState({checked: !this.state.checked});
    }

    render() {
        console.log(this.state.checked);
        return  (
            <div className="onoffswitch">
                <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" checked={this.state.checked} onChange={this.toggleButton} id={this.props.id}/>
                <label className="onoffswitch-label" htmlFor={this.props.id}>
                    <span className="onoffswitch-inner"></span>
                    <span className="onoffswitch-switch"></span>
                </label>
            </div>
        );
    }
}