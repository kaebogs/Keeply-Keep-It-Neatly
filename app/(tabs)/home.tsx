//Working

import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";
import AddTaskModal from "../../components/AddTaskModal";
import PomodoroTimerModal from "../../components/PomodoroTimerModal";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  deadline?: Date | null;
  createdAt?: any;
  updatedAt?: any;
}

const Home = () => {
  const [activeTab, setActiveTab] = useState("To Do list");
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  const [username, setUsername] = useState("User");
  const [todayDate, setTodayDate] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPomodoroVisible, setIsPomodoroVisible] = useState(false);

  // --- Task Streak Logic ---
  const [taskStreak, setTaskStreak] = useState(0);

  // --- Edit Task State ---
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    // Date: MONTH DAY, YEAR - WEEKDAY
    const now = new Date();
    const month = now
      .toLocaleString("default", { month: "long" })
      .toUpperCase();
    const day = now.getDate();
    const year = now.getFullYear();
    const weekday = now
      .toLocaleString("default", { weekday: "long" })
      .toUpperCase();
    setTodayDate(`${month} ${day}, ${year} - ${weekday}`);

    if (currentUser?.displayName) setUsername(currentUser.displayName);
  }, [currentUser]);

  // Firestore: Real-time tasks
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[]
      );
    });
    return unsub;
  }, [currentUser]);

  // --- Calculate Task Streak ---
  useEffect(() => {
    // Get all completed task dates (as yyyy-mm-dd)
    const completedDates = tasks
      .filter((t) => t.completed && t.updatedAt)
      .map((t) => {
        const date = t.updatedAt?.toDate?.() || t.updatedAt;
        return date ? date.toISOString().slice(0, 10) : null;
      })
      .filter(Boolean);

    // Remove duplicates and sort descending
    const uniqueDates = Array.from(new Set(completedDates)).sort((a, b) =>
      b.localeCompare(a)
    );

    // Calculate streak
    let streak = 0;
    let current = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const dateStr = uniqueDates[i];
      const date = new Date(dateStr);
      if (
        date.getFullYear() === current.getFullYear() &&
        date.getMonth() === current.getMonth() &&
        date.getDate() === current.getDate()
      ) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    setTaskStreak(streak);
  }, [tasks]);

  // --- Pomodoro Timer Modal Logic ---
  const handlePomodoroPress = () => {
    setIsPomodoroVisible(true);
  };

  // CRUD Handlers
  const handleAddTask = async ({
    title,
    description,
    deadline,
  }: {
    title: string;
    description: string;
    deadline?: Date | null;
  }) => {
    if (!title.trim()) return;
    try {
      await addDoc(collection(db, "tasks"), {
        title: title.trim(),
        description: description || "",
        completed: false,
        userId: currentUser.uid,
        deadline: deadline || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setIsModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "Could not add task.");
    }
  };

  const handleEditTask = async ({
    title,
    description,
    deadline,
  }: {
    title: string;
    description: string;
    deadline?: Date | null;
  }) => {
    if (!editingTask) return;
    try {
      await updateDoc(doc(db, "tasks", editingTask.id), {
        title: title.trim(),
        description: description || "",
        deadline: deadline || null,
        updatedAt: serverTimestamp(),
      });
      setIsModalVisible(false);
      setEditingTask(null);
    } catch (e) {
      Alert.alert("Error", "Could not update task.");
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      await updateDoc(doc(db, "tasks", task.id), {
        completed: !task.completed,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      Alert.alert("Error", "Could not update task.");
    }
  };

  const handleDeleteTask = async (task: Task) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "tasks", task.id));
            Alert.alert("Task Deleted", "The task was deleted successfully.");
          } catch (e) {
            Alert.alert("Error", "Could not delete task.");
          }
        },
      },
    ]);
  };

  // Stats & Filter
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  // Updated filter logic for tabs
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeTab === "To Do list") {
      // Show all tasks regardless of status
      return matchesSearch;
    }
    if (activeTab === "Ongoing") {
      return !task.completed && matchesSearch;
    }
    // Completed tab
    return task.completed && matchesSearch;
  });

  // UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
            <Text style={styles.welcomeText}>Hello, {username}</Text>
            <Text style={styles.dateText}>{todayDate}</Text>
          </Animated.View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statsCard}>
            <Ionicons name="checkmark-done-circle" size={28} color="#F76A86" />
            <Text style={styles.statsValue}>{completedCount}</Text>
            <Text style={styles.statsLabel}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statsCard}>
            <Ionicons name="list-circle" size={28} color="#F76A86" />
            <Text style={styles.statsValue}>{tasks.length}</Text>
            <Text style={styles.statsLabel}>All Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statsCard}>
            <Ionicons name="trending-up" size={28} color="#F76A86" />
            <Text style={styles.statsValue}>{progress}%</Text>
            <Text style={styles.statsLabel}>Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Mini Stat Cards for Streak and Pomodoro */}
        <View style={styles.miniStatsContainer}>
          <View style={[styles.miniStatCard, { marginRight: 12 }]}>
            <Ionicons name="flame-outline" size={20} color="#F76A86" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.miniStatValue}>{taskStreak} Streak</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.miniStatCard}
            onPress={handlePomodoroPress}
          >
            <Ionicons name="timer-outline" size={20} color="#F76A86" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.miniStatValue}>Pomodoro Timer</Text>
            </View>
          </TouchableOpacity>
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
            placeholder="Search Task"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {["To Do list", "Ongoing", "Completed"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab ? styles.activeTabButton : null,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab ? styles.activeTabText : null,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        {/* Task List */}
        <View style={styles.taskListContainer}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Swipeable
                key={task.id}
                renderRightActions={() => (
                  <View style={styles.swipeActionsContainer}>
                    <TouchableOpacity
                      style={[styles.swipeActionRect, styles.editActionRect]}
                      onPress={() => {
                        setEditingTask(task);
                        setIsModalVisible(true);
                      }}
                    >
                      <Ionicons name="create-outline" size={22} color="#fff" />
                      <Text style={styles.swipeActionTextRect}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.swipeActionRect, styles.deleteActionRect]}
                      onPress={() => handleDeleteTask(task)}
                    >
                      <Ionicons name="trash-outline" size={22} color="#fff" />
                      <Text style={styles.swipeActionTextRect}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              >
                <TouchableOpacity
                  style={[
                    styles.taskItem,
                    task.completed && styles.completedTask,
                  ]}
                  onLongPress={() => handleDeleteTask(task)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed && styles.completedTaskText,
                      ]}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                    {task.description ? (
                      <Text
                        style={[
                          styles.taskDesc,
                          task.completed && styles.completedTaskText,
                        ]}
                        numberOfLines={2}
                      >
                        {task.description}
                      </Text>
                    ) : null}
                    {task.deadline ? (
                      <Text style={styles.taskDeadline}>
                        {(() => {
                          let d;
                          if (
                            task.deadline &&
                            typeof (task.deadline as any).toDate === "function"
                          ) {
                            d = (task.deadline as any).toDate();
                          } else if (task.deadline instanceof Date) {
                            d = task.deadline;
                          } else {
                            d = new Date(task.deadline);
                          }
                          if (isNaN(d.getTime())) return "Due: Invalid date";
                          const month = d.toLocaleString("default", {
                            month: "long",
                          });
                          const day = d.getDate();
                          const year = d.getFullYear();
                          const time = d.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });
                          return `Due: ${month} ${day}, ${year} - ${time}`;
                        })()}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleToggleTask(task)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        task.completed && styles.checkboxChecked,
                      ]}
                    >
                      {task.completed && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                </TouchableOpacity>
              </Swipeable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Image
                source={require("../../assets/images/taskllist.png")}
                style={{ width: 85, height: 85 }}
                resizeMode="contain"
              />
              <Text style={styles.emptyStateText}>No tasks found</Text>
              <Text style={styles.emptyStateSubtext}>
                Add a new task to get started
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <AddTaskModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingTask(null);
        }}
        onAddTask={editingTask ? handleEditTask : handleAddTask}
        task={
          editingTask
            ? {
                id: editingTask.id,
                title: editingTask.title,
                description: editingTask.description ?? "",
                deadline: editingTask.deadline ?? null,
              }
            : undefined
        }
      />

      <PomodoroTimerModal
        visible={isPomodoroVisible}
        onClose={() => setIsPomodoroVisible(false)}
      />

      {/* Add Task FAB */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingTask(null);
          setIsModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;

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
  dateText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    width: (SCREEN_WIDTH - 60) / 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statsValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#333",
    marginTop: 5,
  },
  statsLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  miniStatsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 18,
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    minWidth: 0,
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 0,
    marginRight: 0,
  },
  featureButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  featureButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: (SCREEN_WIDTH - 50) / 2,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  featureButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 15,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#F76A86",
    fontWeight: "700",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBarBg: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginRight: 10,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#F76A86",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F76A86",
  },
  taskListContainer: {
    marginBottom: 80,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#C2EFB9",
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#333",
  },
  completedTask: {
    backgroundColor: "#FFE0DE",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    color: "#333",
  },
  completedTaskText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskDesc: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  taskDeadline: {
    fontSize: 12,
    color: "#F76A86",
    marginTop: 2,
  },
  checkboxContainer: {
    marginLeft: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#F76A86",
    borderColor: "#F76A86",
  },
  swipeActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    margin: 0,
    padding: 0,
  },
  swipeActionRect: {
    width: 64,
    height: "88.5%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -10,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#999",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
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
