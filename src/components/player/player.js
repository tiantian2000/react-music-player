/**
 * Created by Administrator on 2018/6/2.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Progress from '../progress/progress';
import $ from 'jquery';
import 'jplayer';
import Lyric from 'lyric-parser'
import './player.css'
import Scroll from 'react-bscroll'
import 'react-bscroll/lib/react-scroll.css'

let duration = 0
class Player extends Component {

    constructor(){
        super()
        this.state = {
            progress: 0,     //进度
            duration: 0,     //总时长
            volume: 0,       //音量
            currentItem: {}, //当前歌曲,
            isPlay: false,   //播放状态,
            leftTime: '',    //剩余时间
            type: 'cycle',  //播放类型(默认循环)
            currentLyric: [], //歌词
            lineNo: 0 ,       //高亮显示的行号
            currentTime: 0,    //当前播放时间
            lineNum: 0         //当前滚动到的行数
        }
    }

    componentDidMount(){

        $("#player").jPlayer({
            supplied: "mp3",
            wmode: "window",
            useStateClassSkin: true
        });
        //设置当前播放的音乐
        this.playItem(this.props.currentItem)
        //绑定播放事件监听
        $('#player').bind($.jPlayer.event.timeupdate,(e)=>{
            //console.log(e.jPlayer.status.currentTime.toFixed(3))
            //console.log(e.jPlayer.status.currentTime)
            //console.log(e.jPlayer.status.duration)
            //console.log(e.jPlayer.options.volume)
            //获取总进度
            duration = e.jPlayer.status.duration
            //剩余进度
            //console.log(1- e.jPlayer.status.currentPercentAbsolute/100)
            this.changeLineNo()
            this.setState({
                //取音量
                volume: e.jPlayer.options.volume * 100,
                //取当前播放的百分比
                progress: e.jPlayer.status.currentPercentAbsolute,
                leftTime: duration * (1- e.jPlayer.status.currentPercentAbsolute/100),
                currentTime: e.jPlayer.status.currentTime
            })
        })
        //监听播放完毕
        $("#player").bind($.jPlayer.event.ended, (e) => {
           this.changeNext()
        });

    }

    //处理歌词
    handleLyric(){
        let medisArray = new Array();
        let medises = this.state.currentItem.lyrics.split('\n')
        //console.log(medises)
        for(let item of medises){
            var t = item.substring(item.indexOf("[") + 1, item.indexOf("]"));
            medisArray.push({
                //把原来的mm:ss的时间格式改为秒
                t: (t.split(":")[0] * 60 + Number.parseFloat(t.split(":")[1])).toFixed(3),
                c: item.substring(item.indexOf("]") + 1, item.length)
              }
            )
        }
        medisArray.pop()
        console.log(medisArray)
        this.setState({
            currentLyric: medisArray
        })

    }

    //父组件有传值
    componentWillReceiveProps(nextProps) {
        let currentItem = nextProps.currentItem
        console.log(currentItem)
        this.setState({
            currentItem
        })
        this.playItem(currentItem,true)
    }

    //切换歌曲
    playItem(item,type=false){
        $("#player").jPlayer("setMedia", {
            mp3: item.file
        })
        if(type){ //立即播放
            $('#player').jPlayer('play')
            this.setState({
                isPlay: true
            })
        }
        this.setState({
            currentItem: item,
            lineNo: 0
        },()=>this.handleLyric())
    }

    //组件被卸载的时候
    componentWillUnMount(){
        $('#player').unbind($.jPlayer.event.timeupdate)
    }

    //设置播放进度
    changeProgressHandler(progress){
        //console.log(duration * progress)
    //如果是播放的时候点击则暂停,反之则播放
        this.state.isPlay?$('#player').jPlayer('play',duration * progress)
            :$('#player').jPlayer('pause',duration * progress)
        this.setState({
            currentTime: duration * progress
        },()=>this.queryLineNo())

    }

    //设置音量
    changeVolumeHandler(progress){
        $('#player').jPlayer('volume',progress)
        this.setState({
            volume: progress
        })
    }

    //点击播放
    play(){
        //如果是播放的时候点击则暂停,反之则播放
        this.state.isPlay?$('#player').jPlayer('pause'):$('#player').jPlayer('play')
        this.setState({
            //设置播放状态
            isPlay: !this.state.isPlay
        })

    }

    //格式化时间
    formatTime(time){
        time = Math.floor(time)
        let miniutes = Math.floor(time / 60)
        let seconds = Math.floor(time % 60)

        seconds = seconds<10? `0${seconds}`:seconds
        return `${miniutes}:${seconds}`
    }

    //下一曲
    next(){
        this.props.onNextChange();
    }

    //上一曲
    pre(){
        this.props.onPreChange()
    }

    //播放完毕后切换到一首
    changeNext(){
        this.props.onNextPlay(this.state.type)
    }

    //切换播放模式
    changeType(){
        this.state.type==='cycle'?this.setState({
            type: 'once'
        }):this.setState({
            type: 'cycle'
        })
    }

    //歌词高亮显示的监听
    changeLineNo() {
        //console.log(this.state.lineNo,this.state.currentLyric[this.state.lineNo],this.state.currentTime.toFixed(3))
        if(this.state.currentLyric[this.state.lineNo] === undefined){
            this.setState({
                lineNo: 0
            })
        }else if (this.state.lineNo == this.state.currentLyric.length - 1 &&
            this.state.currentTime.toFixed(3) >= parseFloat(this.state.currentLyric[this.state.lineNo].t)) {
            this.setState({
                lineNo: 0
            })
        }else if (parseFloat(this.state.currentLyric[this.state.lineNo].t) <= this.state.currentTime.toFixed(3) &&
            this.state.currentTime.toFixed(3) <= parseFloat(this.state.currentLyric[this.state.lineNo + 1].t)) {

           this.setState({
                lineNo: this.state.lineNo+1
            })
        }else if (parseFloat(this.state.currentLyric[this.state.lineNo].t) <= this.state.currentTime.toFixed(3) &&
            this.state.currentTime.toFixed(3) <= parseFloat(this.state.currentLyric[this.state.lineNo + 2].t)) {

            this.setState({
                lineNo: this.state.lineNo+2
            })

        }
        this.handleLyricScroll()
    }

    //查询进度条设置后对应歌词的行号
    queryLineNo(){
        let index = 0
        let newLyric = this.state.currentLyric.filter((item)=>{
           if(parseFloat(item.t) <= this.state.currentTime.toFixed(3)){
               //console.log(item.t,this.state.currentTime.toFixed(3))
               index++
               return item
           }
        })
        //console.log(index)
        this.setState({
            lineNo: index
        })

    }

    handleLyricScroll(){
        this.setState({
            lineNum: this.state.lineNum + 1
        },()=>{
            if(this.state.lineNum === 7){ //行号每跳到7则滚动
                let lyricElS =  this.refs.lyricLine
                lyricElS = lyricElS.getElementsByTagName('li');
                let lyricEl = lyricElS[this.state.lineNo]
                let scrollObj = this.refs.scroll.getScrollObj()
                scrollObj.scrollToElement(lyricEl,3000)
                this.setState({
                    lineNum: 0
                })
            }
        })




    }

    render() {
        return (
               <div className="player-page">
                    <h1 className="ml-4 caption">个人音乐坊</h1>
                    <div className="mt-3 row">
                        <div className="ml-4 col-2 cover">
                            <img  className={this.state.isPlay?'play':'pause'} src={this.state.currentItem.cover}
                                  alt="歌曲图片"/>
                        </div>
                        <div className="ml-4 col-5">
                            <h2 className="music-title">{this.state.currentItem.title}</h2>
                            <h3 className="music-article">{this.state.currentItem.artist}</h3>
                            <div className="row mt-3">
                                <div className="col-2 left-time">
                                    -{this.formatTime(this.state.leftTime)}
                                </div>
                                <div className="col-10">
                                    <div className="row volume-controller">
                                        <div className="col-1"><i className="icon-volume volume"></i></div>
                                        <div className="col-3 volume-progress">
                                            {<Progress  progress={this.state.volume}
                                                       onProgressChange={this.changeVolumeHandler.bind(this)}/>}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="progress-bar mt-3">
                                <Progress progress={this.state.progress} bgColor="#dd3c49"
                                          onProgressChange={this.changeProgressHandler.bind(this)}/>
                            </div>
                            <div className="row mt-5">
                                <div className="col-11">
                                    <i className="icon prev" onClick={this.pre.bind(this)}></i>
                                    <i className={`ml-4 icon ${this.state.isPlay?'pause':'play'}`} onClick={this.play.bind(this)}></i>
                                    <i className="ml-4 icon next" onClick={this.next.bind(this)}></i>
                                </div>
                                <div className="col-1">
                                    <i className={`icon repeat-${this.state.type}`}
                                       onClick={this.changeType.bind(this)}></i>
                                </div>
                            </div>
                        </div>

                        <div className="ml-4 col-4 clric">
                            <Scroll ref="scroll">
                                <ul ref="lyricLine" className="list-group">
                                {this.state.currentLyric.map((item,index)=>{
                                        return <li  key={index}
                                                   className={`list-group-item ${this.state.lineNo===index?'active':''}`}>
                                    {item.c}</li>
                                    })
                                }
                                </ul>
                            </Scroll>
                        </div>
                    </div>
                </div>

        );
    }
}

export default Player;
