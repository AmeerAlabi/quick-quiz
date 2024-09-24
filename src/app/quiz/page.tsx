"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";

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
  retries = 5,
  backoff = 2000
) {
  const apiUrl = `https://opentdb.com/api.php?amount=${count}&category=${category}&difficulty=${difficulty}&type=multiple`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.warn(`Rate limit hit. Retrying in ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return fetchTriviaQuestions(category, difficulty, count, retries - 1, Math.min(backoff * 2, 30000));
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

function QuizComponent() {
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category && difficulty && count) {
      fetchTriviaQuestions(category, difficulty, count)
        .then(setQuestions)
        .catch((error) => {
          console.error("Failed to fetch questions:", error);
          setError("Failed to load questions. Please try again later.");
        });
    }
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

    if (selectedAnswer === questions[currentQuestion]?.correctAnswer) {
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

  const handleShowAnswers = () => setShowCorrectAnswers(true);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

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
        {!quizEnded ? (
          <div className="text-white">
            <h1 className="text-2xl mb-4">{questions[currentQuestion].question}</h1>
            <div className="mb-4">
              {questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  className={`block mb-2 p-2 w-full text-left rounded ${
                    selectedAnswer === option
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <p>Time left: {timeLeft} seconds</p>
            <button
              className="mt-4 p-2 bg-teal-500 text-white rounded"
              onClick={handleAnswer}
              disabled={!selectedAnswer}
            >
              Next
            </button>
          </div>
        ) : (
          <div className="text-white">
            <h1 className="text-2xl mb-4">Quiz Ended!</h1>
            <p>Your score: {score} / {questions.length}</p>
            <button
              className="mt-4 p-2 bg-teal-500 text-white rounded"
              onClick={handleShowAnswers}
            >
              Show Correct Answers
            </button>
            {showCorrectAnswers && (
              <ul className="mt-4">
                {questions.map((q, idx) => (
                  <li key={idx} className="mb-2">
                    <strong>{q.question}</strong>: {q.correctAnswer}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Loading quiz...</div>}>
      <QuizComponent />
    </Suspense>
  );
}
