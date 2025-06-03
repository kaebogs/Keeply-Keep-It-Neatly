//Working

import { PomodoroTimerModalProps } from "@/types/props";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const WORK_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

const PomodoroTimerModal: React.FC<PomodoroTimerModalProps> = ({
  visible,
  onClose,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (visible) {
      resetTimer();
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [visible]);

  React.useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            if (!isBreak) {
              setIsBreak(true);
              setSecondsLeft(BREAK_DURATION);
              setIsRunning(true);
            } else {
              setIsBreak(false);
              setSecondsLeft(WORK_DURATION);
              setIsRunning(false);
            }
            return prev;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, isBreak]);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    clearTimer();
    setIsBreak(false);
    setSecondsLeft(WORK_DURATION);
    setIsRunning(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#A0A0A0" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isBreak ? "Break Time" : "Pomodoro Timer"}
          </Text>
          <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
          <Text style={styles.statusText}>
            {isBreak ? "Take a short break!" : "Focus on your task!"}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                isRunning && styles.controlButtonActive,
              ]}
              onPress={() => setIsRunning((prev) => !prev)}
            >
              <Ionicons
                name={isRunning ? "pause" : "play"}
                size={24}
                color="#fff"
              />
              <Text style={styles.controlButtonText}>
                {isRunning ? "Pause" : "Start"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PomodoroTimerModal;

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
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    position: "relative",
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
    marginBottom: 18,
    marginTop: 8,
    alignSelf: "center",
    letterSpacing: 0.5,
  },
  timer: {
    fontSize: 54,
    fontWeight: "800",
    color: "#0E2148",
    marginBottom: 10,
    letterSpacing: 2,
  },
  statusText: {
    fontSize: 16,
    color: "#888",
    marginBottom: 24,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F76A86",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginHorizontal: 8,
    marginTop: 8,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#000",
  },
  controlButtonActive: {
    backgroundColor: "#6C63FF",
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});
