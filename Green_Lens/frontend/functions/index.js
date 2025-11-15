const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// Enable CORS for frontend requests
const corsHandler = cors({origin: true});

//
// toggleUserStatus — Admin toggles a user's account between active/inactive
//
exports.toggleUserStatus = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Allow POST only
      if (req.method !== "POST") return res.status(405).json({message: "Method not allowed"});

      // Validate and decode Firebase ID token
      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) return res.status(401).json({message: "Unauthorized - No token"});
      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const currentUid = decodedToken.uid;

      // Ensure requester is an Admin
      const currentUserDoc = await db.collection("users").doc(currentUid).get();
      if (!currentUserDoc.exists || currentUserDoc.data().role !== "Admin") {
        return res.status(403).json({message: "Forbidden — Admin access only"});
      }

      // Validate target UID
      const {targetUid} = req.body;
      if (!targetUid) return res.status(400).json({message: "Target UID is required"});
      if (targetUid === currentUid) return res.status(400).json({message: "You cannot suspend yourself"});

      // Load target user record
      const userDocRef = db.collection("users").doc(targetUid);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) return res.status(404).json({message: "User not found"});

      // Toggle status
      const currentStatus = userDoc.data().status || "active";
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      // Apply status changes in Firestore + Auth
      await userDocRef.update({status: newStatus});
      await auth.updateUser(targetUid, {disabled: newStatus === "inactive"});

      return res.status(200).json({newStatus});
    } catch (error) {
      console.error("Error in toggleUserStatus:", error);
      return res.status(500).json({message: "Internal server error"});
    }
  });
});

//
// updateUserAuth — Admin updates email, password, name, username, or role of another user
//
exports.updateUserAuth = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Allow POST only
      if (req.method !== "POST") return res.status(405).json({message: "Method not allowed"});

      // Validate and decode Firebase ID token
      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) return res.status(401).json({message: "Unauthorized - No token"});
      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const currentUid = decodedToken.uid;

      // Ensure requester is an Admin
      const currentUserDoc = await db.collection("users").doc(currentUid).get();
      if (!currentUserDoc.exists || currentUserDoc.data().role !== "Admin") {
        return res.status(403).json({message: "Forbidden — Admin access only"});
      }

      // Extract fields to update
      const {targetUid, email, password, name, username, role} = req.body;
      if (!targetUid) return res.status(400).json({message: "Target UID is required"});

      // Build Auth update object
      const updateAuth = {};
      if (email) updateAuth.email = email.toLowerCase();
      if (password) updateAuth.password = password;

      // Apply changes in Firebase Auth
      await auth.updateUser(targetUid, updateAuth);

      // Prepare Firestore updates
      const userDocRef = db.collection("users").doc(targetUid);
      const updateFirestore = {};
      if (email) updateFirestore.email = email.toLowerCase();
      if (name) updateFirestore.name = name;
      if (username) updateFirestore.username = username.toLowerCase();
      if (role) updateFirestore.role = role;

      // Apply changes in Firestore
      if (Object.keys(updateFirestore).length > 0) {
        await userDocRef.update(updateFirestore);
      }

      return res.status(200).json({message: "User auth updated successfully"});
    } catch (error) {
      console.error("Error updating user auth:", error);
      return res.status(500).json({message: error.message});
    }
  });
});