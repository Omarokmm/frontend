import { useState } from "react";
import * as _global from "../config/global";
const WorkoutFrom = () => {
  const baseUrl = _global.BASE_URL;
  const [title, setTitle] = useState("");
  const [reps, setReps] = useState("");
  const [load, setLoad] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const onAddWorkout = async (e) => {
    e.preventDefault();
    const workout = {
      title,
      reps,
      load,
    };
    const response = await fetch(baseUrl + "workouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workout),
    });
    const json = await response.json();
    if (response.ok) {
      setTitle("");
      setReps("");
      setLoad("");
      setError(null);
      setEmptyFields([]);
    }
    if (!response.ok) {
      console.log(json);
      setEmptyFields(json.emptyFields);
      setError(json.error);
    }
  };
  return (
    <div className="workout-from">
      <h3> Add a New Workout </h3>{" "}
      <form onSubmit={onAddWorkout}>
        <div className="form-control">
          <label htmlFor="title"> Exercise Name </label>{" "}
          <input
            type="text"
            id="title"
            name="title"
            className={emptyFields.includes("title") ? "error" : ""}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            value={title}
            placeholder="Enter Workout Name"
          />
        </div>{" "}
        <div className="form-control">
          <label htmlFor="load"> load(kg) </label>{" "}
          <input
            type="number"
            id="load"
            name="load"
            className={emptyFields.includes("load") ? "error" : ""}
            onChange={(e) => {
              setLoad(e.target.value);
            }}
            value={load}
            placeholder="Enter Workout Load"
          />
        </div>{" "}
        <div className="form-control">
          <label htmlFor="reps"> Reps </label>{" "}
          <input
            type="number"
            id="reps"
            name="reps"
            className={emptyFields.includes("reps") ? "error" : ""}
            onChange={(e) => {
              setReps(e.target.value);
            }}
            value={reps}
            placeholder="Enter Workout Reps"
          />
        </div>{" "}
        <div>
          <button className="btn"> Add Workout </button>{" "}
        </div>{" "}
        {error && (
          <div className="error">
            <span> {error} </span>{" "}
          </div>
        )}{" "}
      </form>{" "}
    </div>
  );
};

export default WorkoutFrom;
