// Admin_AccountsPage.jsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebaseConfig";
import GreenLensLogo from "../../assets/Green_Lens_logo.png";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs(false);

export default function Admin_AccountsPage() {
  const navigation = useNavigation();
  const itemsPerPage = 9;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const db = getFirestore(app);
  const auth = getAuth(app);
  auth._canInitEmulator = false; // prevents firebase from re-initializing auth unnecessarily

  // --- Auth state listener (one time only) ---
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
          } finally {
            setLoadingUser(false);
          }
        } else {
          setLoadingUser(false);
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
          email: doc.data().email || "",
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

  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
    } else {
      let start = Math.max(currentPage - 2, 1);
      let end = Math.min(start + maxVisible - 1, totalPages);
      if (end - start < maxVisible - 1) start = Math.max(end - maxVisible + 1, 1);
      for (let i = start; i <= end; i++) visiblePages.push(i);
    }

    return visiblePages;
  };

  const visiblePages = getVisiblePages();

  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading user...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={GreenLensLogo} style={styles.logoImage} />
      </View>

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
        contentContainerStyle={{ paddingBottom: 30 }}
        scrollEnabled={false}
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

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Admin_SuspendAccountPage", { user: item })
                }
                disabled={!currentUser || item.id === currentUser.uid}
                style={{ opacity: !currentUser || item.id === currentUser.uid ? 0.5 : 1 }}
              >
                <Ionicons name="ban" size={20} color="red" />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        <TouchableOpacity disabled={currentPage === 1} onPress={() => setCurrentPage(1)}>
          <Text style={[styles.pageArrow, currentPage === 1 && styles.disabled]}>
            {"<<"}
          </Text>
        </TouchableOpacity>

        {visiblePages[0] > 1 && <Text style={styles.ellipsis}>...</Text>}

        {visiblePages.map((page) => (
          <TouchableOpacity key={`page-${page}`} onPress={() => setCurrentPage(page)}>
            <Text style={[styles.pageNumber, currentPage === page && styles.activePage]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <Text style={styles.ellipsis}>...</Text>
        )}

        <TouchableOpacity disabled={currentPage === totalPages} onPress={() => setCurrentPage(totalPages)}>
          <Text style={[styles.pageArrow, currentPage === totalPages && styles.disabled]}>
            {">>"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingTop: 50 },
  logoContainer: { alignItems: "flex-start", marginBottom: 16 },
  logoImage: { width: 150, height: 50, resizeMode: "contain" },
  topBar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  searchBar: { flex: 1, backgroundColor: "#f2f2f2", paddingHorizontal: 1, borderRadius: 8, marginRight: 10 },
  newUserButton: { backgroundColor: "black", padding: 10, borderRadius: 8 },
  newUserText: { color: "white", fontWeight: "600" },
  listHeader: { flexDirection: "row", paddingVertical: 8, marginBottom: 4, alignItems: "center" },
  headerText: { fontWeight: "700", fontSize: 14, color: "#000" },
  userRow: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#EDEDED", borderRadius: 8, marginBottom: 8 },
  username: { flex: 1, fontWeight: "600", fontSize: 16 },
  role: { flex: 1, textAlign: "center" },
  status: { flex: 1, fontWeight: "600", textAlign: "center" },
  pagination: { flexDirection: "row", justifyContent: "center", marginVertical: 12, marginBottom: 10, alignItems: "center" },
  pageNumber: { marginHorizontal: 4, paddingVertical: 6, paddingHorizontal: 8, fontSize: 14, borderWidth: 1, borderColor: "#ccc", borderRadius: 4 },
  activePage: { backgroundColor: "black", color: "white" },
  pageArrow: { fontSize: 16, marginHorizontal: 10 },
  disabled: { color: "#aaa" },
  ellipsis: { fontSize: 16, marginHorizontal: 6, color: "#777" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
