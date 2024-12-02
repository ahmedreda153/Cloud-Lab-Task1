# Cloud Lab Task 1

This project demonstrates a Firebase-integrated real-time chat application using Node.js, Express.js, and Firebase services (Firestore, Realtime Database, and Cloud Messaging). It allows users to manage channels, subscribe to notifications, and participate in chats.

---

## Features

1. **Add Channels**: Add new channels to Firestore and dynamically update the channel list.
2. **Manage Channels**: Delete existing channels with a single click.
3. **Subscribe to Notifications**: Users can subscribe or unsubscribe to topics for receiving real-time updates.
4. **Real-Time Chat**: Chat with other users in real time using Firebase Realtime Database.
5. **Firebase Cloud Messaging**: Manage device token subscriptions for topics.

---

## Prerequisites

1. **Node.js**: Make sure Node.js is installed on your system.
2. **Firebase Project**:
   - A Firebase project is required with Firestore, Realtime Database, and Cloud Messaging enabled.
   - Download the `serviceAccountKey.json` for Firebase Admin SDK configuration.
3. **Frontend Setup**:
   - Use the provided HTML, CSS, and JS files for the UI.

---

## Setup Instructions

### Backend

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <repository_folder>
2. Install dependencies:
    ```bash
    npm install
3. Place your serviceAccountKey.json file in the project root.

4. Configure Firebase in firebaseConfig inside the frontend JavaScript file.

5. Start the server:
    ```bash
    npm run dev
NOTE : The backend server will run on http://localhost:5000.

---

### Frontend

1. Open the index.html file in any browser.

2. When prompted, enter your name to join the chat.

--- 

### Endpoints

1. Add Document
    ```Json
    {
        "collection": "channels",
        "documentName": "channelName",
        "document": {
            "topic": "channelName"
        }
    }
2. Delete Document
    ```Json
    {
    "collection": "channels",
    "documentName": "channelName"
    }
3. Get Documents
    ```Json
    {
        "collection" : "channels"
    }
4. Subscribe to Topic
    ```Json
    {
    "token": "Token",
    "topic": "channelName"
    }
5. Unsubscribe from Topic
    ```Json
    {
    "token": "Token",
    "topic": "channelName"
    }
---
### Technologies Used

- Node.js: Backend framework.
- Express.js: Simplifies HTTP server operations.
- Firebase Admin SDK: Interact with Firestore, Realtime Database, and Cloud Messaging.
- HTML/CSS/JavaScript: Frontend for user interaction.

---

### Acknowledgments

- Firebase Documentation https://firebase.google.com/docs

---

### Notes

- Update `<repository_url>` with the actual URL of the repository.
- Ensure `firebaseConfig` matches your Firebase project settings.

### Authors
- Ahmed Reda El-sayed Yehia 20210018
- Salma Mohammed Mahmoud Abdelghany 20210161
