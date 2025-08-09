import { Fragment } from "react";
import "./App.css";
import Questions from "./components/Questions";

function App() {
  return (
    <Fragment>
      <h1 className="flex justify-center space-x-1 text-5xl font-extrabold text-purple-600">
        {"QuizGame".split("").map((letter, i) => (
          <span
            key={i}
            className="animate-bounceLetter text-center m-2"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {letter}
          </span>
        ))}
      </h1>

      <Questions />
    </Fragment>
  );
}

export default App;
