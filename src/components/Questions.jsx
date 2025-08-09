import { useEffect, useState } from "react";

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const multipleType =
    "https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple";

  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    const savedQuestions = localStorage.getItem("quizQuestions");

    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem("quizQuestions");
        }
      } catch {
        localStorage.removeItem("quizQuestions");
      }
    }

    const fetchData = async () => {
      try {
        const res = await fetch(multipleType);
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          setQuestions(data.results);
          localStorage.setItem("quizQuestions", JSON.stringify(data.results));
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAnswerClick = (option) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);

    if (option === questions[currentQIndex].correct_answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowScore(true);
    }
  };

  const handleRestart = () => {
    setShowScore(false);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    localStorage.removeItem("quizQuestions");
    window.location.reload();
  };

  if (loading) {
    return <p className="text-center text-lg font-medium">Loading questions...</p>;
  }

  if (showScore) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-fadeIn">
          <h2 className="text-3xl font-bold mb-4 text-purple-700">Quiz Completed 🎉</h2>
          <p className="text-lg mb-6">
            Your Score: <span className="font-semibold text-purple-600">{score}</span> / {questions.length}
          </p>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];
  const correctAnswer = currentQuestion.correct_answer;
  const answers = [...currentQuestion.incorrect_answers, correctAnswer].sort(
    () => Math.random() - 0.5
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-2xl animate-fadeIn">
        <h3 className="text-xl font-semibold text-purple-700 mb-4">
          {decodeHtml(currentQuestion.question)}
        </h3>

        <ul className="space-y-3">
          {answers.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === correctAnswer;

            let optionClasses =
              "p-3 rounded-lg cursor-pointer transition-all duration-300 transform ";

            if (selectedAnswer) {
              if (isSelected && isCorrect) {
                optionClasses += "bg-green-500 text-white scale-105 shadow-lg";
              } else if (isSelected && !isCorrect) {
                optionClasses += "bg-red-500 text-white animate-shake";
              } else if (isCorrect) {
                optionClasses += "bg-green-300 text-black";
              } else {
                optionClasses += "bg-gray-200 text-gray-700";
              }
            } else {
              optionClasses +=
                "bg-gray-200 hover:bg-purple-500 hover:text-white hover:scale-105";
            }

            return (
              <li
                key={idx}
                className={optionClasses}
                onClick={() => handleAnswerClick(option)}
              >
                {decodeHtml(option)}
              </li>
            );
          })}
        </ul>

        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-600">
            Question {currentQIndex + 1} / {questions.length}
          </p>
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`px-6 py-2 rounded-lg shadow-lg transition-all duration-300 ${
              selectedAnswer
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {currentQIndex + 1 === questions.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questions;
