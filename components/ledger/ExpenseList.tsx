import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

interface Category {
  id: string;
  name: string;
  color: string;
  budget: number;
  icon: string;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: "expense" | "income";
}

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  title: string;
  showDate?: boolean;
  limit?: number;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  title,
  showDate = false,
  limit,
  onEditExpense,
  onDeleteExpense,
}) => {
  const displayedExpenses = limit ? expenses.slice(0, limit) : expenses;

  const renderRightActions = (
    expense: Expense,
    progress: Animated.AnimatedAddition<number>,
    dragX: Animated.AnimatedAddition<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-200, -100, -50, 0],
      outputRange: [0, 50, 75, 100],
      extrapolate: "clamp",
    });

    const editScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const deleteScale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View
          style={[
            styles.actionButton,
            styles.editButton,
            { transform: [{ translateX: trans }, { scale: editScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButtonInner}
            onPress={() => onEditExpense?.(expense)}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.actionButton,
            styles.deleteButton,
            { transform: [{ translateX: trans }, { scale: deleteScale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButtonInner}
            onPress={() => onDeleteExpense?.(expense.id)}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderExpenseItem = (expense: Expense) => {
    const ExpenseContent = () => (
      <View style={styles.expenseItem}>
        <View style={styles.expenseLeft}>
          <View
            style={[
              styles.categoryIcon,
              {
                backgroundColor:
                  categories.find((c) => c.name === expense.category)?.color ||
                  "#ccc",
              },
            ]}
          >
            <Ionicons
              name={
                (categories.find((c) => c.name === expense.category)
                  ?.icon as any) || "folder"
              }
              size={20}
              color="white"
            />
          </View>
          <View style={styles.expenseDetails}>
            <Text style={styles.expenseDescription}>{expense.description}</Text>
            <Text style={styles.expenseCategory}>{expense.category}</Text>
            {showDate && (
              <Text style={styles.expenseDate}>
                {new Date(expense.date).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
        <Text
          style={[
            styles.expenseAmount,
            {
              color: expense.type === "expense" ? "#FF6B6B" : "#4ECDC4",
            },
          ]}
        >
          {expense.type === "expense" ? "-" : "+"}₱{expense.amount.toFixed(2)}
        </Text>
      </View>
    );

    // Only wrap with Swipeable if edit/delete handlers are provided
    if (onEditExpense || onDeleteExpense) {
      return (
        <Swipeable
          key={expense.id}
          renderRightActions={(progress, dragX) =>
            renderRightActions(expense, progress, dragX)
          }
          rightThreshold={40}
        >
          <ExpenseContent />
        </Swipeable>
      );
    }

    return <ExpenseContent key={expense.id} />;
  };

  return (
    <View style={styles.recentExpenses}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {displayedExpenses.length > 0 ? (
        displayedExpenses.map(renderExpenseItem)
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>
            {title === "Recent Expenses"
              ? "No expenses yet"
              : "No transactions found"}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {title === "Recent Expenses"
              ? "Add your first expense to get started"
              : "Try adjusting your filters or add new transactions"}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ExpenseList;

const styles = StyleSheet.create({
  recentExpenses: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minHeight: 64,
  },
  expenseLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 11,
    color: "#999",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: 20,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    height: "100%",
    marginLeft: 2,
  },
  actionButtonInner: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: height * 0.08,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginTop: 12,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    maxWidth: width * 0.8,
    lineHeight: 20,
  },
});
