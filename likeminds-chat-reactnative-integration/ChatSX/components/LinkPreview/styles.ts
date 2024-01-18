import { StyleSheet } from "react-native";
import STYLES from "../../constants/Styles";
import Layout from "../../constants/Layout";

export const styles = StyleSheet.create({
  linkPreview: {
    padding: Layout.normalize(10),
    width: "80%",
    alignSelf: "flex-end",
    borderRadius: Layout.normalize(15),
    backgroundColor: "#fff",
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: STYLES.$COLORS.TERTIARY,
    borderBottomRightRadius: 0,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: STYLES.$COLORS.TERTIARY,
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.FONT_PRIMARY,
    maxWidth: Layout.window.width - 150,
  },
  messageDate: {
    fontSize: Layout.normalize(10),
    color: "#aaa",
    textAlign: "right",
  },
  linkPreviewBox: {
    maxHeight: Layout.normalize(350),
    backgroundColor: STYLES.$COLORS.JOINED_BTN,
    borderRadius: Layout.normalize(5),
    overflow: "hidden",
    marginBottom: STYLES.$MARGINS.XS,
  },
  linkPreviewIcon: {
    height: Layout.normalize(250),
    resizeMode: "cover",
  },
  displayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.normalize(10),
  },
  alignTime: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: Layout.normalize(3),
  },
  messageInfo: {
    color: "green",
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.BOLD,
    marginBottom: STYLES.$MARGINS.XS,
  },
  messageCustomTitle: {
    color: STYLES.$COLORS.MSG,
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
  },
  linkPreviewTitle: {
    color: "black",
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.BOLD,
    overflow: "hidden",
    marginLeft: Layout.normalize(10),
    marginRight: Layout.normalize(10),
    marginTop: Layout.normalize(10),
  },
  linkPreviewMessageText: {
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.FONT_PRIMARY,
    maxWidth: Layout.window.width - 150,
    marginLeft: Layout.normalize(10),
    marginRight: Layout.normalize(10),
    marginBottom: Layout.normalize(10),
  },
});
