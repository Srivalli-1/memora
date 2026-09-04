import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Gamepad2, Play, Check, X, RotateCcw } from 'lucide-react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const GamesPage = () => {
  const [activeGameModal, setActiveGameModal] = useState(null); // 'WYR', 'WORD', 'QUIZ', 'MATCH'

  // Game 1: Would You Rather
  const wyrQuestions = [
    { q1: 'Late night cozy talks', q2: 'Early morning coffee together' },
    { q1: 'Handwritten physical letters', q2: 'Surprise sweet voice notes' },
    { q1: 'Quiet cabin in the rain', q2: 'Sunlit road trip with windows down' },
    { q1: 'Polaroid vintage camera shots', q2: 'Candid video clips of laughter' }
  ];
  const [wyrIndex, setWyrIndex] = useState(0);
  const [wyrFinished, setWyrFinished] = useState(false);

  // Game 2: Word Connect (Simple word unscramble / memory word guess)
  const wordPuzzles = [
    { scrambled: 'M M O R E Y', word: 'MEMORY', hint: 'Something sweet you never want to forget' },
    { scrambled: 'R E D A M', word: 'DREAM', hint: 'What we build together for tomorrow' },
    { scrambled: 'M P O R E I S', word: 'PROMISE', hint: 'A sacred pledge between two hearts' }
  ];
  const [wordIndex, setWordIndex] = useState(0);
  const [wordInput, setWordInput] = useState('');
  const [wordStatus, setWordStatus] = useState('');

  // Game 3: Quiz Time (How well do you know each other?)
  const quizQuestions = [
    {
      question: 'What is my favorite way to spend a quiet Sunday evening?',
      options: ['Curling up with a book & warm tea', 'Cooking a slow homemade dinner', 'Watching favorite old movies', 'Stargazing on a balcony'],
      correct: 0
    },
    {
      question: 'Which season holds my most nostalgic memories?',
      options: ['Spring blossoms', 'Warm coastal summers', 'Autumn golden leaves', 'Cozy winter rains'],
      correct: 2
    }
  ];
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // Game 4: Memory Match (Card pair flip)
  const [cards, setCards] = useState([
    { id: 1, val: '🌸', flipped: false, matched: false },
    { id: 2, val: '☕', flipped: false, matched: false },
    { id: 3, val: '💌', flipped: false, matched: false },
    { id: 4, val: '🌸', flipped: false, matched: false },
    { id: 5, val: '☕', flipped: false, matched: false },
    { id: 6, val: '💌', flipped: false, matched: false }
  ]);
  const [selectedCards, setSelectedCards] = useState([]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleFlipCard = (index) => {
    if (cards[index].flipped || cards[index].matched || selectedCards.length === 2) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (cards[first].val === cards[second].val) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setSelectedCards([]);
        triggerConfetti();
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Botanical Leaves at Corners (Panel 7) */}
      <div className="absolute -top-6 -left-6 text-3xl opacity-75 select-none pointer-events-none transform -rotate-45">
        🌿🍃
      </div>
      <div className="absolute -bottom-6 -right-6 text-3xl opacity-75 select-none pointer-events-none transform rotate-12">
        🌸🌿
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c1810]">
          Games
        </h1>
        <p className="text-xs sm:text-sm text-[#705645] font-serif mt-1">
          Small games for big smiles <span className="text-[#c86d74]">♡</span>
        </p>
      </div>

      {/* Main Row: 4 Game Cards + Side Note matching Panel 7 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Four Cards (9.5 Cols) */}
        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Would You Rather */}
          <div className="parchment-plaque p-5 rounded-2xl flex flex-col justify-between min-h-[190px] group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#fdf2f4] border border-[#f4cfd3] flex items-center justify-center text-lg shadow-xs">
                💗
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#2c1810]">
                  Would You Rather
                </h3>
                <p className="text-xs text-[#705645] leading-relaxed font-serif mt-1">
                  Fun questions to know each other better.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#eee4d6]">
              <button
                onClick={() => {
                  setWyrIndex(0);
                  setWyrFinished(false);
                  setActiveGameModal('WYR');
                }}
                className="w-full py-1.5 px-3 rounded-full bg-[#fdfbf7] hover:bg-[#f5eee6] border border-[#e8dfd1] text-xs font-semibold text-[#c86d74] flex items-center justify-center gap-1 transition shadow-xs"
              >
                Play →
              </button>
            </div>
          </div>

          {/* Card 2: Word Connect */}
          <div className="parchment-plaque p-5 rounded-2xl flex flex-col justify-between min-h-[190px] group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#edf4f2] border border-[#cde0dc] flex items-center justify-center text-lg shadow-xs">
                🔤
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#2c1810]">
                  Word Connect
                </h3>
                <p className="text-xs text-[#705645] leading-relaxed font-serif mt-1">
                  Find words together.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#eee4d6]">
              <button
                onClick={() => {
                  setWordIndex(0);
                  setWordInput('');
                  setWordStatus('');
                  setActiveGameModal('WORD');
                }}
                className="w-full py-1.5 px-3 rounded-full bg-[#fdfbf7] hover:bg-[#f5eee6] border border-[#e8dfd1] text-xs font-semibold text-[#c86d74] flex items-center justify-center gap-1 transition shadow-xs"
              >
                Play →
              </button>
            </div>
          </div>

          {/* Card 3: Quiz Time */}
          <div className="parchment-plaque p-5 rounded-2xl flex flex-col justify-between min-h-[190px] group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#f4eef9] border border-[#dfcff0] flex items-center justify-center text-lg shadow-xs">
                ❓
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#2c1810]">
                  Quiz Time
                </h3>
                <p className="text-xs text-[#705645] leading-relaxed font-serif mt-1">
                  How well do you know each other?
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#eee4d6]">
              <button
                onClick={() => {
                  setQuizIndex(0);
                  setQuizScore(0);
                  setQuizAnswered(null);
                  setQuizFinished(false);
                  setActiveGameModal('QUIZ');
                }}
                className="w-full py-1.5 px-3 rounded-full bg-[#fdfbf7] hover:bg-[#f5eee6] border border-[#e8dfd1] text-xs font-semibold text-[#c86d74] flex items-center justify-center gap-1 transition shadow-xs"
              >
                Play →
              </button>
            </div>
          </div>

          {/* Card 4: Memory Match */}
          <div className="parchment-plaque p-5 rounded-2xl flex flex-col justify-between min-h-[190px] group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#fef7ea] border border-[#fae2be] flex items-center justify-center text-lg shadow-xs">
                🧩
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#2c1810]">
                  Memory Match
                </h3>
                <p className="text-xs text-[#705645] leading-relaxed font-serif mt-1">
                  Match the pairs.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#eee4d6]">
              <button
                onClick={() => {
                  setCards([
                    { id: 1, val: '🌸', flipped: false, matched: false },
                    { id: 2, val: '☕', flipped: false, matched: false },
                    { id: 3, val: '💌', flipped: false, matched: false },
                    { id: 4, val: '🌸', flipped: false, matched: false },
                    { id: 5, val: '☕', flipped: false, matched: false },
                    { id: 6, val: '💌', flipped: false, matched: false }
                  ]);
                  setSelectedCards([]);
                  setActiveGameModal('MATCH');
                }}
                className="w-full py-1.5 px-3 rounded-full bg-[#fdfbf7] hover:bg-[#f5eee6] border border-[#e8dfd1] text-xs font-semibold text-[#c86d74] flex items-center justify-center gap-1 transition shadow-xs"
              >
                Play →
              </button>
            </div>
          </div>
        </div>

        {/* Side Pinned Kraft Note with Paperclip (2.5 Cols) matching Panel 7 */}
        <div className="md:col-span-3 flex justify-center">
          <div className="relative sticky-note p-6 sm:p-7 w-full max-w-[210px] transform rotate-2 hover:rotate-0 transition duration-300 text-center space-y-2 shadow-paper">
            {/* Metal Paperclip Accent */}
            <div className="paperclip -top-4 left-1/2 -translate-x-1/2" />

            <div className="pt-2 font-handwriting text-xl text-[#3d2417] leading-snug font-bold">
              Good <br />
              Conversations <br />
              Lead to <br />
              Great Connections
            </div>
            <div className="text-2xl text-[#c86d74]">♡</div>
          </div>
        </div>
      </div>

      {/* Game Modal 1: Would You Rather */}
      <Modal
        isOpen={activeGameModal === 'WYR'}
        onClose={() => setActiveGameModal(null)}
        title="Would You Rather ♡"
        maxWidth="max-w-md"
      >
        {!wyrFinished ? (
          <div className="space-y-6 text-center py-2">
            <span className="text-xs text-[#806958] font-serif">
              Question {wyrIndex + 1} of {wyrQuestions.length}
            </span>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  triggerConfetti();
                  if (wyrIndex + 1 < wyrQuestions.length) setWyrIndex(wyrIndex + 1);
                  else setWyrFinished(true);
                }}
                className="p-5 rounded-2xl bg-[#fdfbf7] border-2 border-[#e8dfd1] hover:border-[#e89da2] hover:bg-[#fbeeed] font-serif text-sm font-bold text-[#2c1810] transition duration-200 shadow-xs"
              >
                {wyrQuestions[wyrIndex]?.q1}
              </button>

              <div className="text-xs text-[#806958] font-bold font-serif">— OR —</div>

              <button
                onClick={() => {
                  triggerConfetti();
                  if (wyrIndex + 1 < wyrQuestions.length) setWyrIndex(wyrIndex + 1);
                  else setWyrFinished(true);
                }}
                className="p-5 rounded-2xl bg-[#fdfbf7] border-2 border-[#e8dfd1] hover:border-[#e89da2] hover:bg-[#fbeeed] font-serif text-sm font-bold text-[#2c1810] transition duration-200 shadow-xs"
              >
                {wyrQuestions[wyrIndex]?.q2}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <span className="text-3xl">🌸</span>
            <h4 className="text-lg font-serif font-bold text-[#2c1810]">You finished the choices!</h4>
            <p className="text-xs text-[#806958]">
              Sweet choices make for closer hearts.
            </p>
            <Button size="sm" variant="primary" onClick={() => setActiveGameModal(null)}>
              Done
            </Button>
          </div>
        )}
      </Modal>

      {/* Game Modal 2: Word Connect */}
      <Modal
        isOpen={activeGameModal === 'WORD'}
        onClose={() => setActiveGameModal(null)}
        title="Word Connect 🔤"
        maxWidth="max-w-md"
      >
        <div className="space-y-5 text-center py-2">
          <span className="text-xs text-[#806958] font-serif">
            Unscramble the letters to reveal the memory word:
          </span>

          <div className="text-2xl font-serif font-bold tracking-widest text-[#2c1810] p-4 rounded-2xl bg-[#faf4ec] border border-[#eee4d6]">
            {wordPuzzles[wordIndex]?.scrambled}
          </div>

          <p className="text-xs text-[#806958] italic">
            Hint: {wordPuzzles[wordIndex]?.hint}
          </p>

          <input
            type="text"
            placeholder="Type word in UPPERCASE..."
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value.toUpperCase())}
            className="w-full text-center tracking-widest font-bold py-2.5 px-4 rounded-xl border border-[#e8dfd1] bg-[#fdfbf7] text-sm"
          />

          {wordStatus && (
            <div className={`text-xs font-bold ${wordStatus.includes('Correct') ? 'text-[#4d734e]' : 'text-[#a8323e]'}`}>
              {wordStatus}
            </div>
          )}

          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (wordInput.trim() === wordPuzzles[wordIndex].word) {
                  setWordStatus('✨ Correct! Beautiful job!');
                  triggerConfetti();
                  setTimeout(() => {
                    if (wordIndex + 1 < wordPuzzles.length) {
                      setWordIndex(wordIndex + 1);
                      setWordInput('');
                      setWordStatus('');
                    } else {
                      setWordStatus('🏆 All words unlocked!');
                    }
                  }, 1000);
                } else {
                  setWordStatus('Try again ♡');
                }
              }}
            >
              Verify Word
            </Button>
          </div>
        </div>
      </Modal>

      {/* Game Modal 3: Quiz Time */}
      <Modal
        isOpen={activeGameModal === 'QUIZ'}
        onClose={() => setActiveGameModal(null)}
        title="Quiz Time ❓"
        maxWidth="max-w-md"
      >
        {!quizFinished ? (
          <div className="space-y-5 py-2">
            <span className="text-xs text-[#806958] font-serif block text-center">
              Question {quizIndex + 1} of {quizQuestions.length}
            </span>

            <h4 className="text-sm font-serif font-bold text-[#2c1810] text-center">
              "{quizQuestions[quizIndex]?.question}"
            </h4>

            <div className="space-y-2">
              {quizQuestions[quizIndex]?.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuizAnswered(i);
                    if (i === quizQuestions[quizIndex].correct) {
                      setQuizScore((s) => s + 1);
                      triggerConfetti();
                    }
                    setTimeout(() => {
                      if (quizIndex + 1 < quizQuestions.length) {
                        setQuizIndex((idx) => idx + 1);
                        setQuizAnswered(null);
                      } else {
                        setQuizFinished(true);
                      }
                    }, 800);
                  }}
                  className={`w-full p-3 rounded-xl border text-xs font-semibold text-left transition ${
                    quizAnswered !== null
                      ? i === quizQuestions[quizIndex].correct
                        ? 'bg-[#edf4ed] border-[#cfdec0] text-[#4d734e]'
                        : i === quizAnswered
                        ? 'bg-[#fbeeed] border-[#f4cfd3] text-[#a8323e]'
                        : 'bg-[#fdfbf7] border-[#e8dfd1] text-[#806958]'
                      : 'bg-[#fdfbf7] border-[#e8dfd1] text-[#2c1810] hover:bg-[#faf4ea]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <span className="text-3xl">🏆</span>
            <h4 className="text-lg font-serif font-bold text-[#2c1810]">Quiz Completed!</h4>
            <p className="text-xs text-[#806958]">
              Score: {quizScore} / {quizQuestions.length}
            </p>
            <Button size="sm" variant="primary" onClick={() => setActiveGameModal(null)}>
              Finish
            </Button>
          </div>
        )}
      </Modal>

      {/* Game Modal 4: Memory Match */}
      <Modal
        isOpen={activeGameModal === 'MATCH'}
        onClose={() => setActiveGameModal(null)}
        title="Memory Match 🧩"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 py-2 text-center">
          <p className="text-xs text-[#806958] font-serif">
            Find the matching pairs to clear the board:
          </p>

          <div className="grid grid-cols-3 gap-3 p-4 bg-[#faf6f0] rounded-2xl border border-[#eee4d6]">
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => handleFlipCard(i)}
                className={`h-20 rounded-2xl text-2xl flex items-center justify-center border transition-all duration-300 ${
                  card.flipped || card.matched
                    ? 'bg-[#fdfbf7] border-[#e8dfd1] shadow-xs'
                    : 'bg-[#e8dfd1] border-[#d8cbb8] hover:bg-[#decab0]'
                }`}
              >
                {card.flipped || card.matched ? card.val : '?'}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="ghost"
            icon={RotateCcw}
            onClick={() => {
              setCards([
                { id: 1, val: '🌸', flipped: false, matched: false },
                { id: 2, val: '☕', flipped: false, matched: false },
                { id: 3, val: '💌', flipped: false, matched: false },
                { id: 4, val: '🌸', flipped: false, matched: false },
                { id: 5, val: '☕', flipped: false, matched: false },
                { id: 6, val: '💌', flipped: false, matched: false }
              ]);
              setSelectedCards([]);
            }}
          >
            Reset Game
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default GamesPage;
