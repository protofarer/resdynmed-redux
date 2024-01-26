// clientside
export function initDate() {
  const urlParams = new URLSearchParams(window.location.search);
  const dayParam = urlParams.get("date");
  let date;
  if (dayParam) {
    date = parseDateFromDayString(dayParam);
  } else {
    date = new Date();
  }
  history.replaceState({}, '', `?date=${date.toISOString().slice(0,10)}`);
  return date;
}

export function getServerTime() {
  return new Date()
}

export function parseDateFromDayString(dayString: string) {
    const parts = dayString.split("-");
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1; // Months are zero-based
    const day = parseInt(parts[2], 10);
    return new Date(year, monthIndex, day);
}

export function parseDayStringFromDate(date: Date) {
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const padMonth = month < 10 ? `0${month}` : month;
	const padDay = day < 10 ? `0${day}` : day;
	return `${date.getFullYear()}-${padMonth}-${padDay}`
}

