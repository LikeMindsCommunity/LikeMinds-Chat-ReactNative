import React, { ReactNode } from "react";
import { View } from "react-native";
import ToastMessage from "../../components/ToastMessage";
import { styles } from "./styles";
import {
  ChatroomContextValues,
  useChatroomContext,
} from "../../context/ChatroomContext";
import ChatroomModals from "../../components/ChatroomModals";
import { CustomisableMethodsContextProvider } from "../../context/CustomisableMethodsContext";
import { CustomComponentContextProvider } from "../../context/CustomComponentContextProvider";
import { useAppDispatch, useAppSelector } from "../../store";
import { SHOW_TOAST } from "../../store/types/types";

interface Data {
  id: string;
  title: string;
}

interface ChatRoomProps {
  children: ReactNode;
  customReplyBox?: (item: any, chatroomName: string) => JSX.Element;
  customMessageHeader?: ReactNode;
  customMessageFooter?: ReactNode;
  customVideoImageAttachmentConversation?: ReactNode;
  customPdfAttachmentConversation?: ReactNode;
  customVoiceNoteAttachmentConversation?: ReactNode;
  customGifAttachmentConversation?: ReactNode;
  customMessageNotSupportedConversation?: ReactNode;
  customDeletedMessage?: ReactNode;
  customReplyConversations?: ReactNode;
  customPollConversationView?: ReactNode;
  customLinkPreview?: ReactNode;
  customStateMessage?: ReactNode;
  customReactionList?: React.ReactNode;
  customRetryButton?: React.ReactNode;
  showViewParticipants?: boolean;
  showShareChatroom?: boolean;
  showMuteNotifications?: boolean;
  showLeaveChatroom?: boolean;
  showJoinChatroom?: boolean;
  showUnmuteNotifications?: boolean;
  showBlockMember?: boolean;
  showUnBlockMember?: boolean;
  showViewProfile?: boolean;
  showSecretLeaveChatroom?: boolean;
  setChatroomTopic?: () => void;
  leaveChatroom?: () => void;
  leaveSecretChatroom?: () => void;
  joinChatroom?: () => void;
  muteNotifications?: () => void;
  unmuteNotifications?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  blockMember?: () => void;
  unblockMember?: () => void;
  handleGallery?: () => void;
  handleCamera?: () => void;
  handleDoc?: () => void;
  onEdit?: () => void;
}

interface ChatRoomComponentProps {
  children: ReactNode;
}

const ChatRoom = ({
  children,
  customReplyBox,
  customMessageHeader,
  customMessageFooter,
  customVideoImageAttachmentConversation,
  customPdfAttachmentConversation,
  customVoiceNoteAttachmentConversation,
  customGifAttachmentConversation,
  customMessageNotSupportedConversation,
  customDeletedMessage,
  customReplyConversations,
  customPollConversationView,
  customLinkPreview,
  customStateMessage,
  customReactionList,
  customRetryButton,
  showViewParticipants,
  showShareChatroom,
  showMuteNotifications,
  showLeaveChatroom,
  showJoinChatroom,
  showUnmuteNotifications,
  showBlockMember,
  showUnBlockMember,
  showViewProfile,
  showSecretLeaveChatroom,
  setChatroomTopic,
  leaveChatroom,
  leaveSecretChatroom,
  joinChatroom,
  muteNotifications,
  unmuteNotifications,
  onApprove,
  onReject,
  blockMember,
  unblockMember,
  handleGallery,
  handleCamera,
  handleDoc,
  onEdit,
}: ChatRoomProps) => {
  return (
    <CustomComponentContextProvider
      customReplyBox={customReplyBox}
      customMessageHeader={customMessageHeader}
      customMessageFooter={customMessageFooter}
      customVideoImageAttachmentConversation={
        customVideoImageAttachmentConversation
      }
      customPdfAttachmentConversation={customPdfAttachmentConversation}
      customVoiceNoteAttachmentConversation={
        customVoiceNoteAttachmentConversation
      }
      customGifAttachmentConversation={customGifAttachmentConversation}
      customMessageNotSupportedConversation={
        customMessageNotSupportedConversation
      }
      customDeletedMessage={customDeletedMessage}
      customReplyConversations={customReplyConversations}
      customPollConversationView={customPollConversationView}
      customLinkPreview={customLinkPreview}
      customStateMessage={customStateMessage}
      customReactionList={customReactionList}
    >
      <CustomisableMethodsContextProvider
        setChatroomTopicProp={setChatroomTopic}
        leaveChatroomProp={leaveChatroom}
        leaveSecretChatroomProp={leaveSecretChatroom}
        joinChatroomProp={joinChatroom}
        muteNotificationsProp={muteNotifications}
        unmuteNotificationsProp={unmuteNotifications}
        onApproveProp={onApprove}
        onRejectProp={onReject}
        blockMemberProp={blockMember}
        unblockMemberProp={unblockMember}
        showViewParticipants={showViewParticipants}
        showShareChatroom={showShareChatroom}
        showMuteNotifications={showMuteNotifications}
        showLeaveChatroom={showLeaveChatroom}
        showJoinChatroom={showJoinChatroom}
        showUnmuteNotifications={showUnmuteNotifications}
        showBlockMember={showBlockMember}
        showUnBlockMember={showUnBlockMember}
        showViewProfile={showViewProfile}
        showSecretLeaveChatroom={showSecretLeaveChatroom}
        handleGalleryProp={handleGallery}
        handleCameraProp={handleCamera}
        handleDocProp={handleDoc}
        onEditProp={onEdit}
      >
        <ChatroomComponent children={children} />
      </CustomisableMethodsContextProvider>
    </CustomComponentContextProvider>
  );
};

const ChatroomComponent = ({ children }: ChatRoomComponentProps) => {
  const { isToast, msg, setIsToast }: ChatroomContextValues =
    useChatroomContext();
  const { isToast: isToastFromStore, toastMessage: toastMessageFromStore } = useAppSelector((state) => state.homefeed);
  const dispatch = useAppDispatch()
  return (
    <View style={styles.container}>
      {/* Children components */}
      {children}

      {/* Chatroom Modals */}
      <ChatroomModals />

      {/* Toast Message Flow inside Chatroom */}
      <ToastMessage
        message={isToast ? msg : isToastFromStore ? toastMessageFromStore : ""}
        isToast={isToast || isToastFromStore}
        onDismiss={() => {
          setIsToast(false);
          dispatch({
            type: SHOW_TOAST,
            body: {
              isToast: false,
              msg: ""
            }
          });
        }}
      />
    </View>
  );
};

export { ChatRoom };
