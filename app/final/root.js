import React from 'react';
import Header from './components/header';
import Player from './page/player';
import MusicList from './page/musicList';
import {MUSIC_LIST} from './config/musicList';
import {Router,IndexRoute,Link,Route,hashHistory} from 'react-router';
import Pubsub from 'pubsub-js';
import { randomRange } from './utils/utils';
let App=React.createClass({
	componentDidMount(){
			$("#player").jPlayer({
				supplied:'mp3',
				wmode:'window'
			});
			this.playMusic(this.state.currentMusicItem);
			$("#player").bind($.jPlayer.event.ended,(e)=> {
				this.playNext();
			});
		Pubsub.subscribe('PLAY_MUSIC',(msg,musicItem)=>{
			this.playMusic(musicItem)
		});
		Pubsub.subscribe('DELETE_MUSIC',(msg,musicItem)=>{
			this.setState({
				musicList:this.state.musicList.filter(item=>{
					return item!==musicItem
				})
			})
		});
		Pubsub.subscribe('PLAY_PREV',(msg,musicItem)=>{
			this.playNext('prev')
		});
		Pubsub.subscribe('PLAY_NEXT',(msg,musicItem)=>{
			this.playNext()
		});
			let repeatList = [
				'cycle',
				'once',
				'random'
			];
			PubSub.subscribe('CHANAGE_REPEAT', () => {
				let index = repeatList.indexOf(this.state.repeatType);
				index = (index + 1) % repeatList.length;
				this.setState({
					repeatType: repeatList[index]
				});
			});
		},
		componentWillUnmount(){
			Pubsub.unsubscribe('DELETE_MUSIC');
			Pubsub.unsubscribe('PLAY_MUSIC');
			PubSub.unsubscribe('CHANAGE_REPEAT');
			Pubsub.unsubscribe('PLAY_PREV');
			Pubsub.unsubscribe('PLAY_NEXT');
			$("#player").unbind($.jPlayer.event.ended)
		},
	getInitialState(){
	return {
		musicList:MUSIC_LIST,
		currentMusicItem:MUSIC_LIST[0],
		repeatType: 'cycle'
	}
},

		playNext(type='next'){
			let index=this.findMusicIndex(this.state.currentMusicItem);
			let newIndex=null;
			let musicListLength=this.state.musicList.length;
			if(this.state.repeatType == 'once'){
				newIndex=index
			} else if(this.state.repeatType == 'random'){
				newIndex = randomRange(0, this.state.musicList.length - 1);
			while(newIndex == index) {
				newIndex = randomRange(0, this.state.musicList.length - 1);
			}
			}else{
				if(type=='next'){
				newIndex=(index+1)%musicListLength
			}else{
				newIndex=(index-1+musicListLength)%musicListLength
			};
			}
			let musicItem = this.state.musicList[newIndex];
			this.setState({
				currentMusitItem: musicItem
			});
			this.playMusic(musicItem);

		},
		findMusicIndex(musicItem){
			let index = this.state.musicList.indexOf(musicItem);
			return Math.max(0, index);
		},
		playMusic(musicItem){
			$('#player').jPlayer('setMedia',{
				mp3:musicItem.file
			}).jPlayer('play');
			this.setState({
				currentMusicItem:musicItem
			})
		},

render() {
	return (
		<div>
			<Header />
			{ React.cloneElement(this.props.children,this.state) }
		</div>
		)
}
});
let Root=React.createClass({
	render(){
		return(
		<Router history={hashHistory}>
			<Route path="/" component={App}>
				<IndexRoute component={Player}> </IndexRoute>
				<Route path="/list" component={MusicList}> </Route>
			</Route>
		</Router>
	)
	}
});
export default Root;