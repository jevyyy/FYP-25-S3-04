const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const corsHandler = cors({ origin: true });

// ------------------------
// Toggle user status
// ------------------------
exports.toggleUserStatus = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized - No token" });
      const idToken = authHeader.split("Bearer ")[1];

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (err) {
        console.error("Invalid token:", err);
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
      }

      const currentUid = decodedToken.uid;
      const { targetUid } = req.body;

      if (!targetUid) return res.status(400).json({ message: "Target UID is required" });
      if (targetUid === currentUid) return res.status(400).json({ message: "You cannot suspend yourself" });

      const userDocRef = db.collection("users").doc(targetUid);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) return res.status(404).json({ message: "User not found" });

      const currentStatus = userDoc.data().status || "active";
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      // Update Firestore
      await userDocRef.update({ status: newStatus });

      // Update Firebase Auth
      await auth.updateUser(targetUid, { disabled: newStatus === "inactive" });

      console.log(`User ${targetUid} status changed to ${newStatus}`);
      return res.status(200).json({ newStatus });
    } catch (error) {
      console.error("Error in toggleUserStatus:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
});

// ------------------------
// Update user email & password
// ------------------------
exports.updateUserAuth = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized - No token" });
      const idToken = authHeader.split("Bearer ")[1];

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (err) {
        console.error("Invalid token:", err);
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
      }

      const { targetUid, email, password, name, username, role } = req.body;

      if (!targetUid) return res.status(400).json({ message: "Target UID is required" });

      const updateAuth = {};
      if (email) updateAuth.email = email.toLowerCase();
      if (password) updateAuth.password = password;

      await auth.updateUser(targetUid, updateAuth);

      // Optional: also update Firestore for email, name, username, role
      const userDocRef = db.collection("users").doc(targetUid);
      const updateFirestore = {};
      if (email) updateFirestore.email = email.toLowerCase();
      if (name) updateFirestore.name = name;
      if (username) updateFirestore.username = username.toLowerCase();
      if (role) updateFirestore.role = role;

      if (Object.keys(updateFirestore).length > 0) {
        await userDocRef.update(updateFirestore);
      }

      console.log(`✅ User ${targetUid} auth updated`);
      return res.status(200).json({ message: "User auth updated successfully" });
    } catch (error) {
      console.error("Error updating user auth:", error);
      return res.status(500).json({ message: error.message });
    }
  });
});
