import { View, Text } from "react-native";
import React from "react";
import ChatroomActionModal from "../../customModals/ChatroomActionModal";
import ReportActionModal from "../../customModals/ReportActionModal";
import MessageReactionModal from "../../customModals/MessageReactionModal";
import EmojiKeyboardModal from "../../customModals/EmojiKeyboardModal";
import WarningMessageModal from "../../customModals/WarningMessage";
import ApproveDMRequestModal from "../../customModals/ApproveDMRequest";
import RejectDMRequestModal from "../../customModals/RejectDMRequest";
import BlockDMRequestModal from "../../customModals/BlockDMRequest";

interface ChatroomModals {
  setChatroomTopicProp: () => void;
  leaveChatroomProp: () => void;
  leaveSecretChatroomProp: () => void;
  joinChatroomProp: () => void;
  muteNotificationsProp: () => void;
  unmuteNotificationsProp: () => void;
}

const ChatroomModals = ({
  setChatroomTopicProp,
  leaveChatroomProp,
  leaveSecretChatroomProp,
  joinChatroomProp,
  muteNotificationsProp,
  unmuteNotificationsProp,
}: ChatroomModals) => {
  return (
    <View>
      {/* Chatroom Action Modal */}
      <ChatroomActionModal
        joinChatroomProp={joinChatroomProp}
        muteNotificationsProp={muteNotificationsProp}
        unmuteNotificationsProp={unmuteNotificationsProp}
      />

      {/* Report Action Modal */}
      <ReportActionModal setChatroomTopicProp={setChatroomTopicProp} />

      {/* Message Reaction Modal */}
      <MessageReactionModal />

      {/* Emoji Keyboard Modal */}
      <EmojiKeyboardModal />

      {/* CHATROOM LEAVING WARNING message modal */}
      <WarningMessageModal
        leaveChatroomProp={leaveChatroomProp}
        leaveSecretChatroomProp={leaveSecretChatroomProp}
      />

      {/* APPROVE DM request Modal */}
      <ApproveDMRequestModal />

      {/* REJECT DM request Modal */}
      <RejectDMRequestModal />

      {/* BLOCK DM request Modal */}
      <BlockDMRequestModal />
    </View>
  );
};

export default ChatroomModals;
