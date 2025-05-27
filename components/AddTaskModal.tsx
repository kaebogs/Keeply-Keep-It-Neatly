//Working

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: {
    title: string;
    description: string;
    deadline?: Date | null;
    id?: string;
  }) => void;
  task?: {
    id?: string;
    title: string;
    description: string;
    deadline?: Date | null;
  };
}

const AddTaskModal = ({
  visible,
  onClose,
  onAddTask,
  task,
}: AddTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState("");

  // Animation state
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    setTitle(task ? task.title : "");
    setDescription(task ? task.description : "");
    setDeadline(task && task.deadline ? new Date(task.deadline) : null);
    setError("");
  }, [task, visible]);

  // Animate in/out when modal visibility changes (slow fade)
  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
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
  }, [visible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }
    setError("");
    onAddTask({ title, description, deadline, id: task?.id });
    setTitle("");
    setDescription("");
    setDeadline(null);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    }).start(() => {
      onClose();
    });
  };

  const handleClose = () => {
    setError("");
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    }).start(() => {
      onClose();
    });
  };

  const getDeadlineDisplay = () => {
    if (!deadline) return "Set Deadline (optional)";
    const date = deadline.toLocaleDateString();
    const time = deadline.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} • ${time}`;
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const prev = deadline || new Date();
      const newDate = new Date(selectedDate);
      newDate.setHours(prev.getHours(), prev.getMinutes());
      setDeadline(newDate);
      setTimeout(() => setShowTimePicker(true), 200);
    }
  };

  const onTimeChange = (_: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && deadline) {
      const newDate = new Date(deadline);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDeadline(newDate);
    }
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.centeredView}
      >
        <Animated.View style={[styles.modalView, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color="#A0A0A0" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {task ? "Edit Task" : "Add New Task"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            placeholderTextColor="#888"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (error) setError("");
            }}
            maxLength={50}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <TouchableOpacity
            style={styles.deadlineButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={20} color="#6C63FF" />
            <Text style={styles.deadlineButtonText}>
              {getDeadlineDisplay()}
            </Text>
            {deadline && (
              <TouchableOpacity
                onPress={() => setDeadline(null)}
                style={{ marginLeft: 8 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color="#B0B0B0" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              minimumDate={new Date()}
              textColor="#000"
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
              textColor="#000"
            />
          )}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>
              {task ? "Save" : "Add Task"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddTaskModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: "rgba(240,240,240,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    right: 18,
    top: 18,
    zIndex: 1,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 24,
    alignSelf: "center",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#f5f5f5",
    color: "#222",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#000",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  deadlineButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#000",
  },
  deadlineButtonText: {
    color: "#888",
    fontSize: 16,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: "#F76A86",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#000",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#F76A86",
    fontSize: 14,
    marginBottom: 8,
    alignSelf: "center",
    fontWeight: "600",
  },
});
