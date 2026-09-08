import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { getSocket, initSocket } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import Button from './common/Button';
import Modal from './common/Modal';
import { Trophy, RotateCcw, LogOut } from 'lucide-react';

// Sample Word Connect questions
const WORD_CONNECT_QUESTIONS = [
  {
    id: 1,
    question: 'Find the word that connects: MUSIC, BAND, ___',
    options: ['GUITAR', 'PIANO', 'DRUM', 'PLAY'],
    correctAnswer: 'GUITAR'
  },
  {
    id: 2,
    question: 'Find the word that connects: BOOK, STORY, ___',
    options: ['CHAPTER', 'PAGE', 'WORD', 'LETTER'],
    correctAnswer: 'CHAPTER'
  },
  {
    id: 3,
    question: 'Find the word that connects: FLOWER, PLANT, ___',
    options: ['PETAL', 'SEED', 'STEM', 'LEAF'],
    correctAnswer: 'STEM'
  },
  {
    id: 4,
    question: 'Find the word that connects: CAR, ROAD, ___',
    options: ['WHEEL', 'DRIVER', 'LANE', 'ENGINE'],
    correctAnswer: 'LANE'
  },
  {
    id: 5,
    question: 'Find the word that connects: MOON, NIGHT, ___',
    options: ['STAR', 'DARK', 'LIGHT', 'SKY'],
    correctAnswer: 'STAR'
  }
];

const MultiplayerWordConnect = ({ sharedSpaceId, onGameEnd, onLeave }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  
  const [gameRoomId, setGameRoomId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [gameStatus, setGameStatus] = useState('LOADING'); // LOADING, WAITING, PLAYING, COMPLETED
  const [players, setPlayers] = useState([]);
  const [otherPlayer, setOtherPlayer] = useState(null);
  const [gameResults, setGameResults] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = WORD_CONNECT_QUESTIONS[currentQuestionIndex] || null;

  // Initialize socket and game room
  useEffect(() => {
    const initGame = async () => {
      try {
        setLoading(true);
        socketRef.current = initSocket();

        // Create or get game room
        const roomRes = await api.post('/game-rooms', {
          sharedSpaceId,
          gameType: 'WORD_CONNECT'
        });

        if (roomRes.data?.success) {
          const roomId = roomRes.data.gameRoom.id;
          setGameRoomId(roomId);

          // Join Socket.IO room
          socketRef.current.emit('game:join', {
            gameRoomId: roomId,
            userId: user.id
          });

          // Listen for player joined
          socketRef.current.on('game:player-joined', (data) => {
            console.log('Player joined:', data);
            loadGameRoomState(roomId);
          });

          // Listen for answer received
          socketRef.current.on('game:answer-received', (data) => {
            console.log('Answer received:', data);
            loadGameRoomState(roomId);
          });

          // Listen for question changed
          socketRef.current.on('game:question-changed', (data) => {
            setCurrentQuestionIndex(data.questionIndex);
            setPlayerAnswer('');
          });

          // Listen for game completed
          socketRef.current.on('game:completed', (data) => {
            setGameResults(data.results);
            setGameStatus('COMPLETED');
          });

          // Load initial state
          loadGameRoomState(roomId);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create game room');
      } finally {
        setLoading(false);
      }
    };

    initGame();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('game:player-joined');
        socketRef.current.off('game:answer-received');
        socketRef.current.off('game:question-changed');
        socketRef.current.off('game:completed');
      }
    };
  }, [sharedSpaceId, user.id]);

  const loadGameRoomState = async (roomId) => {
    try {
      const res = await api.get(`/game-rooms/${roomId}`);
      if (res.data?.success) {
        const room = res.data.gameRoom;
        setPlayers(room.players);

        // Find other player
        const other = room.players.find(p => p.userId !== user.id);
        setOtherPlayer(other);

        // Determine game status
        if (room.players.length === 2) {
          if (room.players.every(p => p.isReady)) {
            setGameStatus('PLAYING');
          } else {
            setGameStatus('WAITING');
          }
        } else {
          setGameStatus('WAITING');
        }

        // Track answered questions
        const answered = new Set();
        room.players.forEach(player => {
          try {
            const answers = JSON.parse(player.answers || '{}');
            Object.keys(answers).forEach(idx => {
              answered.add(parseInt(idx));
            });
          } catch (e) {
            // Ignore parse errors
          }
        });
        setAnsweredQuestions(answered);
      }
    } catch (err) {
      console.error('Failed to load game room state:', err);
    }
  };

  const handleReady = async () => {
    try {
      const res = await api.post(`/game-rooms/${gameRoomId}/ready`, {
        isReady: true
      });

      if (res.data?.success) {
        if (res.data.allReady) {
          setGameStatus('PLAYING');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set ready status');
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();

    if (!playerAnswer.trim() || !currentQuestion) {
      setError('Please select an answer');
      return;
    }

    try {
      setLoading(true);
      const isCorrect = playerAnswer.toUpperCase() === currentQuestion.correctAnswer.toUpperCase();

      // Submit answer to backend
      await api.post(`/game-rooms/${gameRoomId}/submit-answer`, {
        answer: playerAnswer,
        questionIndex: currentQuestionIndex,
        isCorrect
      });

      // Emit answer via Socket.IO
      socketRef.current.emit('game:answer-submitted', {
        gameRoomId,
        userId: user.id,
        answer: playerAnswer,
        questionIndex: currentQuestionIndex,
        isCorrect
      });

      // Move to next question if available
      if (currentQuestionIndex < WORD_CONNECT_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setPlayerAnswer('');
        socketRef.current.emit('game:next-question', {
          gameRoomId,
          questionIndex: currentQuestionIndex + 1
        });
      } else {
        // Game completed
        await completeGame();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const completeGame = async () => {
    try {
      const res = await api.post(`/game-rooms/${gameRoomId}/complete`);
      if (res.data?.success) {
        const room = res.data.gameRoom;
        setGameResults({
          players: room.players,
          winner: room.winner
        });
        setGameStatus('COMPLETED');

        // Emit game completed via Socket.IO
        socketRef.current.emit('game:complete', {
          gameRoomId,
          results: {
            players: room.players,
            winner: room.winner
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete game');
    }
  };

  const handlePlayAgain = async () => {
    try {
      setLoading(true);
      // Reset game state
      setCurrentQuestionIndex(0);
      setPlayerAnswer('');
      setAnsweredQuestions(new Set());
      setGameResults(null);
      setGameStatus('WAITING');
      setError('');

      // Reset players in backend
      const res = await api.post('/game-rooms', {
        sharedSpaceId,
        gameType: 'WORD_CONNECT'
      });

      if (res.data?.success) {
        const newRoomId = res.data.gameRoom.id;
        setGameRoomId(newRoomId);

        socketRef.current.emit('game:join', {
          gameRoomId: newRoomId,
          userId: user.id
        });

        loadGameRoomState(newRoomId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start new game');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGame = async () => {
    try {
      await api.post(`/game-rooms/${gameRoomId}/leave`);
      socketRef.current.emit('game:leave', { gameRoomId });
      onLeave?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave game');
    }
  };

  if (loading && gameStatus === 'LOADING') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-2xl mb-3">🎮</div>
          <p className="text-sm text-[#806958] font-serif">Starting Word Connect game...</p>
        </div>
      </div>
    );
  }

  if (gameStatus === 'WAITING') {
    return (
      <div className="space-y-6 p-6 bg-white rounded-2xl border border-[#eee4d6]">
        <div className="text-center">
          <h3 className="text-lg font-serif font-bold text-[#2c1810] mb-2">
            Waiting for your person to join 💗
          </h3>
          <p className="text-xs text-[#806958] font-serif">
            {players.length === 1 ? 'Waiting for opponent...' : 'Both players ready!'}
          </p>
        </div>

        <div className="space-y-2">
          {players.map(player => (
            <div key={player.userId} className="p-3 bg-[#faf3e8] rounded-xl border border-[#ebd8bc]">
              <p className="text-sm font-serif font-bold text-[#2c1810]">
                {player.userId === user.id ? 'You' : 'Opponent'}
              </p>
              <p className="text-xs text-[#806958]">
                {player.isReady ? '✓ Ready' : '⏳ Getting ready...'}
              </p>
            </div>
          ))}
        </div>

        {players.length === 2 && !players.find(p => p.userId === user.id).isReady && (
          <Button
            variant="primary"
            onClick={handleReady}
            loading={loading}
            className="w-full"
          >
            I'm Ready
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={handleLeaveGame}
          icon={LogOut}
          className="w-full"
        >
          Leave
        </Button>
      </div>
    );
  }

  if (gameStatus === 'COMPLETED' && gameResults) {
    const currentPlayerScore = gameResults.players?.find(p => p.userId === user.id)?.correctCount || 0;
    const otherPlayerScore = gameResults.players?.find(p => p.userId !== user.id)?.correctCount || 0;
    const winnerId = gameResults.winner;

    return (
      <div className="space-y-6 p-6 bg-gradient-to-br from-[#faf3e8] to-[#f4e4e6] rounded-2xl border border-[#e8dfd1]">
        <div className="text-center space-y-3">
          <div className="text-4xl">
            {winnerId === user.id ? '🏆' : winnerId ? '🎉' : '🤝'}
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#2c1810]">
            {winnerId === user.id
              ? 'You Won!'
              : winnerId
              ? 'You Lost'
              : "It's a Tie!"}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {gameResults.players?.map(player => (
            <div
              key={player.userId}
              className={`p-4 rounded-xl border-2 ${
                player.userId === user.id
                  ? 'bg-white border-[#e89da2]'
                  : 'bg-white border-[#ebd8bc]'
              }`}
            >
              <p className="text-xs font-serif text-[#806958]">
                {player.userId === user.id ? 'Your Score' : "Opponent's Score"}
              </p>
              <p className="text-3xl font-bold text-[#2c1810] mt-1">
                {player.correctCount}
              </p>
              <p className="text-[10px] text-[#805645] mt-1">
                {player.correctCount}/{WORD_CONNECT_QUESTIONS.length} correct
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t border-[#e8dfd1]">
          <Button
            variant="primary"
            onClick={handlePlayAgain}
            loading={loading}
            className="w-full"
            icon={RotateCcw}
          >
            Play Again
          </Button>
          <Button
            variant="ghost"
            onClick={handleLeaveGame}
            icon={LogOut}
            className="w-full"
          >
            Exit Game
          </Button>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="space-y-6 p-6 bg-white rounded-2xl border border-[#eee4d6]">
      {error && (
        <div className="p-3 bg-[#fbeeed] border border-[#f4cfd3] rounded-xl text-xs text-[#a8323e] font-semibold">
          {error}
        </div>
      )}

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3">
        {players.map(player => (
          <div
            key={player.userId}
            className={`p-3 rounded-xl border ${
              player.userId === user.id
                ? 'bg-[#fff8ea] border-[#f5dfb8]'
                : 'bg-[#faf4ec] border-[#ebd8bc]'
            }`}
          >
            <p className="text-xs font-serif font-bold text-[#5c3e2e] uppercase tracking-wider">
              {player.userId === user.id ? 'Your Score' : 'Opponent'}
            </p>
            <p className="text-2xl font-bold text-[#2c1810] mt-1">
              {player.correctCount}
            </p>
          </div>
        ))}
      </div>

      {/* Question Counter */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-serif text-[#806958]">
          Question {currentQuestionIndex + 1} of {WORD_CONNECT_QUESTIONS.length}
        </p>
        <div className="w-24 h-1 bg-[#eee4d6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e89da2] transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / WORD_CONNECT_QUESTIONS.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-4 bg-[#faf3e8] border border-[#ebd8bc] rounded-xl">
        <p className="text-sm font-serif text-[#2c1810] font-bold">
          {currentQuestion?.question}
        </p>
      </div>

      {/* Answer Options */}
      <form onSubmit={handleAnswerSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {currentQuestion?.options.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setPlayerAnswer(option)}
              className={`p-3 rounded-lg border-2 text-sm font-serif font-bold transition ${
                playerAnswer === option
                  ? 'bg-[#e89da2] border-[#c86d74] text-white'
                  : 'bg-white border-[#eee4d6] text-[#2c1810] hover:border-[#e89da2]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!playerAnswer || loading}
          className="w-full"
        >
          Submit Answer
        </Button>
      </form>

      <Button
        variant="ghost"
        onClick={handleLeaveGame}
        icon={LogOut}
        className="w-full text-xs"
      >
        Leave Game
      </Button>
    </div>
  );
};

export default MultiplayerWordConnect;
