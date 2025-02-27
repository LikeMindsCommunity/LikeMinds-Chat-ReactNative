import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  ACCEPT_INVITE_SUCCESS,
  ADD_STATE_MESSAGE,
  CLEAR_CHATROOM_CONVERSATION,
  CLEAR_CHATROOM_DETAILS,
  CLEAR_CHATROOM_TOPIC,
  CLEAR_FAILED_MESSAGE_ID,
  CLEAR_FILE_UPLOADING_MESSAGES,
  CLEAR_SELECTED_FILE_TO_VIEW,
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_MESSAGES,
  GET_CHATROOM_ACTIONS_SUCCESS,
  GET_CHATROOM_DB_SUCCESS,
  GET_CONVERSATIONS_SUCCESS,
  HIDE_SHIMMER,
  LONG_PRESSED,
  REACTION_SENT,
  REJECT_INVITE_SUCCESS,
  SELECTED_MESSAGES,
  SET_CHATROOM_CREATOR,
  SET_CHATROOM_TOPIC,
  SET_DM_PAGE,
  SET_EXPLORE_FEED_PAGE,
  SET_FILE_UPLOADING_MESSAGES,
  SET_IS_REPLY,
  SET_PAGE,
  SET_REPLY_MESSAGE,
  SET_TEMP_STATE_MESSAGE,
  SHOW_TOAST,
  UPDATE_CHAT_REQUEST_STATE,
} from "../store/types/types";
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  Keyboard,
  LogBox,
  View,
} from "react-native";
import STYLES from "../constants/Styles";
import {
  CommonActions,
  StackActions,
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BUCKET, POOL_ID, REGION } from "../awsExports";
import { CognitoIdentityCredentials, S3 } from "aws-sdk";
import AWS from "aws-sdk";
import {
  ChatroomChatRequestState,
  ChatroomType,
  Events,
  Keys,
  MemberState,
  Sources,
} from "../enums";
import {
  GetConversationsRequestBuilder,
  SyncConversationRequest,
} from "@likeminds.community/chat-rn";
import { Credentials } from "../credentials";
import { initAPI } from "../store/actions/homefeed";
import { createTemporaryStateMessage, splitFileName } from "../utils/chatroomUtils";
import { LMChatAnalytics } from "../analytics/LMChatAnalytics";
import { getChatroomType, getConversationType } from "../utils/analyticsUtils";
import {
  CHATROOM,
  DM_ALL_MEMBERS,
  EXPLORE_FEED,
  HOMEFEED,
} from "../constants/Screens";
import { DataSnapshot, onValue, ref } from "firebase/database";
import { getExploreFeedData } from "../store/actions/explorefeed";
import {
  AUDIO_TEXT,
  CANCEL_BUTTON,
  CONFIRM_BUTTON,
  FAILED,
  GIF_TEXT,
  IMAGE_TEXT,
  JOIN_CHATROOM,
  JOIN_CHATROOM_MESSAGE,
  PDF_TEXT,
  REJECT_INVITATION,
  REJECT_INVITATION_MESSAGE,
  REQUEST_DM_LIMIT,
  SUCCESS,
  VIDEO_TEXT,
  VOICE_NOTE_TEXT,
} from "../constants/Strings";
import { getChatroom, onConversationsCreate } from "../store/actions/chatroom";
import { fetchResourceFromURI, formatTime, generateGifName } from "../commonFuctions";
import { Image as CompressedImage } from "react-native-compressor";
import { Client } from "../client";
import AudioPlayer from "../optionalDependecies/AudioPlayer";
import { Attachment } from "@likeminds.community/chat-rn/dist/shared/responseModels/Attachment";
import { SdkTheme } from "../setupChat";
import { Themes } from "../enums/Themes";
import { ScreenName } from "../enums/ScreenNameEnums"
import { Conversation } from "@likeminds.community/chat-rn/dist/shared/responseModels/Conversation";

interface UploadResource {
  selectedImages: any;
  conversationID: any;
  chatroomID: any;
  selectedFilesToUpload: any;
  uploadingFilesMessages: any;
  isRetry: boolean;
}

interface UploadResourceRetry {
  selectedImages: any;
  conversationID: any;
  chatroomID: any;
  conversation: any,
  isRetry: boolean;
  failedUploads: any;
  index: any;
}

interface ChatroomContextProps {
  children: ReactNode;
}

export interface ChatroomContextValues {
  navigation: any;
  conversations: any;
  chatroomID: string;
  isNavigationToSearchedConversation: boolean;
  searchedConversation: any;
  previousChatroomID: any;
  showDM: boolean;
  user: any;
  community: any;
  memberRights: any;
  position: any;
  chatroomWithUser: any;
  chatroomDetails: any;
  chatroomDBDetails: any;
  chatroomType: ChatroomType;
  isLongPress: boolean;
  selectedMessages: any[];
  currentChatroomTopic: any;
  reactionArr: string[];
  replyChatID?: number;
  isToast: boolean;
  msg: string;
  reportModalVisible: boolean;
  isReact: boolean;
  isOpen: boolean;
  DMApproveAlertModalVisible: boolean;
  DMRejectAlertModalVisible: boolean;
  DMBlockAlertModalVisible: boolean;
  isMessagePrivately: boolean;
  isEditable: boolean;
  isWarningMessageModalState: boolean;
  shimmerIsLoading: boolean;
  isRealmDataPresent: boolean;
  chatroomFollowStatus: string;
  memberCanMessage: boolean;
  chatroomDBDetailsLength: number;
  isChatroomTopic: boolean;
  chatRequestState: any;
  chatroomName: string;
  chatroomProfile: any;
  previousRoute: any;
  isSecret: boolean;
  filteredChatroomActions: any[];
  modalVisible: boolean;
  refInput: any;
  shimmerVisibleForChatbot: boolean;
  messageSentByUserId: string;

  // Functions
  setIsEditable: Dispatch<SetStateAction<boolean>>;
  setIsReact: Dispatch<SetStateAction<boolean>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsToast: Dispatch<SetStateAction<boolean>>;
  setReplyChatID: Dispatch<SetStateAction<number | undefined>>;
  setChatroomTopic: () => void;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  setReportModalVisible: Dispatch<SetStateAction<boolean>>;
  handleReportModalClose: () => void;
  handleModalClose: () => void;
  handleReactionModalClose: () => void;
  leaveChatroom: () => void;
  showWarningModal: () => void;
  hideWarningModal: () => void;
  leaveSecretChatroom: () => void;
  joinChatroom: () => void;
  joinSecretChatroom: () => void;
  muteNotifications: () => void;
  unmuteNotifications: () => void;
  showJoinAlert: () => void;
  showRejectAlert: () => void;
  sendReaction: (val: string, isReactionButton: boolean) => void;
  removeReaction: (item: any, reactionArr: any, removeFromList?: any) => void;
  handlePick: (emojiObject: any) => void;
  handleLongPress: (
    isStateIncluded: boolean,
    isIncluded: boolean,
    item: any,
    selectedMessages: any
  ) => void;
  handleClick: (
    isStateIncluded: boolean,
    isIncluded: boolean,
    item: any,
    emojiClicked: boolean,
    selectedMessages: any
  ) => void;
  onApprove: () => void;
  onReject: () => void;
  onTapToUndo: () => void;
  blockMember: () => void;
  unblockMember: () => void;
  handleDMApproveClick: () => void;
  handleDMRejectClick: () => void;
  handleBlockMember: () => void;
  hideDMApproveAlert: () => void;
  hideDMRejectAlert: () => void;
  hideDMBlockAlert: () => void;
  handleFileUpload: (
    conversationID: number,
    isRetry: boolean,
    isVoiceNote?: boolean,
    voiceNotesToUpload?: any
  ) => void;
  onReplyPrivatelyClick: (uuid: string, conversationID: number) => void;
  setShimmerVisibleForChatbot: Dispatch<SetStateAction<boolean>>;
  setMessageSentByUserId: Dispatch<SetStateAction<string>>;
  backAction: any;
  uploadResourceRetry: (params: UploadResourceRetry) => any;
  onRetryButtonClicked: (item: any, setShowRetry: any, setRetryUploadInProgress: any, retryUploadInProgress: any) => void;
}

const ChatroomContext = createContext<ChatroomContextValues | undefined>(
  undefined
);

export const useChatroomContext = () => {
  const context = useContext(ChatroomContext);
  if (!context) {
    throw new Error(
      "useChatroomContext must be used within an ChatroomContextProvider"
    );
  }
  return context;
};

export const ChatroomContextProvider = ({ children }: ChatroomContextProps) => {
  const myClient = Client.myClient;

  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute();

  const {
    chatroomID,
    previousChatroomID,
    navigationFromNotification,
    deepLinking,
    isNavigationToSearchedConversation,
    searchedConversation,
  } = route.params as {
    chatroomID: any; // Adjust the type accordingly
    previousChatroomID: any; // Adjust the type accordingly
    navigationFromNotification: any; // Adjust the type accordingly
    deepLinking: any; // Adjust the type accordingly
    isNavigationToSearchedConversation: any;
    searchedConversation: any;
  };

  const refInput = useRef<any>();

  const db = myClient?.firebaseInstance();
  const dipatch = useAppDispatch();

  const [replyChatID, setReplyChatID] = useState<number>();

  const [modalVisible, setModalVisible] = useState(false);
  const [shimmerVisibleForChatbot, setShimmerVisibleForChatbot] = useState(false);

  const [messageSentByUserId, setMessageSentByUserId] = useState("");
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
    messageId
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
  const [isFound, setIsFound] = useState(false);

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
      return currentSelectedMessage;
    }
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
      if (DB_DATA?.topicId) {
        const conversation = await myClient?.getConversation(DB_DATA?.topicId);
        dispatch({
          type: SET_CHATROOM_TOPIC,
          body: {
            currentChatroomTopic: conversation[0],
          },
        });
      } else if (!DB_DATA?.topicId) {
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
    // if FileUpload Screen is opened then don't call API's
    if (route.name == ScreenName.FileUpload) {
      return;
    }
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

  // This useEffect is used to highlight the chatroom topic conversation for 1 sec on scrolling to it
  useEffect(() => {
    if (isFound) {
      setTimeout(() => {
        setIsFound(false);
      }, 1000);
    }
  }, [isFound, chatroomID]);

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
    // if FileUpload Screen is opened then don't call API's
    if (route.name == ScreenName.FileUpload) {
      return;
    }
    const invokeFunction = async () => {
      if (navigationFromNotification) {
        if (appState.match(/active|foreground/)) {
          // App has gone to the background
          // await fetchInitAPI();
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
      AudioPlayer ? AudioPlayer?.default?.reset() : null;
    };
  }, [chatroomID]);

  // this useEffect is to stop audio player when the app is in background
  useEffect(() => {
    if (!isFocused) {
      AudioPlayer ? AudioPlayer?.default?.reset() : null;
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
          navigation?.push(CHATROOM, {
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
            navigation?.push(CHATROOM, {
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

  useEffect(() => {
    if ((chatroomType == ChatroomType.OPENCHATROOM ||
      chatroomType == ChatroomType.ANNOUNCEMENTROOM) &&
      selectedMessages?.length == 1 &&
      (SdkTheme.sdkTheme == Themes.COMMUNITY_HYBRID)
    ) {
      callAPI();
    }

    async function callAPI() {
      const apiRes = await myClient?.canDmFeed({
        reqFrom: "group_channel",
        chatroomId: chatroomID,
        uuid: selectedMessages[0]?.member?.sdkClientInfo?.uuid,
      });
      const response = apiRes?.data;
      if (response?.cta) {
        const match = response?.cta?.match(/show_list=([^&]+)/);
        if (match && match[1]) {
          setShowList(match[1]);
        }
        setShowDM(response?.showDm);
      }
    }
  }, [chatroomID, chatroomDBDetails, selectedMessages])

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
    if ((DB_RESPONSE?.chatroomMeta[chatroomID])?.chatRequestState == 1) {
      await myClient?.updateChatRequestState(
        chatroomID?.toString(),
        ChatroomChatRequestState.ACCEPTED
      );
    }
    let flagForShimmer = shimmerVisibleForChatbot
    if (DB_RESPONSE?.conversationsData?.length !== 0) {
      await myClient?.saveConversationData(
        DB_RESPONSE,
        DB_RESPONSE?.chatroomMeta,
        DB_RESPONSE?.conversationsData,
        community?.id
      );

      if (messageSentByUserId != conversationId) {
        setShimmerVisibleForChatbot(() => false);
        flagForShimmer = false;
      }

      if (messageId != conversationId) {
        dispatch({
          type: HIDE_SHIMMER
        })
        setShimmerVisibleForChatbot(false);
      }
    }
    if (page === 1) {
      const payload = GetConversationsRequestBuilder.builder()
        .setChatroomId(chatroomID?.toString())
        .setLimit(PAGE_SIZE)
        .build();
      let conversationsFromRealm = await myClient?.getConversations(payload);
      // if uploadingFilesMessages is not empty then add those messages to the conversation list
      if (Object.keys(uploadingFilesMessages)?.length > 0) {
        conversationsFromRealm = [...Object.values(uploadingFilesMessages), ...conversationsFromRealm]
      }
      dispatch({
        type: GET_CONVERSATIONS_SUCCESS,
        body: { conversations: conversationsFromRealm, shimmer: flagForShimmer },
      });
    }
    return;
  };

  //useffect includes firebase realtime listener
  useEffect(() => {
    // if FileUpload Screen is opened then don't call API's
    if (route.name == ScreenName.FileUpload) {
      return;
    }
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
          fetchChatroomDetails();
        }
      }
    });
  }, [chatroomID, messageSentByUserId, messageId]);

  // this useffect updates routes, previousRoute variables when we come to chatroom.
  useEffect(() => {
    if (isFocused) {
      routes = (navigation.getState())?.routes;
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
    const selectedMessagesLength = selectedMessages?.length;
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

  // method to close the three dot modal
  const handleModalClose = () => {
    setModalVisible(false);
  };

  // method to close the reaction modal
  const handleReactionModalClose = () => {
    setIsReact(false);
  };

  // method to leave chatroom
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

  // method to show warning modal
  const showWarningModal = () => {
    setIsWarningMessageModalState(true);
  };

  // method to hide warning modal
  const hideWarningModal = () => {
    setIsWarningMessageModalState(false);
  };

  // method to leave secret chatroom
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

  // method to join chatroom
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

  // method to join secret chatroom
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

  // method to mute notifications
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

  // method to unmute notifications
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

  // method to show join button alert
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

  // method to show reject button alert
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
    conversationID: number,
    reaction: string,
    isReactionButton: boolean
  ) => {
    const res = await myClient?.putReaction({
      conversationId: conversationID,
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
        [Keys.MESSAGE_ID, conversationID?.toString()],
        [Keys.CHATROOM_ID, chatroomID?.toString()],
      ])
    );
  };

  // this function calls removeReactionAPI
  const removeReactionAPI = async (
    conversationID: number,
    reaction: string
  ) => {
    const res = await myClient?.deleteReaction({
      chatroomId: chatroomID,
      conversationId: conversationID,
      reaction: reaction,
    });
  };

  // this function is for sending a reaction from conversation
  const sendReaction = (val: string, isReactionButton: boolean) => {
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
    isStateIncluded: boolean,
    isIncluded: boolean,
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
    isStateIncluded: boolean,
    isIncluded: boolean,
    item: any,
    emojiClicked: boolean,
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
    await fetchChatroomDetails();

    dispatch({
      type: ADD_STATE_MESSAGE,
      body: { conversation: response?.data?.conversation },
    });
    await myClient?.saveNewConversation(
      chatroomID?.toString(),
      response?.data?.conversation
    );

    return response;
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

    await paginatedConversationSyncAPI(INITIAL_SYNC_PAGE,
      0,
      Date.now() * 1000)
    await fetchChatroomDetails();

    return response;
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
    await paginatedConversationSyncAPI(INITIAL_SYNC_PAGE,
      0,
      Date.now() * 1000)
    await fetchChatroomDetails();
    return response;
  };

  // this function calls API to block a member
  const blockMember = async () => {
    const payload = {
      chatroomId: chatroomID,
      status: ChatroomChatRequestState.INITIATED,
    };
    dispatch({
      type: SHOW_TOAST,
      body: { isToast: true, msg: "Member blocked" },
    });
    const response = await myClient?.blockMember(payload);
    dispatch({
      type: ADD_STATE_MESSAGE,
      body: { conversation: response?.data?.conversation },
    });
    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.REJECTED
    );
    await paginatedConversationSyncAPI(INITIAL_SYNC_PAGE,
      0,
      Date.now() * 1000)
    await fetchChatroomDetails();
    return response;
  };

  // this function calls API to unblock a member
  const unblockMember = async () => {
    const payload = {
      chatroomId: chatroomID,
      status: ChatroomChatRequestState.ACCEPTED,
    };
    dispatch({
      type: SHOW_TOAST,
      body: { isToast: true, msg: "Member unblocked" },
    });
    const response = await myClient?.blockMember(payload);
    dispatch({
      type: ADD_STATE_MESSAGE,
      body: { conversation: response?.data?.conversation },
    });
    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.ACCEPTED
    );
    fetchChatroomDetails();
    return response;
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

  // method to show dm approve alert
  const showDMApproveAlert = () => {
    setDMApproveAlertModalVisible(true);
  };

  // method to hide dm approve alert
  const hideDMApproveAlert = () => {
    setDMApproveAlertModalVisible(false);
  };

  // method to show dm reject alert
  const showDMRejectAlert = () => {
    setDMRejectAlertModalVisible(true);
  };

  // method to hide dm reject alert
  const hideDMRejectAlert = () => {
    setDMRejectAlertModalVisible(false);
  };

  // method to show dm blocked alert
  const showDMBlockAlert = () => {
    setDMBlockAlertModalVisible(true);
  };

  // method to hide dm blocked alert
  const hideDMBlockAlert = () => {
    setDMBlockAlertModalVisible(false);
  };

  // method to create blob and upload to aws
  const uploadResource = async ({
    selectedImages,
    conversationID,
    chatroomID,
    selectedFilesToUpload,
    uploadingFilesMessages,
    isRetry,
  }: UploadResource) => {
    LogBox.ignoreLogs(["new NativeEventEmitter"]);
    let attachments: Attachment[] = [];
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

      const fileInfo = splitFileName(name);
      const path = `files/collabcard/${chatroomID}/conversation/${user?.uuid}/${fileInfo?.name}-${conversationID}.${fileInfo.extension}`;
      const thumbnailUrlPath = `files/collabcard/${chatroomID}/conversation/${user?.uuid}/${thumbnailURL}`

      let uriFinal: any;
      try {

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

          const payload: Attachment = {
            id: conversationID,
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
            awsFolderPath: path,
            localFilePath: item.uri,
            thumbnailAWSFolderPath: thumbnailUrlPath,
            thumbnailLocalFilePath: fileType === VIDEO_TEXT ? thumbnailURL : null,
            fileUrl: awsResponse,
            createdAt: conversationID,
            updatedAt: conversationID,
            isUploaded: true
          };

          attachments.push(payload);
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
    return attachments;
  };

  // method to handle file upload
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

      if (Array.isArray(res)) {
        return res;
      }
      return null;
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
      if (Array?.isArray(res)) {
        return res;
      }

      return null;
    }
  };

  async function onRetryButtonClicked(item: any, setShowRetry: any, setRetryUploadInProgress: any, retryUploadInProgress: any) {
    if (retryUploadInProgress) {
      return null;
    }

    setRetryUploadInProgress(true);
    const failedUploads: any[] = [];
    const uploadResponse: any[] = [];

    for (let i = 0; i < (item?.attachments?.length || 0); i++) {
      const attachmentObject = item.attachments[i];

      if (attachmentObject?.isUploaded === false || attachmentObject?.isUploaded == undefined || attachmentObject?.isUploaded == null) {
        const res = await uploadResourceRetry({
          selectedImages: attachmentObject,
          conversationID: item?.id,
          chatroomID: item?.chatroomId,
          conversation: item,
          isRetry: false,
          failedUploads,
          index: i,
        });
        if (res) {
          uploadResponse.push(res);
        }
      } else {
        uploadResponse?.push(attachmentObject);
      }
    }


    if (failedUploads?.length > 0) {
      setRetryUploadInProgress(false);
      return null;
    }


    let payload: any = {
      chatroomId: chatroomID,
      hasFiles: item?.attachments?.length > 0 ? true : false,
      text: item?.answer?.trim(),
      temporaryId: item?.temporaryId?.toString(),
      attachmentCount: item?.attachments?.length,
      repliedConversationId: item?.replyConversationId?.id,
      attachments: uploadResponse,
      triggerBot: false,
    };

    item.localCreatedEpoch = Date.now();
    if (uploadResponse?.length > 0) {
      (item as Conversation).attachmentUploadedEpoch = Date.now();
    }

    try {
      const response: any = await dispatch(
        onConversationsCreate(payload) as any
      );
      if (response?.conversation) {
        setShowRetry(false);
        dispatch({
          type: CLEAR_FAILED_MESSAGE_ID
        })
        await Client?.myClient?.updateConversationData(response?.conversation, response?.widgets)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setRetryUploadInProgress(false);
    }
  }


  const uploadResourceRetry = async ({
    selectedImages,
    conversationID,
    chatroomID,
    conversation,
    isRetry,
    failedUploads,
    index
  }: UploadResourceRetry) => {
    LogBox.ignoreLogs(["new NativeEventEmitter"]);
    let response: any = null;
    const item = selectedImages
    if (item == null || item == undefined) return response
    const attachmentType = isRetry ? item?.type : item?.type?.split("/")[0];
    const gifAttachmentType = item?.data?.type;
    const docAttachmentType = item?.type
    const thumbnailURL = item?.thumbnailUrl;
    const gifHeight = item?.data?.images?.fixed_width?.height;
    const gifWidth = item?.data?.images?.fixed_width?.width;
    const name =
      attachmentType === IMAGE_TEXT
        ? item.name
        : attachmentType === VIDEO_TEXT
          ? item.name
          : gifAttachmentType === GIF_TEXT
            ? generateGifName()
            : docAttachmentType === PDF_TEXT
              ? item.name
              : item?.name;


    const path = `files/collabcard/${chatroomID}/conversation/${conversationID}/${name}`;
    const thumbnailUrlPath = `files/collabcard/${chatroomID}/conversation/${conversationID}/${thumbnailURL}`;
    let uriFinal: any;

    try {

      if (attachmentType === IMAGE_TEXT) {
        const compressedImgURI = await CompressedImage.compress(item.url, {
          compressionMethod: "auto",
        });
        const compressedImg = await fetchResourceFromURI(compressedImgURI);
        uriFinal = compressedImg;
      } else {
        const img = await fetchResourceFromURI(item?.url);
        uriFinal = img;
      }

      //for video thumbnail
      let thumbnailUrlImg: any;
      if (
        thumbnailURL &&
        (attachmentType === VIDEO_TEXT || gifAttachmentType === GIF_TEXT)
      ) {
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

      let getVideoThumbnailData: any = null;
      if (
        thumbnailURL &&
        (attachmentType === VIDEO_TEXT || gifAttachmentType === GIF_TEXT)
      ) {
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
        } else if (gifAttachmentType === GIF_TEXT) {
          fileType = GIF_TEXT;
        }

        const payload: any = {
          conversationId: conversationID,
          id: conversationID,
          index: index + 1,
          meta:
            fileType === VIDEO_TEXT
              ? {
                size: item?.metaRO?.size,
                duration: item?.metaRO?.duration,
              }
              : fileType === VOICE_NOTE_TEXT ? {
                size: item?.metaRO?.size,
                duration: item?.metaRO?.duration,
              }
                : {
                  size: item?.metaRO?.size
                },
          name,
          type: item?.type,
          url: awsResponse,
          thumbnailUrl:
            fileType === VIDEO_TEXT || fileType === GIF_TEXT
              ? getVideoThumbnailData?.Location
              : null,
          height: gifHeight ? gifHeight : null,
          width: gifWidth ? gifWidth : null,
          chatroomId: conversation?.chatroomId ?? item?.chatroomId,
          communityId: conversation?.communityId,
          isUploaded: true
        };

        await Client?.myClient?.updateAttachment(
          conversationID,
          payload
        )

        response = payload

        LMChatAnalytics.track(
          Events.ATTACHMENT_UPLOADED,
          new Map<string, string>([
            [Keys.CHATROOM_ID, chatroomID?.toString()],
            [Keys.CHATROOM_TYPE, chatroomDBDetails?.type?.toString()],
            [Keys.MESSAGE_ID, conversationID?.toString()],
            [Keys.TYPE, attachmentType],
          ])
        );
      }
    } catch (error) {

      failedUploads?.push(selectedImages);
    }
    dispatch({
      type: CLEAR_SELECTED_FILES_TO_UPLOAD,
    });
    dispatch({
      type: CLEAR_SELECTED_FILE_TO_VIEW,
    });
    return response;
  }

  // method to be trigerred on initiating of reply privately
  const onReplyPrivatelyClick = async (
    uuid: string,
    conversationId: number
  ) => {
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
        navigation?.pop(1);
        navigation?.push(CHATROOM, {
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
              navigation?.pop(1);
              navigation?.push(CHATROOM, {
                chatroomID: createdChatroomID,
              });
            }
          }
        } else {
          const userDMLimit = res?.userDmLimit;

          // to show alert only if API has valid response
          if (userDMLimit) {
            Alert.alert(
              REQUEST_DM_LIMIT,
              `You can only send ${userDMLimit?.numberInDuration
              } DM requests per ${userDMLimit?.duration
              }.\n\nTry again in ${formatTime(res?.newRequestDmTimestamp as number)}`,
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

  const contextValues: ChatroomContextValues = {
    navigation,
    conversations,
    chatroomID,
    isNavigationToSearchedConversation,
    searchedConversation,
    previousChatroomID,
    showDM,
    user,
    community,
    memberRights,
    position,
    chatroomWithUser,
    chatroomDetails,
    chatroomDBDetails,
    chatroomType,
    isLongPress,
    selectedMessages,
    currentChatroomTopic,
    reactionArr,
    replyChatID,
    isToast,
    msg,
    reportModalVisible,
    isReact,
    isOpen,
    DMApproveAlertModalVisible,
    DMRejectAlertModalVisible,
    DMBlockAlertModalVisible,
    isMessagePrivately,
    isEditable,
    isWarningMessageModalState,
    shimmerIsLoading,
    isRealmDataPresent,
    chatroomFollowStatus,
    memberCanMessage,
    chatroomDBDetailsLength,
    isChatroomTopic,
    chatRequestState,
    chatroomName,
    chatroomProfile,
    previousRoute,
    isSecret,
    filteredChatroomActions,
    modalVisible,
    refInput,
    shimmerVisibleForChatbot,
    messageSentByUserId,
    uploadResourceRetry,
    onRetryButtonClicked,

    setIsEditable,
    setIsReact,
    setIsOpen,
    setIsToast,
    setReplyChatID,
    setChatroomTopic,
    setModalVisible,
    setReportModalVisible,
    handleReportModalClose,
    handleModalClose,
    handleReactionModalClose,
    leaveChatroom,
    showWarningModal,
    hideWarningModal,
    leaveSecretChatroom,
    joinChatroom,
    joinSecretChatroom,
    muteNotifications,
    unmuteNotifications,
    showJoinAlert,
    showRejectAlert,
    sendReaction,
    removeReaction,
    handlePick,
    handleLongPress,
    handleClick,
    onApprove,
    onReject,
    onTapToUndo,
    blockMember,
    unblockMember,
    handleDMApproveClick,
    handleDMRejectClick,
    handleBlockMember,
    hideDMApproveAlert,
    hideDMRejectAlert,
    hideDMBlockAlert,
    handleFileUpload,
    onReplyPrivatelyClick,
    backAction,
    setShimmerVisibleForChatbot,
    setMessageSentByUserId
  };

  return (
    <ChatroomContext.Provider value={contextValues}>
      {children}
    </ChatroomContext.Provider>
  );
};
