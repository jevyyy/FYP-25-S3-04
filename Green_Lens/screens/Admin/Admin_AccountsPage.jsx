// Admin_AccountPage.jsx
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
  const itemsPerPage = 6;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

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
          username: doc.data().username,
          role: doc.data().role,
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

  // --- Toggle user status using fetch + ID token ---
  const toggleSuspend = async (docId) => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to perform this action.");
      return;
    }

    if (!docId) return;
    if (docId === currentUser.uid) {
      Alert.alert("Action Denied", "You cannot suspend your own account!");
      return;
    }

    setLoadingId(docId);

    try {
      const idToken = await currentUser.getIdToken(true);
      const functionUrl =
        "https://us-central1-green-lens-47e9b.cloudfunctions.net/toggleUserStatus";

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUid: docId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error calling Cloud Function");
      }

      const newStatus = data.newStatus;

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === docId ? { ...u, status: newStatus } : u))
      );

      Alert.alert("Success", `User status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error toggling status:", error);
      Alert.alert("Error", error.message || "Unable to update account.");
    } finally {
      setLoadingId(null);
    }
  };

  // --- Filter + paginate ---
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <View style={styles.container}>
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

      <FlatList
        data={currentUsers}
        keyExtractor={(item) => `user-${item.id}`}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.userRow,
              item.status === "inactive" && { backgroundColor: "#FFF7D4" },
            ]}
            key={`row-${item.id}`}
          >
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.role}>{item.role}</Text>
            <Text
              style={[
                styles.status,
                item.status === "active" ? { color: "green" } : { color: "red" },
              ]}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
            <TouchableOpacity
              onPress={() => toggleSuspend(item.id)}
              disabled={loadingId === item.id || item.id === currentUser?.uid}
              style={{
                opacity:
                  loadingId === item.id || item.id === currentUser?.uid ? 0.5 : 1,
              }}
            >
              <Ionicons name="ban" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

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
          onPress={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
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
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#EDEDED",
    borderRadius: 8,
    marginBottom: 8,
  },
  username: { flex: 1, fontWeight: "600" },
  role: { flex: 1 },
  status: { flex: 1, fontWeight: "600" },
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
