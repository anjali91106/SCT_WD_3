import { useEffect, useState } from "react";

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const multipleType =
    "https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple";

  // Fetch or load from localStorage
  useEffect(() => {
    const savedQuestions = localStorage.getItem("quizQuestions");

    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          setLoading(false);
          return; // stop here, no fetch needed
        }
      } catch (err) {
        console.warn("Saved questions are invalid, refetching...");
      }
    }

    // If no saved or invalid, fetch from API
    const fetchData = async () => {
      try {
        const res = await fetch(multipleType);
        if (res.status === 429) {
          throw new Error("Too many requests — try again later");
        }
        const data = await res.json();
        setQuestions(data.results);
        localStorage.setItem("quizQuestions", JSON.stringify(data.results));
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAnswer = (answer) => {
    const correctAnswer = questions[currentIndex].correct_answer;
    if (answer === correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    localStorage.removeItem("quizQuestions");
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setShowResults(false);
    setLoading(true);
    // Re-fetch
    const fetchData = async () => {
      const res = await fetch(multipleType);
      const data = await res.json();
      setQuestions(data.results);
      localStorage.setItem("quizQuestions", JSON.stringify(data.results));
      setLoading(false);
    };
    fetchData();
  };

  if (loading) return <p className="text-center text-lg mt-10">Loading...</p>;

  // If no questions (e.g., API 429 or fetch error)
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold mb-4 text-red-500">
          😢 No questions available
        </h2>
        <p className="mb-6">
          The quiz server might be busy (429 error). Please try again in a
          minute.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-3xl font-bold mb-4">Quiz Completed! 🎉</h2>
        <p className="text-xl mb-6">
          You scored <span className="font-bold">{score}</span> out of{" "}
          {questions.length}
        </p>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answers = [
    ...currentQuestion.incorrect_answers,
    currentQuestion.correct_answer,
  ].sort(() => Math.random() - 0.5);

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      {/* Progress Bar */}
      <div className="w-full bg-gray-300 rounded-full h-4 mb-6">
        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question */}
      <h2 className="text-xl font-bold mb-4">{currentQuestion.question}</h2>

      {/* Answers */}
      <div className="grid gap-3">
        {answers.map((ans, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(ans)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            {ans}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Questions;
