export const minutesToString = (minutes?: number | null) => {
  if (!minutes) {
    return "onbeperkt";
  }
  if (minutes === 1) {
    return `${minutes} minuut`;
  }
  if (minutes < 60) {
    return `${minutes} minuten`;
  }
  const hours = minutes / 60;
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
