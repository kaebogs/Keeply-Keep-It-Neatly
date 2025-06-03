import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

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

interface ExpenseChartsProps {
  filteredExpenses: Expense[];
  categories: Category[];
}

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
  filteredExpenses,
  categories,
}) => {
  const getPieChartData = () => {
    const categoryTotals = categories
      .map((category) => {
        const total = filteredExpenses
          .filter(
            (exp) => exp.category === category.name && exp.type === "expense"
          )
          .reduce((sum, exp) => sum + exp.amount, 0);

        return {
          name: category.name,
          population: total,
          color: category.color,
          legendFontColor: "#333",
          legendFontSize: 12,
        };
      })
      .filter((item) => item.population > 0);

    return categoryTotals;
  };

  const getLineChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    const data = last7Days.map((date) => {
      const dayExpenses = filteredExpenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return (
            expDate.toDateString() === date.toDateString() &&
            exp.type === "expense"
          );
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      return dayExpenses;
    });

    return {
      labels: last7Days.map((date) => date.getDate().toString()),
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          color: (opacity = 1) => `rgba(247, 106, 134, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  if (filteredExpenses.length === 0) {
    return (
      <View style={styles.chartsContainer}>
        <Text style={styles.cardTitle}>Expense Analytics</Text>
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <Text style={{ color: "#666", fontSize: 14 }}>
            No expense data available for charts
          </Text>
        </View>
      </View>
    );
  }

  const pieData = getPieChartData();
  const lineData = getLineChartData();

  return (
    <View style={styles.chartsContainer}>
      <Text style={styles.cardTitle}>Expense Analytics</Text>

      {pieData.length > 0 && (
        <>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#333",
              marginBottom: 10,
            }}
          >
            Spending by Category
          </Text>
          <PieChart
            data={pieData}
            width={width - 80}
            height={180}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute
            style={styles.chart}
          />
        </>
      )}

      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#333",
          marginBottom: 10,
          marginTop: 20,
        }}
      >
        Daily Spending Trend (Last 7 Days)
      </Text>
      <LineChart
        data={lineData}
        width={width - 80}
        height={180}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(247, 106, 134, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#F76A86",
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

export default ExpenseCharts;

const styles = StyleSheet.create({
  chartsContainer: {
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
