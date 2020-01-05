import React from 'react';
var steam = require("../types/steam");

export default class SteamUserDisplay extends React.Component {

    state = {
        selected: false
    }

    constructor(props){
        super(props);
        if(props.selected)
            this.state.selected = props.selected;
        if(props.onClick)
            this.state.onClick = props.onClick;
        if(props.user)
            this.state.user = props.user;
        else
            console.error("[SteamUserDisplay] 'user' is missing!");
    }

    componentDidMount() {
        this.loadUserData();
    }

    toggle = function(sel = null){
        this.setState((state)=>{
            if(sel!=null)
                state.selected = sel;
            else
                state.selected = !state.selected;
            return state;
        });
    }

    loadUserData = () => {
        steam.getSteamUserInfo(this.state.user.steam64id).then(data=>{
            this.setState((state)=>{
                state.data = data;
                return state;
            });
        });
    }

    switch = () =>{
        steam.changeUser(this.state.user.name);
    }

    onClick = () =>{
        if(this.state.onClick)
            this.state.onClick();
    }

    render() {
        var style = {background: "#000"};
        var name = "";
        if(this.state.data){
            style = {backgroundImage: "url('"+this.state.data.getElementsByTagName("avatarFull")[0].childNodes[0].nodeValue+"')"};
            name = this.state.data.getElementsByTagName("steamID")[0].childNodes[0].nodeValue;
        }
        var classes = this.state.selected?"user active":"user";
        return  (
            <div className={classes} onClick={this.onClick}>
                <div className="user-back" style={style}></div>
                <div className="user-name">{name}</div>
                <div className="user-btns">
                    <div className="user-switch" onClick={this.switch}>SWITCH</div>
                </div>
            </div>
        );
    }
}