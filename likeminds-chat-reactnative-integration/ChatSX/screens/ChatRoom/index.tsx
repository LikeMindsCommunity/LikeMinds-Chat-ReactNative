import {
  CommonActions,
  StackActions,
  useIsFocused,
} from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Image,
  Pressable,
  Alert,
  Modal,
  BackHandler,
  Platform,
  LogBox,
  AppState,
  ImageBackground,
} from "react-native";
import { Image as CompressedImage } from "react-native-compressor";
import { SyncConversationRequest } from "@likeminds.community/chat-rn";
import {
  copySelectedMessages,
  fetchResourceFromURI,
  formatTime,
} from "../../commonFuctions";
import MessageInputBox from "../../components/InputBox";
import ToastMessage from "../../components/ToastMessage";
import STYLES from "../../constants/Styles";
import { useAppDispatch, useAppSelector } from "../../store";
import { getChatroom } from "../../store/actions/chatroom";
import { styles } from "./styles";
import Clipboard from "@react-native-clipboard/clipboard";
import { DataSnapshot, onValue, ref } from "firebase/database";
import { initAPI } from "../../store/actions/homefeed";
import {
  ACCEPT_INVITE_SUCCESS,
  ADD_STATE_MESSAGE,
  CLEAR_CHATROOM_CONVERSATION,
  CLEAR_CHATROOM_DETAILS,
  CLEAR_CHATROOM_TOPIC,
  CLEAR_FILE_UPLOADING_MESSAGES,
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  CLEAR_SELECTED_MESSAGES,
  GET_CHATROOM_ACTIONS_SUCCESS,
  GET_CHATROOM_DB_SUCCESS,
  GET_CONVERSATIONS_SUCCESS,
  LONG_PRESSED,
  REACTION_SENT,
  REJECT_INVITE_SUCCESS,
  SELECTED_MESSAGES,
  SET_CHATROOM_CREATOR,
  SET_CHATROOM_TOPIC,
  SET_DM_PAGE,
  SET_EDIT_MESSAGE,
  SET_EXPLORE_FEED_PAGE,
  SET_FILE_UPLOADING_MESSAGES,
  SET_IS_REPLY,
  SET_PAGE,
  SET_REPLY_MESSAGE,
  SET_TEMP_STATE_MESSAGE,
  SHOW_TOAST,
  UPDATE_CHAT_REQUEST_STATE,
} from "../../store/types/types";
import { getExploreFeedData } from "../../store/actions/explorefeed";
import Layout from "../../constants/Layout";
import { EmojiKeyboard } from "rn-emoji-keyboard";
import {
  CHATROOM,
  EXPLORE_FEED,
  HOMEFEED,
  REPORT,
  VIEW_PARTICIPANTS,
} from "../../constants/Screens";
import {
  COMMUNITY_MANAGER_DISABLED_CHAT,
  DM_REQUEST_SENT_MESSAGE,
  JOIN_CHATROOM,
  JOIN_CHATROOM_MESSAGE,
  REJECT_INVITATION,
  REJECT_INVITATION_MESSAGE,
  REQUEST_SENT,
  CANCEL_BUTTON,
  CONFIRM_BUTTON,
  APPROVE_BUTTON,
  REJECT_BUTTON,
  FAILED,
  VIDEO_TEXT,
  PDF_TEXT,
  AUDIO_TEXT,
  IMAGE_TEXT,
  SUCCESS,
  REQUEST_DM_LIMIT,
  WARNING_MSG_PRIVATE_CHATROOM,
  WARNING_MSG_PUBLIC_CHATROOM,
  VOICE_NOTE_TEXT,
} from "../../constants/Strings";
import { DM_ALL_MEMBERS } from "../../constants/Screens";
import ApproveDMRequestModal from "../../customModals/ApproveDMRequest";
import BlockDMRequestModal from "../../customModals/BlockDMRequest";
import RejectDMRequestModal from "../../customModals/RejectDMRequest";
import { BUCKET, POOL_ID, REGION } from "../../awsExports";
import { CognitoIdentityCredentials, S3 } from "aws-sdk";
import AWS from "aws-sdk";
import WarningMessageModal from "../../customModals/WarningMessage";
import LinearGradient from "react-native-linear-gradient";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import {
  ChatroomChatRequestState,
  Keys,
  MemberState,
  Sources,
} from "../../enums";
import { ChatroomType } from "../../enums";
import { onShare } from "../../shareUtils";
import { ChatroomActions, Events } from "../../enums";
import TrackPlayer from "react-native-track-player";
import { LMChatAnalytics } from "../../analytics/LMChatAnalytics";
import {
  getChatroomType,
  getConversationType,
} from "../../utils/analyticsUtils";
import { createTemporaryStateMessage } from "../../utils/chatroomUtils";
import { GetConversationsRequestBuilder } from "@likeminds.community/chat-rn";
import { Credentials } from "../../credentials";
import MessageList from "../../components/MessageList";
import { Client } from "../../client";
import { CallBack } from "../../callBacks/callBackClass";
import { NavigateToGroupDetailsParams } from "../../callBacks/type";

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

interface Data {
  id: string;
  title: string;
}

interface ChatRoomProps {
  navigation: any;
  route: any;
}

interface UploadResource {
  selectedImages: any;
  conversationID: any;
  chatroomID: any;
  selectedFilesToUpload: any;
  uploadingFilesMessages: any;
  isRetry: boolean;
}

const ChatRoom = ({ navigation, route }: ChatRoomProps) => {
  const myClient = Client.myClient;

  const [currentChatroomId, setCurrentChatroomId] = useState("");

  const {
    chatroomID,
    previousChatroomID,
    navigationFromNotification,
    deepLinking,
    announcementRoomId,
    backIconPath,
    gender,
    backgroundImage,
  } = route.params;

  const ChatroomTabNavigator = route?.params?.tabNavigator;

  const chatroomHeaderStyles = STYLES.$CHATROOM_HEADER_STYLE;
  const chatroomNameHeaderStyle = chatroomHeaderStyles?.chatroomNameHeaderStyle;
  const chatroomSubHeaderStyle = chatroomHeaderStyles?.chatroomSubHeaderStyle;
  const chatroomSelectedHeaderIcons =
    chatroomHeaderStyles?.chatroomSelectedHeaderIcons;

  useEffect(() => {
    ChatroomTabNavigator && setCurrentChatroomId(chatroomID);
  }, []);

  const lmChatInterface = CallBack.lmChatInterface;

  const flatlistRef = useRef<any>(null);
  const refInput = useRef<any>();

  const db = myClient?.firebaseInstance();

  const [replyChatID, setReplyChatID] = useState<number>();

  const [modalVisible, setModalVisible] = useState(false);
  const [isToast, setIsToast] = useState(false);
  const [msg, setMsg] = useState("");
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [isReact, setIsReact] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [DMApproveAlertModalVisible, setDMApproveAlertModalVisible] =
    useState(false);
  const [DMRejectAlertModalVisible, setDMRejectAlertModalVisible] =
    useState(false);
  const [DMBlockAlertModalVisible, setDMBlockAlertModalVisible] =
    useState(false);
  const [showDM, setShowDM] = useState<any>(null);
  const [showList, setShowList] = useState<any>(null);
  const [isMessagePrivately, setIsMessagePrivately] = useState<any>(false);
  const [isEditable, setIsEditable] = useState<any>(false);
  const [isWarningMessageModalState, setIsWarningMessageModalState] =
    useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [shimmerIsLoading, setShimmerIsLoading] = useState(true);
  const [isRealmDataPresent, setIsRealmDataPresent] = useState(false);

  const reactionArr = ["❤️", "😂", "😮", "😢", "😠", "👍"];
  const isFocused = useIsFocused();

  const dispatch = useAppDispatch();
  const {
    chatroomDetails,
    chatroomDBDetails,
    isLongPress,
    selectedMessages,
    stateArr,
    position,
    chatroomCreator,
    currentChatroomTopic,
    temporaryStateMessage,
  }: any = useAppSelector((state) => state.chatroom);
  const { user, community, memberRights } = useAppSelector(
    (state) => state.homefeed
  );

  const { conversations = [] }: any = useAppSelector((state) => state.chatroom);

  const { uploadingFilesMessages }: any = useAppSelector(
    (state) => state.upload
  );

  const INITIAL_SYNC_PAGE = 1;
  const PAGE_SIZE = 200;

  const chatroomType = chatroomDBDetails?.type;
  const chatroomFollowStatus = chatroomDBDetails?.followStatus;
  const memberCanMessage = chatroomDBDetails?.memberCanMessage;
  const chatroomWithUser = chatroomDBDetails?.chatroomWithUser;
  const chatRequestState = chatroomDBDetails?.chatRequestState;
  const chatroomDBDetailsLength = Object.keys(chatroomDBDetails)?.length;
  const [isChatroomTopic, setIsChatroomTopic] = useState(false);

  AWS.config.update({
    region: REGION, // Replace with your AWS region, e.g., 'us-east-1'
    credentials: new CognitoIdentityCredentials({
      IdentityPoolId: POOL_ID, // Replace with your Identity Pool ID
    }),
  });

  const s3 = new S3();

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

  const chatroomName =
    chatroomType === ChatroomType.DMCHATROOM
      ? user?.id != chatroomWithUser?.id
        ? chatroomWithUser?.name
        : chatroomDBDetails?.member?.name!
      : chatroomDBDetails?.header;

  {
    /* `{? = then}`, `{: = else}`  */
  }
  {
    /*
          if DM ?
            if userID !=== chatroomWithUserID ?
              chatroomWithUserImageURL
            : memberImageURL
          : null
      */
  }
  const chatroomProfile =
    chatroomType === ChatroomType.DMCHATROOM
      ? user?.id !== chatroomWithUser?.id
        ? chatroomWithUser?.imageUrl
        : chatroomDBDetails?.member?.imageUrl!
      : null;

  let routes = navigation.getState()?.routes;

  let previousRoute = routes[routes?.length - 2];

  const isSecret = chatroomDBDetails?.isSecret;

  const notIncludedActionsID = [16]; // Add All members
  const filteredChatroomActions = chatroomDetails?.chatroomActions?.filter(
    (val: any) => !notIncludedActionsID?.includes(val?.id)
  );

  // This method is to call setChatroomTopic API and update local db as well followed by updation of redux for local handling
  const setChatroomTopic = async () => {
    const currentSelectedMessage = selectedMessages[0];
    const payload = {
      chatroomId: chatroomID,
      conversationId: currentSelectedMessage?.id,
    };
    const response = await myClient?.setChatroomTopic(
      payload,
      currentSelectedMessage
    );
    if (response?.success === true) {
      dispatch({
        type: SET_CHATROOM_TOPIC,
        body: { currentChatroomTopic: currentSelectedMessage },
      });
      dispatch({
        type: CLEAR_SELECTED_MESSAGES,
      });
    }
  };

  // Initial header of chatroom screen
  const setInitialHeader = () => {
    navigation.setOptions({
      title: "",
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity
            onPress={() => {
              lmChatInterface.navigateToHomePage();
            }}
          >
            {backIconPath ? (
              <Image source={backIconPath} style={styles.backOptionalBtn} />
            ) : (
              <Image
                source={require("../../assets/images/back_arrow3x.png")}
                style={styles.backBtn}
              />
            )}
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
                <View>
                  {ChatroomTabNavigator &&
                  gender == "male" &&
                  chatroomType !== ChatroomType.DMCHATROOM ? (
                    <Image
                      source={
                        chatroomDBDetails?.chatroomImageUrl
                          ? { uri: chatroomDBDetails?.chatroomImageUrl }
                          : require("../../assets/images/defaultGroupIconMale.png")
                      }
                      style={styles.avatar}
                    />
                  ) : chatroomType !== ChatroomType.DMCHATROOM ? (
                    <Image
                      source={
                        chatroomDBDetails?.chatroomImageUrl
                          ? { uri: chatroomDBDetails?.chatroomImageUrl }
                          : require("../../assets/images/defaultGroupIconFemale.png")
                      }
                      style={styles.avatar}
                    />
                  ) : null}
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      const params: NavigateToGroupDetailsParams = {
                        chatroom: chatroomDBDetails,
                      };
                      lmChatInterface.navigateToGroupDetails(params);
                    }}
                  >
                    <Text
                      ellipsizeMode="tail"
                      numberOfLines={1}
                      style={{
                        color: chatroomNameHeaderStyle?.color
                          ? chatroomNameHeaderStyle?.color
                          : STYLES.$COLORS.FONT_PRIMARY,
                        fontSize: chatroomNameHeaderStyle?.fontSize
                          ? chatroomNameHeaderStyle?.fontSize
                          : STYLES.$FONT_SIZES.LARGE,
                        fontFamily: chatroomNameHeaderStyle?.fontFamily
                          ? chatroomNameHeaderStyle?.fontFamily
                          : STYLES.$FONT_TYPES.BOLD,
                        maxWidth: Layout.normalize(250),
                      }}
                    >
                      {chatroomName}
                    </Text>
                  </TouchableOpacity>
                  {chatroomType !== ChatroomType.DMCHATROOM ? (
                    <Text
                      style={{
                        color: chatroomSubHeaderStyle?.color
                          ? chatroomSubHeaderStyle?.color
                          : STYLES.$COLORS.MSG,
                        fontSize: chatroomSubHeaderStyle?.fontSize
                          ? chatroomSubHeaderStyle?.fontSize
                          : STYLES.$FONT_SIZES.SMALL,
                        fontFamily: chatroomSubHeaderStyle?.fontFamily
                          ? chatroomSubHeaderStyle?.fontFamily
                          : STYLES.$FONT_TYPES.LIGHT,
                      }}
                    >
                      {chatroomDetails?.participantCount != undefined
                        ? `${chatroomDetails?.participantCount} participants`
                        : ""}
                    </Text>
                  ) : chatroomType === ChatroomType.DMCHATROOM &&
                    ChatroomTabNavigator ? (
                    <Text
                      style={{
                        color: chatroomSubHeaderStyle?.color
                          ? chatroomSubHeaderStyle?.color
                          : STYLES.$COLORS.MSG,
                        fontSize: chatroomSubHeaderStyle?.fontSize
                          ? chatroomSubHeaderStyle?.fontSize
                          : STYLES.$FONT_SIZES.SMALL,
                        fontFamily: chatroomSubHeaderStyle?.fontFamily
                          ? chatroomSubHeaderStyle?.fontFamily
                          : STYLES.$FONT_TYPES.LIGHT,
                      }}
                    >
                      Moderator
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}
        </View>
      ),
      headerRight: () =>
        ChatroomTabNavigator ? (
          <></>
        ) : (
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
          )
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
              style={[
                styles.selectedBackBtn,
                {
                  tintColor:
                    chatroomSelectedHeaderIcons?.tintColor !== undefined
                      ? chatroomSelectedHeaderIcons?.tintColor
                      : undefined,
                },
              ]}
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
                      refInput.current.focus();
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
                    style={[
                      styles.threeDots,
                      {
                        tintColor:
                          chatroomSelectedHeaderIcons?.tintColor !== undefined
                            ? chatroomSelectedHeaderIcons?.tintColor
                            : undefined,
                      },
                    ]}
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
                  style={[
                    styles.threeDots,
                    {
                      tintColor:
                        chatroomSelectedHeaderIcons?.tintColor !== undefined
                          ? chatroomSelectedHeaderIcons?.tintColor
                          : undefined,
                    },
                  ]}
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
                  style={[
                    styles.threeDots,
                    {
                      tintColor:
                        chatroomSelectedHeaderIcons?.tintColor !== undefined
                          ? chatroomSelectedHeaderIcons?.tintColor
                          : undefined,
                    },
                  ]}
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
                  style={[
                    styles.editIcon,
                    {
                      tintColor:
                        chatroomSelectedHeaderIcons?.tintColor !== undefined
                          ? chatroomSelectedHeaderIcons?.tintColor
                          : undefined,
                    },
                  ]}
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
                  style={[
                    styles.threeDots,
                    {
                      tintColor:
                        chatroomSelectedHeaderIcons?.tintColor !== undefined
                          ? chatroomSelectedHeaderIcons?.tintColor
                          : undefined,
                    },
                  ]}
                />
              </TouchableOpacity>
            )}
            {len === 1 &&
              !isFirstMessageDeleted &&
              !ChatroomTabNavigator(
                <TouchableOpacity
                  onPress={() => {
                    setReportModalVisible(true);
                  }}
                >
                  <Image
                    source={require("../../assets/images/three_dots3x.png")}
                    style={[
                      styles.threeDots,
                      {
                        tintColor:
                          chatroomSelectedHeaderIcons?.tintColor !== undefined
                            ? chatroomSelectedHeaderIcons?.tintColor
                            : undefined,
                      },
                    ]}
                  />
                </TouchableOpacity>
              )}
          </View>
        );
      },
    });
  };

  const handleReportModalClose = () => {
    setReportModalVisible(false);
  };

  //this function to update page for pagination in redux for GroupFeed or DMFeed
  const updatePageInRedux = () => {
    if (chatroomType === ChatroomType.DMCHATROOM) {
      dispatch({ type: SET_DM_PAGE, body: 1 });
    } else {
      dispatch({ type: SET_PAGE, body: 1 });
    }
  };

  // Sync conversation API call
  async function syncConversationAPI(
    page: number,
    maxTimeStamp: number,
    minTimeStamp: number,
    conversationId?: string
  ) {
    const res = myClient?.syncConversation(
      SyncConversationRequest.builder()
        .setChatroomId(chatroomID)
        .setPage(page)
        .setMinTimestamp(minTimeStamp)
        .setMaxTimestamp(maxTimeStamp)
        .setPageSize(500)
        .setConversationId(conversationId)
        .build()
    );
    return res;
  }

  // pagination call for sync conversation
  const paginatedConversationSyncAPI = async (
    page: number,
    minTimeStamp: number,
    maxTimeStamp: number,
    conversationId?: string
  ) => {
    const val = await syncConversationAPI(
      page,
      maxTimeStamp,
      minTimeStamp,
      conversationId
    );

    const DB_RESPONSE = val?.data;

    if (DB_RESPONSE?.conversationsData.length !== 0) {
      // This is to get chatroomCreator of current chatroom which will be later used to give permission that who can set chatroom topic
      const chatroomCreatorUserId =
        DB_RESPONSE?.chatroomMeta[chatroomID]?.userId;
      const chatroomCreator = DB_RESPONSE?.userMeta[chatroomCreatorUserId];

      dispatch({
        type: SET_CHATROOM_CREATOR,
        body: { chatroomCreator: chatroomCreator },
      });
      await myClient?.saveConversationData(
        DB_RESPONSE,
        DB_RESPONSE?.chatroomMeta,
        DB_RESPONSE?.conversationsData,
        user?.sdkClientInfo?.community?.toString()
      );
    }

    if (page === 1) {
      const payload = GetConversationsRequestBuilder.builder()
        .setChatroomId(chatroomID?.toString())
        .setLimit(PAGE_SIZE)
        .build();

      const conversationsFromRealm = await myClient?.getConversations(payload);

      dispatch({
        type: GET_CONVERSATIONS_SUCCESS,
        body: { conversations: conversationsFromRealm },
      });
    }

    if (DB_RESPONSE?.conversationsData?.length === 0) {
      return;
    } else {
      paginatedConversationSyncAPI(
        page + 1,
        minTimeStamp,
        maxTimeStamp,
        conversationId
      );
    }
  };

  // this function fetchConversations when we first move inside Chatroom
  async function fetchData(chatroomDetails: any, showLoaderVal?: boolean) {
    const maxTimeStamp = Math.floor(Date.now() * 1000);

    if (chatroomDetails === undefined) {
      //Cold start in case of initiating on a new DM or viewing chatroom from ExploreFeed
      await paginatedConversationSyncAPI(INITIAL_SYNC_PAGE, 0, maxTimeStamp);
      await myClient?.updateChatroomViewed(chatroomID);
      setShimmerIsLoading(false);
      fetchChatroomDetails();
    } else {
      let conversationsFromRealm;

      // Warm start
      if (chatroomDetails?.isChatroomVisited) {
        const payload = GetConversationsRequestBuilder.builder()
          .setChatroomId(chatroomID?.toString())
          .setLimit(PAGE_SIZE)
          .build();

        conversationsFromRealm = await myClient?.getConversations(payload);

        dispatch({
          type: GET_CONVERSATIONS_SUCCESS,
          body: { conversations: conversationsFromRealm },
        });
        const minTimeStamp =
          chatroomDetails?.lastSeenConversation?.lastUpdatedAt ?? 0;
        await paginatedConversationSyncAPI(
          INITIAL_SYNC_PAGE,
          minTimeStamp,
          maxTimeStamp
        );
      } else {
        // Cold start
        await paginatedConversationSyncAPI(INITIAL_SYNC_PAGE, 0, maxTimeStamp);
        await myClient?.updateChatroomViewed(chatroomID);
        setShimmerIsLoading(false);
      }
    }
  }

  //this function fetchChatroomDetails when we first move inside Chatroom
  async function fetchChatroomDetails() {
    const payload = { chatroomId: chatroomID };
    const chatroom = await myClient?.getChatroom(chatroomID?.toString());
    const DB_DATA = chatroom?.data;
    if (DB_DATA?.isChatroomVisited) {
      setShimmerIsLoading(false);
    }
    if (DB_DATA) {
      dispatch({
        type: GET_CHATROOM_DB_SUCCESS,
        body: { chatroomDBDetails: DB_DATA },
      });
      setIsRealmDataPresent(true);
      // This is to set chatroom topic if its already in API response
      if (DB_DATA?.topic && DB_DATA?.topicId) {
        dispatch({
          type: SET_CHATROOM_TOPIC,
          body: {
            currentChatroomTopic: DB_DATA?.topic,
          },
        });
      } else if (!DB_DATA?.topic && !DB_DATA?.topicId) {
        dispatch({
          type: CLEAR_CHATROOM_TOPIC,
        });
      }
    }
    const response = await myClient?.getChatroomActions(payload);
    dispatch({
      type: GET_CHATROOM_ACTIONS_SUCCESS,
      body: response?.data,
    });
    return DB_DATA;
  }

  // this function fetch initiate API
  async function fetchInitAPI() {
    //this line of code is for the sample app only, pass your uuid instead of this.
    const UUID = Credentials.userUniqueId;
    const userName = Credentials.username;

    const payload = {
      uuid: UUID,
      userName: userName,
      isGuest: false,
    };
    const res = await dispatch(initAPI(payload) as any);
    return res;
  }

  // this useLayoutEffect calls API's before printing UI Layout
  useLayoutEffect(() => {
    dispatch({
      type: CLEAR_CHATROOM_CONVERSATION,
      body: { conversations: [] },
    });
    dispatch({
      type: CLEAR_CHATROOM_DETAILS,
      body: { chatroomDBDetails: {} },
    });
    dispatch({ type: SELECTED_MESSAGES, body: [] });
    dispatch({ type: LONG_PRESSED, body: false });
    dispatch({ type: SET_IS_REPLY, body: { isReply: false } });
    dispatch({
      type: SET_REPLY_MESSAGE,
      body: { replyMessage: "" },
    });
  }, [chatroomID]);

  // local handling for chatroom topic updation's state message
  useEffect(() => {
    const addChatroomTopic = async () => {
      const tempStateMessage = createTemporaryStateMessage(
        currentChatroomTopic,
        user
      );
      dispatch({
        type: ADD_STATE_MESSAGE,
        body: { conversation: tempStateMessage },
      });
      dispatch({
        type: SET_TEMP_STATE_MESSAGE,
        body: { temporaryStateMessage: tempStateMessage },
      });
      await myClient?.saveNewConversation(
        chatroomID?.toString(),
        tempStateMessage
      );
    };
    if (selectedMessages.length !== 0 && isChatroomTopic) {
      addChatroomTopic();
    }
  }, [currentChatroomTopic, chatroomID]);

  // To trigger analytics for Message Selected
  useEffect(() => {
    for (let i = 0; i < selectedMessages.length; i++) {
      LMChatAnalytics.track(
        Events.MESSAGE_SELECTED,
        new Map<string, string>([
          [Keys.TYPE, getConversationType(selectedMessages[i])],
          [Keys.CHATROOM_ID, chatroomID?.toString()],
        ])
      );
    }
  }, [selectedMessages, chatroomID]);

  // To trigger analytics for Chatroom opened
  useEffect(() => {
    let source;
    if (previousRoute?.name === EXPLORE_FEED) {
      source = "explore_feed";
    } else if (previousRoute?.name === HOMEFEED) {
      source = "home_feed";
    } else if (navigationFromNotification) {
      source = "notification";
    } else if (deepLinking) {
      source = "deep_link";
    }
    LMChatAnalytics.track(
      Events.CHAT_ROOM_OPENED,
      new Map<string, string>([
        [Keys.CHATROOM_ID, chatroomID?.toString()],
        [
          Keys.CHATROOM_TYPE,
          getChatroomType(chatroomType, chatroomDBDetails?.isSecret),
        ],
        [Keys.SOURCE, source],
      ])
    );
  }, [chatroomType, chatroomID]);

  //this useEffect fetch chatroom details only after initiate API got fetched if `navigation from Notification` else fetch chatroom details
  useEffect(() => {
    const invokeFunction = async () => {
      if (navigationFromNotification) {
        if (appState.match(/active|foreground/)) {
          // App has gone to the background
          await fetchInitAPI();
        }
        const chatroomDetails = await fetchChatroomDetails();
        await fetchData(chatroomDetails, false);
      } else {
        const chatroomDetails = await fetchChatroomDetails();
        await fetchData(chatroomDetails, false);
      }
    };
    invokeFunction();
  }, [navigation, user, chatroomID]);

  // this useEffect set unseenCount to zero when closing the chatroom
  useEffect(() => {
    const closingChatroom = async () => {
      await myClient?.markReadChatroom({
        chatroomId: chatroomID,
      });
      await myClient?.updateUnseenCount(chatroomID?.toString());
      await myClient?.deleteConversationFromRealm(temporaryStateMessage?.id);
    };
    return () => {
      if (previousRoute?.name !== EXPLORE_FEED) {
        closingChatroom();
      }
    };
  }, [temporaryStateMessage, chatroomID]);

  // this useEffect is to stop audio player when going out of chatroom, if any audio is running
  useEffect(() => {
    return () => {
      TrackPlayer.reset();
    };
  }, [chatroomID]);

  // this useEffect is to stop audio player when the app is in background
  useEffect(() => {
    if (!isFocused) {
      TrackPlayer.reset();
    }
  }, [isFocused, chatroomID]);

  //Logic for navigation backAction
  function backAction() {
    dispatch({ type: SELECTED_MESSAGES, body: [] });
    dispatch({ type: LONG_PRESSED, body: false });
    if (chatroomType === ChatroomType.DMCHATROOM) {
      if (previousRoute?.name === DM_ALL_MEMBERS) {
        const popAction = StackActions.pop(2);
        navigation.dispatch(popAction);
      } else {
        if (previousChatroomID) {
          const popAction = StackActions.pop(1);
          navigation.dispatch(popAction);
          navigation.push(CHATROOM, {
            chatroomID: previousChatroomID,
          });
        } else {
          navigation.goBack();
        }
      }
    } else {
      navigation.goBack();
    }
  }

  //Navigation gesture back handler for android
  useEffect(() => {
    function backActionCall() {
      Keyboard.dismiss();
      if (chatroomType === ChatroomType.DMCHATROOM) {
        if (previousRoute?.name === DM_ALL_MEMBERS) {
          const popAction = StackActions.pop(2);
          navigation.dispatch(popAction);
        } else {
          if (previousChatroomID) {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
            navigation.push(CHATROOM, {
              chatroomID: previousChatroomID,
            });
          } else {
            navigation.goBack();
          }
        }
      } else {
        navigation.goBack();
      }
      return true;
    }

    const backHandlerAndroid = BackHandler.addEventListener(
      "hardwareBackPress",
      backActionCall
    );
    return () => backHandlerAndroid.remove();
  }, [chatroomType, chatroomID]);

  // this useEffect update initial header when we get chatroomDetails.
  useEffect(() => {
    setInitialHeader();
  }, [chatroomDBDetails, chatroomDetails, chatroomID]);

  // this useEffect call API to show InputBox based on showDM key.
  useEffect(() => {
    async function callApi() {
      if (chatroomType == ChatroomType.DMCHATROOM) {
        const apiRes = await myClient?.canDmFeed({
          reqFrom: "chatroom",
          chatroomId: chatroomID,
          uuid: chatroomWithUser?.sdkClientInfo?.uuid,
        });
        const response = apiRes?.data;
        if (response?.cta) {
          setShowDM(response?.showDm);
        }
      } else if (
        chatroomType == ChatroomType.OPENCHATROOM ||
        chatroomType == ChatroomType.ANNOUNCEMENTROOM
      ) {
        if (community?.id) {
          const payload = {
            page: 1,
          };
        }
      }
    }

    if (chatroomDBDetails) {
      callApi();
    }
  }, [chatroomDBDetails, chatroomID]);

  // this useEffect update headers when we longPress or update selectedMessages array.
  useEffect(() => {
    if (selectedMessages?.length === 0) {
      setInitialHeader();
    } else if (isLongPress) {
      setSelectedHeader();
    }
  }, [isLongPress, selectedMessages, chatroomID]);

  // sync conversation call with conversation_id from firebase listener
  const firebaseConversationSyncAPI = async (
    page: number,
    minTimeStamp: number,
    maxTimeStamp: number,
    conversationId?: string
  ) => {
    const val = await syncConversationAPI(
      page,
      maxTimeStamp,
      minTimeStamp,
      conversationId
    );
    const DB_RESPONSE = val?.data;
    if (DB_RESPONSE?.conversationsData?.length !== 0) {
      await myClient?.saveConversationData(
        DB_RESPONSE,
        DB_RESPONSE?.chatroomMeta,
        DB_RESPONSE?.conversationsData,
        community?.id
      );
    }
    if (page === 1) {
      const payload = GetConversationsRequestBuilder.builder()
        .setChatroomId(chatroomID?.toString())
        .setLimit(PAGE_SIZE)
        .build();
      const conversationsFromRealm = await myClient?.getConversations(payload);
      dispatch({
        type: GET_CONVERSATIONS_SUCCESS,
        body: { conversations: conversationsFromRealm },
      });
    }
    return;
  };

  //useffect includes firebase realtime listener
  useEffect(() => {
    const query = ref(db, `/collabcards/${chatroomID}`);
    return onValue(query, async (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const firebaseData = snapshot.val();
        const conversationID = firebaseData?.collabcard?.answer_id;
        if (conversationID) {
          const maxTimeStamp = Math.floor(Date.now() * 1000);
          await firebaseConversationSyncAPI(
            INITIAL_SYNC_PAGE,
            0,
            maxTimeStamp,
            conversationID
          );
          await myClient?.updateChatRequestState(
            chatroomID?.toString(),
            ChatroomChatRequestState.ACCEPTED
          );
          fetchChatroomDetails();
        }
      }
    });
  }, [chatroomID]);

  // this useffect updates routes, previousRoute variables when we come to chatroom.
  useEffect(() => {
    if (isFocused) {
      routes = navigation.getState()?.routes;
      previousRoute = routes[routes?.length - 2];
    }
  }, [isFocused, chatroomID]);

  //This useEffect has logic to or hide message privately when long press on a message
  useEffect(() => {
    if (selectedMessages?.length === 1) {
      const selectedMessagesMember = selectedMessages[0]?.member;
      if (
        showDM &&
        selectedMessagesMember?.id !== user?.id &&
        !selectedMessages[0]?.deletedBy
      ) {
        if (showList == 2 && selectedMessagesMember?.state === 1) {
          setIsMessagePrivately(true);
        } else if (showList == 1) {
          setIsMessagePrivately(true);
        } else {
          setIsMessagePrivately(false);
        }
      } else {
        setIsMessagePrivately(false);
      }
    }
  }, [selectedMessages, showDM, showList, chatroomID]);

  // This is to check eligibity of user that whether he/she can set chatroom topic or not
  useEffect(() => {
    const selectedMessagesLength = selectedMessages.length;
    const selectedMessage = selectedMessages[0];

    if (
      selectedMessagesLength == 1 &&
      (user?.sdkClientInfo?.uuid == chatroomCreator?.sdkClientInfo?.uuid ||
        user?.state == MemberState.ADMIN) &&
      selectedMessage?.deletedBy == null
    ) {
      setIsChatroomTopic(true);
    }
  }, [selectedMessages, chatroomID]);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleReactionModalClose = () => {
    setIsReact(false);
  };

  const leaveChatroom = async () => {
    const payload = {
      collabcardId: chatroomID,
      uuid: user?.sdkClientInfo?.uuid,
      value: false,
    };
    const res = await myClient
      .followChatroom(payload)
      .then(async () => {
        LMChatAnalytics.track(
          Events.CHAT_ROOM_UN_FOLLOWED,
          new Map<string, string>([
            [Keys.CHATROOM_ID, chatroomID?.toString()],
            [Keys.COMMUNITY_ID, user?.sdkClientInfo?.community?.toString()],
            [Keys.SOURCE, Sources.COMMUNITY_FEED],
          ])
        );
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({ type: SET_EXPLORE_FEED_PAGE, body: 1 });
          const payload2 = {
            orderType: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
          dispatch({
            type: CLEAR_CHATROOM_CONVERSATION,
            body: { conversations: [] },
          });
          dispatch({
            type: CLEAR_CHATROOM_DETAILS,
            body: { chatroomDBDetails: {} },
          });
          await myClient?.updateChatroomFollowStatus(
            chatroomID?.toString(),
            false
          );
          navigation.goBack();
        } else {
          // Updating the followStatus of chatroom to false in case of leaving the chatroom
          await myClient?.updateChatroomFollowStatus(
            chatroomID?.toString(),
            false
          );
          setTimeout(() => {
            navigation.goBack();
          }, 300);
        }
      })
      .catch(() => {
        Alert.alert("Leave Chatroom failed");
      });

    return res;
  };

  const showWarningModal = () => {
    setIsWarningMessageModalState(true);
  };

  const hideWarningModal = () => {
    setIsWarningMessageModalState(false);
  };

  const leaveSecretChatroom = async () => {
    const payload: any = {
      chatroomId: chatroomID,
      isSecret: isSecret,
    };
    const res = await myClient
      .leaveSecretChatroom(payload)
      .then(async () => {
        LMChatAnalytics.track(
          Events.CHAT_ROOM_LEFT,
          new Map<string, string>([
            [Keys.CHATROOM_NAME, chatroomName?.toString()],
            [Keys.CHATROOM_ID, chatroomID?.toString()],
            [
              Keys.CHATROOM_TYPE,
              getChatroomType(chatroomType, chatroomDBDetails?.isSecret),
            ],
          ])
        );
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({ type: SET_EXPLORE_FEED_PAGE, body: 1 });
          const payload2 = {
            orderType: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
          dispatch({
            type: CLEAR_CHATROOM_CONVERSATION,
            body: { conversations: [] },
          });
          dispatch({
            type: CLEAR_CHATROOM_DETAILS,
            body: { chatroomDBDetails: {} },
          });
          await myClient?.updateChatroomFollowStatus(
            chatroomID?.toString(),
            false
          );
          navigation.goBack();
        } else {
          // Updating the followStatus of chatroom to false in case of leaving the chatroom
          await myClient?.updateChatroomFollowStatus(
            chatroomID?.toString(),
            false
          );
          setTimeout(() => {
            navigation.goBack();
          }, 300);
        }
      })
      .catch(() => {
        Alert.alert("Leave Chatroom failed");
      });
    return res;
  };

  const joinChatroom = async () => {
    const payload = {
      collabcardId: chatroomID,
      uuid: user?.sdkClientInfo?.uuid,
      value: true,
    };
    const res = await myClient
      .followChatroom(payload)
      .then(async () => {
        LMChatAnalytics.track(
          Events.CHAT_ROOM_FOLLOWED,
          new Map<string, string>([
            [Keys.CHATROOM_ID, chatroomID?.toString()],
            [Keys.COMMUNITY_ID, user?.sdkClientInfo?.community?.toString()],
            [Keys.SOURCE, Sources.COMMUNITY_FEED],
          ])
        );
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({ type: SET_EXPLORE_FEED_PAGE, body: 1 });
          const payload2 = {
            orderType: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
        } else {
          updatePageInRedux();
        }
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes:
              previousRoute?.name === EXPLORE_FEED
                ? [{ name: HOMEFEED }, { name: previousRoute?.name }]
                : [{ name: previousRoute?.name }],
          })
        );
      })
      .catch(() => {
        Alert.alert("Join Chatroom failed");
      });

    return res;
  };

  const joinSecretChatroom = async () => {
    const payload = {
      collabcardId: chatroomID,
      uuid: user?.sdkClientInfo?.uuid,
      value: true,
    };
    const res = await myClient
      .followChatroom(payload)
      .then(async () => {
        await paginatedConversationSyncAPI(
          INITIAL_SYNC_PAGE,
          0,
          Date.now() * 1000
        );

        await myClient?.updateChatroomFollowStatus(
          chatroomID?.toString(),
          true
        );
        fetchChatroomDetails();

        LMChatAnalytics.track(
          Events.CHAT_ROOM_FOLLOWED,
          new Map<string, string>([
            [Keys.CHATROOM_ID, chatroomID?.toString()],
            [Keys.COMMUNITY_ID, user?.sdkClientInfo?.community?.toString()],
            [Keys.SOURCE, Sources.COMMUNITY_FEED],
          ])
        );

        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({ type: SET_EXPLORE_FEED_PAGE, body: 1 });
          const payload2 = {
            orderType: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
        } else {
          updatePageInRedux();
        }
      })
      .catch(() => {
        Alert.alert("Join Secret Chatroom failed");
      });

    return res;
  };

  const muteNotifications = async () => {
    const payload = {
      chatroomId: chatroomID,
      value: true,
    };
    myClient
      .muteChatroom(payload)
      .then((res: any) => {
        fetchChatroomDetails();
        myClient?.updateMuteStatus(chatroomID);
        LMChatAnalytics.track(
          Events.CHATROOM_MUTED,
          new Map<string, string>([[Keys.CHATROOM_NAME, chatroomName]])
        );
        setMsg("Notifications muted for this chatroom");
        setIsToast(true);
      })
      .catch(() => {
        Alert.alert("Mute Notification failed");
      });
  };

  const unmuteNotifications = async () => {
    const payload = {
      chatroomId: chatroomID,
      value: false,
    };
    const res = await myClient
      .muteChatroom(payload)
      .then(() => {
        fetchChatroomDetails();
        myClient?.updateMuteStatus(chatroomID);
        LMChatAnalytics.track(
          Events.CHATROOM_UNMUTED,
          new Map<string, string>([[Keys.CHATROOM_NAME, chatroomName]])
        );
        setMsg("Notifications unmuted for this chatroom");
        setIsToast(true);
      })
      .catch(() => {
        Alert.alert("Unmute Notification failed");
      });
  };

  const showJoinAlert = () =>
    Alert.alert(
      JOIN_CHATROOM,
      JOIN_CHATROOM_MESSAGE,
      [
        {
          text: CANCEL_BUTTON,
          style: "default",
        },
        {
          text: CONFIRM_BUTTON,
          onPress: async () => {
            const res = await myClient?.inviteAction({
              channelId: `${chatroomID}`,
              inviteStatus: 1,
            });
            dispatch({
              type: SHOW_TOAST,
              body: { isToast: true, msg: "Invitation accepted" },
            });

            dispatch({ type: ACCEPT_INVITE_SUCCESS, body: chatroomID });
            updatePageInRedux();
            await dispatch(getChatroom({ chatroomId: chatroomID }) as any);
          },
          style: "default",
        },
      ],
      {
        cancelable: false,
      }
    );

  const showRejectAlert = () =>
    Alert.alert(
      REJECT_INVITATION,
      REJECT_INVITATION_MESSAGE,
      [
        {
          text: CANCEL_BUTTON,
          style: "cancel",
        },
        {
          text: CONFIRM_BUTTON,
          onPress: async () => {
            const res = await myClient?.inviteAction({
              channelId: `${chatroomID}`,
              inviteStatus: 2,
            });
            dispatch({
              type: SHOW_TOAST,
              body: { isToast: true, msg: "Invitation rejected" },
            });

            dispatch({
              type: CLEAR_CHATROOM_CONVERSATION,
              body: { conversations: [] },
            });
            dispatch({
              type: CLEAR_CHATROOM_DETAILS,
              body: { chatroomDBDetails: {} },
            });
            dispatch({ type: REJECT_INVITE_SUCCESS, body: chatroomID });
            navigation.goBack();
          },
          style: "default",
        },
      ],
      {
        cancelable: false,
      }
    );

  // this function calls sendReactionAPI
  const sendReactionAPI = async (
    consversationID: any,
    reaction: any,
    isReactionButton: boolean
  ) => {
    const res = await myClient?.putReaction({
      conversationId: consversationID,
      reaction: reaction,
    });
    let from;
    if (isReactionButton) {
      from = "reaction button";
    } else {
      from = "long press";
    }
    LMChatAnalytics.track(
      Events.REACTION_ADDED,
      new Map<string, string>([
        [Keys.REACTION, reaction],
        [Keys.FROM, from],
        [Keys.MESSAGE_ID, consversationID?.toString()],
        [Keys.CHATROOM_ID, chatroomID?.toString()],
      ])
    );
  };

  // this function calls removeReactionAPI
  const removeReactionAPI = async (consversationID: any, reaction: any) => {
    const res = await myClient?.deleteReaction({
      chatroomId: chatroomID,
      conversationId: consversationID,
      reaction: reaction,
    });
  };

  // this function is for sending a reaction from conversation
  const sendReaction = (val: any, isReactionButton: boolean) => {
    const previousMsg = selectedMessages[0];
    let changedMsg;
    if (selectedMessages[0]?.reactions?.length > 0) {
      const isReactedArr = selectedMessages[0]?.reactions.filter(
        (val: any) => val?.member?.id == user?.id
      );
      if (isReactedArr?.length > 0) {
        // Reacted different emoji
        if (isReactedArr[0].reaction !== val) {
          const resultArr = selectedMessages[0]?.reactions.map((element: any) =>
            element?.member?.id == user?.id
              ? {
                  member: {
                    id: user?.id,
                    name: user?.name,
                    imageUrl: "",
                  },
                  reaction: val,
                  updatedAt: Date.now(),
                }
              : element
          );
          changedMsg = {
            ...selectedMessages[0],
            reactions: resultArr,
          };
          //API call
        } else if (isReactedArr[0].reaction === val) {
          // Reacted same emoji
          const resultArr = selectedMessages[0]?.reactions.map((element: any) =>
            element?.member?.id == user?.id
              ? {
                  member: {
                    id: user?.id,
                    name: user?.name,
                    imageUrl: "",
                  },
                  reaction: val,
                  updatedAt: Date.now(),
                }
              : element
          );
          changedMsg = {
            ...selectedMessages[0],
            reactions: resultArr,
          };
          // No API call
        }
      } else {
        changedMsg = {
          ...selectedMessages[0],
          reactions: [
            ...selectedMessages[0]?.reactions,
            {
              member: {
                id: user?.id,
                name: user?.name,
                imageUrl: "",
              },
              reaction: val,
              updatedAt: Date.now(),
            },
          ],
        };
        //API call
      }
    } else {
      changedMsg = {
        ...selectedMessages[0],
        reactions: [
          ...selectedMessages[0]?.reactions,
          {
            member: {
              id: user?.id,
              name: user?.name,
              imageUrl: "",
            },
            reaction: val,
            updatedAt: Date.now(),
          },
        ],
      };
    }

    dispatch({
      type: REACTION_SENT,
      body: {
        previousMsg: previousMsg,
        changedMsg: changedMsg,
      },
    });
    dispatch({ type: SELECTED_MESSAGES, body: [] });
    dispatch({ type: LONG_PRESSED, body: false });
    setIsReact(false);
    sendReactionAPI(previousMsg?.id, val, isReactionButton);
  };

  // this function is for removing a reaction from conversation
  const removeReaction = (
    item: any,
    reactionArr: any,
    removeFromList?: any
  ) => {
    const previousMsg = item;
    let changedMsg;
    let val;

    if (item?.reactions?.length > 0) {
      const index = item?.reactions.findIndex(
        (val: any) => val?.member?.id == user?.id
      );

      // this condition checks if clicked reaction ID matches the findIndex ID
      const isIndexMatches =
        item?.reactions[index]?.member?.id === reactionArr?.id;

      const isIndexExist = index !== -1 ? true : false;

      // check condition user has a reaction && isIndexMatches(true if clicked reaction ID is same as findReactionID)
      if (
        (isIndexExist && isIndexMatches) || // condition to remove reaction from list of all reactions
        (isIndexExist && !!removeFromList && isIndexMatches) // condition to remove reaction from list specific reaction
      ) {
        const tempArr = [...item?.reactions];

        val = tempArr[index];

        if (index !== undefined || isIndexExist) {
          tempArr.splice(index, 1);
        }

        changedMsg = {
          ...item,
          reactions: tempArr,
        };

        dispatch({
          type: REACTION_SENT,
          body: {
            previousMsg: previousMsg,
            changedMsg: changedMsg,
          },
        });
        removeReactionAPI(previousMsg?.id, val?.reaction);
      }
    }
  };

  //this function is for sending a reaction to a message
  const handlePick = (emojiObject: any) => {
    sendReaction(emojiObject?.emoji, true);
    dispatch({ type: SELECTED_MESSAGES, body: [] });
    dispatch({ type: LONG_PRESSED, body: false });
    setIsOpen(false);
  };

  //this function handles LongPress event on conversations
  const handleLongPress = (
    isStateIncluded: any,
    isIncluded: any,
    item: any,
    selectedMessages: any
  ) => {
    dispatch({ type: LONG_PRESSED, body: true });
    if (isIncluded) {
      const filterdMessages = selectedMessages.filter(
        (val: any) => val?.id !== item?.id && !isStateIncluded
      );
      dispatch({
        type: SELECTED_MESSAGES,
        body: [...filterdMessages],
      });
    } else {
      if (!isStateIncluded) {
        dispatch({
          type: SELECTED_MESSAGES,
          body: [...selectedMessages, item],
        });
      }
    }

    if (!isStateIncluded && !item?.deletedBy) {
      setIsReact(true);
    }
  };

  //this function handles onPress event on conversations
  const handleClick = (
    isStateIncluded: any,
    isIncluded: any,
    item: any,
    emojiClicked: any,
    selectedMessages: any
  ) => {
    if (isLongPress) {
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !isStateIncluded
        );
        if (filterdMessages?.length > 0) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
        } else {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
          dispatch({ type: LONG_PRESSED, body: false });
        }
      } else {
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
      }
    } else if (emojiClicked) {
      dispatch({ type: LONG_PRESSED, body: true });
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !stateArr.includes(val?.state)
        );
        if (filterdMessages?.length > 0) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
        } else {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
          dispatch({ type: LONG_PRESSED, body: false });
        }
      } else {
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
        setIsReact(true);
      }
    }
  };

  // this function calls API to approve DM request
  const onApprove = async () => {
    const response = await myClient?.sendDMRequest({
      chatroomId: chatroomID,
      chatRequestState: ChatroomChatRequestState.ACCEPTED,
    });

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: { chatRequestState: 1 },
    });

    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.ACCEPTED
    );
    fetchChatroomDetails();

    dispatch({
      type: ADD_STATE_MESSAGE,
      body: { conversation: response?.data?.conversation },
    });
    await myClient?.saveNewConversation(
      chatroomID?.toString(),
      response?.data?.conversation
    );
  };

  // this function calls API to reject DM request
  const onReject = async () => {
    const response = await myClient?.sendDMRequest({
      chatroomId: chatroomID,
      chatRequestState: ChatroomChatRequestState.REJECTED,
    });

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: { chatRequestState: 2 },
    });
    dispatch({
      type: ADD_STATE_MESSAGE,
      body: { conversation: response?.data?.conversation },
    });

    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.REJECTED
    );
    fetchChatroomDetails();
  };

  // this function calls API to approve DM request on click TapToUndo
  const onTapToUndo = async () => {
    const response = await myClient?.blockMember({
      chatroomId: chatroomID,
      status: ChatroomChatRequestState.ACCEPTED,
    });

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: { chatRequestState: 1 },
    });
    dispatch({
      type: ADD_STATE_MESSAGE,
      body: { conversation: response?.data?.conversation },
    });
    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.ACCEPTED
    );
    fetchChatroomDetails();
  };

  // this function calls API to block a member
  const blockMember = async () => {
    const payload = {
      chatroomId: chatroomID,
      status: ChatroomChatRequestState.INITIATED,
    };
    const response = await myClient?.blockMember(payload);
    dispatch({
      type: SHOW_TOAST,
      body: { isToast: true, msg: "Member blocked" },
    });
    dispatch({
      type: ADD_STATE_MESSAGE,
      body: { conversation: response?.data?.conversation },
    });
    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.REJECTED
    );
    fetchChatroomDetails();
  };

  // this function calls API to unblock a member
  const unblockMember = async () => {
    const payload = {
      chatroomId: chatroomID,
      status: ChatroomChatRequestState.ACCEPTED,
    };
    const response = await myClient?.blockMember(payload);
    dispatch({
      type: SHOW_TOAST,
      body: { isToast: true, msg: "Member blocked" },
    });
    dispatch({
      type: ADD_STATE_MESSAGE,
      body: { conversation: response?.data?.conversation },
    });
    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.ACCEPTED
    );
    fetchChatroomDetails();
  };

  // this function shows confirm alert popup to approve DM request
  const handleDMApproveClick = () => {
    showDMApproveAlert();
  };

  // this function shows confirm alert popup to reject DM request
  const handleDMRejectClick = () => {
    showDMRejectAlert();
  };

  // this function shows confirm alert popup to approve DM request on click TapToUndo
  const handleBlockMember = () => {
    showDMBlockAlert();
  };

  const showDMApproveAlert = () => {
    setDMApproveAlertModalVisible(true);
  };

  const hideDMApproveAlert = () => {
    setDMApproveAlertModalVisible(false);
  };

  const showDMRejectAlert = () => {
    setDMRejectAlertModalVisible(true);
  };

  const hideDMRejectAlert = () => {
    setDMRejectAlertModalVisible(false);
  };

  const showDMBlockAlert = () => {
    setDMBlockAlertModalVisible(true);
  };

  const hideDMBlockAlert = () => {
    setDMBlockAlertModalVisible(false);
  };

  const uploadResource = async ({
    selectedImages,
    conversationID,
    chatroomID,
    selectedFilesToUpload,
    uploadingFilesMessages,
    isRetry,
  }: UploadResource) => {
    LogBox.ignoreLogs(["new NativeEventEmitter"]);
    for (let i = 0; i < selectedImages?.length; i++) {
      const item = selectedImages[i];
      const attachmentType = isRetry ? item?.type : item?.type?.split("/")[0];
      const docAttachmentType = isRetry
        ? item?.type
        : item?.type?.split("/")[1];
      const voiceNoteAttachmentType = item?.type;
      const thumbnailURL = item?.thumbnailUrl;
      const name =
        attachmentType === IMAGE_TEXT
          ? item.fileName
          : attachmentType === VIDEO_TEXT
          ? item.fileName
          : attachmentType === VOICE_NOTE_TEXT
          ? item.name
          : docAttachmentType === PDF_TEXT
          ? item.name
          : null;
      const path = `files/collabcard/${chatroomID}/conversation/${conversationID}/${name}`;
      const thumbnailUrlPath = `files/collabcard/${chatroomID}/conversation/${conversationID}/${thumbnailURL}`;

      let uriFinal: any;

      if (attachmentType === IMAGE_TEXT) {
        //image compression
        const compressedImgURI = await CompressedImage.compress(item.uri, {
          compressionMethod: "auto",
        });
        const compressedImg = await fetchResourceFromURI(compressedImgURI);
        uriFinal = compressedImg;
      } else {
        const img = await fetchResourceFromURI(item.uri);
        uriFinal = img;
      }

      //for video thumbnail
      let thumbnailUrlImg: any;
      if (thumbnailURL && attachmentType === VIDEO_TEXT) {
        thumbnailUrlImg = await fetchResourceFromURI(thumbnailURL);
      }

      const params = {
        Bucket: BUCKET,
        Key: path,
        Body: uriFinal,
        ACL: "public-read-write",
        ContentType: item?.type, // Replace with the appropriate content type for your file
      };

      //for video thumbnail
      const thumnnailUrlParams: any = {
        Bucket: BUCKET,
        Key: thumbnailUrlPath,
        Body: thumbnailUrlImg,
        ACL: "public-read-write",
        ContentType: "image/jpeg", // Replace with the appropriate content type for your file
      };

      try {
        let getVideoThumbnailData: any;

        if (thumbnailURL && attachmentType === VIDEO_TEXT) {
          getVideoThumbnailData = await s3.upload(thumnnailUrlParams).promise();
        }
        const data = await s3.upload(params).promise();
        const awsResponse = data.Location;
        if (awsResponse) {
          let fileType = "";
          if (docAttachmentType === PDF_TEXT) {
            fileType = PDF_TEXT;
          } else if (attachmentType === AUDIO_TEXT) {
            fileType = AUDIO_TEXT;
          } else if (attachmentType === VIDEO_TEXT) {
            fileType = VIDEO_TEXT;
          } else if (attachmentType === IMAGE_TEXT) {
            fileType = IMAGE_TEXT;
          } else if (voiceNoteAttachmentType === VOICE_NOTE_TEXT) {
            fileType = VOICE_NOTE_TEXT;
          }

          const payload = {
            conversationId: conversationID,
            filesCount: selectedImages?.length,
            index: i + 1,
            meta:
              fileType === VIDEO_TEXT
                ? {
                    size: selectedFilesToUpload[i]?.fileSize,
                    duration: selectedFilesToUpload[i]?.duration,
                  }
                : fileType === VOICE_NOTE_TEXT
                ? {
                    size: null,
                    duration: item?.duration,
                  }
                : {
                    size:
                      docAttachmentType === PDF_TEXT
                        ? selectedFilesToUpload[i]?.size
                        : selectedFilesToUpload[i]?.fileSize,
                  },
            name:
              docAttachmentType === PDF_TEXT
                ? selectedFilesToUpload[i]?.name
                : voiceNoteAttachmentType === VOICE_NOTE_TEXT
                ? item?.name
                : selectedFilesToUpload[i]?.fileName,
            type: fileType,
            url: awsResponse,
            thumbnailUrl:
              fileType === VIDEO_TEXT ? getVideoThumbnailData?.Location : null,
          };

          const uploadRes = await myClient?.putMultimedia(payload as any);
        }
      } catch (error) {
        dispatch({
          type: SET_FILE_UPLOADING_MESSAGES,
          body: {
            message: {
              ...uploadingFilesMessages[conversationID?.toString()],
              isInProgress: FAILED,
            },
            ID: conversationID,
          },
        });
        const id = conversationID;
        const message = {
          ...uploadingFilesMessages[conversationID?.toString()],
          isInProgress: FAILED,
        };

        await myClient?.saveAttachmentUploadConversation(
          id?.toString(),
          JSON.stringify(message)
        );
        return error;
      }
      dispatch({
        type: CLEAR_SELECTED_FILES_TO_UPLOAD,
      });
      dispatch({
        type: CLEAR_SELECTED_FILE_TO_VIEW,
      });
    }

    dispatch({
      type: CLEAR_FILE_UPLOADING_MESSAGES,
      body: {
        ID: conversationID,
      },
    });
    await myClient?.removeAttactmentUploadConversationByKey(
      conversationID?.toString()
    );
  };

  const handleFileUpload = async (
    conversationID: number,
    isRetry: boolean,
    isVoiceNote?: boolean,
    voiceNotesToUpload?: any
  ) => {
    if (isVoiceNote) {
      const res = await uploadResource({
        selectedImages: voiceNotesToUpload,
        conversationID: conversationID,
        chatroomID: chatroomID,
        selectedFilesToUpload: voiceNotesToUpload,
        uploadingFilesMessages,
        isRetry: isRetry,
      });

      LMChatAnalytics.track(
        Events.VOICE_NOTE_SENT,
        new Map<string, string>([
          [Keys.CHATROOM_TYPE, chatroomType?.toString()],
          [Keys.CHATROOM_ID, chatroomID?.toString()],
        ])
      );

      return res;
    } else {
      LMChatAnalytics.track(
        Events.ATTACHMENT_UPLOAD_ERROR,
        new Map<string, string>([
          [Keys.CHATROOM_ID, chatroomID?.toString()],
          [Keys.CHATROOM_TYPE, chatroomDBDetails?.type?.toString()],
          [Keys.CLICKED_RETRY, true],
        ])
      );
      const selectedFilesToUpload = uploadingFilesMessages[conversationID];
      dispatch({
        type: SET_FILE_UPLOADING_MESSAGES,
        body: {
          message: {
            ...selectedFilesToUpload,
            isInProgress: SUCCESS,
          },
          ID: conversationID,
        },
      });
      const id = conversationID;
      const message = {
        ...selectedFilesToUpload,
        isInProgress: SUCCESS,
      };

      await myClient?.saveAttachmentUploadConversation(
        id.toString(),
        JSON.stringify(message)
      );
      const res = await uploadResource({
        selectedImages: selectedFilesToUpload?.attachments,
        conversationID: conversationID,
        chatroomID: chatroomID,
        selectedFilesToUpload: selectedFilesToUpload,
        uploadingFilesMessages,
        isRetry: isRetry,
      });
      return res;
    }
  };

  const onReplyPrivatelyClick = async (uuid: any, conversationId: string) => {
    const apiRes = await myClient?.checkDMLimit({
      uuid: uuid,
    });
    const res = apiRes?.data;
    if (apiRes?.success === false) {
      dispatch({
        type: SHOW_TOAST,
        body: { isToast: true, msg: `${apiRes?.errorMessage}` },
      });
    } else {
      const clickedChatroomID = res?.chatroomId;
      if (clickedChatroomID) {
        navigation.pop(1);
        navigation.push(CHATROOM, {
          chatroomID: clickedChatroomID,
          previousChatroomID: chatroomID,
        });
      } else {
        if (res?.isRequestDmLimitExceeded === false) {
          const payload = {
            uuid: uuid,
          };
          const apiResponse = await myClient?.createDMChatroom(payload);
          setShimmerIsLoading(false);
          const response = apiResponse?.data;
          if (apiResponse?.success === false) {
            dispatch({
              type: SHOW_TOAST,
              body: { isToast: true, msg: `${apiResponse?.errorMessage}` },
            });
          } else {
            const createdChatroomID = response?.chatroom?.id;
            if (createdChatroomID) {
              navigation.pop(1);
              navigation.push(CHATROOM, {
                chatroomID: createdChatroomID,
              });
            }
          }
        } else {
          const userDMLimit = res?.userDmLimit;
          Alert.alert(
            REQUEST_DM_LIMIT,
            `You can only send ${
              userDMLimit?.numberInDuration
            } DM requests per ${
              userDMLimit?.duration
            }.\n\nTry again in ${formatTime(res?.newRequestDmTimestamp)}`,
            [
              {
                text: CANCEL_BUTTON,
                style: "default",
              },
            ]
          );
        }
      }
    }
    LMChatAnalytics.track(
      Events.REPLY_PRIVATELY,
      new Map<string, string>([
        [Keys.CHATROOM_ID, chatroomID?.toString()],
        [Keys.MESSAGE_ID, conversationId?.toString()],
        [Keys.SENDER_ID, user?.sdkClientInfo?.uuid?.toString()],
        [Keys.RECEIVER_ID, uuid?.toString()],
      ])
    );
  };

  return (
    <View style={styles.container}>
      {shimmerIsLoading ? (
        <View style={{ marginTop: Layout.normalize(10) }}>
          <View
            style={{
              backgroundColor: "#e8e8e877",
              width: Layout.normalize(200),
              paddingLeft: Layout.normalize(8),
              paddingVertical: Layout.normalize(15),
              borderTopRightRadius: Layout.normalize(12),
              borderTopLeftRadius: Layout.normalize(12),
              borderBottomRightRadius: Layout.normalize(12),
            }}
          >
            <ShimmerPlaceHolder
              style={{
                width: Layout.normalize(150),
                height: Layout.normalize(10),
                borderRadius: Layout.normalize(5),
              }}
            />
            <ShimmerPlaceHolder
              style={{
                width: Layout.normalize(120),
                height: Layout.normalize(10),
                marginTop: Layout.normalize(10),
                borderRadius: Layout.normalize(5),
              }}
            />
          </View>

          <View
            style={{
              backgroundColor: "#e8e8e877",
              alignSelf: "flex-end",
              width: Layout.normalize(200),
              paddingLeft: Layout.normalize(8),
              paddingVertical: Layout.normalize(15),
              borderTopRightRadius: Layout.normalize(12),
              borderTopLeftRadius: Layout.normalize(12),
              borderBottomLeftRadius: Layout.normalize(12),
              marginTop: Layout.normalize(10),
            }}
          >
            <ShimmerPlaceHolder
              style={{
                width: Layout.normalize(150),
                height: Layout.normalize(10),
                borderRadius: Layout.normalize(5),
              }}
            />
            <ShimmerPlaceHolder
              style={{
                width: Layout.normalize(120),
                height: Layout.normalize(10),
                marginTop: Layout.normalize(10),
                borderRadius: Layout.normalize(5),
              }}
            />
          </View>
          <View
            style={{
              backgroundColor: "#e8e8e877",
              width: Layout.normalize(200),
              paddingLeft: Layout.normalize(8),
              paddingVertical: Layout.normalize(15),
              borderTopRightRadius: Layout.normalize(12),
              borderTopLeftRadius: Layout.normalize(12),
              borderBottomRightRadius: Layout.normalize(12),
              marginTop: Layout.normalize(10),
            }}
          >
            <ShimmerPlaceHolder
              style={{
                width: Layout.normalize(150),
                height: Layout.normalize(10),
                borderRadius: Layout.normalize(5),
              }}
            />
            <ShimmerPlaceHolder
              style={{
                width: Layout.normalize(120),
                height: Layout.normalize(10),
                marginTop: Layout.normalize(10),
                borderRadius: Layout.normalize(5),
              }}
            />
          </View>

          <View
            style={{
              backgroundColor: "#e8e8e877",
              alignSelf: "flex-end",
              width: Layout.normalize(200),
              paddingLeft: Layout.normalize(8),
              paddingVertical: Layout.normalize(15),
              borderTopRightRadius: Layout.normalize(12),
              borderTopLeftRadius: Layout.normalize(12),
              borderBottomLeftRadius: Layout.normalize(12),
              marginTop: Layout.normalize(10),
            }}
          >
            <ShimmerPlaceHolder
              style={{
                width: Layout.normalize(150),
                height: Layout.normalize(10),
                borderRadius: Layout.normalize(5),
              }}
            />
            <ShimmerPlaceHolder
              style={{
                width: Layout.normalize(120),
                height: Layout.normalize(10),
                marginTop: Layout.normalize(10),
                borderRadius: Layout.normalize(5),
              }}
            />
          </View>
        </View>
      ) : (
        <>
          {backgroundImage ? (
            <ImageBackground
              resizeMode="cover"
              style={{ flex: 1, justifyContent: "center" }}
              source={backgroundImage}
            >
              {ChatroomTabNavigator && (
                <ChatroomTabNavigator
                  navigation={navigation}
                  chatroomId={currentChatroomId}
                  announcementRoomId={announcementRoomId}
                  gender={gender}
                  lmChatInterface={lmChatInterface}
                />
              )}
              <MessageList
                chatroomID={chatroomID}
                handleLongPress={handleLongPress}
                handleClick={handleClick}
                removeReaction={removeReaction}
                onTapToUndo={onTapToUndo}
                handleFileUpload={handleFileUpload}
                navigation={navigation}
                ref={refInput}
              />
            </ImageBackground>
          ) : (
            <>
              {ChatroomTabNavigator && (
                <ChatroomTabNavigator
                  navigation={navigation}
                  chatroomId={currentChatroomId}
                  announcementRoomId={announcementRoomId}
                  gender={gender}
                  lmChatInterface={lmChatInterface}
                />
              )}
              <MessageList
                chatroomID={chatroomID}
                handleLongPress={handleLongPress}
                handleClick={handleClick}
                removeReaction={removeReaction}
                onTapToUndo={onTapToUndo}
                handleFileUpload={handleFileUpload}
                navigation={navigation}
                ref={refInput}
              />
            </>
          )}
        </>
      )}

      <View
        style={{
          marginTop: "auto",
        }}
      >
        {/* if chatroomType !== 10 (Not DM) then show group bottom changes, else if chatroomType === 10 (DM) then show DM bottom changes */}
        {chatroomType !== ChatroomType.DMCHATROOM &&
        memberRights?.length > 0 ? (
          <View>
            {!(chatroomDBDetailsLength === 0) &&
            previousRoute?.name === EXPLORE_FEED
              ? !chatroomFollowStatus && (
                  <TouchableOpacity
                    onPress={() => {
                      joinSecretChatroom();
                    }}
                    style={[styles.joinBtnContainer, { alignSelf: "center" }]}
                  >
                    <Image
                      source={require("../../assets/images/join_group3x.png")}
                      style={styles.icon}
                    />
                    <Text style={styles.join}>{"Join"}</Text>
                  </TouchableOpacity>
                )
              : null}
            {!(chatroomDBDetailsLength === 0) ? (
              //case to block normal user from messaging in a chatroom where only CMs can message
              user.state !== 1 &&
              chatroomDBDetails?.memberCanMessage === false ? (
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledInputText}>
                    Only Community Manager can message here.
                  </Text>
                </View>
              ) : //case to allow CM for messaging in an Announcement Room
              !(user.state !== 1 && chatroomDBDetails?.type === 7) &&
                chatroomFollowStatus &&
                memberRights[3]?.isSelected === true ? (
                <MessageInputBox
                  chatroomName={chatroomName}
                  chatroomWithUser={chatroomWithUser}
                  replyChatID={replyChatID}
                  chatroomID={chatroomID}
                  navigation={navigation}
                  isUploadScreen={false}
                  myRef={refInput}
                  handleFileUpload={handleFileUpload}
                  isEditable={isEditable}
                  setIsEditable={(value: boolean) => {
                    setIsEditable(value);
                  }}
                  isSecret={isSecret}
                  chatroomType={chatroomType}
                  currentChatroomTopic={currentChatroomTopic}
                />
              ) : //case to block normal users from messaging in an Announcement Room
              user.state !== 1 && chatroomDBDetails?.type === 7 ? (
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledInputText}>
                    Only Community Manager can message here.
                  </Text>
                </View>
              ) : memberRights[3]?.isSelected === false ? (
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledInputText}>
                    The community managers have restricted you from responding
                    here.
                  </Text>
                </View>
              ) : !(Object.keys(chatroomDBDetails)?.length === 0) &&
                previousRoute?.name === HOMEFEED &&
                isRealmDataPresent ? (
                <View
                  style={{
                    padding: Layout.normalize(20),
                    backgroundColor: STYLES.$COLORS.TERTIARY,
                  }}
                >
                  <Text
                    style={styles.inviteText}
                  >{`${chatroomDBDetails?.header} invited you to join this secret group.`}</Text>
                  <View style={{ marginTop: Layout.normalize(10) }}>
                    <TouchableOpacity
                      onPress={() => {
                        showJoinAlert();
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: Layout.normalize(10),
                        flexGrow: 1,
                        paddingVertical: Layout.normalize(10),
                      }}
                    >
                      <Image
                        style={styles.emoji}
                        source={require("../../assets/images/like_icon3x.png")}
                      />
                      <Text style={styles.inviteBtnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        showRejectAlert();
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: Layout.normalize(10),
                        flexGrow: 1,
                        paddingVertical: Layout.normalize(10),
                      }}
                    >
                      <Image
                        style={styles.emoji}
                        source={require("../../assets/images/ban_icon3x.png")}
                      />
                      <Text style={styles.inviteBtnText}>{REJECT_BUTTON}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledInputText}>
                    Responding is disabled
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>Loading...</Text>
              </View>
            )}
          </View>
        ) : chatroomType === ChatroomType.DMCHATROOM &&
          memberRights?.length > 0 ? (
          <View>
            {chatRequestState === 0 &&
            (chatroomDBDetails?.chatRequestedBy
              ? chatroomDBDetails?.chatRequestedBy?.id !== user?.id?.toString()
              : null) ? (
              <View style={styles.dmRequestView}>
                <Text style={styles.inviteText}>{DM_REQUEST_SENT_MESSAGE}</Text>
                <View style={styles.dmRequestButtonBox}>
                  <TouchableOpacity
                    onPress={() => {
                      handleDMApproveClick();
                    }}
                    style={styles.requestMessageTextButton}
                  >
                    <Image
                      style={styles.emoji}
                      source={require("../../assets/images/like_icon3x.png")}
                    />
                    <Text style={styles.inviteBtnText}>{APPROVE_BUTTON}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleDMRejectClick();
                    }}
                    style={styles.requestMessageTextButton}
                  >
                    <Image
                      style={styles.emoji}
                      source={require("../../assets/images/ban_icon3x.png")}
                    />
                    <Text style={styles.inviteBtnText}>{REJECT_BUTTON}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            {showDM === false ? (
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>
                  {COMMUNITY_MANAGER_DISABLED_CHAT}
                </Text>
              </View>
            ) : showDM === true &&
              (chatRequestState === 0 || chatRequestState === 2) ? (
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>{REQUEST_SENT}</Text>
              </View>
            ) : (showDM === true && chatRequestState === 1) ||
              chatRequestState === null ? (
              <MessageInputBox
                replyChatID={replyChatID}
                chatroomID={chatroomID}
                chatRequestState={chatRequestState}
                chatroomType={chatroomType}
                navigation={navigation}
                isUploadScreen={false}
                isPrivateMember={chatroomDBDetails?.isPrivateMember}
                myRef={refInput}
                handleFileUpload={handleFileUpload}
                isEditable={isEditable}
                setIsEditable={(value: boolean) => {
                  setIsEditable(value);
                }}
              />
            ) : (
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>Loading...</Text>
              </View>
            )}
          </View>
        ) : null}
      </View>

      {/* Chatroom Action Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <Pressable style={styles.centeredView} onPress={handleModalClose}>
          <View>
            <Pressable onPress={() => {}} style={[styles.modalView]}>
              {filteredChatroomActions?.map((val: any, index: any) => {
                return (
                  <TouchableOpacity
                    onPress={async () => {
                      if (val?.id === ChatroomActions.VIEW_PARTICIPANTS) {
                        setModalVisible(false);
                        // navigation.navigate(VIEW_PARTICIPANTS, {
                        //   chatroomID: chatroomID,
                        //   isSecret: isSecret,
                        //   chatroomName: chatroomName,
                        // });
                      } else if (
                        val?.id === ChatroomActions.LEAVE_CHATROOM ||
                        val?.id === ChatroomActions.LEAVE_SECRET_CHATROOM
                      ) {
                        // showWarningModal();
                        setModalVisible(false);
                      } else if (val?.id === ChatroomActions.JOIN_CHATROOM) {
                        if (!isSecret) {
                          // joinChatroom();
                        }
                        setModalVisible(false);
                      } else if (
                        val?.id === ChatroomActions.MUTE_NOTIFICATIONS
                      ) {
                        // await muteNotifications();
                        setModalVisible(false);
                      } else if (
                        val?.id === ChatroomActions.UNMUTE_NOTIFICATIONS
                      ) {
                        // await unmuteNotifications();
                        setModalVisible(false);
                      } else if (val?.id === ChatroomActions.VIEW_PROFILE) {
                        //View Profile code
                      } else if (val?.id === ChatroomActions.BLOCK_MEMBER) {
                        // await handleBlockMember();
                        setModalVisible(false);
                      } else if (val?.id === ChatroomActions.UNBLOCK_MEMBER) {
                        // await unblockMember();
                        setModalVisible(false);
                      } else if (val?.id === ChatroomActions.SHARE) {
                        // Share flow
                        // onShare(
                        //   chatroomID,
                        //   chatroomType,
                        //   chatroomDBDetails?.isSecret
                        // );
                      }
                    }}
                    key={val?.id}
                    style={styles.filtersView}
                  >
                    <Text style={styles.filterText}>{val?.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Report Action Modal */}
      <Modal
        transparent={true}
        visible={reportModalVisible && selectedMessages?.length == 1}
        onRequestClose={() => {
          setReportModalVisible(!modalVisible);
        }}
      >
        <Pressable style={styles.centeredView} onPress={handleReportModalClose}>
          <View>
            <Pressable onPress={() => {}} style={[styles.modalView]}>
              {isMessagePrivately ? (
                <TouchableOpacity
                  onPress={() => {
                    const uuid =
                      selectedMessages[0]?.member?.sdkClientInfo?.uuid;

                    onReplyPrivatelyClick(uuid, selectedMessages[0]?.id);
                    dispatch({ type: SELECTED_MESSAGES, body: [] });
                    setReportModalVisible(false);
                    // handleReportModalClose()
                  }}
                  style={styles.filtersView}
                >
                  <Text style={styles.filterText}>Message Privately</Text>
                </TouchableOpacity>
              ) : null}

              {isChatroomTopic && chatroomType !== ChatroomType.DMCHATROOM ? (
                <TouchableOpacity
                  onPress={async () => {
                    setChatroomTopic();
                    setReportModalVisible(false);
                  }}
                  style={styles.filtersView}
                >
                  <Text style={styles.filterText}>Set chatroom topic</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(REPORT, {
                    conversationID: selectedMessages[0]?.id,
                    chatroomID: chatroomID,
                    selectedMessages: selectedMessages[0],
                  });
                  dispatch({ type: SELECTED_MESSAGES, body: [] });
                  setReportModalVisible(false);
                }}
                style={styles.filtersView}
              >
                <Text style={styles.filterText}>Report Message</Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Message Reaction Modal */}
      <Modal
        transparent={true}
        visible={isReact}
        onRequestClose={() => {
          setIsReact(false);
        }}
      >
        <Pressable
          style={styles.reactionCenteredView}
          onPress={handleReactionModalClose}
        >
          <View>
            <Pressable
              onPress={() => {}}
              style={[
                styles.reactionModalView,
                {
                  top:
                    position.y > Layout.window.height / Layout.normalize(2)
                      ? Platform.OS === "ios"
                        ? position.y - Layout.normalize(150)
                        : position.y - Layout.normalize(100)
                      : position.y - Layout.normalize(10),
                },
              ]}
            >
              {reactionArr?.map((val: any, index: any) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      sendReaction(val, false);
                    }}
                    key={val + index}
                    style={styles.reactionFiltersView}
                  >
                    <Text style={styles.filterText}>{val}</Text>
                  </TouchableOpacity>
                );
              })}
              <Pressable
                style={[
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: Layout.normalize(10),
                    marginTop: Layout.normalize(8),
                  },
                ]}
                onPress={() => {
                  setIsOpen(true);
                  setIsReact(false);
                }}
              >
                <Image
                  style={{
                    height: Layout.normalize(25),
                    width: Layout.normalize(25),
                    resizeMode: "contain",
                  }}
                  source={require("../../assets/images/add_more_emojis3x.png")}
                />
              </Pressable>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Emoji Keyboard Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isOpen}
        onRequestClose={() => {
          setIsOpen(false);
        }}
      >
        <Pressable
          style={styles.emojiCenteredView}
          onPress={() => {
            setIsOpen(false);
          }}
        >
          <View>
            <Pressable onPress={() => {}} style={[styles.emojiModalView]}>
              <View style={{ height: Layout.normalize(350) }}>
                <EmojiKeyboard
                  categoryPosition="top"
                  onEmojiSelected={handlePick}
                />
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* CHATROOM LEAVING WARNING message modal */}
      <WarningMessageModal
        hideWarningModal={hideWarningModal}
        warningMessageModalState={isWarningMessageModalState}
        warningMessage={
          isSecret ? WARNING_MSG_PRIVATE_CHATROOM : WARNING_MSG_PUBLIC_CHATROOM
        }
        leaveChatroom={() => {
          if (isSecret) {
            leaveSecretChatroom();
          } else {
            leaveChatroom();
          }
        }}
      />

      {/* APPROVE DM request Modal */}
      <ApproveDMRequestModal
        hideDMApproveAlert={hideDMApproveAlert}
        DMApproveAlertModalVisible={DMApproveAlertModalVisible}
        onApprove={onApprove}
      />

      {/* REJECT DM request Modal */}
      <RejectDMRequestModal
        hideDMRejectAlert={hideDMRejectAlert}
        DMRejectAlertModalVisible={DMRejectAlertModalVisible}
        onReject={onReject}
        navigation={navigation}
        chatroomID={chatroomID}
        chatroomType={chatroomType}
      />

      {/* BLOCK DM request Modal */}
      <BlockDMRequestModal
        hideDMBlockAlert={hideDMBlockAlert}
        DMBlockAlertModalVisible={DMBlockAlertModalVisible}
        blockMember={blockMember}
        chatroomName={chatroomName}
      />

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
