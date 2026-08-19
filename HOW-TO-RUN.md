# How to run the School Management System (offline)

This app runs on **one computer** at the school. Teachers and students then open
it on their own phones/laptops through the **same WiFi** — no internet needed and
nothing to pay for.

Think of the one computer as the "server". It must be **on and running the app**
while people are using it.

---

## What you need (once)

- A **Windows computer** to act as the server (the office PC is fine).
- **Node.js** installed on it — free from **https://nodejs.org** (download the
  "LTS" version and click through the installer).
- All the users (teachers/students) on the **same WiFi / network** as that computer.

---

## Step 1 — First-time setup (do this once)

1. Copy this whole project folder onto the server computer (a USB is fine).
2. Double-click **`setup.bat`**.
3. Wait for it to finish (it needs internet **this one time**). When it says
   **"Setup complete"**, you're done with setup.

---

## Step 2 — Start the app (each day)

1. Double-click **`start-app.bat`**.
2. A black window opens and shows some addresses, for example:

   ```
   On this computer:  http://localhost:4000
   On the same WiFi:  http://192.168.1.10:4000
   ```

3. **Leave this window open** while people use the app. (Closing it stops the app.)
4. If Windows asks to "allow Node.js through the firewall", click **Allow** — this
   is what lets other devices connect.

## Step 3 — Open it

- **On the server computer:** open a browser and go to `http://localhost:4000`
- **On any phone/laptop on the same WiFi:** open a browser and type the
  **"On the same WiFi"** address shown in the window (e.g. `http://192.168.1.10:4000`).

## Step 4 — Stop the app

- Just **close the black window**, or double-click **`stop-app.bat`**.

---

## Logins (demo accounts)

The setup adds these so you can try it immediately. **Change the passwords**
(and add your real classes, teachers, and students) from the admin account.

| Role    | How to log in                               |
| ------- | ------------------------------------------- |
| Admin   | `admin@school.com` / `admin123`             |
| Teacher | `ahmed@school.com` / `teacher123`           |
| Student | Class 5 → Section A → Roll `2` → `school123` |

New students get the default password **`school123`** until changed.

---

## Backing up your data (important)

All the school's data lives in **one file**:

```
server/prisma/dev.db
```

To back up, just **copy that file** somewhere safe (a USB, another folder) now and
then. To restore, copy it back. That's it.

---

## Common questions

**Others can't open the WiFi address.**
- Make sure they're on the **same WiFi** as the server computer.
- On the server, allow Node.js when Windows Firewall asks (or allow it manually
  in Windows Defender Firewall).
- Re-check the address in the black window — the IP can change if the router
  restarts.

**The first page load is slow / the app seems asleep.**
- It shouldn't be, offline. Just make sure `start-app.bat` is running.

**I want to move it to another computer.**
- Copy the whole folder over, install Node.js there, and run `setup.bat` again.
- To keep existing data, also copy `server/prisma/dev.db` after setup.

**Does the server computer need to stay on?**
- Yes — the app only works while that computer is on and `start-app.bat` is running.
