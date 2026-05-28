# Vicharanashala FAQ Portal Prototype 🚀

Welcome to the FAQ Portal! If you are new to this project, don't worry. This guide is written so that anyone can understand it, even if you are just starting out with coding.

Think of this app like a restaurant:
* **The Database (MongoDB):** This is the pantry where we store all our food (the FAQ questions).
* **The Backend (NestJS):** This is the waiter and kitchen. It takes requests from the customers and fetches the right food from the pantry.
* **The Frontend (React):** This is the beautiful dining room where the customer sits, reads the menu (the FAQs), and talks to the staff.

---

## 🌟 What We Have Built So Far (Phase 1)

1.  **The Brain is Filled (Database Seeding):** We created a script that automatically takes 127 official Samagama FAQs and neatly organizes them into our MongoDB database. 
2.  **The Waiter is Ready (NestJS Backend):** We built a backend server that safely connects to the database. It has a special "route" (like a door) that allows the frontend to ask for the FAQ questions.
3.  **The Dining Room is Open (React Frontend):** We built a beautiful website where users can view all the questions. It has a working search bar and category buttons that filter the questions instantly!

---

## 🛠️ How to Run the App on Your Computer

Follow these steps exactly to see the app working on your screen. You will need to open **three different terminal windows**.

### Step 1: Wake Up the Database
Our app needs a place to store data. If you are using a local database on a Mac, open your terminal and type:
`brew services start mongodb-community`
*(If your team is using a cloud database like MongoDB Atlas, you can skip this step!)*

### Step 2: Feed the Database (Only do this ONCE!)
We need to put the 127 questions into the database. 
1. Open a terminal and go into the `backend` folder.
2. Type: `npm install` (to download the tools we need).
3. Type: `MONGO_URI="mongodb://localhost:27017/vicharanashala" npx ts-node seed.ts`
*(When it says "FAQs seeded successfully!", you are done. Never run this again unless you want to erase everything and start over).*

### Step 3: Start the Backend (The Waiter)
Keep the database running in the background. Now let's turn on the backend.
1. Open a **new** terminal window and go into the `backend` folder.
2. Type: `npm run start:dev`
*(Wait until it says the Nest application successfully started. It is now running on port 3000).*

### Step 4: Start the Frontend (The Dining Room)
Now let's turn on the beautiful website.
1. Open a **third** terminal window and go into the `frontend` folder.
2. Type: `npm install` (to download the tools for the website).
3. Type: `npm run dev`
4. It will give you a link (usually `http://localhost:5173/`). Click it or type it into your browser!

---

## 🔮 Future Work (What we are building next)

We have some amazing features planned. If you want to help, here is what we are building and where the code will go:

### 1. The Yaksha-mini AI Chatbot (Phase 2)
* **What it is:** A floating chat window where users can ask questions. If the answer isn't in the FAQs, an AI will answer it! We have a super-smart system that tries the Minimax AI first, and if that fails, it instantly switches to Gemini AI so it never breaks.
* **Where it belongs:** * Frontend: `frontend/src/YakshaChat.tsx` (to connect the "Send" button to the real API).
    * Backend: `backend/src/ai.service.ts` (this file is already built, we just need to link it to a controller!).

### 2. Admin Maker-Checker Panel
* **What it is:** A secret page for team members. When students suggest new answers, they go into a "Pending" queue. An admin must read them and click "Approve" before the public can see them.
* **Where it belongs:** * Backend: `backend/src/pending-approvals.schema.ts` (the database rules for pending items).
    * Frontend: A new file we will create called `frontend/src/AdminPanel.tsx`.

### 3. Light & Dark Mode Toggle
* **What it is:** A simple switch at the top of the screen so users can change the website from dark mode (night) to light mode (day).
* **Where it belongs:** * Frontend: `frontend/src/style.css` (we will add light mode colors) and a new toggle button in `frontend/src/FaqDashboard.tsx`.

### 4. "Liquid Glass" UI Design
* **What it is:** Upgrading the look of our buttons and chat widget so they look slightly see-through and shiny, exactly like the premium glass icons you see on Apple devices or Telegram.
* **Where it belongs:** * Frontend: `frontend/src/style.css`. We will use CSS properties like `backdrop-filter: blur(10px)` to make things look like frosted glass!
