import { BookDetailModalProps } from "@/types/props";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BookDetailModal: React.FC<BookDetailModalProps> = ({
  visible,
  book,
  onClose,
  renderStars,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
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
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start(() => setShowModal(false));
    }
  }, [visible]);

  if (!showModal) return null;

  return (
    <Modal
      transparent
      animationType="none"
      visible={showModal}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Animated.View style={[styles.detailCard, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.detailCloseBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#888" />
          </TouchableOpacity>
          <View style={styles.detailHeaderRow}>
            <Image
              source={
                book?.coverUri
                  ? { uri: book.coverUri }
                  : require("@/assets/images/books.jpg")
              }
              style={styles.detailCover}
              resizeMode="cover"
            />
            <View style={styles.detailHeaderText}>
              <Text style={styles.detailTitle} numberOfLines={2}>
                {book?.title}
              </Text>
              <View style={{ marginTop: 4 }}>
                {renderStars(book?.rating || 0, 18)}
              </View>
              <View style={styles.detailDescCard}>
                <Text style={styles.detailDescLabel}>Description</Text>
                <Text style={styles.detailDescText}>
                  {book?.description || "No description"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BookDetailModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  detailCloseBtn: {
    alignSelf: "flex-end",
    padding: 4,
    marginBottom: 2,
  },
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 8,
  },
  detailCover: {
    width: 70,
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
    marginRight: 14,
    borderColor: "#333",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailHeaderText: {
    flex: 1,
    justifyContent: "flex-start",
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  detailDescCard: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  detailDescLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginBottom: 4,
  },
  detailDescText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
});
