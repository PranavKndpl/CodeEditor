# 🧑‍💻 Collaborative Code Editor

A real-time **collaborative code editor** that lets multiple users edit and run code together in the browser.
The frontend is hosted online, but to actually execute code securely, you’ll run the **server** locally — it spins up isolated Docker containers for each code execution.

---

## 🌍 Live Demo

Frontend (React App):
👉 [https://codeeditor-ipi6.onrender.com/](https://codeeditor-ipi6.onrender.com/)

> You can open this link in your browser to use the editor interface.
> The editor connects to a local backend that you’ll run yourself (instructions below).

---

## 🧩 Project Structure

```bash
root/
├── frontend/   # React app (deployed on Render)
├── backend/    # WebSocket server (also deployed on Render)
└── server/     # Local execution server (you run this on your PC)
    ├── server.js
    ├── worker.js
    ├── redisClient.js
    └── package.json
````

  * **frontend/** — React-based collaborative editor UI (already deployed).
  * **backend/** — WebSocket signaling layer for real-time collaboration (also deployed).
  * **server/** — The local code execution environment.
    This runs Docker containers for code execution and exposes a public endpoint via ngrok.

-----

## ⚙️ Prerequisites

Before running the server, make sure you have these installed:

  * [Node.js](https://nodejs.org/) (v18 or newer)
  * [Redis](https://redis.io/download)
  * [Docker](https://www.docker.com/)
  * [ngrok](https://ngrok.com/download)

-----

## 🪄 Setting Up ngrok

1.  **Download ngrok:**
    [https://ngrok.com/download](https://ngrok.com/download)

2.  **Unzip & install** (follow ngrok’s setup instructions).

3.  **Login and connect your authtoken:**
    After creating a free account, you’ll get a token on your ngrok dashboard.
    Run this in your terminal:

    ```bash
    ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
    ```

-----

## 🚀 Running the Local Server

You will need two separate terminals for this.

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
    cd YOUR_REPO_NAME/server
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **In your FIRST terminal, start the server:**
    *(This will start Redis, the Node.js API, and the Docker worker)*

    ```bash
    npm start
    ```

4.  **In a SECOND terminal, start ngrok:**
    *(This exposes your local server (port 3001) to the internet)*

    ```bash
    ngrok http 3001
    ```

5.  **Copy the ngrok public URL** from your **second** terminal (it looks like this):

    ```text
    Forwarding   [https://something.ngrok.io](https://something.ngrok.io) -> http://localhost:3001
    ```

6.  **Paste this URL** into the input box on the live website and click **"Save URL"**. You are now ready to run code.

-----

## 🧠 How It Works

  * The **frontend** (React app) is already live and lets users collaboratively edit code in real time.
  * The **backend** (WebSocket server) synchronizes edits between all connected users.
  * The **local server** (this part) receives code from the editor and safely executes it inside a Docker container, returning the output via Redis.
  * The code execution happens on your local machine, not the hosted frontend.

⚠️ **Note:** Each user running this locally will have their own unique ngrok URL. They must paste their URL into the input box on the frontend and click **"Save URL"** to connect their browser to their local backend.

-----

## 🐳 Requirements Recap

Make sure Docker is running before starting the worker — it’s required to create isolated containers for code execution.

If you get:

```text
Error: connect ECONNREFUSED /var/run/docker.sock
```

It means Docker isn’t running or you don’t have permission to access it.

-----

## 🤝 Contributing

If you’d like to extend or improve the project, feel free to fork the repository and submit a pull request.
