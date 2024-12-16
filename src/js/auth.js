import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getAnalytics,
  logEvent,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { app } from "/src/js/config.js";

const analytics = getAnalytics(app);
const auth = getAuth(app);

function signInWithEmail() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Signed in as:", user.email);
      fetch(
        `http://localhost:5000/check-first-login?uid=${encodeURIComponent(
          user.uid
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            console.error("Failed to check first login status");
          }
          console.log("First login status checked");

          return response.json();
        })
        .then((data) => {
          console.log("First login status:", data.firstLogin);

          if (data.firstLogin) {
            console.log("First login event");
            // Update first login status
            fetch("http://localhost:5000/update-first-login", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ uid: user.uid }),
            })
              .then((response) => {
                if (response.ok) {
                  console.log("First login status updated successfully");
                  logEvent(analytics, "first_login", {
                    user: user.email || user.phoneNumber,
                    timestamp: Date.now(),
                  });
                  if ("Notification" in window) {
                    // Request notification permission if not already granted
                    Notification.requestPermission().then((permission) => {
                      if (permission === "granted") {
                        const notification = new Notification("Welcome!", {
                          body: `Welcome to the app, ${
                            user.name || user.email || user.phoneNumber
                          }! We're excited to have you on board.`,
                        });

                        notification.onclick = () => {
                          window.focus();
                          notification.close();
                        };
                      }
                    });
                  }

                  window.location.href = "/src/pages/index.html";
                } else {
                  console.error("Error updating first login status");
                }
              })
              .catch((error) => {
                console.error(
                  "Error updating first login status:",
                  error.message
                );
              });
          } else {
            console.log("Returning user event");
            window.location.href = "/src/pages/index.html";
          }
        })
        .catch((error) => {
          console.error("Error checking first login status:", error.message);
        });
    })
    .catch((error) => {
      alert("Error signing in: " + error.message);
      console.error("Sign in error:", error.message);
    });
}

function signUpWithEmail() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Signed up as:", user.email);
      fetch("http://localhost:5000/create-user-by-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name, email: email, uid: user.uid }),
      })
        .then((response) => {
          if (response.ok) {
            console.log("User created successfully in Firestore");
            alert("User created successfully");
          } else {
            console.error("Error creating user in Firestore");
          }
        })
        .catch((error) => {
          console.error("Error creating user in Firestore:", error.message);
        });
    })
    .catch((error) => {
      alert("Error signing up: " + error.message);
      console.error("Sign up error:", error.message);
    });
}

// Set up RecaptchaVerifier
function setUpRecaptcha() {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          console.log("Recaptcha verified");
        },
        "expired-callback": () => {
          console.error("Recaptcha expired. Try again.");
        },
      }
    );
  }
}

// Phone number sign-up function
function signInOrUpWithPhoneNumber() {
  const name = document.getElementById("name").value;
  const phoneNumber = document.getElementById("phone").value;
  setUpRecaptcha();
  const appVerifier = window.recaptchaVerifier;

  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then((confirmationResult) => {
      const verificationCode = prompt(
        "Enter the verification code sent to your phone:"
      );
      return confirmationResult.confirm(verificationCode);
    })
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(
        "Successfully signed up / signed in with phone:",
        user.phoneNumber
      );

      fetch(
        `http://localhost:5000/check-user-exists?uid=${encodeURIComponent(
          user.uid
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to check user existence");
          }
          return response.json();
        })
        .then((data) => {
          if (data.exists) {
            console.log("User exists in Firestore");
            window.location.href = "/src/pages/index.html";
          } else {
            console.error("User doesn't exist in Firestore");
            fetch("http://localhost:5000/create-user-by-phone", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: name,
                phoneNumber: user.phoneNumber,
                uid: user.uid,
              }),
            })
              .then((response) => {
                if (response.ok) {
                  console.log("User created successfully in Firestore");
                  window.location.href = "/src/pages/index.html";
                } else {
                  console.error("Error creating user in Firestore");
                }
              })
              .catch((error) => {
                console.error(
                  "Error creating user in Firestore:",
                  error.message
                );
              });
          }
        })
        .catch((error) => {
          console.error("Error checking user existence:", error.message);
        });
    })
    .catch((error) => {
      console.error("Phone sign-up error:", error.message);
    });
}

// Google Sign-In/Sign-Up
const googleProvider = new GoogleAuthProvider();

function signInWithGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      const user = result.user;
      console.log("Signed in with Google as:", user.displayName, user.email);
      fetch(
        `http://localhost:5000/check-user-exists?uid=${encodeURIComponent(
          user.uid
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to check user existence");
          }
          return response.json();
        })
        .then((data) => {
          if (data.exists) {
            console.log("User exists in Firestore");
            window.location.href = "/src/pages/index.html";
          } else {
            console.error("User doesn't exist in Firestore");
            fetch("http://localhost:5000/create-user-by-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user.email,
                uid: user.uid,
                name: user.displayName,
              }),
            })
              .then((response) => {
                if (response.ok) {
                  console.log("User created successfully in Firestore");
                  window.location.href = "/src/pages/index.html";
                } else {
                  console.error("Error creating user in Firestore");
                }
              })
              .catch((error) => {
                console.error(
                  "Error creating user in Firestore:",
                  error.message
                );
              });
          }
        })
        .catch((error) => {
          console.error("Error checking user existence:", error.message);
        });
    })
    .catch((error) => {
      console.error("Google sign-in error:", error.message);
    });
}

window.signInWithEmail = signInWithEmail;
window.signUpWithEmail = signUpWithEmail;
window.signInOrUpWithPhoneNumber = signInOrUpWithPhoneNumber;
window.signInWithGoogle = signInWithGoogle;
