import { Category, FilterPeriod } from "@/types/props";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface FilterControlsProps {
  filterPeriod: FilterPeriod;
  setFilterPeriod: (period: FilterPeriod) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  categories: Category[];
  selectedMonth: number;
  selectedYear: number;
  onMonthYearPress: () => void;
  onYearPress: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filterPeriod,
  setFilterPeriod,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  categories,
  selectedMonth,
  selectedYear,
  onMonthYearPress,
  onYearPress,
}) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <View style={styles.container}>
      {/* Time Period Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Period</Text>
        <View style={styles.filterRow}>
          {(["week", "month", "year", "all"] as FilterPeriod[]).map(
            (period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setFilterPeriod(period)}
                style={[
                  styles.filterButton,
                  filterPeriod === period && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterPeriod === period && styles.filterButtonTextActive,
                  ]}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Month/Year Picker for Month Filter */}
        {filterPeriod === "month" && (
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={onMonthYearPress}
          >
            <Ionicons name="calendar-outline" size={20} color="#F76A86" />
            <Text style={styles.datePickerText}>
              {monthNames[selectedMonth]} {selectedYear}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#F76A86" />
          </TouchableOpacity>
        )}

        {/* Year Picker for Year Filter */}
        {filterPeriod === "year" && (
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={onYearPress}
          >
            <Ionicons name="calendar-outline" size={20} color="#F76A86" />
            <Text style={styles.datePickerText}>{selectedYear}</Text>
            <Ionicons name="chevron-down" size={16} color="#F76A86" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScrollView}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategoryFilter("all")}
            style={[
              styles.categoryButton,
              selectedCategoryFilter === "all" && styles.categoryButtonActive,
            ]}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategoryFilter === "all" &&
                  styles.categoryButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategoryFilter(category.name)}
              style={[
                styles.categoryButton,
                selectedCategoryFilter === category.name &&
                  styles.categoryButtonActive,
              ]}
            >
              <View
                style={[
                  styles.categoryIcon,
                  {
                    backgroundColor:
                      selectedCategoryFilter === category.name
                        ? "#fff"
                        : category.color,
                  },
                ]}
              >
                <Ionicons
                  name={category.icon as any}
                  size={14}
                  color={
                    selectedCategoryFilter === category.name
                      ? category.color
                      : "#fff"
                  }
                />
              </View>
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategoryFilter === category.name &&
                    styles.categoryButtonTextActive,
                ]}
                numberOfLines={1}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default FilterControls;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    // Remove negative margins that caused overflow
    marginHorizontal: 0,
    // Ensure content stays within bounds
    overflow: "hidden",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Ensure buttons don't overflow
    flexWrap: "wrap",
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: 6, // Reduced padding
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60, // Minimum width to prevent text cutoff
  },
  filterButtonActive: {
    backgroundColor: "#F76A86",
    borderColor: "#F76A86",
  },
  filterButtonText: {
    fontSize: 12, // Slightly smaller text
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE8EC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F76A86",
    width: "100%",
  },
  datePickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F76A86",
    marginHorizontal: 8,
  },
  categoryScrollView: {
    // Remove any margin that might cause overflow
    marginHorizontal: 0,
  },
  categoryScrollContent: {
    paddingHorizontal: 0, // Remove padding that might cause overflow
    alignItems: "center",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    // Prevent buttons from shrinking
    flexShrink: 0,
  },
  categoryButtonActive: {
    backgroundColor: "#F76A86",
    borderColor: "#F76A86",
  },
  categoryIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
});
