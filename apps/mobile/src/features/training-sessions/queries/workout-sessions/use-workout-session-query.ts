import { useQuery } from "@tanstack/react-query";
import { workoutSessionQueryKeys } from "./workout-session-query-keys";

// export function useWorkoutSessionQuery() {
//    return useQuery({
//       queryKey: workoutSessionQueryKeys.list(),
//       queryFn: () => getWorkoutSessions(),
//    });
// }