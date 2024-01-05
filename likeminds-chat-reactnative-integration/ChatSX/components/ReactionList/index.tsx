import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useContext, useState } from "react";
import ReactionGridModal from "../ReactionGridModal";
import {
  LONG_PRESSED,
  SELECTED_MESSAGES,
  SET_POSITION,
} from "../../store/types/types";
import { useAppDispatch, useAppSelector } from "../../store";
import STYLES from "../../constants/Styles";
import { LMChatAnalytics } from "../../analytics/LMChatAnalytics";
import { Events, Keys } from "../../enums";
import { styles } from "./styles";
import { useLMChatStyles } from "../../lmChatProvider";

const ReactionList = ({
  item,
  chatroomID,
  userIdStringified,
  reactionArr,
  isTypeSent,
  isIncluded,
  handleLongPress,
  removeReaction,
}: any) => {
  const [selectedReaction, setSelectedReaction] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  const LMChatContextStyles = useLMChatStyles();
  const reactionListStyles = LMChatContextStyles?.reactionListStyles;

  //styling props
  const reactionSize = reactionListStyles?.reactionSize;
  const reactionLeftItemStroke = reactionListStyles?.reactionLeftItemStroke;
  const reactionRightItemStroke = reactionListStyles?.reactionRightItemStroke;
  const reactionItemBorderRadius = reactionListStyles?.reactionItemBorderRadius;
  const gap = reactionListStyles?.gap;
  const selectedMessageBackgroundColor =
    reactionListStyles?.selectedMessageBackgroundColor;

  const SELECTED_BACKGROUND_COLOR = selectedMessageBackgroundColor
    ? selectedMessageBackgroundColor
    : STYLES.$COLORS.SELECTED_BLUE;

  const { selectedMessages, isLongPress, stateArr }: any = useAppSelector(
    (state) => state.chatroom
  );

  const dispatch = useAppDispatch();

  const reactionLen = reactionArr.length;

  // function handles event on Press reaction below a message
  const handleReactionOnPress = (event: any, val?: any) => {
    const { pageX, pageY } = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: { pageX: pageX, pageY: pageY },
    });
    const isStateIncluded = stateArr.includes(item?.state);
    if (isLongPress) {
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !isStateIncluded
        );
        if (filterdMessages.length > 0) {
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
    } else {
      setSelectedReaction(val);
      setModalVisible(true);
    }
  };
  return (
    <View>
      {!item?.deletedBy ? (
        reactionLen > 0 && reactionLen <= 2 ? (
          <View
            style={[
              isTypeSent
                ? styles.reactionSentParent
                : styles.reactionReceivedParent,
            ]}
          >
            {reactionArr.map((val: any, index: any) => (
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={(event) => {
                  handleReactionOnPress(event, val?.reaction);
                }}
                style={[
                  styles.reaction,
                  reactionSize
                    ? { width: reactionSize, height: reactionSize }
                    : null,
                  isTypeSent && reactionRightItemStroke
                    ? { backgroundColor: reactionRightItemStroke }
                    : null,
                  !isTypeSent && reactionLeftItemStroke
                    ? { backgroundColor: reactionLeftItemStroke }
                    : null,
                  reactionItemBorderRadius
                    ? {
                        borderRadius: reactionItemBorderRadius,
                      }
                    : null,
                  gap ? { gap: gap } : null,

                  isIncluded
                    ? { backgroundColor: SELECTED_BACKGROUND_COLOR }
                    : null,
                ]}
                key={val + index}
              >
                <Text style={styles.messageText}>{val?.reaction}</Text>
                <Text style={styles.messageText}>{val?.memberArr?.length}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : reactionLen > 2 ? (
          <View
            style={
              isTypeSent
                ? styles.reactionSentParent
                : styles.reactionReceivedParent
            }
          >
            <TouchableOpacity
              onLongPress={handleLongPress}
              delayLongPress={200}
              onPress={(event) => {
                handleReactionOnPress(event, reactionArr[0]?.reaction);
              }}
              style={[
                styles.reaction,
                reactionItemBorderRadius
                  ? { borderRadius: reactionItemBorderRadius }
                  : null,
                isIncluded
                  ? { backgroundColor: SELECTED_BACKGROUND_COLOR }
                  : !isTypeSent && reactionLeftItemStroke
                  ? { backgroundColor: reactionLeftItemStroke }
                  : isTypeSent && reactionRightItemStroke
                  ? { backgroundColor: reactionRightItemStroke }
                  : { backgroundColor: STYLES.$COLORS.TERTIARY },
              ]}
            >
              <Text style={styles.messageText}>{reactionArr[0]?.reaction}</Text>
              <Text style={styles.messageText}>
                {reactionArr[0]?.memberArr?.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onLongPress={handleLongPress}
              delayLongPress={200}
              onPress={(event) => {
                handleReactionOnPress(event, reactionArr[1]?.reaction);
              }}
              style={[
                styles.reaction,
                reactionItemBorderRadius
                  ? { borderRadius: reactionItemBorderRadius }
                  : null,
                isIncluded
                  ? { backgroundColor: SELECTED_BACKGROUND_COLOR }
                  : !isTypeSent && reactionLeftItemStroke
                  ? { backgroundColor: reactionLeftItemStroke }
                  : isTypeSent && reactionRightItemStroke
                  ? { backgroundColor: reactionRightItemStroke }
                  : { backgroundColor: STYLES.$COLORS.TERTIARY },
              ]}
            >
              <Text style={styles.messageText}>{reactionArr[1]?.reaction}</Text>
              <Text style={styles.messageText}>
                {reactionArr[1]?.memberArr?.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onLongPress={handleLongPress}
              delayLongPress={200}
              onPress={(event) => {
                handleReactionOnPress(event, null);
              }}
              style={[
                styles.moreReaction,
                reactionItemBorderRadius
                  ? { borderRadius: reactionItemBorderRadius }
                  : null,
                isIncluded
                  ? { backgroundColor: SELECTED_BACKGROUND_COLOR }
                  : !isTypeSent && reactionLeftItemStroke
                  ? { backgroundColor: reactionLeftItemStroke }
                  : isTypeSent && reactionRightItemStroke
                  ? { backgroundColor: reactionRightItemStroke }
                  : { backgroundColor: STYLES.$COLORS.TERTIARY },
              ]}
            >
              <View>
                <Image
                  style={{
                    height: 20,
                    width: 20,
                    resizeMode: "contain",
                  }}
                  source={require("../../assets/images/more_dots3x.png")}
                />
              </View>
            </TouchableOpacity>
          </View>
        ) : null
      ) : null}

      <ReactionGridModal
        defaultReactionArr={item?.reactions}
        reactionArr={reactionArr}
        modalVisible={modalVisible}
        selectedReaction={selectedReaction}
        setModalVisible={(val) => {
          setModalVisible(val);
        }}
        item={item}
        chatroomID={chatroomID}
        removeReaction={(reactionArr: any, removeFromList?: any) => {
          removeReaction(item, reactionArr, removeFromList);

          LMChatAnalytics.track(
            Events.REACTION_REMOVED,
            new Map<string, string>([
              [Keys.MESSAGE_ID, item?.id],
              [Keys.CHATROOM_ID, chatroomID?.toString()],
            ])
          );

          //logic to check clicked index and findIndex are same so that we can remove reaction
          const index = item?.reactions.findIndex(
            (val: any) => val?.member?.id == userIdStringified
          );

          if (
            index !== -1 &&
            item?.reactions[index]?.member?.id == reactionArr?.id // this condition checks if clicked reaction ID matches the findIndex ID
          ) {
            setModalVisible(false);
          }
        }}
      />
    </View>
  );
};

export default ReactionList;
