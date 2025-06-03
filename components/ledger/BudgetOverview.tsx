import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Budget {
  totalBudget: number;
  totalSpent: number;
  monthlyBudget: number;
}

interface BudgetOverviewProps {
  budget: Budget;
  filterPeriod: string;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budget,
  filterPeriod,
}) => {
  const spentPercentage =
    budget.monthlyBudget > 0
      ? (budget.totalSpent / budget.monthlyBudget) * 100
      : 0;

  const remaining = budget.monthlyBudget - budget.totalSpent;

  return (
    <View style={styles.budgetCard}>
      <Text style={styles.cardTitle}>Budget Overview</Text>
      <View style={styles.budgetRow}>
        <View style={styles.budgetItem}>
          <Text style={styles.budgetLabel}>Monthly Budget</Text>
          <Text style={styles.budgetAmount}>
            ₱{budget.monthlyBudget.toFixed(2)}
          </Text>
        </View>

        <View style={styles.budgetItem}>
          <Text style={styles.budgetLabel}>Total Spent</Text>
          <Text style={styles.budgetAmount}>
            ₱{budget.totalSpent.toFixed(2)}
          </Text>
        </View>

        <View style={styles.budgetItem}>
          <Text style={styles.budgetLabel}>Remaining</Text>
          <Text
            style={[
              styles.budgetAmount,
              { color: remaining >= 0 ? "#4CAF50" : "#FF6B6B" },
            ]}
          >
            ₱{remaining.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(spentPercentage, 100)}%`,
              backgroundColor: spentPercentage > 90 ? "#FF6B6B" : "#F76A86",
            },
          ]}
        />
      </View>
    </View>
  );
};

export default BudgetOverview;

const styles = StyleSheet.create({
  budgetCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  budgetItem: {
    alignItems: "center",
  },
  budgetLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F76A86",
    borderRadius: 4,
  },
});
