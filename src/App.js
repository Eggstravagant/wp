import React, { useEffect, useMemo, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const firebaseConfig = {
  apiKey: "AIzaSyAuTdUHgIYA5mITCdSvGOe-eCgmKF3Zx88",
  authDomain: "wakeoak-62226.firebaseapp.com",
  projectId: "wakeoak-62226",
  storageBucket: "wakeoak-62226.appspot.com",
  messagingSenderId: "934292031983",
  appId: "1:934292031983:web:4dd14d66c1b2d936ea4e1a",
  measurementId: "G-TZ1VQWWSPY",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function normalizeProfile(data = {}) {
  return {
    name: data.name || "",
    lastName: data.lastName || "",
    gender: data.gender || "",
    birthday: data.birthday || "",
    darkMode: !!data.darkMode,
    email: data.email || "",
  };
}

function sameProfile(a, b) {
  return (
    (a?.name || "") === (b?.name || "") &&
    (a?.lastName || "") === (b?.lastName || "") &&
    (a?.gender || "") === (b?.gender || "") &&
    (a?.birthday || "") === (b?.birthday || "") &&
    !!a?.darkMode === !!b?.darkMode &&
    (a?.email || "") === (b?.email || "")
  );
}

function LoginWrapper() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsub();
  }, []);

  if (user === undefined) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#F5F1EE",
          fontFamily: "Inter, sans-serif",
          color: "#4A3428",
        }}
      >
        Loading...
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" />;
  return <Login />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function allFilled() {
    return email.trim() && password.trim() && name.trim() && lastName.trim();
  }

  async function handleSignup() {
    if (!allFilled()) {
      setError("All fields are required");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      await setDoc(doc(db, "users", user.uid), {
        email: email.trim(),
        name: name.trim(),
        lastName: lastName.trim(),
        gender: "",
        birthday: "",
        darkMode: false,
        points: 0,
        dismissedCards: [],
        createdAt: Date.now(),
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogin() {
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle = {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    outline: "none",
    fontSize: 16,
    backgroundColor: "#FAF5F0",
    color: "#4A3428",
  };

  const buttonStyle = {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    background: "#4A3428",
    color: "white",
    border: "none",
    cursor: isSubmitting ? "not-allowed" : "pointer",
    fontWeight: "bold",
    opacity: isSubmitting ? 0.7 : 1,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F5F1EE",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: 360,
          padding: 30,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 28, color: "#4A3428", margin: 0 }}>TaskOak</h1>

        <input
          style={inputStyle}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="First Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: "red", margin: 0 }}
          >
            {error}
          </motion.p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <motion.button
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            style={buttonStyle}
            onClick={handleSignup}
            disabled={isSubmitting}
          >
            Create Account
          </motion.button>

          <motion.button
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            style={buttonStyle}
            onClick={handleLogin}
            disabled={isSubmitting}
          >
            Login
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function Toggle({ checked, onChange, darkMode }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 56,
        height: 30,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        position: "relative",
        background: checked ? "#4A3428" : darkMode ? "#4B5563" : "#D1D5DB",
        transition: "0.25s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 29 : 3,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "white",
          transition: "0.25s",
          display: "block",
        }}
      />
    </button>
  );
}

function SettingsModal({
  open,
  onClose,
  profile,
  setProfile,
  saveStatus,
  darkMode,
  isSavingSettings,
}) {
  if (!open) return null;

  const panelBg = darkMode ? "#1F2937" : "white";
  const text = darkMode ? "#F9FAFB" : "#4A3428";
  const muted = darkMode ? "#D1D5DB" : "#6B7280";
  const inputBg = darkMode ? "#111827" : "#FAF5F0";
  const border = darkMode ? "#374151" : "#ddd";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            width: "100%",
            maxWidth: 520,
            background: panelBg,
            color: text,
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 28 }}>Settings</h2>
              <p style={{ margin: "6px 0 0 0", color: muted }}>
                Changes save when you close this menu
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isSavingSettings}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 22,
                cursor: isSavingSettings ? "not-allowed" : "pointer",
                color: text,
                opacity: isSavingSettings ? 0.6 : 1,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8 }}>
                First Name
              </label>
              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, name: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: text,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8 }}>
                Last Name
              </label>
              <input
                value={profile.lastName}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, lastName: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: text,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8 }}>
                Gender
              </label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, gender: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: text,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8 }}>
                Birthday
              </label>
              <input
                type="date"
                value={profile.birthday}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, birthday: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: text,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: darkMode ? "#111827" : "#FAF5F0",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>Dark Mode</p>
                <p style={{ margin: "4px 0 0 0", color: muted, fontSize: 14 }}>
                  Switch the app appearance
                </p>
              </div>

              <Toggle
                checked={profile.darkMode}
                onChange={(value) =>
                  setProfile((prev) => ({ ...prev, darkMode: value }))
                }
                darkMode={darkMode}
              />
            </div>
          </div>

          <p
            style={{
              marginTop: 18,
              marginBottom: 0,
              fontSize: 14,
              color: muted,
            }}
          >
            {saveStatus}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Dashboard() {
  const [uid, setUid] = useState("");
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState(0);
  const [profile, setProfile] = useState(
    normalizeProfile({
      name: "",
      lastName: "",
      gender: "",
      birthday: "",
      darkMode: false,
      email: "",
    })
  );
  const [settingsDraft, setSettingsDraft] = useState(
    normalizeProfile({
      name: "",
      lastName: "",
      gender: "",
      birthday: "",
      darkMode: false,
      email: "",
    })
  );
  const [dismissedCards, setDismissedCards] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Idle");
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const unsubscribeUserDocRef = useRef(null);
  const unsubscribeTasksRef = useRef(null);
  const navigate = useNavigate();

  const effectiveDarkMode = settingsOpen
    ? settingsDraft.darkMode
    : profile.darkMode;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid("");
        setTasks([]);
        setProfileLoaded(false);
        if (unsubscribeUserDocRef.current) unsubscribeUserDocRef.current();
        if (unsubscribeTasksRef.current) unsubscribeTasksRef.current();
        navigate("/");
        return;
      }

      setUid(user.uid);
      setError("");

      const userRef = doc(db, "users", user.uid);
      const tasksRef = collection(db, "users", user.uid, "tasks");

      try {
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          await setDoc(
            userRef,
            {
              email: user.email || "",
              name: "",
              lastName: "",
              gender: "",
              birthday: "",
              darkMode: false,
              points: 0,
              dismissedCards: [],
              createdAt: Date.now(),
            },
            { merge: true }
          );
        }

        if (unsubscribeUserDocRef.current) unsubscribeUserDocRef.current();
        unsubscribeUserDocRef.current = onSnapshot(
          userRef,
          (userSnap) => {
            if (!userSnap.exists()) return;

            const data = userSnap.data();
            const incomingProfile = normalizeProfile({
              ...data,
              email: data.email || user.email || "",
            });

            setProfile(incomingProfile);

            if (!settingsOpen) {
              setSettingsDraft(incomingProfile);
            }

            setDismissedCards(
              Array.isArray(data.dismissedCards) ? data.dismissedCards : []
            );
            setPoints(Number(data.points || 0));
            setProfileLoaded(true);
            setSaveStatus("All changes saved");
          },
          (err) => {
            setError(err.message || "Could not load profile");
          }
        );

        if (unsubscribeTasksRef.current) unsubscribeTasksRef.current();
        unsubscribeTasksRef.current = onSnapshot(
          tasksRef,
          async (taskSnap) => {
            const arr = [];
            let total = 0;

            taskSnap.forEach((d) => {
              const data = { id: d.id, ...d.data() };
              arr.push(data);
              if (data.completed) total += Number(data.reward || 0);
            });

            setTasks(arr);
            setPoints(total);

            await setDoc(
              userRef,
              {
                points: total,
              },
              { merge: true }
            );
          },
          (err) => {
            setError(err.message || "Could not load tasks");
          }
        );
      } catch (err) {
        setError(err.message || "Could not load dashboard");
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDocRef.current) unsubscribeUserDocRef.current();
      if (unsubscribeTasksRef.current) unsubscribeTasksRef.current();
    };
  }, [navigate, settingsOpen]);

  function openSettings() {
    setSettingsDraft(normalizeProfile(profile));
    setSaveStatus("Editing...");
    setSettingsOpen(true);
  }

  async function closeSettingsAndSave() {
    if (!uid || isSavingSettings) return;

    if (sameProfile(settingsDraft, profile)) {
      setSettingsOpen(false);
      setSaveStatus("No changes to save");
      return;
    }

    setIsSavingSettings(true);
    setSaveStatus("Saving settings...");

    const nextProfile = normalizeProfile(settingsDraft);
    setProfile(nextProfile);

    try {
      await setDoc(
        doc(db, "users", uid),
        {
          name: nextProfile.name,
          lastName: nextProfile.lastName,
          gender: nextProfile.gender,
          birthday: nextProfile.birthday,
          darkMode: nextProfile.darkMode,
        },
        { merge: true }
      );

      setSettingsOpen(false);
      setSaveStatus("All changes saved");
    } catch (err) {
      setError(err.message || "Could not save settings");
      setSaveStatus("Could not save changes");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function addTask() {
    if (!uid || !title.trim()) return;

    setError("");

    try {
      await addDoc(collection(db, "users", uid, "tasks"), {
        title: title.trim(),
        completed: false,
        reward: 10,
        createdAt: Date.now(),
      });
      setTitle("");
    } catch (err) {
      setError(err.message || "Could not add task");
    }
  }

  async function toggleComplete(task) {
    if (!uid) return;

    setError("");

    try {
      await setDoc(
        doc(db, "users", uid, "tasks", task.id),
        {
          ...task,
          completed: !task.completed,
        },
        { merge: true }
      );
    } catch (err) {
      setError(err.message || "Could not update task");
    }
  }

  async function removeTask(task) {
    if (!uid) return;

    setError("");

    try {
      await deleteDoc(doc(db, "users", uid, "tasks", task.id));
    } catch (err) {
      setError(err.message || "Could not delete task");
    }
  }

  async function dismissCard(cardId) {
    if (!uid) return;

    const next = dismissedCards.includes(cardId)
      ? dismissedCards
      : [...dismissedCards, cardId];

    setDismissedCards(next);

    try {
      await setDoc(
        doc(db, "users", uid),
        {
          dismissedCards: next,
        },
        { merge: true }
      );
    } catch (err) {
      setError(err.message || "Could not save dismissed card");
    }
  }

  async function logout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message || "Could not log out");
      setIsLoggingOut(false);
    }
  }

  const cards = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.completed).length;

    return [
      {
        id: "first-task",
        title: "Make your first task",
        subtitle: "Create your first task to get started.",
        reward: 100,
        show: tasks.length === 0,
      },
      {
        id: "complete-task",
        title: "Complete a task",
        subtitle: "Mark one of your tasks as done.",
        reward: 25,
        show: tasks.length > 0 && completedTasks === 0,
      },
      {
        id: "keep-going",
        title: "Build momentum",
        subtitle: "Complete 3 tasks to build a streak.",
        reward: 75,
        show: completedTasks > 0 && completedTasks < 3,
      },
    ].filter((card) => card.show && !dismissedCards.includes(card.id));
  }, [tasks, dismissedCards]);

  const pageBg = effectiveDarkMode ? "#111827" : "#F5F1EE";
  const cardBg = effectiveDarkMode ? "#1F2937" : "white";
  const textColor = effectiveDarkMode ? "#F9FAFB" : "#4A3428";
  const mutedText = effectiveDarkMode ? "#D1D5DB" : "#7A5C4D";
  const borderColor = effectiveDarkMode ? "#374151" : "#ddd";
  const softBg = effectiveDarkMode ? "#0F172A" : "#eee";
  const inputBg = effectiveDarkMode ? "#111827" : "white";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        color: textColor,
        transition: "0.25s",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: 20,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ color: textColor, marginBottom: 6 }}>Your Tasks</h1>
            <p style={{ margin: 0, color: mutedText, fontSize: 18 }}>
              Welcome,{" "}
              <strong>
                {profile.name} {profile.lastName}
              </strong>
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ fontSize: 18, margin: 0 }}>
              Points: <strong>{points}</strong>
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "8px 12px",
                background: softBg,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                cursor: "pointer",
              }}
              onClick={openSettings}
            >
              Settings
            </motion.button>

            <motion.button
              whileHover={{ scale: isLoggingOut ? 1 : 1.05 }}
              whileTap={{ scale: isLoggingOut ? 1 : 0.95 }}
              style={{
                padding: "8px 12px",
                background: softBg,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                cursor: isLoggingOut ? "not-allowed" : "pointer",
                opacity: isLoggingOut ? 0.7 : 1,
              }}
              onClick={logout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </motion.button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 10,
              background: effectiveDarkMode ? "#3F1D1D" : "#FDECEC",
              color: effectiveDarkMode ? "#FECACA" : "#991B1B",
              border: effectiveDarkMode
                ? "1px solid #7F1D1D"
                : "1px solid #F5C2C2",
            }}
          >
            {error}
          </div>
        )}

        <AnimatePresence>
          {cards.length > 0 && (
            <div
              style={{
                marginTop: 24,
                display: "grid",
                gap: 12,
              }}
            >
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: effectiveDarkMode
                      ? "linear-gradient(135deg, #1E293B, #0F172A)"
                      : "linear-gradient(135deg, #FFF6EE, #F6E9DD)",
                    border: `1px solid ${
                      effectiveDarkMode ? "#334155" : "#E7D4C3"
                    }`,
                    borderRadius: 16,
                    padding: 18,
                    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        color: effectiveDarkMode ? "#C4B5FD" : "#8B6B5A",
                      }}
                    >
                      Challenge
                    </p>

                    <h3
                      style={{
                        margin: "6px 0 4px 0",
                        color: textColor,
                        fontSize: 20,
                      }}
                    >
                      {card.title}
                    </h3>

                    <p style={{ margin: 0, color: mutedText }}>
                      {card.subtitle}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        background: "#4A3428",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: 999,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      +{card.reward} pts
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => dismissCard(card.id)}
                      style={{
                        padding: "10px 12px",
                        background: cardBg,
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Dismiss
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          <input
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: inputBg,
              color: textColor,
              outline: "none",
            }}
            placeholder="Add a task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: 12,
              background: "#4A3428",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
            onClick={addTask}
          >
            Add
          </motion.button>
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 10,
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      textDecoration: task.completed ? "line-through" : "none",
                      color: textColor,
                      fontWeight: 600,
                    }}
                  >
                    {task.title}
                  </span>

                  <span style={{ fontSize: 13, color: mutedText }}>
                    Reward: {task.reward} points
                  </span>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "6px 10px",
                      background: "#8B6B5A",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleComplete(task)}
                  >
                    {task.completed ? "Undo" : "Done"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "6px 10px",
                      background: softBg,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onClick={() => removeTask(task)}
                  >
                    ✕
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={closeSettingsAndSave}
        profile={settingsDraft}
        setProfile={setSettingsDraft}
        saveStatus={saveStatus}
        darkMode={effectiveDarkMode}
        isSavingSettings={isSavingSettings}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<LoginWrapper />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
