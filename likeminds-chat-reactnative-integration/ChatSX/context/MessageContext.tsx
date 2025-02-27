import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { GestureResponderEvent, View } from "react-native";
import { SET_POSITION } from "../store/types/types";
import { Credentials } from "../credentials";
import { ChatroomContextValues, useChatroomContext } from "./ChatroomContext";

interface MessageContextProps {
  children: ReactNode;
  item: any;
  index: number;
  isStateIncluded: boolean;
  isIncluded: boolean;
}

export interface MessageContextValues {
  reactionArr: string[];
  isTypeSent: boolean;
  userIdStringified: string;
  chatroomWithUser: any;
  isItemIncludedInStateArr: boolean;
  defaultReactionArrLen: number;
  conversationDeletor: any;
  conversationDeletorName: string;
  conversationCreator: any;
  chatroomWithUserUuid: any;
  chatroomWithUserMemberId: string;
  currentUserUuid: string;
  item: any;
  index: number;
  isStateIncluded: boolean;
  isIncluded: boolean;
  showRetry: boolean;
  retryUploadInProgress: boolean;
  failedMessageId: string;
  
  handleLongPress: (event: GestureResponderEvent) => void;
  setRetryUploadInProgress: Dispatch<SetStateAction<boolean>>;
  handleOnPress: (event: GestureResponderEvent) => void;
  answerTrimming: (answer: string) => any;
  setShowRetry: Dispatch<SetStateAction<boolean>>
}

const MessageContext = createContext<MessageContextValues | undefined>(
  undefined
);

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error(
      "useMessageContext must be used within an MessageContextProvider"
    );
  }
  return context;
};

export const MessageContextProvider = ({
  children,
  item,
  index,
  isStateIncluded,
  isIncluded,
}: MessageContextProps) => {
  const { user } = useAppSelector((state) => state.homefeed);

  const { stateArr, chatroomDBDetails, failedMessageId }: any = useAppSelector(
    (state) => state.chatroom
  );

  const [showRetry, setShowRetry] = useState(false);
  const [retryUploadInProgress, setRetryUploadInProgress] = useState(false);

  const {
    selectedMessages,
    handleLongPress: longPressOpenKeyboard,
    handleClick,
  }: ChatroomContextValues = useChatroomContext();

  const [reactionArr, setReactionArr] = useState([] as any);
  const userIdStringified = user?.id?.toString();
  const isTypeSent = item?.member?.id == userIdStringified ? true : false;
  const chatroomWithUser = chatroomDBDetails?.chatroomWithUser;
  const isItemIncludedInStateArr = stateArr.includes(item?.state);

  const dispatch = useAppDispatch();

  const defaultReactionArrLen = item?.reactions?.length;

  //this useEffect update setReactionArr in format of { reaction: 👌, memberArr: []}
  useEffect(() => {
    let tempArr = [] as any;
    if (defaultReactionArrLen === 0) {
      setReactionArr([]);
    }
    for (let i = 0; i < defaultReactionArrLen; i++) {
      if (defaultReactionArrLen > 0) {
        const isIncuded = tempArr.some(
          (val: any) => val.reaction === item?.reactions[i]?.reaction
        );
        if (isIncuded) {
          const index = tempArr.findIndex(
            (val: any) => val.reaction === item?.reactions[i]?.reaction
          );
          tempArr[index].memberArr = [
            ...tempArr[index]?.memberArr,
            item?.reactions[i]?.member,
          ];
          setReactionArr([...tempArr] as any);
        } else {
          const obj = {
            reaction: item?.reactions[i]?.reaction,
            memberArr: [item?.reactions[i]?.member],
          };
          tempArr = [...tempArr, obj];
          setReactionArr([...tempArr] as any);
        }
      }
    }
  }, [item?.reactions]);

  // function handles event on longPress action on a message
  const handleLongPress = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: { pageX: pageX, pageY: pageY },
    });
    longPressOpenKeyboard(isStateIncluded, isIncluded, item, selectedMessages);
  };

  // function handles event on Press action on a message
  const handleOnPress = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: { pageX: pageX, pageY: pageY },
    });
    handleClick(isStateIncluded, isIncluded, item, true, selectedMessages);
  };

  const conversationDeletor = item?.deletedByMember?.sdkClientInfo?.uuid;
  const conversationDeletorName = item?.deletedByMember?.name;
  const conversationCreator = item?.member?.sdkClientInfo?.uuid;
  const chatroomWithUserUuid = user?.sdkClientInfo?.uuid;
  const chatroomWithUserMemberId = user?.id;
  const currentUserUuid = user?.sdkClientInfo?.uuid;

  // Method to trim the initial DM connection message based on loggedInMember id
  const answerTrimming = (answer: string) => {
    const loggedInMember = currentUserUuid;
    const chatroomWithUser =
      chatroomDBDetails?.chatroomWithUser?.sdkClientInfo?.uuid;

    // checking for M2M or M2CM flow based on isPrivateMember key
    const isPrivateMember = chatroomDBDetails?.isPrivateMember;

    if (loggedInMember === chatroomWithUser && isPrivateMember) {
      const startingIndex = answer.lastIndexOf("<");
      const receivingUser = answer.substring(0, startingIndex - 2);
      return receivingUser;
    } else {
      const startingIndex = answer.indexOf("<");
      const endingIndex = answer.indexOf(">");
      const sendingUser =
        answer.substring(0, startingIndex - 1) +
        answer.substring(endingIndex + 2);
      return sendingUser;
    }
  };

  const contextValues: MessageContextValues = {
    reactionArr,
    isTypeSent,
    userIdStringified,
    chatroomWithUser,
    isItemIncludedInStateArr,
    defaultReactionArrLen,
    conversationDeletor,
    conversationDeletorName,
    conversationCreator,
    chatroomWithUserUuid,
    chatroomWithUserMemberId,
    currentUserUuid,
    item,
    index,
    isStateIncluded,
    isIncluded,
    showRetry,
    retryUploadInProgress,
    failedMessageId,

    setShowRetry,
    handleLongPress,
    handleOnPress,
    answerTrimming,
    setRetryUploadInProgress
  };

  return (
    <MessageContext.Provider value={contextValues}>
      {children}
    </MessageContext.Provider>
  );
};
