import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { copySelectedMessages } from "../../commonFuctions";
import ToastMessage from "../../components/ToastMessage";
import STYLES from "../../constants/Styles";
import { useAppDispatch } from "../../store";
import { styles } from "./styles";
import Clipboard from "@react-native-clipboard/clipboard";
import {
  CLEAR_CHATROOM_TOPIC,
  GET_CONVERSATIONS_SUCCESS,
  LONG_PRESSED,
  SELECTED_MESSAGES,
  SET_EDIT_MESSAGE,
  SET_IS_REPLY,
  SET_REPLY_MESSAGE,
} from "../../store/types/types";
import Layout from "../../constants/Layout";
import { EmojiKeyboard } from "rn-emoji-keyboard";
import { REPORT } from "../../constants/Screens";
import {
  WARNING_MSG_PRIVATE_CHATROOM,
  WARNING_MSG_PUBLIC_CHATROOM,
  VOICE_NOTE_TEXT,
} from "../../constants/Strings";
import ApproveDMRequestModal from "../../customModals/ApproveDMRequest";
import BlockDMRequestModal from "../../customModals/BlockDMRequest";
import RejectDMRequestModal from "../../customModals/RejectDMRequest";
import WarningMessageModal from "../../customModals/WarningMessage";
import { Keys } from "../../enums";
import { ChatroomType } from "../../enums";
import { ChatroomActions, Events } from "../../enums";
import TrackPlayer from "react-native-track-player";
import { LMChatAnalytics } from "../../analytics/LMChatAnalytics";
import { getConversationType } from "../../utils/analyticsUtils";
import MessageList from "../../components/MessageList";
import {
  ChatroomContextProvider,
  ChatroomContextValues,
  useChatroomContext,
} from "../../context/ChatroomContext";
import { Client } from "../../client";
import MessageInput from "../../components/MessageInput";
import ChatroomActionModal from "../../customModals/ChatroomActionModal";
import ReportActionModal from "../../customModals/ReportActionModal";
import MessageReactionModal from "../../customModals/MessageReactionModal";
import EmojiKeyboardModal from "../../customModals/EmojiKeyboardModal";
import ChatroomModals from "../../components/ChatroomModals";

interface ChatRoomProps {
  navigation: any;
  route: any;
}

const ChatRoom = ({ navigation, route }: ChatRoomProps) => {
  return (
    <ChatroomContextProvider navigation={navigation} route={route}>
      <ChatroomComponent />
    </ChatroomContextProvider>
  );
};

const ChatroomComponent = () => {
  const myClient = Client.myClient;
  const {
    navigation,
    conversations,
    chatroomID,
    user,
    chatroomDetails,
    chatroomDBDetails,
    isLongPress,
    selectedMessages,
    currentChatroomTopic,
    chatroomType,
    isToast,
    msg,
    chatroomFollowStatus,
    memberCanMessage,
    chatRequestState,
    chatroomName,
    chatroomProfile,
    filteredChatroomActions,
    modalVisible,
    refInput,

    setIsEditable,
    setReplyChatID,
    setIsToast,
    setModalVisible,
    setReportModalVisible,
  }: ChatroomContextValues = useChatroomContext();

  const dispatch = useAppDispatch();

  // Initial header of chatroom screen
  const setInitialHeader = () => {
    navigation.setOptions({
      title: "",
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity onPress={() => {}}>
            <Image
              source={require("../../assets/images/back_arrow3x.png")}
              style={styles.backBtn}
            />
          </TouchableOpacity>
          {!(Object.keys(chatroomDBDetails)?.length === 0) ? (
            <View style={styles.alignRow}>
              {chatroomType === ChatroomType.DMCHATROOM ? (
                <View style={styles.profile}>
                  <Image
                    source={
                      chatroomProfile
                        ? { uri: chatroomProfile }
                        : require("../../assets/images/default_pic.png")
                    }
                    style={styles.avatar}
                  />
                </View>
              ) : null}

              <View style={styles.chatRoomInfo}>
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={{
                    color: STYLES.$COLORS.FONT_PRIMARY,
                    fontSize: STYLES.$FONT_SIZES.LARGE,
                    fontFamily: STYLES.$FONT_TYPES.BOLD,
                    maxWidth: 150,
                  }}
                >
                  {chatroomName}
                </Text>
                {chatroomType !== ChatroomType.DMCHATROOM ? (
                  <Text
                    style={{
                      color: STYLES.$COLORS.MSG,
                      fontSize: STYLES.$FONT_SIZES.SMALL,
                      fontFamily: STYLES.$FONT_TYPES.LIGHT,
                    }}
                  >
                    {chatroomDetails?.participantCount != undefined
                      ? `${chatroomDetails?.participantCount} participants`
                      : ""}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      ),
      headerRight: () =>
        filteredChatroomActions?.length > 0 && (
          <View style={styles.headerRight}>
            {chatroomDetails ? (
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
              >
                <Image
                  source={require("../../assets/images/three_dots3x.png")}
                  style={styles.threeDots}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        ),
    });
  };

  // Selected header of chatroom screen
  const setSelectedHeader = () => {
    navigation.setOptions({
      title: "",
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity
            onPress={() => {
              dispatch({ type: SELECTED_MESSAGES, body: [] });
              dispatch({ type: LONG_PRESSED, body: false });
              setInitialHeader();
            }}
          >
            <Image
              source={require("../../assets/images/blue_back_arrow3x.png")}
              style={styles.selectedBackBtn}
            />
          </TouchableOpacity>
          <View style={styles.chatRoomInfo}>
            <Text
              style={{
                color: STYLES.$COLORS.FONT_PRIMARY,
                fontSize: STYLES.$FONT_SIZES.LARGE,
                fontFamily: STYLES.$FONT_TYPES.BOLD,
              }}
            >
              {selectedMessages?.length}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => {
        const len = selectedMessages?.length;
        const communityManagerState = 1;
        let userCanDeleteParticularMessageArr: any = [];
        let selectedMessagesIDArr: any = [];
        let isCopy = false;
        let showCopyIcon = true;
        let isDelete = false;
        const isFirstMessageDeleted = selectedMessages[0]?.deletedBy;
        let isSelectedMessageEditable = false;
        const selectedMessagesLength = selectedMessages?.length;

        //Logic to set isSelectedMessageEditable true/false, based on that we will show edit icon.
        if (selectedMessagesLength === 1) {
          if (
            selectedMessages[0]?.member?.id == user?.id &&
            !!selectedMessages[0]?.answer &&
            selectedMessages[0]?.deletedBy == null
          ) {
            isSelectedMessageEditable = true;
          } else {
            isSelectedMessageEditable = false;
          }
        } else {
          isSelectedMessageEditable = false;
        }

        //Logic to set isCopy, showCopyIcon, isDelete true/false, based on that we will show respective icons.
        for (let i = 0; i < selectedMessagesLength; i++) {
          if (selectedMessages[i]?.attachmentCount > 0) {
            showCopyIcon = false;
          }

          if (!selectedMessages[i]?.deletedBy && showCopyIcon) {
            isCopy = true;
          } else if (!showCopyIcon) {
            isCopy = false;
          }

          if (
            selectedMessages[i]?.member?.id == user?.id &&
            !selectedMessages[i]?.deletedBy
          ) {
            userCanDeleteParticularMessageArr = [
              ...userCanDeleteParticularMessageArr,
              true,
            ];
            selectedMessagesIDArr = [
              ...selectedMessagesIDArr,
              selectedMessages[i]?.id,
            ];
          } else {
            userCanDeleteParticularMessageArr = [
              ...userCanDeleteParticularMessageArr,
              false,
            ];
            selectedMessagesIDArr = [
              ...selectedMessagesIDArr,
              selectedMessages[i]?.id,
            ];
          }
        }

        if (userCanDeleteParticularMessageArr.includes(false)) {
          if (
            user?.state === communityManagerState &&
            userCanDeleteParticularMessageArr?.length === 1 &&
            !isFirstMessageDeleted
          ) {
            isDelete = true;
          } else {
            isDelete = false;
          }
        } else {
          isDelete = true;
        }
        return (
          <View style={styles.selectedHeadingContainer}>
            {len === 1 &&
              !isFirstMessageDeleted &&
              memberCanMessage &&
              chatroomFollowStatus && (
                <TouchableOpacity
                  onPress={() => {
                    if (len > 0) {
                      setReplyChatID(selectedMessages[0]?.id);
                      dispatch({ type: SET_IS_REPLY, body: { isReply: true } });
                      dispatch({
                        type: SET_REPLY_MESSAGE,
                        body: { replyMessage: selectedMessages[0] },
                      });
                      dispatch({ type: SELECTED_MESSAGES, body: [] });
                      dispatch({ type: LONG_PRESSED, body: false });
                      setInitialHeader();
                      refInput?.current.focus();
                      LMChatAnalytics.track(
                        Events.MESSAGE_REPLY,
                        new Map<string, string>([
                          [Keys.TYPE, getConversationType(selectedMessages[0])],
                          [Keys.CHATROOM_ID, chatroomID?.toString()],
                          [
                            Keys.REPLIED_TO_MEMBER_ID,
                            selectedMessages[0]?.member?.id,
                          ],
                          [
                            Keys.REPLIED_TO_MEMBER_STATE,
                            selectedMessages[0]?.member?.state,
                          ],
                          [Keys.REPLIED_TO_MESSAGE_ID, selectedMessages[0]?.id],
                        ])
                      );
                    }
                  }}
                >
                  <Image
                    source={require("../../assets/images/reply_icon3x.png")}
                    style={styles.threeDots}
                  />
                </TouchableOpacity>
              )}

            {len === 1 && !isFirstMessageDeleted && isCopy ? (
              <TouchableOpacity
                onPress={() => {
                  const output = copySelectedMessages(
                    selectedMessages,
                    chatroomID
                  );
                  Clipboard.setString(output);
                  dispatch({ type: SELECTED_MESSAGES, body: [] });
                  dispatch({ type: LONG_PRESSED, body: false });
                  setInitialHeader();
                }}
              >
                <Image
                  source={require("../../assets/images/copy_icon3x.png")}
                  style={styles.threeDots}
                />
              </TouchableOpacity>
            ) : len > 1 && isCopy ? (
              <TouchableOpacity
                onPress={() => {
                  const output = copySelectedMessages(
                    selectedMessages,
                    chatroomID
                  );
                  Clipboard.setString(output);
                  dispatch({ type: SELECTED_MESSAGES, body: [] });
                  dispatch({ type: LONG_PRESSED, body: false });
                  setInitialHeader();
                }}
              >
                <Image
                  source={require("../../assets/images/copy_icon3x.png")}
                  style={styles.threeDots}
                />
              </TouchableOpacity>
            ) : null}

            {isSelectedMessageEditable &&
            (chatroomType === ChatroomType.DMCHATROOM
              ? !!chatRequestState
              : true) ? ( // this condition checks in case of DM, chatRequestState != 0 && chatRequestState != null then only show edit Icon
              <TouchableOpacity
                onPress={() => {
                  setIsEditable(true);
                  dispatch({
                    type: SET_EDIT_MESSAGE,
                    body: { editConversation: { ...selectedMessages[0] } },
                  });
                  dispatch({ type: SELECTED_MESSAGES, body: [] });
                  refInput.current.focus();
                }}
              >
                <Image
                  source={require("../../assets/images/edit_icon3x.png")}
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            ) : null}
            {isDelete && (
              <TouchableOpacity
                onPress={async () => {
                  const res = await myClient
                    .deleteConversations({
                      conversationIds: selectedMessagesIDArr,
                      reason: "none",
                    })
                    .then(async () => {
                      dispatch({ type: SELECTED_MESSAGES, body: [] });
                      dispatch({ type: LONG_PRESSED, body: false });
                      let updatedConversations;
                      for (let i = 0; i < selectedMessagesIDArr.length; i++) {
                        LMChatAnalytics.track(
                          Events.MESSAGE_DELETED,
                          new Map<string, string>([
                            [
                              Keys.TYPE,
                              getConversationType(selectedMessages[i]),
                            ],
                            [Keys.CHATROOM_ID, chatroomID?.toString()],
                          ])
                        );
                        if (
                          selectedMessagesIDArr[i] == currentChatroomTopic?.id
                        ) {
                          dispatch({
                            type: CLEAR_CHATROOM_TOPIC,
                          });
                          updatedConversations =
                            await myClient?.deleteConversation(
                              selectedMessagesIDArr[i],
                              user,
                              conversations,
                              true,
                              chatroomID?.toString()
                            );
                        } else {
                          updatedConversations =
                            await myClient?.deleteConversation(
                              selectedMessagesIDArr[i],
                              user,
                              conversations,
                              false,
                              chatroomID?.toString()
                            );
                        }
                        // to stop audio player if we delete the message
                        const conversation: any =
                          await myClient.getConversation(
                            selectedMessagesIDArr[i]
                          );
                        if (
                          conversation[0]?.attachments[0]?.type ==
                          VOICE_NOTE_TEXT
                        ) {
                          await TrackPlayer.reset();
                        }
                      }
                      dispatch({
                        type: GET_CONVERSATIONS_SUCCESS,
                        body: { conversations: updatedConversations },
                      });
                      setInitialHeader();
                    })
                    .catch(() => {
                      Alert.alert("Delete message failed");
                    });
                }}
              >
                <Image
                  source={require("../../assets/images/delete_icon3x.png")}
                  style={styles.threeDots}
                />
              </TouchableOpacity>
            )}
            {len === 1 && !isFirstMessageDeleted && (
              <TouchableOpacity
                onPress={() => {
                  setReportModalVisible(true);
                }}
              >
                <Image
                  source={require("../../assets/images/three_dots3x.png")}
                  style={styles.threeDots}
                />
              </TouchableOpacity>
            )}
          </View>
        );
      },
    });
  };

  // this useEffect update initial header when we get chatroomDetails.
  useEffect(() => {
    setInitialHeader();
  }, [chatroomDBDetails, chatroomDetails]);

  // this useEffect update headers when we longPress or update selectedMessages array.
  useEffect(() => {
    if (selectedMessages?.length === 0) {
      setInitialHeader();
    } else if (isLongPress) {
      setSelectedHeader();
    }
  }, [isLongPress, selectedMessages]);

  return (
    <View style={styles.container}>
      {/* Message List */}
      <MessageList />

      {/* Input Box Flow */}
      <MessageInput />

      {/* Chatroom Modals */}
      <ChatroomModals />

      {/* Toast Message Flow inside Chatroom */}
      <ToastMessage
        message={msg}
        isToast={isToast}
        onDismiss={() => {
          setIsToast(false);
        }}
      />
    </View>
  );
};

export { ChatRoom };
