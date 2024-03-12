import {
  View,
  Text,
  Pressable,
  Keyboard,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { forwardRef, useEffect, useRef, useState } from "react";
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

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

interface MessageList {
  onTapToUndo?: () => void;
  ReactionList?: any;
  scrollToBottom?: () => void;
}

const MessageList = ({
  onTapToUndo,
  ReactionList,
  scrollToBottom,
}: MessageList) => {
  return (
    <MessageListContextProvider>
      <MessageListComponent
        ReactionList={ReactionList}
        onTapToUndo={onTapToUndo}
        scrollToBottomProp={scrollToBottom}
      />
    </MessageListContextProvider>
  );
};

const MessageListComponent = ({
  ReactionList,
  onTapToUndo,
  scrollToBottomProp,
}: any) => {
  const {
    conversations,
    selectedMessages,
    currentChatroomTopic,
    shimmerIsLoading,
    refInput,
    handleLongPress,
    handleClick,
  }: ChatroomContextValues = useChatroomContext();

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

  const { stateArr }: any = useAppSelector((state) => state.chatroom);
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
      ) : (
        <>
          {/* Chatroom Topic */}
          <ChatroomTopic />
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

              if (isFound && item?.id == currentChatroomTopic?.id) {
                isIncluded = true;
              }

              if (isReplyFound && item?.id === replyConversationId) {
                isIncluded = true;
              }

              return (
                <View>
                  {index < conversations?.length &&
                  conversations[index]?.date !==
                    conversations[index + 1]?.date ? (
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
                        ReactionListProp={ReactionList}
                        onTapToUndoProp={onTapToUndo}
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
