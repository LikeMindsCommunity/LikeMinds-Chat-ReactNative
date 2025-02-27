import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { styles } from "../AttachmentConversations/styles";
import Layout from "../../constants/Layout";
import { convertSecondsToTime } from "../../commonFuctions";
import { FAILED, SUCCESS } from "../../constants/Strings";
import STYLES from "../../constants/Styles";
import { onPausePlay, onResumePlay, startPlay, stopPlay } from "../../audio";
import { LMChatAnalytics } from "../../analytics/LMChatAnalytics";
import { Events, Keys } from "../../enums";
import ReactNativeBlobUtil from "react-native-blob-util";
import { Base64 } from "../../awsExports";
import { onSeekTo } from "../../audio/Controls";
import { useChatroomContext } from "../../context/ChatroomContext";
import { useMessageContext } from "../../context/MessageContext";
import AudioPlayer from "../../optionalDependecies/AudioPlayer";
import Slider from "../../optionalDependecies/Slider";

const VoiceNoteView = () => {
  const { item, showRetry, setShowRetry, setRetryUploadInProgress, retryUploadInProgress } = useMessageContext();
  const { handleFileUpload, onRetryButtonClicked } = useChatroomContext();
  const [isVoiceNotePlaying, setIsVoiceNotePlaying] = useState(false);
  const progress = AudioPlayer ? AudioPlayer?.useProgress() : null;
  const activeTrack = AudioPlayer ? AudioPlayer?.useActiveTrack() : null;

  let firstAttachment = item?.attachments[0];
  const chatBubbleStyles = STYLES.$CHAT_BUBBLE_STYLE;
  const playPauseBoxChatBubble = chatBubbleStyles?.playPauseBoxIcon;
  const voiceNoteSlider = chatBubbleStyles?.voiceNoteSlider;
  const isAudioActive =
    activeTrack?.externalUrl === firstAttachment?.url ? true : false;

  // to stop the audio if move out of the chatroom
  useEffect(() => {
    if (progress.duration <= progress.position) {
      AudioPlayer ? AudioPlayer?.default?.reset() : null;
      setIsVoiceNotePlaying(false);
    }
  }, [progress]);

  // to handle start player
  const handleStartPlay = async (path: string) => {
    if (Platform.OS === "ios") {
      const fileExtension = "m4a";

      const dir = ReactNativeBlobUtil.fs.dirs.DocumentDir;
      const localPath = `${dir}/${Base64.btoa(path)}.${fileExtension}`;
      ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: fileExtension,
        path: localPath,
      })
        .fetch("GET", path)
        .then(async (res) => {
          const internalUrl = `file://${res.path()}`;
          await startPlay(internalUrl, path);
          setIsVoiceNotePlaying(true);
        });
    } else {
      await startPlay(path, path);
      setIsVoiceNotePlaying(true);
    }
    LMChatAnalytics.track(
      Events.VOICE_NOTE_PLAYED,
      new Map<string, string>([
        [Keys.CHATROOM_TYPE, item?.state?.toString()],
        [Keys.CHATROOM_ID, item?.chatroomId?.toString()],
        [Keys.MESSAGE_ID, item?.id?.toString()],
      ])
    );
  };

  // to pause playing audio recording
  const handleOnPausePlay = async () => {
    const value = await onPausePlay();
    setIsVoiceNotePlaying(value);
  };

  // to resume playing audio recording
  const handleOnResumePlay = async () => {
    const value = await onResumePlay();
    setIsVoiceNotePlaying(value);
  };

  // to seek player to the provided time
  const handleOnSeekTo = async (value: number) => {
    const secondsToSeek = value * (firstAttachment?.metaRO?.duration / 100);
    await onSeekTo(secondsToSeek);
  };


  return (
    <View>
      <View style={styles.voiceNotesParentBox}>
        {isVoiceNotePlaying && isAudioActive ? (
          <TouchableOpacity
            onPress={() => {
              handleOnPausePlay();
            }}
            style={[styles.playPauseBox, { ...playPauseBoxChatBubble }]}
          >
            <Image
              source={require("../../assets/images/pause_icon3x.png")}
              style={styles.playPauseImage}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (progress.position > 0 && isAudioActive) {
                handleOnResumePlay();
              } else {
                handleStartPlay(firstAttachment?.url);
              }
            }}
            style={[styles.playPauseBox, { ...playPauseBoxChatBubble }]}
          >
            <Image
              style={styles.playPauseImage}
              source={require("../../assets/images/play_icon3x.png")}
            />
          </TouchableOpacity>
        )}
        <View
          style={{
            flex: 1,
            marginTop: Platform.OS === "ios" ? 0 : Layout.normalize(10),
            gap: Layout.normalize(3),
          }}
        >
          <Slider
            minimumValue={0}
            maximumValue={100}
            step={0}
            value={
              isAudioActive
                ? progress.position / progress.duration
                  ? (progress.position / progress.duration) * 100
                  : 0
                : 0
            }
            minimumTrackTintColor={
              voiceNoteSlider?.minimumTrackTintColor
                ? voiceNoteSlider.minimumTrackTintColor
                : "#ffad31"
            }
            maximumTrackTintColor="grey"
            tapToSeek={true}
            onSlidingComplete={handleOnSeekTo}
            thumbTintColor={
              voiceNoteSlider?.thumbTintColor
                ? voiceNoteSlider.thumbTintColor
                : "#ffad31"
            }
          />
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              marginLeft: Layout.normalize(10),
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/images/mic_icon3x.png")}
              style={[styles.smallIcon, { tintColor: "grey" }]}
            />
            {isVoiceNotePlaying ? (
              <Text style={styles.recordTitle}>
                {!isAudioActive && !!progress.position
                  ? convertSecondsToTime(0)
                  : convertSecondsToTime(Math.floor(progress.position))}
              </Text>
            ) : (
              <Text style={styles.recordTitle}>
                {convertSecondsToTime(
                  Math.floor(firstAttachment?.metaRO?.duration)
                )}
              </Text>
            )}
          </View>
        </View>
      </View>
      {(item?.isInProgress === SUCCESS && !showRetry) || retryUploadInProgress ? (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
        </View>
      ) : showRetry ? (
        <View style={styles.uploadingIndicator}>
          <Pressable
            onPress={() => {
              onRetryButtonClicked(item, setShowRetry, setRetryUploadInProgress, retryUploadInProgress)
            }}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.retryButton,
            ]}
          >
            <Image
              style={styles.retryIcon}
              source={require("../../assets/images/retry_file_upload3x.png")}
            />
            <Text style={styles.retryText}>RETRY</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

export default VoiceNoteView;
