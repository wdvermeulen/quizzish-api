export const minutesToString = (minutes?: number | null): string => {
  if (!minutes) {
    return "onbeperkt";
  }
  if (minutes === 1) {
    return `${minutes} minuut`;
  }
  if (minutes < 60) {
    return `${minutes} minuten`;
  }
  if (minutes === 90) {
    return "Anderhalf uur";
  }
  const hours = Math.floor(minutes / 60);
  const minutesLeft = minutes % 60;
  if (minutesLeft > 0) {
    return `${hours} uur en ${minutesToString(minutesLeft)}`;
  }
  return `${hours} uur`;
};

export const secondsToString = (seconds?: number | null) => {
  if (!seconds) {
    return "onbeperkt";
  }
  if (seconds < 60) {
    return `${seconds} seconden`;
  }
  return minutesToString(seconds / 60);
};
