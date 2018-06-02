/**
 * Created by Administrator on 2018/6/2.
 */
import React, { Component } from 'react';
import {MUSIC_LIST} from '../../config'
import './music_list.css'

class MusicList extends Component {

    constructor(){
        super()
        this.state = {
            musicList: MUSIC_LIST,
            currIndex: 0
        }
    }

    //父组件有传值
    componentWillReceiveProps(nextProps) {
        console.log('有传值')
        let currIndex = nextProps.currIndex
        this.setState({
            currIndex
        })
    }

    //点击歌曲
    changeMusic(index){
        console.log('点击了',index)
        this.props.onMusicChange(index)
        this.setState({
            currentIndex: index
        })
    }

    //删除歌曲
    deleteItem(index,e){
        //阻止冒泡
        e.stopPropagation();
        e.preventDefault();
        this.props.onDeleteChange(index)
    }

    render() {
        return (
            <div className="mt-5">
                <div className="alert alert-warning" role="alert">我的播放列表</div>
                <ul className="list-group">
                    {this.state.musicList.map((item,index)=>{
                        return <i  key={index}
                                   className={`list-group-item ${this.state.currIndex===index?'active':''}`}
                                    onClick={this.changeMusic.bind(this,index)}
                                >
                            <span className="title">{item.title}</span><span className="author">{item.artist}</span>
                                <span className="delete" onClick={this.deleteItem.bind(this,index)}>X</span>
                            </i>
                    })}
                </ul>

            </div>
        );
    }
}

export default MusicList