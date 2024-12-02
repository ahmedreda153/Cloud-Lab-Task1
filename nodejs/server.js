const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const path = require("path");
var cors = require("cors");

// Path to service account key JSON file
const serviceAccount = require(path.join(
  __dirname,
  "cloud-lab-task-1-2c614-firebase-adminsdk-7aosr-58004c037e.json"
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

// POST endpoint to add a new document to Firestore
app.post("/add-document", async (req, res) => {
  console.log(req.body);

  const { collection, document, documentName } = req.body;
  console.log("collection", collection);
  console.log("document", document);
  console.log("documentName", documentName);

  try {
    await admin
      .firestore()
      .collection(collection)
      .doc(documentName)
      .set(document);
    console.log("req.body", req.body);

    res.status(200).json({ message: "Document added successfully" });
  } catch (error) {
    console.error("Error adding document:", error);
    res
      .status(500)
      .json({ message: "Error adding document: " + error.message });
  }
});

// DELETE endpoint to delete a document from Firestore
app.delete("/delete-document", async (req, res) => {
  const { collection, documentName } = req.body;

  try {
    await admin.firestore().collection(collection).doc(documentName).delete();
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res
      .status(500)
      .json({ message: "Error deleting document: " + error.message });
  }
});

// GET endpoint to get all documents from a Firestore collection
app.get("/get-documents", async (req, res) => {
  const { collection } = req.query;

  try {
    const snapshot = await admin.firestore().collection(collection).get();
    const documents = snapshot.docs.map((doc) => doc.data());
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error getting documents:", error);
    res.status(500).json({ message: "Error getting documents: " + error });
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

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
