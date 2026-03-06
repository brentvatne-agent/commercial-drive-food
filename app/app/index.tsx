import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

type Place = {
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  cuisine: string | null;
  address: string | null;
  housenumber: string | null;
  phone: string | null;
  website: string | null;
  opening_hours: string | null;
  osm_id: number | null;
  osm_type: string | null;
  source: string;
  status: string;
  status_note?: string;
  audit_status?: "confirmed" | "closed" | "skipped";
  audit_note?: string;
  audit_timestamp?: string;
};

type PlacesData = {
  metadata: any;
  places: Place[];
};

const CATEGORIES: Record<string, { label: string; color: string }> = {
  restaurant: { label: "Restaurant", color: "#e74c3c" },
  cafe: { label: "Cafe", color: "#8e44ad" },
  bakery: { label: "Bakery", color: "#e67e22" },
  fast_food: { label: "Fast Food", color: "#f39c12" },
  bar: { label: "Bar", color: "#2980b9" },
};

function CategoryBadge({ category }: { category: string }) {
  const info = CATEGORIES[category] || {
    label: category,
    color: "#7f8c8d",
  };
  return (
    <View style={[styles.badge, { backgroundColor: info.color }]}>
      <Text style={styles.badgeText}>{info.label}</Text>
    </View>
  );
}

function AuditBadge({ status }: { status?: string }) {
  if (!status) return null;
  const colors: Record<string, string> = {
    confirmed: "#27ae60",
    closed: "#c0392b",
    skipped: "#95a5a6",
  };
  return (
    <View style={[styles.badge, { backgroundColor: colors[status] || "#95a5a6" }]}>
      <Text style={styles.badgeText}>{status.toUpperCase()}</Text>
    </View>
  );
}

function PlaceCard({
  place,
  onAudit,
}: {
  place: Place;
  onAudit: (status: "confirmed" | "closed" | "skipped", note?: string) => void;
}) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState("");

  const handleClosed = () => {
    setShowNoteInput(true);
  };

  const submitClosed = () => {
    onAudit("closed", note);
    setShowNoteInput(false);
    setNote("");
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{place.name}</Text>
        <AuditBadge status={place.audit_status} />
      </View>
      <View style={styles.cardMeta}>
        <CategoryBadge category={place.category} />
        {place.housenumber && (
          <Text style={styles.cardAddress}>
            {place.housenumber} Commercial Dr
          </Text>
        )}
      </View>
      {place.cuisine && (
        <Text style={styles.cardCuisine}>{place.cuisine.replace(/;/g, ", ")}</Text>
      )}
      {place.status !== "open" && (
        <Text style={styles.statusNote}>
          Status: {place.status}
          {place.status_note ? ` - ${place.status_note}` : ""}
        </Text>
      )}
      {place.audit_note && (
        <Text style={styles.auditNote}>Note: {place.audit_note}</Text>
      )}

      {!place.audit_status && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.btnConfirm]}
            onPress={() => onAudit("confirmed")}
          >
            <Text style={styles.btnText}>Confirm</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnClosed]}
            onPress={handleClosed}
          >
            <Text style={styles.btnText}>Closed</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnSkip]}
            onPress={() => onAudit("skipped")}
          >
            <Text style={styles.btnText}>Skip</Text>
          </Pressable>
        </View>
      )}

      {showNoteInput && (
        <View style={styles.noteInput}>
          <TextInput
            style={styles.input}
            placeholder="Optional note (e.g. 'now a bubble tea shop')"
            placeholderTextColor="#999"
            value={note}
            onChangeText={setNote}
          />
          <Pressable style={[styles.btn, styles.btnClosed]} onPress={submitClosed}>
            <Text style={styles.btnText}>Submit</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function AddPlaceForm({ onAdd }: { onAdd: (place: Partial<Place>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("restaurant");
  const [cuisine, setCuisine] = useState("");
  const [housenumber, setHousenumber] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      category,
      cuisine: cuisine.trim() || null,
      housenumber: housenumber.trim() || null,
      address: "Commercial Drive",
      source: "audit_walk",
      status: "open",
      audit_status: "confirmed",
      audit_timestamp: new Date().toISOString(),
    });
    setName("");
    setCuisine("");
    setHousenumber("");
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <Pressable style={styles.addBtn} onPress={() => setExpanded(true)}>
        <Text style={styles.addBtnText}>+ Add Missing Place</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.addForm}>
      <Text style={styles.addFormTitle}>Add Missing Place</Text>
      <TextInput
        style={styles.input}
        placeholder="Name *"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Address number (e.g. 1733)"
        placeholderTextColor="#999"
        value={housenumber}
        onChangeText={setHousenumber}
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Cuisine (e.g. italian, thai)"
        placeholderTextColor="#999"
        value={cuisine}
        onChangeText={setCuisine}
      />
      <View style={styles.categoryPicker}>
        {Object.entries(CATEGORIES).map(([key, info]) => (
          <Pressable
            key={key}
            style={[
              styles.categoryOption,
              category === key && { backgroundColor: info.color },
            ]}
            onPress={() => setCategory(key)}
          >
            <Text
              style={[
                styles.categoryOptionText,
                category === key && { color: "#fff" },
              ]}
            >
              {info.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.addFormActions}>
        <Pressable style={[styles.btn, styles.btnConfirm]} onPress={submit}>
          <Text style={styles.btnText}>Add</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnSkip]}
          onPress={() => setExpanded(false)}
        >
          <Text style={styles.btnText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function AuditScreen() {
  const [data, setData] = useState<PlacesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const hasUnsyncedChanges = useRef(false);

  const fetchPlaces = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/places");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const syncToGithub = useCallback(async () => {
    if (!data || syncing) return;
    try {
      setSyncing(true);
      const res = await fetch("/api/places", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      hasUnsyncedChanges.current = false;
    } catch (e: any) {
      const msg = `Sync failed: ${e.message}`;
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Sync Error", msg);
      }
    } finally {
      setSyncing(false);
    }
  }, [data, syncing]);

  const handleAudit = useCallback(
    (index: number, status: "confirmed" | "closed" | "skipped", note?: string) => {
      if (!data) return;
      const updated = { ...data };
      updated.places = [...data.places];
      updated.places[index] = {
        ...updated.places[index],
        audit_status: status,
        audit_note: note || undefined,
        audit_timestamp: new Date().toISOString(),
      };
      if (status === "closed") {
        updated.places[index].status = "closed";
      }
      setData(updated);
      hasUnsyncedChanges.current = true;
    },
    [data]
  );

  const handleAddPlace = useCallback(
    (place: Partial<Place>) => {
      if (!data) return;
      const newPlace: Place = {
        name: place.name || "Unknown",
        category: place.category || "restaurant",
        latitude: 0,
        longitude: 0,
        cuisine: place.cuisine || null,
        address: place.address || "Commercial Drive",
        housenumber: place.housenumber || null,
        phone: null,
        website: null,
        opening_hours: null,
        osm_id: null,
        osm_type: null,
        source: "audit_walk",
        status: "open",
        audit_status: "confirmed",
        audit_timestamp: new Date().toISOString(),
      };
      const updated = {
        ...data,
        places: [...data.places, newPlace],
        metadata: { ...data.metadata, total_count: data.places.length + 1 },
      };
      setData(updated);
      hasUnsyncedChanges.current = true;
    },
    [data]
  );

  // Sorted north to south (Hastings to Broadway) = descending latitude
  // But our data is sorted south to north, so reverse it
  const sortedPlaces = data?.places
    ? [...data.places].reverse()
    : [];

  const filteredPlaces = sortedPlaces.filter((p) => {
    if (filter === "pending") return !p.audit_status;
    if (filter === "done") return !!p.audit_status;
    return true;
  });

  const auditedCount = data?.places.filter((p) => p.audit_status).length || 0;
  const totalCount = data?.places.length || 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Loading..." }} />
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Error" }} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={[styles.btn, styles.btnConfirm]} onPress={fetchPlaces}>
          <Text style={styles.btnText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Commercial Drive Audit" }} />

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {auditedCount} / {totalCount} audited
          </Text>
          <Pressable
            style={[styles.syncBtn, syncing && styles.syncBtnDisabled]}
            onPress={syncToGithub}
            disabled={syncing}
          >
            <Text style={styles.syncBtnText}>
              {syncing ? "Syncing..." : "Sync"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${totalCount > 0 ? (auditedCount / totalCount) * 100 : 0}%` },
            ]}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {(["all", "pending", "done"] as const).map((f) => (
          <Pressable
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === f && styles.filterBtnTextActive,
              ]}
            >
              {f === "all"
                ? `All (${totalCount})`
                : f === "pending"
                ? `Pending (${totalCount - auditedCount})`
                : `Done (${auditedCount})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <AddPlaceForm onAdd={handleAddPlace} />
        {filteredPlaces.map((place, i) => {
          // Find original index in data.places
          const originalIndex = data!.places.indexOf(place);
          return (
            <PlaceCard
              key={`${place.name}-${place.housenumber}-${i}`}
              place={place}
              onAudit={(status, note) => handleAudit(originalIndex, status, note)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  progressContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#2a2a4a",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#27ae60",
    borderRadius: 3,
  },
  syncBtn: {
    backgroundColor: "#2980b9",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncBtnDisabled: {
    opacity: 0.5,
  },
  syncBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#1a1a3e",
  },
  filterBtnActive: {
    backgroundColor: "#e74c3c",
  },
  filterBtnText: {
    color: "#999",
    fontSize: 13,
  },
  filterBtnTextActive: {
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    flexShrink: 1,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardAddress: {
    color: "#aaa",
    fontSize: 14,
  },
  cardCuisine: {
    color: "#888",
    fontSize: 13,
    marginBottom: 4,
  },
  statusNote: {
    color: "#f39c12",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 4,
  },
  auditNote: {
    color: "#95a5a6",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnConfirm: {
    backgroundColor: "#27ae60",
    flex: 1,
  },
  btnClosed: {
    backgroundColor: "#c0392b",
    flex: 1,
  },
  btnSkip: {
    backgroundColor: "#7f8c8d",
    flex: 1,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  noteInput: {
    marginTop: 8,
    gap: 8,
  },
  input: {
    backgroundColor: "#0f0f23",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#2a2a4a",
  },
  addBtn: {
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a4a",
    borderStyle: "dashed",
  },
  addBtnText: {
    color: "#2980b9",
    fontSize: 16,
    fontWeight: "600",
  },
  addForm: {
    backgroundColor: "#1a1a3e",
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  addFormTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#0f0f23",
    borderWidth: 1,
    borderColor: "#2a2a4a",
  },
  categoryOptionText: {
    color: "#999",
    fontSize: 13,
  },
  addFormActions: {
    flexDirection: "row",
    gap: 8,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
});
