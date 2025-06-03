import { Note } from "@/types/props";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const isTablet = SCREEN_WIDTH >= 768;
const wp = (percentage: number) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage: number) => (SCREEN_HEIGHT * percentage) / 100;
const fontSize = (size: number) => {
  const scale = SCREEN_WIDTH / 375;
  const newSize = size * scale;
  return Math.max(newSize, size * 0.8);
};

// Simple date formatting
function formatNoteDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface NoteDetailsModalProps {
  visible: boolean;
  note: Note | null;
  onClose: () => void;
  onEdit?: (note: Note) => void;
}

const NoteDetailsModal = ({
  visible,
  note,
  onClose,
  onEdit,
}: NoteDetailsModalProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    }
  }, [visible]);

  if (!visible || !note) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(note);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.modal}>
          {/* Compact Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={wp(5)} color="#666" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Note</Text>

            {onEdit && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleEdit}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="create-outline" size={wp(5)} color="#F76A86" />
              </TouchableOpacity>
            )}
          </View>

          {/* Tight Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Date */}
            <Text style={styles.date}>{formatNoteDate(note.date)}</Text>

            {/* Title */}
            <Text style={styles.title} selectable>
              {note.title}
            </Text>

            {/* Description */}
            <Text style={styles.description} selectable>
              {note.description || "No description provided."}
            </Text>
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default NoteDetailsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(240,240,240,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: wp(3),
  },
  modal: {
    width: wp(isTablet ? 55 : 80),
    height: hp(isTablet ? 55 : 60), // Reduced from 65/70 to 55/60
    backgroundColor: "#fff",
    borderRadius: wp(3),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === "ios" ? 0.1 : 0.2,
    shadowRadius: 15,
    elevation: Platform.OS === "android" ? 8 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerButton: {
    width: wp(8),
    height: wp(8),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: fontSize(isTablet ? 18 : 16),
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: wp(4),
    paddingBottom: hp(2),
  },
  date: {
    fontSize: fontSize(isTablet ? 12 : 10),
    color: "#999",
    marginBottom: hp(2),
    textAlign: "center",
  },
  title: {
    fontSize: fontSize(isTablet ? 22 : 20),
    fontWeight: "700",
    color: "#222",
    lineHeight: fontSize(isTablet ? 28 : 26),
    marginBottom: hp(2),
  },
  description: {
    fontSize: fontSize(isTablet ? 16 : 14),
    color: "#555",
    lineHeight: fontSize(isTablet ? 22 : 20),
  },
});
