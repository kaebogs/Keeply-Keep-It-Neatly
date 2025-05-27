//Working

import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { db } from "../config/firebase";
import AddNoteModal from "./AddNoteModal";

interface Note {
  title: string;
  description: string;
  date: string;
}

interface FolderDetailsModalProps {
  visible: boolean;
  folder: {
    id?: string;
    title: string;
    description: string;
    notes?: Note[];
  } | null;
  onClose: () => void;
  onAddNote: (note: Note) => void;
}

// Helper to format date as "Month Day, Year - Weekday and Time"
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
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>(folder?.notes || []);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sync local notes state with folder.notes when folder or modal opens
  useEffect(() => {
    setNotes(folder?.notes || []);
  }, [folder, visible]);

  useEffect(() => {
    if (visible) {
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

  // --- Delete Note Handler ---
  const handleDeleteNote = async (note: Note) => {
    if (!folder.id) return;
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
            setNotes(updatedNotes); // Update local state
            Alert.alert("Success", "Note deleted successfully.");
          } catch (e) {
            Alert.alert("Error", "Could not delete note.");
          }
        },
      },
    ]);
  };

  // --- Edit Note Handler ---
  const handleEditNote = (note: Note) => {
    setEditNote(note);
    setIsNoteModalVisible(true);
  };

  // --- Save Edited Note Handler ---
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
      setNotes(updatedNotes); // Update local state so UI refreshes
      setEditNote(null);
      setIsNoteModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "Could not update note.");
    }
  };

  const handleAddNote = (note: Note) => {
    const newNotes = [...notes, note];
    setNotes(newNotes); // Add new note locally
    onAddNote(note);
    setIsNoteModalVisible(false);
  };

  const handleClose = () => {
    setIsNoteModalVisible(false);
    setEditNote(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { opacity: fadeAnim }]}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color="#A0A0A0" />
          </TouchableOpacity>
          {/* Folder Icon and Name */}
          <View style={styles.header}>
            <Ionicons
              name="folder"
              size={70}
              color="#FFD36B"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.title}>{folder.title}</Text>
            {folder.description ? (
              <Text style={styles.desc}>{folder.description}</Text>
            ) : null}
          </View>
          <View style={styles.divider} />
          {/* Notes container */}
          <View style={styles.notesContainer}>
            {notes && notes.length > 0 ? (
              notes.map((note, idx) => (
                <Swipeable
                  key={idx}
                  renderRightActions={() => (
                    <View style={{ flexDirection: "row", height: "100%" }}>
                      <TouchableOpacity
                        style={[styles.swipeActionRect, styles.editActionRect]}
                        onPress={() => handleEditNote(note)}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.swipeActionTextRect}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.swipeActionRect,
                          styles.deleteActionRect,
                        ]}
                        onPress={() => handleDeleteNote(note)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                        <Text style={styles.swipeActionTextRect}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                >
                  <View style={styles.noteItemCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.noteDate} numberOfLines={1}>
                        {formatNoteDate(note.date)}
                      </Text>
                      <Text style={styles.noteTitle} numberOfLines={1}>
                        {note.title}
                      </Text>
                      <Text
                        style={styles.noteDesc}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {note.description}
                      </Text>
                    </View>
                  </View>
                </Swipeable>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Image
                  source={require("../assets/images/notes.jpg")}
                  style={styles.emptyImage}
                  resizeMode="contain"
                />
                <Text style={styles.emptyText}>No notes available</Text>
              </View>
            )}
          </View>
          {/* Add Notes button always at the bottom */}
          <TouchableOpacity
            style={styles.addNoteButtonFixed}
            onPress={() => {
              setEditNote(null);
              setIsNoteModalVisible(true);
            }}
          >
            <Ionicons
              name="add"
              size={20}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.addNoteButtonText}>Add Notes</Text>
          </TouchableOpacity>
        </Animated.View>
        {/* Add Note Modal overlays and centers above the folder modal */}
        <AddNoteModal
          visible={isNoteModalVisible}
          onClose={() => {
            setIsNoteModalVisible(false);
            setEditNote(null);
          }}
          onAddNote={editNote ? handleSaveEditedNote : handleAddNote}
          note={editNote || undefined}
        />
      </View>
    </Modal>
  );
};

export default FolderDetailsModal;

const styles = StyleSheet.create({
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
    height: "75%",
    width: "90%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    position: "relative",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 2,
    padding: 4,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 18,
    width: "100%",
    backgroundColor: "#FFF8E1",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222",
    marginBottom: 2,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  desc: {
    fontSize: 15,
    color: "#888",
    marginTop: 2,
    marginBottom: 0,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#f0e6e6",
    marginBottom: 0,
  },
  notesContainer: {
    width: "100%",
    alignItems: "stretch",
    paddingVertical: 24,
    paddingHorizontal: 16, // spacing from modal edge
    backgroundColor: "#fff",
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 350,
  },
  emptyImage: {
    width: 140,
    height: 140,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 15,
    textAlign: "center",
    marginVertical: 10,
  },
  noteItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFCCCB",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#F76A86",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  noteDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginBottom: 1,
  },
  noteDesc: {
    fontSize: 13,
    color: "#555",
  },
  addNoteButtonFixed: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 32,
    flexDirection: "row",
    backgroundColor: "#F76A86",
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F76A86",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addNoteButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  notesEmptyText: {
    color: "#888",
    fontSize: 16,
  },
  noteText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  swipeActionRect: {
    width: 64,
    height: "87%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    padding: 0,
  },
  editActionRect: {
    backgroundColor: "#4CAF50",
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  deleteActionRect: {
    backgroundColor: "#F76A86",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  swipeActionTextRect: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
});
