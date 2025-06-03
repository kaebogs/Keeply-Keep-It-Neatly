import { AddScheduleModalProps } from "@/types/props";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

export default function AddScheduleModal({
  visible,
  fadeAnim,
  subject,
  setSubject,
  selectedDate,
  setSelectedDate,
  time,
  showTimePickerHandler,
  onClose,
  onSubmit,
  isLoading,
  editing,
}: AddScheduleModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editing ? "Edit Schedule" : "New Schedule"}
          </Text>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Subject */}
            <Text style={styles.inputLabel}>Subject Title</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="book-outline"
                size={22}
                color="#F76A86"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Enter subject"
                value={subject}
                onChangeText={setSubject}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Date */}
            <Text style={styles.inputLabel}>Select Date</Text>
            <View style={styles.datePickerContainer}>
              <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={
                  selectedDate
                    ? {
                        [selectedDate]: {
                          selected: true,
                          selectedColor: "#F76A86",
                        },
                      }
                    : {}
                }
                style={styles.miniCalendar}
                theme={{
                  backgroundColor: "#ffffff",
                  calendarBackground: "#ffffff",
                  textSectionTitleColor: "#b6c1cd",
                  selectedDayBackgroundColor: "#F76A86",
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: "#F76A86",
                  dayTextColor: "#2d4150",
                  arrowColor: "#F76A86",
                }}
              />
            </View>

            {/* Time */}
            <Text style={styles.inputLabel}>Time</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={showTimePickerHandler}
            >
              <Ionicons
                name="time-outline"
                size={22}
                color="#F76A86"
                style={styles.inputIcon}
              />
              <TextInput
                value={time}
                placeholder="Select time"
                style={styles.input}
                placeholderTextColor="#9CA3AF"
                editable={false}
                pointerEvents="none"
              />
              <Ionicons
                name="chevron-down-outline"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!subject.trim() || !time.trim() || !selectedDate) &&
                  styles.confirmButtonDisabled,
              ]}
              onPress={onSubmit}
              disabled={
                !subject.trim() || !time.trim() || !selectedDate || isLoading
              }
            >
              {isLoading ? (
                <Text style={styles.confirmButtonText}>Loading...</Text>
              ) : (
                <Text style={styles.confirmButtonText}>
                  {editing ? "Update Schedule" : "Add Schedule"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(240,240,240,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "stretch",
    maxHeight: "90%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 15,
    padding: 8,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 20,
    color: "#1F2937",
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#4B5563",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: "#374151",
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  miniCalendar: {
    height: 310,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  confirmButton: {
    backgroundColor: "#F76A86",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: "#F3ABAB",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
