import AddNoteModal from "@/components/folders/AddNoteModal";
import NoteDetailsModal from "@/components/folders/NoteDetailsModal";
import { db } from "@/config/firebase";
import { FolderDetailsModalProps, Note } from "@/types/props";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Responsive calculations
const isTablet = SCREEN_WIDTH >= 768;
const wp = (percentage: number) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage: number) => (SCREEN_HEIGHT * percentage) / 100;
const fontSize = (size: number) => {
  const scale = SCREEN_WIDTH / 375;
  const newSize = size * scale;
  return Math.max(newSize, size * 0.8);
};

// Helper to format date
function formatNoteDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const datePart = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} - ${weekday}, ${time}`;
}

const FolderDetailsModal = ({
  visible,
  folder,
  onClose,
  onAddNote,
}: FolderDetailsModalProps) => {
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [isNoteDetailsVisible, setIsNoteDetailsVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>(folder?.notes || []);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Swipeable refs for each note - use string keys for better reliability
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  // Generate unique key for each note
  const getNoteKey = (note: Note, index: number) =>
    `${note.title.replace(/\s+/g, "_")}_${note.date}_${index}`;

  useEffect(() => {
    setNotes(folder?.notes || []);
  }, [folder, visible]);

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible || !folder) return null;

  // Handle note tap - open note details
  const handleNotePress = (note: Note) => {
    setSelectedNote(note);
    setIsNoteDetailsVisible(true);
  };

  // Handle edit from note details
  const handleEditFromDetails = (note: Note) => {
    setEditNote(note);
    setIsNoteDetailsVisible(false);
    setIsNoteModalVisible(true);
  };

  // Delete Note Handler
  const handleDeleteNote = async (note: Note, noteKey: string) => {
    if (!folder.id) return;

    // Close swipeable first
    if (swipeableRefs.current[noteKey]) {
      swipeableRefs.current[noteKey]?.close();
    }

    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const folderRef = doc(db, "folders", folder.id!);
            const folderSnap = await getDoc(folderRef);
            const folderData = folderSnap.data();
            const updatedNotes = (folderData?.notes || []).filter(
              (n: Note) =>
                !(
                  n.title === note.title &&
                  n.description === note.description &&
                  n.date === note.date
                )
            );
            await updateDoc(folderRef, { notes: updatedNotes });
            setNotes(updatedNotes);
            Alert.alert("Success", "Note deleted successfully.");
          } catch (e) {
            Alert.alert("Error", "Could not delete note.");
          }
        },
      },
    ]);
  };

  // Edit Note Handler
  const handleEditNote = (note: Note, noteKey: string) => {
    // Close swipeable first
    if (swipeableRefs.current[noteKey]) {
      swipeableRefs.current[noteKey]?.close();
    }

    setEditNote(note);
    setIsNoteModalVisible(true);
  };

  // Save Edited Note Handler
  const handleSaveEditedNote = async (updatedNote: Note) => {
    if (!folder?.id || !editNote) return;
    try {
      const folderRef = doc(db, "folders", folder.id);
      const folderSnap = await getDoc(folderRef);
      const folderData = folderSnap.data();
      const notesArr = folderData?.notes || [];
      const updatedNotes = notesArr.map((n: Note) =>
        n.title === editNote.title &&
        n.description === editNote.description &&
        n.date === editNote.date
          ? updatedNote
          : n
      );
      await updateDoc(folderRef, { notes: updatedNotes });
      setNotes(updatedNotes);
      setEditNote(null);
      setIsNoteModalVisible(false);
      Alert.alert("Success", "Note updated!");
    } catch (e) {
      Alert.alert("Error", "Could not update note.");
    }
  };

  const handleAddNote = (note: Note) => {
    const newNotes = [...notes, note];
    setNotes(newNotes);
    onAddNote(note);
    setIsNoteModalVisible(false);
  };

  const handleClose = () => {
    setIsNoteModalVisible(false);
    setIsNoteDetailsVisible(false);
    setSelectedNote(null);
    setEditNote(null);
    onClose();
  };

  // Render swipe actions with improved styling
  const renderRightActions = (note: Note, noteKey: string) => {
    return (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity
          style={[styles.swipeActionRect, styles.editActionRect]}
          onPress={() => handleEditNote(note, noteKey)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={wp(5.5)} color="#fff" />
          <Text style={styles.swipeActionTextRect}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeActionRect, styles.deleteActionRect]}
          onPress={() => handleDeleteNote(note, noteKey)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={wp(5.5)} color="#fff" />
          <Text style={styles.swipeActionTextRect}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <GestureHandlerRootView style={styles.gestureContainer}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.modal, { opacity: fadeAnim }]}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={wp(7)} color="#A0A0A0" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Ionicons
                name="folder"
                size={wp(isTablet ? 12 : 18)}
                color="#FFD36B"
                style={styles.folderIcon}
              />
              <Text style={styles.title} numberOfLines={2}>
                {folder.title}
              </Text>
              {folder.description ? (
                <Text style={styles.desc} numberOfLines={3}>
                  {folder.description}
                </Text>
              ) : null}
            </View>

            <View style={styles.divider} />

            {/* Notes Container */}
            <ScrollView
              style={styles.notesContainer}
              contentContainerStyle={styles.notesContentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {notes && notes.length > 0 ? (
                notes.map((note, idx) => {
                  const noteKey = getNoteKey(note, idx);
                  return (
                    <Swipeable
                      key={noteKey}
                      ref={(ref) => {
                        swipeableRefs.current[noteKey] = ref;
                      }}
                      renderRightActions={() =>
                        renderRightActions(note, noteKey)
                      }
                      rightThreshold={wp(15)}
                      friction={2}
                      overshootRight={false}
                      overshootFriction={8}
                      containerStyle={styles.swipeableContainer}
                    >
                      <TouchableOpacity
                        style={styles.noteItemCard}
                        onPress={() => handleNotePress(note)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.noteContent}>
                          <Text style={styles.noteDate} numberOfLines={1}>
                            {formatNoteDate(note.date)}
                          </Text>
                          <Text style={styles.noteTitle} numberOfLines={2}>
                            {note.title}
                          </Text>
                          <Text
                            style={styles.noteDesc}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {note.description}
                          </Text>
                        </View>
                        <View style={styles.noteArrow}>
                          <Ionicons
                            name="chevron-forward"
                            size={wp(4)}
                            color="#666"
                          />
                        </View>
                      </TouchableOpacity>
                    </Swipeable>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Image
                    source={require("@/assets/images/notes.jpg")}
                    style={styles.emptyImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.emptyText}>No notes available</Text>
                </View>
              )}
            </ScrollView>

            {/* Add Notes Button */}
            <TouchableOpacity
              style={styles.addNoteButtonFixed}
              onPress={() => {
                setEditNote(null);
                setIsNoteModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="add"
                size={wp(5)}
                color="#fff"
                style={styles.addButtonIcon}
              />
              <Text style={styles.addNoteButtonText}>Add Notes</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Add Note Modal */}
          <AddNoteModal
            visible={isNoteModalVisible}
            onClose={() => {
              setIsNoteModalVisible(false);
              setEditNote(null);
            }}
            onAddNote={editNote ? handleSaveEditedNote : handleAddNote}
            note={editNote || undefined}
          />

          {/* Note Details Modal */}
          <NoteDetailsModal
            visible={isNoteDetailsVisible}
            note={selectedNote}
            onClose={() => {
              setIsNoteDetailsVisible(false);
              setSelectedNote(null);
            }}
            onEdit={handleEditFromDetails}
          />
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default FolderDetailsModal;

const styles = StyleSheet.create({
  gestureContainer: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modal: {
    height: hp(isTablet ? 80 : 75),
    width: wp(isTablet ? 70 : 90),
    maxWidth: wp(95),
    backgroundColor: "#fff",
    borderRadius: wp(isTablet ? 4 : 6),
    padding: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === "ios" ? 0.1 : 0.3,
    shadowRadius: 24,
    elevation: Platform.OS === "android" ? 10 : 0,
    position: "relative",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    right: wp(4),
    top: hp(2),
    zIndex: 2,
    padding: wp(1),
  },
  header: {
    alignItems: "center",
    paddingTop: hp(4),
    paddingBottom: hp(2.5),
    paddingHorizontal: wp(4),
    width: "100%",
    backgroundColor: "#FFF8E1",
  },
  folderIcon: {
    marginBottom: hp(1.5),
  },
  title: {
    fontSize: fontSize(isTablet ? 24 : 22),
    fontWeight: "800",
    color: "#222",
    marginBottom: hp(0.5),
    letterSpacing: 0.5,
    textAlign: "center",
    maxWidth: "90%",
  },
  desc: {
    fontSize: fontSize(isTablet ? 16 : 15),
    color: "#888",
    marginTop: hp(0.5),
    textAlign: "center",
    paddingHorizontal: wp(4),
    maxWidth: "95%",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#f0e6e6",
  },
  notesContainer: {
    width: "100%",
    flex: 1,
    backgroundColor: "#fff",
  },
  notesContentContainer: {
    paddingVertical: hp(3),
    paddingHorizontal: wp(4),
    paddingBottom: hp(12),
    minHeight: hp(20),
  },
  swipeableContainer: {
    marginBottom: hp(1.5),
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: hp(40),
    paddingHorizontal: wp(8),
  },
  emptyImage: {
    width: wp(isTablet ? 25 : 35),
    height: wp(isTablet ? 25 : 35),
  },
  emptyText: {
    color: "#aaa",
    fontSize: fontSize(isTablet ? 16 : 15),
    textAlign: "center",
    marginVertical: hp(2),
  },
  noteItemCard: {
    backgroundColor: "#FFCCCB",
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(1.2),
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#F76A86",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === "ios" ? 0.1 : 0.1,
    shadowRadius: 2,
    elevation: Platform.OS === "android" ? 2 : 0,
    minHeight: wp(isTablet ? 14 : 16),
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  noteContent: {
    flex: 1,
    justifyContent: "center",
  },
  noteArrow: {
    marginLeft: wp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  noteDate: {
    fontSize: fontSize(isTablet ? 12 : 10),
    color: "#888",
    marginBottom: 1,
  },
  noteTitle: {
    fontSize: fontSize(isTablet ? 15 : 13),
    fontWeight: "700",
    color: "#222",
    marginBottom: 1,
    lineHeight: fontSize(isTablet ? 18 : 16),
  },
  noteDesc: {
    fontSize: fontSize(isTablet ? 13 : 11),
    color: "#555",
    lineHeight: fontSize(isTablet ? 16 : 14),
  },
  // Updated swipe action styles matching task list
  swipeActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: wp(isTablet ? 14 : 16), // Match noteItemCard height
    margin: 0,
    padding: 0,
  },
  swipeActionRect: {
    width: wp(16),
    height: wp(isTablet ? 14 : 16), // Match noteItemCard height
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    padding: 0,
    borderRadius: 0, // Let parent handle rounding
  },
  editActionRect: {
    backgroundColor: "#4CAF50",
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#333",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    height: wp(isTablet ? 14 : 16), // Ensure same height
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteActionRect: {
    backgroundColor: "#F76A86",
    borderTopRightRadius: wp(2.5),
    borderBottomRightRadius: wp(2.5),
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#333",
    height: wp(isTablet ? 14 : 16), // Ensure same height
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  swipeActionTextRect: {
    color: "#fff",
    fontSize: fontSize(isTablet ? 12 : 11),
    fontWeight: "600",
    marginTop: 2,
  },
  addNoteButtonFixed: {
    position: "absolute",
    left: wp(8),
    right: wp(8),
    bottom: hp(4),
    flexDirection: "row",
    backgroundColor: "#F76A86",
    borderRadius: wp(2.5),
    paddingVertical: hp(2),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F76A86",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === "ios" ? 0.1 : 0.3,
    shadowRadius: 4,
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  addButtonIcon: {
    marginRight: wp(2),
  },
  addNoteButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: fontSize(isTablet ? 17 : 16),
    letterSpacing: 0.2,
  },
});
