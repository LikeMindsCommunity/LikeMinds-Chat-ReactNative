import { Image, TouchableOpacity, View, Text } from "react-native";
import React, { ReactNode, useMemo, useState, useLayoutEffect } from "react";
import { styles } from "./styles";
import STYLES from "../../constants/Styles";
import ReplyConversations from "../ReplyConversations";
import AttachmentConversations from "../AttachmentConversations";
import { PollConversationView } from "../Poll";
import LinkPreview from "../LinkPreview";
import ReactionList from "../ReactionList";
import {
  MessageContextProvider,
  useMessageContext,
} from "../../context/MessageContext";
import { useChatroomContext } from "../../context/ChatroomContext";
import DeletedMessage from "../DeletedMessage";
import SimpleMessage from "../SimpleMessage";
import { NavigateToProfileParams } from "../../callBacks/type";
import { CallBack } from "../../callBacks/callBackClass";
import { useCustomComponentsContext } from "../../context/CustomComponentContextProvider";
import { Conversation } from "@likeminds.community/chat-rn/dist/shared/responseModels/Conversation";
import { onConversationsCreate } from "../../store/actions/chatroom";
import { useAppDispatch } from "../../store";
import { Client } from "../../client";

interface Messages {
  item: any;
  index: number;
  isStateIncluded: boolean;
  isIncluded: boolean;
  onTapToUndoProp?: () => void;
  customWidgetMessageView?: (message: Conversation) => React.ReactElement;
}

const Messages = ({
  item,
  index,
  isStateIncluded,
  isIncluded,
  onTapToUndoProp,
  customWidgetMessageView,
}: Messages) => {
  return (
    <MessageContextProvider
      index={index}
      item={item}
      isStateIncluded={isStateIncluded}
      isIncluded={isIncluded}
    >
      <MessagesComponent
        onTapToUndoProp={onTapToUndoProp}
        customWidgetMessageView={customWidgetMessageView}
      />
    </MessageContextProvider>
  );
};

interface MessagesComponentProps {
  onTapToUndoProp?: () => void;
  customWidgetMessageView?: (message: Conversation) => React.ReactElement;
}

interface CustomReactionList {
  customReactionList?: ReactNode;
}

const MessagesComponent = ({
  onTapToUndoProp,
  customWidgetMessageView,
}: MessagesComponentProps) => {
  const {
    item,
    isIncluded,
    reactionArr,
    isTypeSent,
    userIdStringified,
    isItemIncludedInStateArr,
    handleLongPress,
    showRetry,
    setShowRetry,
    setRetryUploadInProgress,
    retryUploadInProgress,
    failedMessageId
  } = useMessageContext();


  useLayoutEffect(() => {
    let interval;
    let uploadFailed = item?.id == failedMessageId
  
    const checkMessageStatus = () => {
      const currentTimeStampEpoch = Math.floor(Date.now() / 1000);
      if (item?.id?.includes && item?.id?.includes("-")) {
        if (item?.attachments?.length > 0) {
          const localTimestamp =  Math.floor(Math.abs(parseInt(item?.attachmentUploadedEpoch)) / 1000);

          if ( (uploadFailed) || (currentTimeStampEpoch - localTimestamp > 30 && (item?.inProgress == undefined || item?.inProgress == null))) {
            setShowRetry(true);
  
            // Stop checking once the condition is met
            if (interval) {
              clearInterval(interval);
            }
          }
        } else {
          const localTimestamp = Math.floor(Math.abs(parseInt(item?.localSavedEpoch ?? item?.localCreatedEpoch)) / 1000);
          if ( (uploadFailed) || (currentTimeStampEpoch - localTimestamp > 30)) {
            setShowRetry(true);
  
            // Stop checking once the condition is met
            if (interval) {
              clearInterval(interval);
            }
          }
        }
      } else {
        setShowRetry(false);
      }
    };
    
    // Initial check
    checkMessageStatus();
    if (item?.id?.includes && item?.id?.includes("-")) {
      // Start periodic checking
      interval = setInterval(checkMessageStatus, 5000);
    }

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, [item, failedMessageId])


  const { customReactionList }: CustomReactionList =
    useCustomComponentsContext();

  const { removeReaction, chatroomID, onRetryButtonClicked } = useChatroomContext();

  const {
    customDeletedMessage,
    customReplyConversations,
    customPollConversationView,
    customLinkPreview,
    customRetryButton
  } = useCustomComponentsContext();

  const chatBubbleStyles = STYLES.$CHAT_BUBBLE_STYLE;

  //styling props
  const sentMessageBackgroundColor =
    chatBubbleStyles?.sentMessageBackgroundColor;
  const receivedMessageBackgroundColor =
    chatBubbleStyles?.receivedMessageBackgroundColor;
  const selectedMessageBackgroundColor =
    chatBubbleStyles?.selectedMessageBackgroundColor;

  const SELECTED_BACKGROUND_COLOR = selectedMessageBackgroundColor
    ? selectedMessageBackgroundColor
    : STYLES.$COLORS.SELECTED_BLUE;
  // styling props ended

  const showCustomMessageViewWidget = useMemo(() => {
    if (item?.widget && item?.widgetId) {
      const widget = item.widget;
      if (widget) {
        return true;
      } else {
        false;
      }
    } else {
      return false;
    }
  }, [item]);
  if (showCustomMessageViewWidget) {
    return customWidgetMessageView ? customWidgetMessageView(item) : null;
  }


  return (
    <View>
      <View>
        {item?.deletedBy ? (
          customDeletedMessage ? (
            customDeletedMessage
          ) : (
            <DeletedMessage />
          )
        ) : item?.replyConversationObject ? (
          customReplyConversations ? (
            customReplyConversations
          ) : (
            <ReplyConversations />
          )
        ) : !item?.replyConversationObject && item?.attachmentCount > 0 ? (
          <AttachmentConversations />
        ) : item?.state === 10 ? (
          customPollConversationView ? (
            customPollConversationView
          ) : (
            <PollConversationView />
          )
        ) : item?.ogTags?.url != null && item?.ogTags != undefined ? (
          customLinkPreview ? (
            customLinkPreview
          ) : (
            <LinkPreview />
          )
        ) : (
          <SimpleMessage onTapToUndoProp={onTapToUndoProp} />
        )}

        {/* Reaction List */}
        {customReactionList ? (
          customReactionList
        ) : (
          <ReactionList
            item={item}
            chatroomID={chatroomID}
            userIdStringified={userIdStringified}
            reactionArr={reactionArr}
            isTypeSent={isTypeSent}
            isIncluded={isIncluded}
            handleLongPress={handleLongPress}
            removeReaction={removeReaction}
          />
        )}
        {showRetry && item?.attachments?.length == 0 ?
          customRetryButton ? customRetryButton :
          <TouchableOpacity onPress={() => onRetryButtonClicked(item, setShowRetry, setRetryUploadInProgress, retryUploadInProgress)} style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text style={{ color: '#F04438', fontSize: 8, right: 10, bottom: 5 }}>Failed. Tap to retry</Text>
          </TouchableOpacity>
          : null}
      </View>
    </View>
  );
};

export default Messages;
