import React, { useState, useEffect } from "react";
import './App.css';

function App() {
  const [minutes, setMinutes] = useState(() => {
    const savedMinutes = localStorage.getItem("minutes");
    return savedMinutes ? Number(savedMinutes) : 0;
  });
  const [seconds, setSeconds] = useState(() => {
    const savedSeconds = localStorage.getItem("seconds");
    return savedSeconds ? Number(savedSeconds) : 15;
  });
  const [isRunning, setIsRunning] = useState(() => {
    const savedIsRunning = localStorage.getItem("isRunning");
    return savedIsRunning ? JSON.parse(savedIsRunning) : false;
  });
  const [isPaused, setIsPaused] = useState(() => {
    const savedIsPaused = localStorage.getItem("isPaused");
    return savedIsPaused ? JSON.parse(savedIsPaused) : false;
  });
  const [sessions, setSessions] = useState(() => {
    const savedSessions = localStorage.getItem("sessions");
    return savedSessions ? JSON.parse(savedSessions) : [];
  });
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState(() => {
    const savedLeaderboard = localStorage.getItem("leaderboard");
    return savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
  });

  const [group, setGroup] = useState("");
  const [winner, setWinner] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  const timerEndSound = new Audio("path/to/your/sound/file.mp3"); // Add your sound file path here

  useEffect(() => {
    localStorage.setItem("minutes", minutes);
  }, [minutes]);

  useEffect(() => {
    localStorage.setItem("seconds", seconds);
  }, [seconds]);

  useEffect(() => {
    localStorage.setItem("isRunning", isRunning);
  }, [isRunning]);

  useEffect(() => {
    localStorage.setItem("isPaused", isPaused);
  }, [isPaused]);

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    let intervalId;

    if (isRunning && !isPaused) {
      intervalId = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false);
            clearInterval(intervalId);
            timerEndSound.play();
            endSession();
          } else {
            setMinutes((prevMinutes) => prevMinutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((prevSeconds) => prevSeconds - 1);
        }
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, isPaused, minutes, seconds]);

  const startTimer = () => {
    if (players.length === 0) {
      alert("Please add players before starting the game.");
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setMinutes(0);
    setSeconds(15);
    setWinner(null);
    setPlayers([]);
    setCurrentPlayerIndex(0);
  };

  const handleMinuteChange = (e) => {
    setMinutes(Number(e.target.value));
  };

  const handleSecondChange = (e) => {
    setSeconds(Number(e.target.value));
  };

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const addPlayer = () => {
    if (playerName.trim() !== "") {
      setPlayers([...players, { name: playerName, group: "", won: false }]);
      setPlayerName("");
    }
  };

  const assignGroup = (playerIndex, group) => {
    const newPlayers = [...players];
    newPlayers[playerIndex].group = group;
    setPlayers(newPlayers);
  };

  const endTurn = (potted8Ball) => {
    if (players.length === 0) {
      alert("Please add players before ending a turn.");
      return;
    }
    if (currentPlayerIndex >= players.length) return;

    if (potted8Ball) {
      setWinner(players[currentPlayerIndex].name);
    } else {
      setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
    }
  };

  const endSession = () => {
    const newSessions = players.map(player => ({
      player: player.name,
      group: player.group,
      won: player.won,
      date: new Date(),
    }));
    setSessions([...sessions, ...newSessions]);
    newSessions.forEach(updateLeaderboard);
    resetTimer();
  };

  const updateLeaderboard = (session) => {
    const existingPlayer = leaderboard.find(item => item.player === session.player);
    if (existingPlayer) {
      if (session.won) {
        existingPlayer.wins += 1;
      }
    } else {
      leaderboard.push({
        player: session.player,
        wins: session.won ? 1 : 0,
      });
    }
    leaderboard.sort((a, b) => b.wins - a.wins);
    setLeaderboard([...leaderboard]);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? 'container dark' : 'container'}>
      <button className="button toggle-dark-mode" onClick={toggleDarkMode}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <div className="timer-container">
        <div className="timer">
          Timer: {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="button-container">
        <button className="button" onClick={startTimer}>Start</button>
        <button className="button" onClick={pauseTimer}>
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button className="button" onClick={stopTimer}>Stop</button>
        <button className="button" onClick={resetTimer}>Reset</button>
      </div>
      <div className="input-container">
        <input
          type="number"
          value={minutes}
          onChange={handleMinuteChange}
          placeholder="Minutes"
        />
        <input
          type="number"
          value={seconds}
          onChange={handleSecondChange}
          placeholder="Seconds"
        />
        <input
          type="text"
          value={playerName}
          onChange={handlePlayerNameChange}
          placeholder="Player Name"
        />
        <button className="button" onClick={addPlayer}>Add Player</button>
      </div>
      <div className="players-container">
        <h2>Players</h2>
        <ul>
          {players.map((player, index) => (
            <li key={index} className={currentPlayerIndex === index ? 'active' : ''}>
              {player.name} {player.group ? `(${player.group})` : ""}
            </li>
          ))}
        </ul>
      </div>
      <div className="button-container">
        <button className="button" onClick={() => assignGroup(currentPlayerIndex, "Solids")}>Assign Solids</button>
        <button className="button" onClick={() => assignGroup(currentPlayerIndex, "Stripes")}>Assign Stripes</button>
      </div>
      <div className="button-container">
        <button className="button" onClick={() => endTurn(false)}>End Turn</button>
        <button className="button" onClick={() => endTurn(true)}>Pot 8-Ball</button>
        <button className="button" onClick={endSession}>End Game</button>
      </div>
      {winner && <h2>Winner: {winner}</h2>}
      <div className="sessions-container">
        <h2>Session History</h2>
        <ul>
          {sessions.map((session, index) => (
            <li key={index}>
              {session.date.toString()}: {session.player} - {session.group} - {session.won ? "Won" : "Lost"}
            </li>
          ))}
        </ul>
      </div>
      <div className="leaderboard-container">
        <h2>Leaderboard</h2>
        <ul>
          {leaderboard.map((item, index) => (
            <li key={index}>
              {item.player}: {item.wins} wins
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
