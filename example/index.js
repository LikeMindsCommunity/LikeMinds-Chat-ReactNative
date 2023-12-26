/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';
import {initMyClient} from 'likeminds_chat_reactnative_integration/ChatSX/setup';

const myClient = initMyClient('c9a0a9cc-4844-4088-8fda-3146c61979a8');

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => playbackService);

export {myClient};
