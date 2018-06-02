import React, { Component } from 'react';
import Header from './components/header/header'
import Player from './components/player/player'
import MusicList from './components/music_list/Music_list'
import {MUSIC_LIST} from './config'

class App extends Component {

      constructor(){
          super()
          this.state = {
              musicList: MUSIC_LIST, //歌曲列表
              currIndex: 0,           //当前歌曲索引
              //currentItem: MUSIC_LIST[0]    //当前歌曲
          }
      }

      //改变当前播放歌曲的回调函数
      changeMusicHandler(index){
          this.setState({
              currIndex: index,
              currentItem: this.state.musicList[index]
          },()=>console.log(this.state.currIndex))
      }

      //切换到下一首
      changeNext(){
          //如果是最后一首,则回到第一首
          this.state.currIndex === this.state.musicList.length-1? this.setState({
              currIndex: 0,
          }): this.setState({
              currIndex: this.state.currIndex + 1,
          })
      }

      //切换到上一首
      changePre(){
          //如果是第一首则到最后一首
          this.state.currIndex === 0?
              this.setState({
                  currIndex: this.state.musicList.length-1
              }):
              this.setState({
                  currIndex: this.state.currIndex - 1
              })
      }

    //播放完毕时的回调函数
    changeNextPlay(type){
       //如果是循环播放则播放下一首,如果是单曲则重放
       type === 'cycle'?this.changeNext():
           this.setState({
               currIndex: this.state.currIndex
           })
    }

    //从数组中删除给索引的歌曲
    deleteMusicList(index){
        if(this.state.musicList.length > 1){ //只有一首歌的时候不能删
            this.state.musicList.splice(index,1)
            this.setState({
                musicList: this.state.musicList,
                currIndex: 0
            })
        }
    }

      render() {
        return (
          <div className="container">
                <Header />
                <Player currentItem={this.state.musicList[this.state.currIndex]}
                        onNextChange={this.changeNext.bind(this)}
                        onPreChange={this.changePre.bind(this)}
                        onNextPlay={this.changeNextPlay.bind(this)}
                />
                <MusicList currIndex={this.state.currIndex} onMusicChange={this.changeMusicHandler.bind(this)}
                    onDeleteChange={this.deleteMusicList.bind(this)}/>
          </div>
        );
      }
}

export default App;
