# Step-by-Step Guide: How to Set Up the Legal AI Coach Project (For Beginners)

This guide is made for those with little or no coding experience. Follow these steps to get your project running, and use the hints and support links along the way.

---

## 1. **What You Need Before Starting**

- **A computer** with internet access
- **Google Chrome** or another web browser
- **GitHub account** ([sign up here](https://github.com/join))
- **Basic familiarity with installing programs** (YouTube tutorials help!)
- **Text editor:** [VS Code (recommended)](https://code.visualstudio.com/download)
- **Python 3.10+** ([download here](https://www.python.org/downloads/))
- **Node.js & npm** ([download here](https://nodejs.org/en/download/))

---

## 2. **Getting the Project Code**

1. **Sign up or log in to GitHub.**
2. **Find the repository** for the Legal AI Coach project (or create one).
   - If you have a link, click it and then click the green "Code" button > "Download ZIP" or "Clone".
   - If you want to start your own, click "New Repository" and name it.
3. **Open the folder** in VS Code or your chosen editor.

---

## 3. **Setting Up the Backend (FastAPI & Python)**

1. **Open a terminal or command prompt.**
   - In VS Code: `View > Terminal`
2. **Navigate to the backend folder.**
   - Example: `cd backend`
3. **Install required Python packages.**
   - Run: `pip install -r requirements.txt`
   - If you get errors, search the error in Google or ask in [StackOverflow](https://stackoverflow.com/questions/tagged/python).
4. **Start the backend server.**
   - Run: `uvicorn app:app --reload`
   - You should see a message with "Running on http://127.0.0.1:8000"
5. **Test the backend.**
   - Open your browser and go to `http://127.0.0.1:8000/docs`
   - You’ll see interactive documentation to test backend features.

> **Tip:** If you get stuck, search “how to install Python” or “run FastAPI server” on YouTube.

---

## 4. **Setting Up the Frontend (React & Node.js)**

1. **Open a new terminal window.**
2. **Navigate to the frontend folder.**
   - Example: `cd frontend`
3. **Install required Node packages.**
   - Run: `npm install`
4. **Start the frontend development server.**
   - Run: `npm start`
   - This should open a new browser tab with your app.

> **Tip:** If you see errors, copy the message and Google it. Common fixes include updating Node or reinstalling packages.

---

## 5. **Connecting Frontend and Backend**

- The React app will talk to your FastAPI backend using URLs like `http://localhost:8000`.
- You don’t need to do anything extra at first. Later, you’ll add code (or use examples) to send data between them.

---

## 6. **Customizing and Using the App**

- Explore the Dashboard, Goals, Timeline, Documents, Chats, Evidence pages.
- Try adding goals, uploading documents, saving chats, and uploading evidence.
- Follow in-app instructions or tooltips as you explore.

---

## 7. **Getting Help and Support**

- **YouTube:** Search for “how to run React app”, “FastAPI beginner tutorial”, or “[VS Code for beginners](https://www.youtube.com/watch?v=VqCgcpAypFQ)”.
- **GitHub Discussions:** Most repos have a "Discussions" tab for questions.
- **StackOverflow:** Ask questions and get answers from the coding community.
- **Copilot Chat:** If enabled, type your question in the Copilot sidebar in VS Code.
- **Friends or colleagues:** Don’t hesitate to ask for help!

---

## 8. **Common Issues and Fixes**

| Issue                      | What to Do                                       |
|----------------------------|--------------------------------------------------|
| Python not found           | Reinstall Python and add to PATH                 |
| npm not found              | Reinstall Node.js and npm                        |
| Server won’t start         | Check your folder, reinstall dependencies        |
| Port already in use        | Restart computer or change server port           |
| Missing files              | Download the repo or ask for the missing files   |

---

## 9. **Where to Ask for Help**

- [GitHub Help](https://docs.github.com/en)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [StackOverflow](https://stackoverflow.com/)
- [VS Code Help](https://code.visualstudio.com/docs)
- [YouTube Tutorials](https://youtube.com)

---

**You can do this! Step through each part, and don’t be afraid to search for help or ask questions.**