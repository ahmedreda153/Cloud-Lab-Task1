const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const path = require("path");
var cors = require("cors");

// Path to service account key JSON file
const serviceAccount = require(path.join(
  __dirname,
  "cloud-lab-task-1-2c614-firebase-adminsdk-7aosr-4849eb7f86.json"
));

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cloud-lab-task-1-2c614.firebaseio.com",
});

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// POST endpoint to add a new topic to Firestore
app.post("/add-topic", async (req, res) => {
  console.log(req.body);

  const { collection, topic, topicName } = req.body;

  try {
    await admin.firestore().collection(collection).doc(topicName).set(topic);
    console.log("req.body", req.body);

    res.status(200).json({ message: "topic added successfully" });
  } catch (error) {
    console.error("Error adding topic:", error);
    res.status(500).json({ message: "Error adding topic: " + error.message });
  }
});

// DELETE endpoint to delete a topic from Firestore
app.delete("/delete-topic", async (req, res) => {
  const { collection, topicName } = req.body;

  try {
    await admin.firestore().collection(collection).doc(topicName).delete();
    res.status(200).json({ message: "topic deleted successfully" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({ message: "Error deleting topic: " + error.message });
  }
});

// GET endpoint to get a specific user from Firestore
app.get("/get-user", async (req, res) => {
  const { uid } = req.query;

  try {
    const doc = await admin.firestore().collection("users").doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      res.status(200).json({ user: data });
    } else {
      res.status(200).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Error getting user: " + error });
  }
});

// GET endpoint to get all topics from a Firestore collection
app.get("/get-topics", async (req, res) => {
  const { collection } = req.query;

  try {
    const snapshot = await admin.firestore().collection(collection).get();
    const topics = snapshot.docs.map((doc) => doc.data());
    res.status(200).json(topics);
  } catch (error) {
    console.error("Error getting topics:", error);
    res.status(500).json({ message: "Error getting topics: " + error });
  }
});

// GET endpoint to get topics for a specific user from Firestore
app.get("/get-user-topics", async (req, res) => {
  const { uid } = req.query;

  try {
    const doc = await admin.firestore().collection("users").doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      res.status(200).json({ topics: data.topics || [] });
    } else {
      res.status(200).json({ topics: [] });
    }
  } catch (error) {
    console.error("Error getting topics:", error);
    res.status(500).json({ message: "Error getting topics: " + error });
  }
});

// GET endpoint to get all users from Firestore
app.get("/get-users", async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("users").get();
    const users = snapshot.docs.map((doc) => doc.data());
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Error getting users: " + error });
  }
});

// POST endpoint to create a new user with email and pass in auth and Firestore
app.post("/create-user-by-email", async (req, res) => {
  const { email, uid, name } = req.body;

  try {
    await admin.firestore().collection("users").doc(uid).set({
      email: email,
      uid: uid,
      firstLogin: true,
      name: name,
    });

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user: " + error.message });
  }
});

// POST endpoint to create a new user with phone number in auth and Firestore
app.post("/create-user-by-phone", async (req, res) => {
  const { phoneNumber, uid, name } = req.body;

  try {
    await admin.firestore().collection("users").doc(uid).set({
      phoneNumber: phoneNumber,
      uid: uid,
      firstLogin: true,
      name: name,
    });

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user: " + error.message });
  }
});

// GET endpoint to check if a user exists in Firestore
app.get("/check-user-exists", async (req, res) => {
  const { uid } = req.query;

  try {
    const doc = await admin.firestore().collection("users").doc(uid).get();
    if (doc.exists) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ message: "Error checking user: " + error });
  }
});

// Get endpoint to check if use first login
app.get("/check-first-login", async (req, res) => {
  const { uid } = req.query;

  try {
    const doc = await admin.firestore().collection("users").doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      res.status(200).json({ firstLogin: data.firstLogin });
    } else {
      res.status(200).json({ firstLogin: false });
    }
  } catch (error) {
    console.error("Error checking first login:", error);
    res.status(500).json({ message: "Error checking first login: " + error });
  }
});

// PUT endpoint to update first login status in Firestore
app.put("/update-first-login", async (req, res) => {
  const { uid } = req.body;

  try {
    await admin.firestore().collection("users").doc(uid).update({
      firstLogin: false,
    });
    res
      .status(200)
      .json({ message: "First login status updated successfully" });
  } catch (error) {
    console.error("Error updating first login status:", error);
    res.status(500).json({
      message: "Error updating first login status: " + error.message,
    });
  }
});

// PUT endpoint to update user token in Firestore
app.put("/update-user-token", async (req, res) => {
  const { uid, token } = req.body;

  try {
    await admin.firestore().collection("users").doc(uid).update({
      token: token,
    });
    res.status(200).json({ message: "User token updated successfully" });
  } catch (error) {
    console.error("Error updating user token:", error);
    res
      .status(500)
      .json({ message: "Error updating user token: " + error.message });
  }
});

// GET endpoint to get all users from auth in Firestore
app.get("/users", async (req, res) => {
  try {
    const listUsers = await admin.auth().listUsers();
    const users = listUsers.users.map((userRecord) => userRecord.toJSON());
    res.status(200).json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ message: "Error listing users: " + error });
  }
});

// PUT endpoint to update a topics in Firestore in users collection
app.put("/update-user-topics", async (req, res) => {
  const { topics, uid } = req.body;
  console.log("topics", topics);

  try {
    await admin.firestore().collection("users").doc(uid).update({
      topics: topics,
    });
    res.status(200).json({ message: "topics updated successfully" });
  } catch (error) {
    console.error("Error updating topics:", error);
    res
      .status(500)
      .json({ message: "Error updating topics: " + error.message });
  }
});

// POST endpoint to subscribe to a topic
app.post("/subscribe-topic", async (req, res) => {
  const { token, topic } = req.body;

  try {
    await admin.messaging().subscribeToTopic(token, topic);
    res.status(200).json({ message: `Subscribed to ${topic} topic` });
  } catch (error) {
    res.status(500).json({ message: "Error subscribing to topic: " + error });
  }
});

// POST endpoint to unsubscribe from a topic
app.post("/unsubscribe-topic", async (req, res) => {
  const { token, topic } = req.body;
  try {
    await admin.messaging().unsubscribeFromTopic(token, topic);
    res.status(200).json({ message: `Unsubscribed from ${topic} topic` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error unsubscribing from topic: " + error });
  }
});

// POST endpoint to send a push notification to all users subscribed to a topic
app.post("/send-notification", async (req, res) => {
  const { topic, notification } = req.body;
  console.log("topic", topic);
  console.log("notification", notification);

  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    topic: topic,
  };

  try {
    await admin.messaging().send(message);
    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending notification: " + error });
  }
});

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
