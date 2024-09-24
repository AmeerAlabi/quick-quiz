"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const QuizSetup: React.FC = () => {
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const router = useRouter();

  const handleStartQuiz = () => {
    if (category && difficulty) {
      router.push(`/quiz?category=${category}&difficulty=${difficulty}&count=${questionCount}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 border border-gray-700 p-6 rounded-lg"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-teal-400">Quiz Setup</h2>
          <p className="text-gray-400">Customize your quiz experience</p>
        </div>

        <div className="space-y-6 mt-6">
          <div>
            <label htmlFor="category" className="block text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-700 text-gray-200 border border-gray-600 px-5 py-3 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="9">General Knowledge</option>
              <option value="17">Science & Nature</option>
              <option value="23">History</option>
              <option value="22">Geography</option>
              <option value="11">Entertainment: Film</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-gray-700 text-gray-200 border border-gray-600 px-5 py-3 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="" disabled>
                Select difficulty
              </option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label htmlFor="questionCount" className="block text-gray-300 mb-2">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range"
              id="questionCount"
              min={5}
              max={50}
              step={5}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <button
          onClick={handleStartQuiz}
          className={`w-full mt-6 py-3 bg-teal-500 text-gray-900 rounded-lg transition-colors duration-200 hover:bg-teal-600 ${
            (!category || !difficulty) && "opacity-50 cursor-not-allowed"
          }`}
          disabled={!category || !difficulty}
        >
          Start Quiz
        </button>
      </motion.div>
    </div>
  );
};

export default QuizSetup;
