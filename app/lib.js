export async function fetchSessionsForYearAndAdjacent(year) {
  const sessions1 = await fetch(`/sessions/${year - 1}.json`).then((response) => response.json());
  const sessions2 = await fetch(`/sessions/${year}.json`).then((response) => response.json());
  const sessions3 = await fetch(`/sessions/${year + 1}.json`).then((response) => response.json());
  return [...sessions1, ...sessions2, ...sessions3];
}

export async function fetchSessionsForYear(year) {
  return await fetch(`/sessions/${year}.json`).then((response) => response.json());
}

// const MOON_COLORS = [
//   'violet',
//   'indigo',
//   'blue',
//   'teal',
//   'green',
//   'yellowgreen',
//   'yellow',
//   'orange',
//   'orangered',
//   'red',
// ];

export function setupMoonText() {
  const moonText = document.querySelector(".moon-text");
	let frame = 0;
	let content = 0;
	return () => {
		if (frame >= 9 && frame < 19) {
			content++;
			moonText.textContent = `${content}`;
      // moonText.style.color = MOON_COLORS[(content % MOON_COLORS.length) - 1];
		}
		if (frame === 19) {
			moonText.textContent = "";
			frame = 0;
			content = 0;
		}
		frame++
	}
}

export function makeMiniMoon(parentElement) {
  const container = document.createElement('div');
  container.classList.add("container-mini-moon");

  const moon = document.createElement("a");
  moon.classList.add("mini-moon");

  const moonDisc = document.createElement("div");
  moonDisc.classList.add("mini-moon-disc");
  moon.appendChild(moonDisc);

  const diffusor = document.createElement("div");
  diffusor.classList.add("mini-moon-diffusor");

  container.appendChild(moon);
  container.appendChild(diffusor);
  parentElement.appendChild(container);
  return { container, moon };
}

export function miniMoonWithLink(parentElement, sessionObject) {
  let { container, moon } = makeMiniMoon(parentElement);

  const fullDatestring = `${Object.keys(sessionObject)[0]}`; // Replace with your content
  moon.href = `session.html?date=${fullDatestring.slice(0,10)}`;

  const label = document.createElement("span");
  label.classList.add("mini-moon-text");
  const n = Object.values(sessionObject)[0];
  label.textContent = `${n}`;
  container.appendChild(label);

  return container;
}

export function findFirstCycleStartIndexFromDate(date, sessions) {
// find first cycle start index on or after given date
  let startIdx = -1;
  const day = date.getDate();
  const padDay = day < 10 ? `0${day}` : day;
  const month = date.getMonth() + 1;
  const padMonth = month < 10 ? `0${month}` : month;
  const matchString =  `${date.getFullYear()}-${padMonth}-${padDay}`;
  startIdx = sessions.findIndex(x => Object.keys(x)[0].slice(0, 10) >= matchString) ;
  return startIdx;
}

// ? NB added sessions to args upon migrate, was this fn ever used?
export function findPrevCycleStartIndexFromDate(date, sessions) {
// find first cycle start index before given date
  let startIdx = -1;
  const day = date.getDate();
  const padDay = day < 10 ? `0${day}` : day;
  const month = date.getMonth() + 1;
  const padMonth = month < 10 ? `0${month}` : month;
  const matchString =  `${date.getFullYear()}-${padMonth}-${padDay}`;
  startIdx = sessions.findIndex(x => Object.keys(x)[0].slice(0, 10) >= matchString) ;
  return startIdx;
}