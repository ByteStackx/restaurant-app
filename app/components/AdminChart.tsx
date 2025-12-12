import { StyleSheet, Text, View } from "react-native";

type DataPoint = { label: string; value: number };

export function AdminBarChart({ data, title }: { data: DataPoint[]; title?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.chart}>
        {data.map((d) => (
          <View key={d.label} style={styles.row}>
            <Text style={styles.label}>{d.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(d.value / max) * 100}%` }]} />
            </View>
            <Text style={styles.value}>{d.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", padding: 16, gap: 10 },
  title: { fontSize: 16, fontWeight: "800", color: "#111827" },
  chart: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { flex: 1, color: "#374151", fontWeight: "600" },
  barTrack: { flex: 3, height: 10, backgroundColor: "#E5E7EB", borderRadius: 6, overflow: "hidden" },
  barFill: { height: 10, backgroundColor: "#111827" },
  value: { width: 40, textAlign: "right", color: "#111827", fontWeight: "700" },
});
