let cv = {};

fetch("cv.json")
  .then(res => res.json())
  .then(data => {
    cv = data;
  });

self.onmessage = function (e) {
  const input = e.data.toLowerCase();
  let reply = "Hmm, can you ask me about skills, projects, or college?";

  if (!cv.name) {
    reply = "Loading my CV... please ask again in a moment.";
  } else if (input.includes("name")) {
    reply = `I'm ${cv.name}, a creative developer and designer.`;
  } else if (input.includes("college") || input.includes("education")) {
    reply = `I studied at ${cv.college}.`;
  } else if (input.includes("skills")) {
    reply = `My skills are: ${cv.skills.join(", ")}.`;
  } else if (input.includes("projects")) {
    reply = `Some of my projects: ${cv.projects.join(" • ")}.`;
  }

  self.postMessage(reply);
};
