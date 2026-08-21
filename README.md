# 🏆 Radnus Scorecard Application

A simple and interactive **Scorecard Application** that allows users to manage scores for multiple players across multiple rounds of a game. The application dynamically creates scorecards, records scores for every round, calculates the total scores, and finally displays the **Winner, Runner-up, and complete player rankings**.

Built with **Vite** for a fast and modern development experience.

---

## 🚀 Features

* 🎮 **Game Name Input**

  * Enter the name of the game before starting.

* 👥 **Dynamic Player Setup**

  * Specify how many players are participating.
  * Add player names dynamically.

* 📝 **Round-wise Score Entry**

  * Add scores for each player after every round.
  * Supports multiple rounds of gameplay.

* 📊 **Automatic Score Calculation**

  * Calculates the total score of every player automatically.
  * Keeps track of scores throughout the game.

* 🏆 **Winner Detection**

  * Automatically identifies the player with the highest score.
  * Displays the winner prominently.

* 🥈 **Runner-up Detection**

  * Identifies and displays the runner-up based on the final scores.

* 📋 **Complete Scorecard**

  * Displays the scores of all players for every round.
  * Shows the final total score and ranking.

* 🔄 **Dynamic Game Flow**

  * Players and rounds are generated based on user input.
  * No fixed number of players or rounds is required.

* ⚡ **Fast Development with Vite**

  * Uses Vite for a fast development server and optimized build process.

---

## 🛠️ Technologies Used

| Technology    | Purpose                                 |
| ------------- | --------------------------------------- |
| ⚡ Vite        | Development environment and build tool  |
| ⚛️ React      | Building the user interface             |
| 🎨 HTML/CSS   | Structure and styling                   |
| 💻 JavaScript | Application logic and score calculation |

---

## 📂 Project Structure

```text
scorecard-application/
│
├── public/
│   └── ...
│
├── src/
│   ├── assets/
│   │   └── ...
│   │
│   ├── components/
│   │   ├── GameSetup.jsx
│   │   ├── PlayerSetup.jsx
│   │   ├── ScoreCard.jsx
│   │   └── Result.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
│
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

> The exact folder structure may vary depending on the implementation.

---

## ⚙️ How the Application Works

The application follows a simple game-scoring workflow.

### 1. Enter Game Name

The user first enters the name of the game.

Example:

```text
Game Name: Carrom
```

---

### 2. Enter Number of Players

The user specifies the number of players participating in the game.

Example:

```text
Number of Players: 4
```

---

### 3. Add Player Names

The application dynamically generates fields for entering player names.

Example:

```text
Player 1: Sundar
Player 2: Arun
Player 3: Rahul
Player 4: Karthik
```

---

### 4. Enter Scores for Each Round

After starting the game, the scorecard allows the user to enter scores for every player in each round.

Example:

| Player  | Round 1 | Round 2 | Round 3 |
| ------- | ------: | ------: | ------: |
| Sundar  |      20 |      30 |      40 |
| Arun    |      25 |      20 |      35 |
| Rahul   |      15 |      40 |      30 |
| Karthik |      10 |      25 |      45 |

---

### 5. Calculate Total Scores

The application automatically calculates the total score.

```text
Sundar  = 20 + 30 + 40 = 90
Arun    = 25 + 20 + 35 = 80
Rahul   = 15 + 40 + 30 = 85
Karthik = 10 + 25 + 45 = 80
```

---

### 6. Display Final Results

At the end of the game, the application displays the final rankings.

```text
🏆 Winner
Sundar - 90 Points

🥈 Runner-up
Rahul - 85 Points

Final Scoreboard

1. Sundar   - 90
2. Rahul    - 85
3. Arun     - 80
4. Karthik  - 80
```

---

## 🖥️ Application Flow

```text
              ┌──────────────────┐
              │    Start Game    │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Enter Game Name  │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Number of Players│
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Enter Player     │
              │ Names            │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Enter Round      │
              │ Scores           │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Calculate Total  │
              │ Scores           │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Display Rankings │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Winner &         │
              │ Runner-up        │
              └──────────────────┘
```

---

## 📦 Installation

### Prerequisites

Make sure the following are installed on your system:

* **Node.js**
* **npm**

You can verify the installation using:

```bash
node --version
npm --version
```

### Clone the Repository

```bash
git clone <your-repository-url>
```

Navigate into the project directory:

```bash
cd scorecard-application
```

### Install Dependencies

```bash
npm install
```

---

## ▶️ Run the Application

Start the Vite development server:

```bash
npm run dev
```

Vite will provide a local development URL, usually similar to:

```text
http://localhost:5173/
```

Open the URL in your browser to use the application.

---

## 🏗️ Build for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🎯 Example Use Case

The Scorecard Application can be used for games such as:

* 🎲 Board Games
* 🃏 Card Games
* 🎯 Indoor Games
* 🏏 Casual Scoring Games
* 🎮 Multiplayer Games
* 🏆 Competition/Tournament Scoring

For example, during a game with five players, the application can maintain the scores for every round and automatically determine the final winner.

---

## 📊 Key Benefits

### Dynamic Player Management

There is no need to hard-code the number of players. The user can specify the required number of players at runtime.

### Automated Calculations

The application eliminates manual calculation of total scores and reduces the possibility of calculation errors.

### Easy-to-Understand Results

The final result clearly shows:

* Winner
* Runner-up
* Player rankings
* Individual round scores
* Total scores

### Responsive User Experience

The application provides a simple interface for entering and viewing game scores.

---

## 🔮 Future Enhancements

The application can be extended with additional features such as:

* 💾 Save game history
* 📜 View previous games
* 🔐 User authentication
* ☁️ Store scores in a database
* 📱 Improve mobile responsiveness
* 📤 Export scorecards as PDF/Excel
* 🔗 Share scorecards with other players
* ⏱️ Add game timers
* 🏅 Maintain player rankings
* 🌙 Add dark/light mode
* 🔄 Add undo/edit score functionality
* 🏆 Support tournament-style games

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature/new-feature
```

3. Make your changes.
4. Commit your changes.

```bash
git commit -m "Add new feature"
```

5. Push the branch.

```bash
git push origin feature/new-feature
```

6. Create a Pull Request.

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 👨‍💻 Author

**Sundar**

Developed as a practical web application for managing multiplayer game scores.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub!
