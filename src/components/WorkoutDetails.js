import * as _global from "../config/global";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

const WorkoutDetails = ({ workout }) => {
  const Base_Url = "https://www.instagram.com/";
  const deleteWorkout = () => {
    const response = fetch(_global.BASE_URL + "workouts/" + workout._id, {
      method: "DELETE",
    });
    if (response.ok) {
      console.log(response.json());
    }
  };
  return (
    <div className="workout-details">
      <div>
        <h3> {workout.full_name} </h3>{" "}
        <p>
          {" "}
          {/* <strong> User_Name: </strong>{" "} */}{" "}
          <a
            href={`https://www.instagram.com/${workout.Username}`}
            target="_blank"
            rel="noreferrer"
          >
            {" "}
            Dentist{" "}
          </a>{" "}
        </p>{" "}
        <span
          className="btn-trash"
          onClick={() => window.open(`${Base_Url}${workout.Username}`)}
        >
          {" "}
          {workout.Username.slice(0, 2) === "dr" && <span> Profile </span>}{" "}
        </span>{" "}
      </div>{" "}
    </div>
  );
};

export default WorkoutDetails;
