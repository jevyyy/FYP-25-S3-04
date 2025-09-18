import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function Admin_AccountsPage() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 users per page

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const toggleSuspend = async (id, currentStatus) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        status: currentStatus === "active" ? "inactive" : "active",
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: currentStatus === "active" ? "inactive" : "active" } : u
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <View style={styles.container}>
      {/* Top bar with search and new user */}
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

      {/* User Table */}
      <FlatList
        data={currentUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.userRow,
              item.status === "inactive" && { backgroundColor: "#FFF7D4" },
            ]}
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
            <TouchableOpacity onPress={() => toggleSuspend(item.id, item.status)}>
              <Ionicons name="ban" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Pagination Controls */}
      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={currentPage === 1}
          onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          <Text style={[styles.pageArrow, currentPage === 1 && styles.disabled]}>{"<<"}</Text>
        </TouchableOpacity>

        {[...Array(totalPages)].map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setCurrentPage(i + 1)}>
            <Text style={[styles.pageNumber, currentPage === i + 1 && styles.activePage]}>
              {i + 1}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          disabled={currentPage === totalPages}
          onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          <Text style={[styles.pageArrow, currentPage === totalPages && styles.disabled]}>{">>"}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate("Admin_HomePage")}>
          <Ionicons name="home" size={22} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="people" size={22} color="white" />
          <Text style={styles.navText}>Accounts</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Admin_ReportPage")}>
          <Ionicons name="document-text" size={22} color="white" />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Admin_Settings")}>
          <Ionicons name="settings" size={22} color="white" />
          <Text style={styles.navText}>Settings</Text>
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
    alignItems: "center",
  },
  pageNumber: {
    marginHorizontal: 6,
    padding: 6,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#ccc",
  },
  activePage: { backgroundColor: "black", color: "white" },
  pageArrow: { fontSize: 16, marginHorizontal: 10 },
  disabled: { color: "#aaa" },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "black",
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navText: { color: "white", fontSize: 12, textAlign: "center" },
});
