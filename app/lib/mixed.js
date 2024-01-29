
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
