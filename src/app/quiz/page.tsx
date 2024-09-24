"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

async function fetchTriviaQuestions(
  category: string,
  difficulty: string,
  count: number,
  retries = 3,
  backoff = 1000
) {
  const apiUrl = `https://opentdb.com/api.php?amount=${count}&category=${category}&difficulty=${difficulty}&type=multiple`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.warn(`Rate limit hit. Retrying in ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return fetchTriviaQuestions(category, difficulty, count, retries - 1, backoff * 2);
      }
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data.results.map((q: any, index: number) => ({
      id: index,
      question: q.question,
      options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
      correctAnswer: q.correct_answer,
    }));
  } catch (error) {
    console.error("Error fetching trivia questions:", error);
    throw error;
  }
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "9";
  const difficulty = searchParams.get("difficulty") || "easy";
  const count = parseInt(searchParams.get("count") || "10");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [quizEnded, setQuizEnded] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(10); 
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]); 

  useEffect(() => {
    fetchTriviaQuestions(category, difficulty, count).then(setQuestions);
  }, [category, difficulty, count]);

  useEffect(() => {
    if (timeLeft > 0 && !quizEnded) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0) {
      handleAnswer(); 
    }
  }, [timeLeft, quizEnded]);

  const handleAnswer = () => {
    setUserAnswers([...userAnswers, selectedAnswer]);

    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setTimeLeft(30);
    } else {
      setQuizEnded(true);
    }
  };

  const handleShowAnswers = () => {
    setShowCorrectAnswers(true);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-teal-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-md shadow-md">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-teal-400">
              {quizEnded ? "Quiz Completed!" : `Question ${currentQuestion + 1} of ${questions.length}`}
            </h1>
            {!quizEnded && <p className="text-gray-400">Time left: {timeLeft} seconds</p>}
          </div>

          <div>
            {!quizEnded ? (
              <>
                <p className="text-lg mb-4 text-gray-300">{questions[currentQuestion].question}</p>
                <div className="space-y-2">
                  {questions[currentQuestion].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`option-${index}`}
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={() => setSelectedAnswer(option)}
                        className="form-radio text-teal-400"
                      />
                      <label htmlFor={`option-${index}`} className="text-gray-300">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            ) : !showCorrectAnswers ? (
              <>
                <p className="text-xl text-center text-teal-400">
                  Your score: {score} out of {questions.length}
                </p>
                <button
                  onClick={handleShowAnswers}
                  className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-gray-900 rounded-md transition mt-4"
                >
                  Show Correct Answers
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl text-teal-400 mb-4">Correct Answers:</h2>
                {questions.map((question, index) => (
                  <div key={index} className="mb-4">
                    <p className="text-gray-300">
                      <strong>Q{index + 1}:</strong> {question.question}
                    </p>
                    <p className="text-teal-400">
                      Correct Answer: {question.correctAnswer}
                    </p>
                    <p className={`text-gray-300 ${userAnswers[index] === question.correctAnswer ? "text-green-400" : "text-red-400"}`}>
                      Your Answer: {userAnswers[index] || "No answer"}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="mt-6">
            {!quizEnded ? (
              <button
                onClick={handleAnswer}
                className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-gray-900 rounded-md transition"
                disabled={!selectedAnswer}
              >
                {currentQuestion + 1 === questions.length ? "Finish Quiz" : "Next Question"}
              </button>
            ) : showCorrectAnswers && (
              <button
                onClick={() => window.location.href = "/"}
                className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-gray-900 rounded-md transition"
              >
                Go to Quiz Setup
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
