/**
 * Created by Administrator on 2018/5/31.
 */
import React, { Component } from 'react';
import  './header.css'

class Header extends Component {
    render() {
        return (

            <div className="alert alert-primary" role="alert">
                <div className="media">
                    <div className="logo mr-3"/>
                        <div className="media-body">
                            <h5 className="mt-3">天天音乐播放器</h5>
                        </div>
                </div>
            </div>
        );
    }
}

export default Header;