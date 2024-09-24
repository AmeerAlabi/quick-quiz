import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4 text-center">
      <div
      
        className="max-w-2xl"
      >
        <h1 className="text-5xl font-bold text-teal-400 mb-4">Welcome to Quick-Quiz </h1>
        <p className="text-xl text-gray-300 mb-8">
          Challenge yourself with our diverse range of quizzes. Test your knowledge, learn new facts, and have fun!
        </p>
        <Link href="/setup" passHref>
          <button className="bg-teal-500 hover:bg-teal-600 text-gray-900 text-lg px-8 py-3 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
            Start Your Quiz Adventure
          </button>
        </Link>
      </div>
    </div>
  )
}