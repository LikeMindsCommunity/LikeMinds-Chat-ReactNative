import {
  View,
  Text,
  Pressable,
  Keyboard,
  TouchableOpacity,
  Image,
  Platform,
  SafeAreaView,
} from "react-native";
import React, {
  ReactNode,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FlashList } from "@shopify/flash-list";
import Swipeable from "../Swipeable";
import Messages from "../Messages";
import { useAppDispatch, useAppSelector } from "../../store";
import STYLES from "../../constants/Styles";
import { SET_POSITION } from "../../store/types/types";
import { styles } from "./styles";
import {
  ChatroomContextValues,
  useChatroomContext,
} from "../../context/ChatroomContext";
import LinearGradient from "react-native-linear-gradient";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import {
  MessageListContextProvider,
  MessageListContextValues,
  useMessageListContext,
} from "../../context/MessageListContext";
import ChatroomTopic from "../ChatroomTopic";
import Layout from "../../constants/Layout";
import { VOICE_NOTE_TEXT } from "../../constants/Strings";
import AudioPlayer from "../../optionalDependecies/AudioPlayer";
import { Conversation } from "@likeminds.community/chat-rn/dist/shared/responseModels/Conversation";
import { isOtherUserAIChatbot } from "../../utils/chatroomUtils";

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

interface MessageList {
  onTapToUndo?: () => void;
  scrollToBottom?: () => void;
  showChatroomTopic?: boolean;
  customWidgetMessageView?: (message: Conversation) => React.ReactElement;
}

const MessageList = ({
  onTapToUndo,
  scrollToBottom,
  showChatroomTopic,
  customWidgetMessageView
}: MessageList) => {
  return (
    <MessageListComponent
      onTapToUndo={onTapToUndo}
      scrollToBottomProp={scrollToBottom}
      showChatroomTopic={showChatroomTopic}
      customWidgetMessageView={customWidgetMessageView}
    />
  );
};

interface MessageListComponent {
  onTapToUndo?: () => void;
  scrollToBottomProp?: () => void;
  showChatroomTopic?: boolean;
  customWidgetMessageView?: (message: Conversation) => React.ReactElement;
}

const MessageListComponent = ({
  onTapToUndo,
  scrollToBottomProp,
  showChatroomTopic,
  customWidgetMessageView,
}: MessageListComponent) => {
  const {
    conversations,
    selectedMessages,
    currentChatroomTopic,
    shimmerIsLoading,
    refInput,
    searchedConversation,
    handleLongPress,
    handleClick,
    shimmerVisibleForChatbot,
    user,
    chatroomDBDetails,
  }: ChatroomContextValues = useChatroomContext();


  const isOtherUserChatbot = useMemo(() => {
    return isOtherUserAIChatbot(chatroomDBDetails, user);
  }, [user, chatroomDBDetails])


  const {
    flatlistRef,
    isFound,
    isReplyFound,
    setIsFound,
    replyConversationId,
    handleOnScroll,
    renderFooter,
    setKeyboardVisible,
    setIsReplyFound,
    setReplyConversationId,
    keyboardVisible,
    isScrollingUp,
    scrollToBottom,
  }: MessageListContextValues = useMessageListContext();
  const chatBubbleStyles = STYLES.$CHAT_BUBBLE_STYLE;

  //styling props
  const selectedBackgroundColor =
    chatBubbleStyles?.selectedMessagesBackgroundColor;
  const dateStateMessage = chatBubbleStyles?.dateStateMessage;
  const stateMessagesBackgroundColor =
    chatBubbleStyles?.stateMessagesTextStyles?.backgroundColor;

  const SELECTED_BACKGROUND_COLOR = selectedBackgroundColor
    ? selectedBackgroundColor
    : STYLES.$COLORS.SELECTED_BLUE;

  //styling props ends here

  const _keyboardDidShow = () => {
    setKeyboardVisible(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardVisible(false);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      _keyboardDidShow
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      _keyboardDidHide
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // This useEffect is used to highlight the chatroom topic conversation for 1 sec on scrolling to it
  useEffect(() => {
    if (isFound) {
      setTimeout(() => {
        setIsFound(false);
      }, 1000);
    }
  }, [isFound]);

  useEffect(() => {
    if (isReplyFound) {
      setTimeout(() => {
        setIsReplyFound(false);
        setReplyConversationId("");
      }, 1000);
    }
  }, [isReplyFound]);

  {
    /* `{? = then}`, `{: = else}`  */
  }
  {
    /*
        if DM ?
          if userID !=== chatroomWithUserID ?
            chatroomWithUserName
          : memberName
        : chatroomHeaderName
    */
  }

  const { stateArr, shimmerVisible }: any = useAppSelector((state) => state.chatroom);
  const { uploadingFilesMessages }: any = useAppSelector(
    (state) => state.upload
  );
  const dispatch = useAppDispatch();

  return (
    <>
      {/* loading shimmer */}
      {shimmerIsLoading ? (
        <View style={{ marginTop: 10 }}>
          <View
            style={{
              backgroundColor: "#e8e8e877",
              width: 200,
              paddingLeft: 8,
              paddingVertical: 15,
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}
          >
            <ShimmerPlaceHolder
              style={{ width: 150, height: 10, borderRadius: 5 }}
            />
            <ShimmerPlaceHolder
              style={{
                width: 120,
                height: 10,
                marginTop: 10,
                borderRadius: 5,
              }}
            />
          </View>

          <View
            style={{
              backgroundColor: "#e8e8e877",
              alignSelf: "flex-end",
              width: 200,
              paddingLeft: 8,
              paddingVertical: 15,
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              marginTop: 10,
            }}
          >
            <ShimmerPlaceHolder
              style={{ width: 150, height: 10, borderRadius: 5 }}
            />
            <ShimmerPlaceHolder
              style={{
                width: 120,
                height: 10,
                marginTop: 10,
                borderRadius: 5,
              }}
            />
          </View>

          <View
            style={{
              backgroundColor: "#e8e8e877",
              width: 200,
              paddingLeft: 8,
              paddingVertical: 15,
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              borderBottomRightRadius: 12,
              marginTop: 10,
            }}
          >
            <ShimmerPlaceHolder
              style={{ width: 150, height: 10, borderRadius: 5 }}
            />
            <ShimmerPlaceHolder
              style={{
                width: 120,
                height: 10,
                marginTop: 10,
                borderRadius: 5,
              }}
            />
          </View>

          <View
            style={{
              backgroundColor: "#e8e8e877",
              alignSelf: "flex-end",
              width: 200,
              paddingLeft: 8,
              paddingVertical: 15,
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              marginTop: 10,
            }}
          >
            <ShimmerPlaceHolder
              style={{ width: 150, height: 10, borderRadius: 5 }}
            />
            <ShimmerPlaceHolder
              style={{
                width: 120,
                height: 10,
                marginTop: 10,
                borderRadius: 5,
              }}
            />
          </View>
        </View>
      ) : showChatroomTopic ? (
        <>
          {/* Chatroom Topic */}
          <ChatroomTopic />
          {/* List of messages */}
          <FlashList
            ref={flatlistRef}
            data={conversations}
            keyExtractor={(item: any, index) => {
              const isArray = Array.isArray(item);
              return isArray ? `${index}` : item?.id ? `${item?.id}` : `${index}`;
            }}
            extraData={{
              value: [
                selectedMessages,
                uploadingFilesMessages,
                stateArr,
                conversations,
                shimmerVisible,
                shimmerVisibleForChatbot
              ],
            }}
            estimatedItemSize={250}
            renderItem={({ item: value, index }: any) => {

              if (Object.keys(value ?? {})?.length <= 3) {
                return <></>
              }

              // return shimmer component if message is just a shimmer
              if (isOtherUserChatbot && value?.isShimmer) {
                return (
                  <>
                    <View
                      style={{
                        width: 250,
                        paddingLeft: 8,
                        paddingVertical: 15,
                        borderTopRightRadius: 12,
                        borderTopLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        style={{ width: Layout.normalize(40), height: Layout.normalize(40), borderRadius: 100, marginRight: -10, backgroundColor: '#D0D0D0' }}
                        source={chatroomDBDetails?.member?.imageUrl ? {uri: chatroomDBDetails?.member?.imageUrl } : require("../../assets/images/default_pic.png")}
                      />
                      <View>

                      </View>
                      <Image source={require("../../assets/images/tail_3x.png")}
                        style={{
                          height: 20, width: 20,
                          alignSelf: 'flex-end', top: -5, left: 15
                        }}
                      />
                      <View style={{
                        padding: 10,
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        borderRadius: 14
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          gap: 6
                        }}>
                          <ShimmerPlaceHolder
                            style={{ width: 10, height: 10, borderRadius: 5 }}
                          />
                          <ShimmerPlaceHolder
                            style={{ width: 10, height: 10, borderRadius: 5 }}
                          />
                          <ShimmerPlaceHolder
                            style={{ width: 10, height: 10, borderRadius: 5 }}
                          />
                        </View>
                      </View>
                    </View>
                  </>
                )
              }

              let hideDate = false;
              const uploadingFilesMessagesIDArr = Object.keys(
                uploadingFilesMessages
              );
              let item = { ...value };
              if (uploadingFilesMessagesIDArr.includes(value?.id?.toString())) {
                item = uploadingFilesMessages[value?.id];
              }

              const isStateIncluded = stateArr.includes(item?.state);

              let isIncluded = selectedMessages.some(
                (val: any) => val?.id === item?.id && !isStateIncluded
              );

              if (isFound && item?.id == searchedConversation?.id) {
                isIncluded = true;
              } else if (isFound && item?.id == currentChatroomTopic?.id) {
                isIncluded = true;
              }

              if (isReplyFound && item?.id === replyConversationId) {
                isIncluded = true;
              }

              if ((conversations[index])?.date !== (conversations[index + 1])?.date) {
                if ((conversations[index])?.attachments != undefined && ((conversations[index])?.attachments[0])?.type == VOICE_NOTE_TEXT && AudioPlayer == undefined) {
                  hideDate = true;
                }
              }

              return (
                <View>
                  {index < conversations?.length && ((conversations[index])?.date !== undefined && (conversations[index + 1])?.date !== undefined) && 
                    conversations[index]?.date !==
                    conversations[index + 1]?.date && !hideDate && !(shimmerVisible || shimmerVisibleForChatbot) ? (
                    <View style={[styles.statusMessage]}>
                      <Text
                        style={{
                          color: STYLES.$COLORS.FONT_PRIMARY,
                          fontSize: STYLES.$FONT_SIZES.SMALL,
                          fontFamily: STYLES.$FONT_TYPES.LIGHT,
                        }}
                      >
                        {item?.date}
                      </Text>
                    </View>
                  ) : null}

                  <Swipeable
                    onFocusKeyboard={() => {
                      refInput?.current?.focus();
                    }}
                    item={item}
                    isStateIncluded={isStateIncluded}
                  >
                    <Pressable
                      onLongPress={(event) => {
                        const { pageX, pageY } = event.nativeEvent;
                        dispatch({
                          type: SET_POSITION,
                          body: { pageX: pageX, pageY: pageY },
                        });
                        handleLongPress(
                          isStateIncluded,
                          isIncluded,
                          item,
                          selectedMessages
                        );
                      }}
                      delayLongPress={200}
                      onPress={function (event) {
                        const { pageX, pageY } = event.nativeEvent;
                        dispatch({
                          type: SET_POSITION,
                          body: { pageX: pageX, pageY: pageY },
                        });
                        handleClick(
                          isStateIncluded,
                          isIncluded,
                          item,
                          false,
                          selectedMessages
                        );
                      }}
                      style={
                        isIncluded
                          ? selectedBackgroundColor
                            ? { backgroundColor: SELECTED_BACKGROUND_COLOR }
                            : {
                              backgroundColor:
                                STYLES.$COLORS.SELECTED_CHAT_BUBBLE,
                            }
                          : null
                      }
                    >
                      <Messages
                        isIncluded={isIncluded}
                        item={item}
                        isStateIncluded={isStateIncluded}
                        index={index}
                        onTapToUndoProp={onTapToUndo}
                        customWidgetMessageView={customWidgetMessageView}
                      />
                    </Pressable>
                  </Swipeable>
                </View>
              );
            }}
            onScroll={handleOnScroll}
            ListHeaderComponent={renderFooter}
            ListFooterComponent={renderFooter}
            keyboardShouldPersistTaps={"handled"}
            inverted
          />
          {isScrollingUp && (
            <SafeAreaView style={{zIndex: 10}}>
              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  {
                    bottom: Layout.normalize(-50)
                  },
                ]}
                onPress={scrollToBottomProp ? scrollToBottomProp : scrollToBottom}
              >
                <Image
                  source={require("../../assets/images/scrollDown.png")}
                  style={styles.arrowButtonImage}
                />
              </TouchableOpacity>
            </SafeAreaView>
          )}
        </>
      ) : (
        <>
          {/* List of messages */}
          <FlashList
            ref={flatlistRef}
            data={conversations}
            keyExtractor={(item: any, index) => {
              const isArray = Array.isArray(item);
              return isArray ? `${index}` : `${item?.id}`;
            }}
            extraData={{
              value: [
                selectedMessages,
                uploadingFilesMessages,
                stateArr,
                conversations,
              ],
            }}
            estimatedItemSize={250}
            renderItem={({ item: value, index }: any) => {
              let hideDate = false;
              const uploadingFilesMessagesIDArr = Object.keys(
                uploadingFilesMessages
              );
              let item = { ...value };
              if (uploadingFilesMessagesIDArr.includes(value?.id?.toString())) {
                item = uploadingFilesMessages[value?.id];
              }

              const isStateIncluded = stateArr.includes(item?.state);

              let isIncluded = selectedMessages.some(
                (val: any) => val?.id === item?.id && !isStateIncluded
              );

              if (isFound && item?.id == searchedConversation?.id) {
                isIncluded = true;
              } else if (isFound && item?.id == currentChatroomTopic?.id) {
                isIncluded = true;
              }

              if (isReplyFound && item?.id === replyConversationId) {
                isIncluded = true;
              }

              if ((conversations[index])?.date !== (conversations[index + 1])?.date) {
                if ((conversations[index])?.attachments != undefined && ((conversations[index])?.attachments[0])?.type == VOICE_NOTE_TEXT && AudioPlayer == undefined) {
                  hideDate = true;
                }
              }

              return (
                <View>
                  {index < conversations?.length &&
                    conversations[index]?.date !==
                    conversations[index + 1]?.date && !hideDate ? (
                    <View style={[styles.statusMessage]}>
                      <Text
                        style={{
                          color: STYLES.$COLORS.FONT_PRIMARY,
                          fontSize: STYLES.$FONT_SIZES.SMALL,
                          fontFamily: STYLES.$FONT_TYPES.LIGHT,
                        }}
                      >
                        {item?.date}
                      </Text>
                    </View>
                  ) : null}

                  <Swipeable
                    onFocusKeyboard={() => {
                      refInput?.current?.focus();
                    }}
                    item={item}
                    isStateIncluded={isStateIncluded}
                  >
                    <Pressable
                      onLongPress={(event) => {
                        const { pageX, pageY } = event.nativeEvent;
                        dispatch({
                          type: SET_POSITION,
                          body: { pageX: pageX, pageY: pageY },
                        });
                        handleLongPress(
                          isStateIncluded,
                          isIncluded,
                          item,
                          selectedMessages
                        );
                      }}
                      delayLongPress={200}
                      onPress={function (event) {
                        const { pageX, pageY } = event.nativeEvent;
                        dispatch({
                          type: SET_POSITION,
                          body: { pageX: pageX, pageY: pageY },
                        });
                        handleClick(
                          isStateIncluded,
                          isIncluded,
                          item,
                          false,
                          selectedMessages
                        );
                      }}
                      style={
                        isIncluded
                          ? selectedBackgroundColor
                            ? { backgroundColor: SELECTED_BACKGROUND_COLOR }
                            : {
                              backgroundColor:
                                STYLES.$COLORS.SELECTED_CHAT_BUBBLE,
                            }
                          : null
                      }
                    >
                      <Messages
                        isIncluded={isIncluded}
                        item={item}
                        isStateIncluded={isStateIncluded}
                        index={index}
                        onTapToUndoProp={onTapToUndo}
                        customWidgetMessageView={customWidgetMessageView}
                      />
                    </Pressable>
                  </Swipeable>
                </View>
              );
            }}
            onScroll={handleOnScroll}
            ListHeaderComponent={renderFooter}
            ListFooterComponent={renderFooter}
            keyboardShouldPersistTaps={"handled"}
            inverted
          />
          {isScrollingUp && (
            <TouchableOpacity
              style={[
                styles.arrowButton,
                {
                  bottom: keyboardVisible
                    ? Layout.normalize(55)
                    : Layout.normalize(20),
                },
              ]}
              onPress={scrollToBottomProp ? scrollToBottomProp : scrollToBottom}
            >
              <Image
                source={require("../../assets/images/scrollDown.png")}
                style={styles.arrowButtonImage}
              />
            </TouchableOpacity>
          )}
        </>
      )}
    </>
  );
};

export default MessageList;
