// Admin_AccountsPage.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "../../firebaseConfig";

export default function Admin_AccountsPage() {
  const navigation = useNavigation();
  const itemsPerPage = 8;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  const db = getFirestore(app);
  const auth = getAuth(app);

  // --- Auth state listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists() && userDocSnap.data().status === "inactive") {
            Alert.alert("Account Locked", "Your account has been suspended.");
            await signOut(auth);
            navigation.navigate("Login");
          }
        } catch (error) {
          console.error("Error checking current user document:", error);
        }
      } else {
        navigation.navigate("Login");
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Fetch users from Firestore ---
  useEffect(() => {
    const usersCol = collection(db, "users");
    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "",
          username: doc.data().username || "",
          email: doc.data().email || "", // <-- add this
          password: doc.data().password || "",
          role: doc.data().role || "",
          status: doc.data().status || "active",
        }));
        setUsers(userList);
      },
      (error) => {
        console.error("Error fetching users:", error);
        Alert.alert("Error", "Failed to fetch users from Firestore.");
      }
    );

    return () => unsubscribe();
  }, []);

  // --- Filter + paginate ---
  const filteredUsers = users.filter((u) =>
    (u.username || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <View style={styles.container}>
      {/* Top bar with search + new user */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={styles.newUserButton}
          onPress={() => navigation.navigate("Admin_CreateAccountPage")}
        >
          <Text style={styles.newUserText}>+ New User</Text>
        </TouchableOpacity>
      </View>

      {/* Header labels */}
      <View style={styles.listHeader}>
        <Text style={[styles.headerText, { flex: 1 }]}>Username</Text>
        <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>Role</Text>
        <Text style={[styles.headerText, { flex: 1, textAlign: "center" }]}>Status</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* User list */}
      <FlatList
        data={currentUsers}
        keyExtractor={(item) => `user-${item.id}`}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => {
          const username = String(item.username || "");
          const role = String(item.role || "");
          const status = String(item.status || "active");
          const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);

          return (
            <View
              style={[
                styles.userRow,
                status === "inactive" && { backgroundColor: "#FFF7D4" },
              ]}
            >
              {/* Update Account navigation remains */}
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() =>
                  navigation.navigate("Admin_UpdateAccountPage", { user: item })
                }
              >
                <Text style={styles.username}>{username}</Text>
              </TouchableOpacity>

              <Text style={styles.role}>{role}</Text>

              <Text
                style={[
                  styles.status,
                  status === "active" ? { color: "green" } : { color: "red" },
                ]}
              >
                {capitalizedStatus}
              </Text>

              {/* Suspend/Reactivate moved to separate page */}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Admin_SuspendAccountPage", { user: item })
                }
                disabled={item.id === currentUser?.uid}
                style={{
                  opacity: item.id === currentUser?.uid ? 0.5 : 1,
                }}
              >
                <Ionicons name="ban" size={20} color="red" />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={currentPage === 1}
          onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          <Text style={[styles.pageArrow, currentPage === 1 && styles.disabled]}>
            {"<<"}
          </Text>
        </TouchableOpacity>

        {[...Array(totalPages)].map((_, i) => (
          <TouchableOpacity key={`page-${i}`} onPress={() => setCurrentPage(i + 1)}>
            <Text
              style={[styles.pageNumber, currentPage === i + 1 && styles.activePage]}
            >
              {i + 1}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          disabled={currentPage === totalPages}
          onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          <Text
            style={[styles.pageArrow, currentPage === totalPages && styles.disabled]}
          >
            {">>"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 50 },
  topBar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  searchBar: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  newUserButton: { backgroundColor: "black", padding: 10, borderRadius: 8 },
  newUserText: { color: "white", fontWeight: "600" },
  listHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    marginBottom: 4,
    alignItems: "center",
  },
  headerText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#000",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#EDEDED",
    borderRadius: 8,
    marginBottom: 8,
  },
  username: { flex: 1, fontWeight: "600", fontSize: 16 },
  role: { flex: 1, textAlign: "center" },
  status: { flex: 1, fontWeight: "600", textAlign: "center" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
    marginBottom: 120,
    alignItems: "center",
  },
  pageNumber: {
    marginHorizontal: 6,
    padding: 6,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  activePage: { backgroundColor: "black", color: "white" },
  pageArrow: { fontSize: 16, marginHorizontal: 10 },
  disabled: { color: "#aaa" },
});
