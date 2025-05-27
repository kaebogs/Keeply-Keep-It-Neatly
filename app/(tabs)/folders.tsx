import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import AddFolderModal from "../../components/AddFolderModal";
import AddNoteModal from "../../components/AddNoteModal";
import FolderDetailsModal from "../../components/FolderDetailsModal";

// --- FIREBASE LOGIC START ---
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";

const FOLDERS_COLLECTION = "folders";
// --- FIREBASE LOGIC END ---

const Folders = () => {
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [folders, setFolders] = useState<
    {
      id: string;
      title: string;
      description: string;
      notes?: { title: string; description: string; date: string }[];
      userId: string;
    }[]
  >([]);
  const [openedFolder, setOpenedFolder] = useState<null | {
    id: string;
    title: string;
    description: string;
    notes?: { title: string; description: string; date: string }[];
    userId: string;
  }>(null);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);

  // For per-folder menu in grid
  const [menuFolderIdx, setMenuFolderIdx] = useState<number | null>(null);

  // Edit folder modal state (reusing AddFolderModal)
  const [editingFolder, setEditingFolder] = useState<
    null | typeof openedFolder
  >(null);

  // --- FIREBASE: Real-time fetch of folders for current user ---
  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) {
      setFolders([]);
      return;
    }
    const q = query(
      collection(db, FOLDERS_COLLECTION),
      where("userId", "==", user.uid),
      orderBy("title")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFolders(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any
      );
    });
    return unsubscribe;
  }, []);

  // --- FIREBASE: Add a new folder (with userId) ---
  const handleAddFolder = async (folder: {
    title: string;
    description: string;
  }) => {
    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to add a folder.");
      return;
    }
    try {
      await addDoc(collection(db, FOLDERS_COLLECTION), {
        title: folder.title,
        description: folder.description,
        notes: [],
        userId: user.uid,
      });
      setIsModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "Could not add folder.");
    }
  };

  // --- FIREBASE: Edit a folder ---
  const handleEditFolder = async (folder: {
    title: string;
    description: string;
  }) => {
    if (!editingFolder) return;
    const user = getAuth().currentUser;
    if (!user || editingFolder.userId !== user.uid) {
      Alert.alert("Error", "You do not have permission to edit this folder.");
      return;
    }
    try {
      await updateDoc(doc(db, FOLDERS_COLLECTION, editingFolder.id), {
        title: folder.title,
        description: folder.description,
      });
      setEditingFolder(null);
      setIsModalVisible(false);
      Alert.alert("Success", "Folder updated successfully.");
    } catch (e) {
      Alert.alert("Error", "Could not update folder.");
    }
  };

  // --- FIREBASE: Add a note to the opened folder ---
  const handleAddNote = async (note: {
    title: string;
    description: string;
    date: string;
  }) => {
    if (!openedFolder) return;
    const user = getAuth().currentUser;
    if (!user || openedFolder.userId !== user.uid) {
      Alert.alert(
        "Error",
        "You do not have permission to add a note to this folder."
      );
      return;
    }
    try {
      const folderRef = doc(db, FOLDERS_COLLECTION, openedFolder.id);
      const folderNotes = openedFolder.notes || [];
      await updateDoc(folderRef, {
        notes: [...folderNotes, note],
      });
      setOpenedFolder((prev) =>
        prev ? { ...prev, notes: [...(prev.notes || []), note] } : prev
      );
    } catch (e) {
      Alert.alert("Error", "Could not add note.");
    }
  };

  // --- FIREBASE: Delete a folder ---
  const handleDeleteFolder = async (folderId: string) => {
    const user = getAuth().currentUser;
    const folder = folders.find((f) => f.id === folderId);
    if (!user || !folder || folder.userId !== user.uid) {
      Alert.alert("Error", "You do not have permission to delete this folder.");
      return;
    }
    try {
      await deleteDoc(doc(db, FOLDERS_COLLECTION, folderId));
      if (openedFolder?.id === folderId) setOpenedFolder(null);
      Alert.alert("Success", "Folder deleted successfully.");
    } catch (e) {
      Alert.alert("Error", "Could not delete folder.");
    }
  };

  // Filtered folders for search
  const filteredFolders = folders.filter((f) =>
    f.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>keeply.</Text>
          <Animated.View
            entering={FadeIn.duration(800)}
            style={styles.welcomeContainer}
          >
            <Text style={styles.welcomeText}>Folders</Text>
          </Animated.View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search folders"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Folder Grid */}
        <View style={styles.folderGrid}>
          {filteredFolders.length > 0 ? (
            filteredFolders.map((folder, idx) => (
              <View key={folder.id} style={styles.folderSquare}>
                {/* Three-dot menu button */}
                <TouchableOpacity
                  style={styles.folderMenuButton}
                  onPress={() =>
                    setMenuFolderIdx(menuFolderIdx === idx ? null : idx)
                  }
                >
                  <Ionicons name="ellipsis-horizontal" size={22} color="#000" />
                </TouchableOpacity>
                {/* Dropdown menu */}
                {menuFolderIdx === idx && (
                  <View style={styles.folderMenuDropdown}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setMenuFolderIdx(null);
                        setEditingFolder(folder);
                        setIsModalVisible(true);
                      }}
                    >
                      <Text style={styles.menuText}>Edit</Text>
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setMenuFolderIdx(null);
                        Alert.alert(
                          "Delete Folder",
                          "Are you sure you want to delete this folder?",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => handleDeleteFolder(folder.id),
                            },
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.menuText, { color: "#F76A86" }]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.8}
                  onPress={() => {
                    setOpenedFolder(folder);
                    setMenuFolderIdx(null);
                  }}
                >
                  <Ionicons
                    name="folder"
                    size={44}
                    color="#0E2148"
                    style={styles.folderIcon}
                  />
                  <Text style={styles.folderName} numberOfLines={2}>
                    {folder.title}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Image
                source={require("../../assets/images/folders.jpg")}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyText}>
                No folders yet. Tap + to add one!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Folder Details Modal */}
      {openedFolder && (
        <FolderDetailsModal
          visible={true}
          folder={openedFolder}
          onClose={() => setOpenedFolder(null)}
          onAddNote={handleAddNote}
        />
      )}
      {/* Add Note Modal */}
      {isNoteModalVisible && (
        <AddNoteModal
          visible={true}
          onClose={() => setIsNoteModalVisible(false)}
          onAddNote={handleAddNote}
        />
      )}

      {/* Add/Edit Folder Modal (reused for both) */}
      <AddFolderModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingFolder(null);
        }}
        onAddFolder={editingFolder ? handleEditFolder : handleAddFolder}
        folder={editingFolder || undefined} // <-- Pass this prop!
      />

      {/* Add Folder FAB */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingFolder(null);
          setIsModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Folders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  header: {
    marginBottom: 25,
  },
  appName: {
    fontSize: 30,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  welcomeContainer: {
    marginTop: 5,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "900",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  folderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 90,
  },
  folderSquare: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: "#FFCCCB",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#FFD36B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    padding: 10,
    position: "relative",
    minHeight: 90,
    maxHeight: 100,
  },
  folderMenuButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
  },
  folderMenuDropdown: {
    position: "absolute",
    top: 36,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 110,
    zIndex: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  folderIcon: {
    marginBottom: 10,
  },
  folderName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 0,
    letterSpacing: 0.1,
    maxWidth: "90%",
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
  addButton: {
    position: "absolute",
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F76A86",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#fff",
  },
});
