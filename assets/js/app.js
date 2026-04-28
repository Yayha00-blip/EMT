const searchInput = document.getElementById("searchInput");
const resetBtn = document.getElementById("resetBtn");
const groupsContainer = document.getElementById("groupsContainer");
const emptyState = document.getElementById("emptyState");
const regionNav = document.getElementById("regionNav");

const totalCount = document.getElementById("totalCount");
const regionCount = document.getElementById("regionCount");
const cityCount = document.getElementById("cityCount");

function normalize(value) {
  return (value || "").toLowerCase().trim();
}

function getCityLabel(trainer) {
  if (!trainer.unit || normalize(trainer.unit) === "non précisé" || normalize(trainer.unit) === "non-precisé") {
    return "Unité non précisée";
  }
  return trainer.unit;
}

function groupData(list) {
  const grouped = {};

  list.forEach((trainer) => {
    const region = trainer.region || "Région non précisée";
    const city = getCityLabel(trainer);

    if (!grouped[region]) grouped[region] = {};
    if (!grouped[region][city]) grouped[region][city] = [];

    grouped[region][city].push(trainer);
  });

  return grouped;
}

function updateStats(list) {
  totalCount.textContent = list.length;
  regionCount.textContent = new Set(list.map(t => t.region || "Région non précisée")).size;
  cityCount.textContent = new Set(list.map(t => getCityLabel(t))).size;
}

function buildRegionNav(grouped) {
  regionNav.innerHTML = "";

  Object.keys(grouped).sort().forEach(region => {
    const link = document.createElement("a");
    link.href = `#region-${region.replace(/[^a-zA-Z0-9]+/g, "-")}`;
    link.className = "region-link";
    link.textContent = region;
    regionNav.appendChild(link);
  });
}

function trainerCard(trainer) {
  return `
    <article class="trainer-card">
      <div class="trainer-top">
        <div class="trainer-name">${trainer.name}</div>
        <span class="grade">${trainer.grade}</span>
      </div>
      <p><strong>Unit:</strong> ${trainer.unit}</p>
    </article>
  `;
}

function render(list) {
  groupsContainer.innerHTML = "";

  if (!list.length) {
    groupsContainer.classList.add("hidden");
    emptyState.classList.remove("hidden");
    regionNav.innerHTML = "";
    updateStats([]);
    return;
  }

  groupsContainer.classList.remove("hidden");
  emptyState.classList.add("hidden");

  updateStats(list);

  const grouped = groupData(list);
  buildRegionNav(grouped);

  Object.keys(grouped).sort().forEach(region => {
    const cities = grouped[region];
    const cityNames = Object.keys(cities).sort();
    const regionTotal = cityNames.reduce((sum, city) => sum + cities[city].length, 0);

    const regionSection = document.createElement("section");
    regionSection.className = "region-block";
    regionSection.id = `region-${region.replace(/[^a-zA-Z0-9]+/g, "-")}`;

    regionSection.innerHTML = `
      <div class="region-title-row">
        <div>
          <h2>${region}</h2>
          <p class="region-meta">${regionTotal} trainer(s), ${cityNames.length} grouped unit(s)</p>
        </div>
        <span class="region-pill">Operational Group</span>
      </div>
      <div class="cities-grid">
        ${cityNames.map(city => `
          <div class="city-block">
            <div class="city-top">
              <h3>${city}</h3>
              <span class="city-count">${cities[city].length} member(s)</span>
            </div>
            <div class="trainer-list">
              ${cities[city].map(trainerCard).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    `;

    groupsContainer.appendChild(regionSection);
  });
}

function filterAndRender() {
  const q = normalize(searchInput.value);

  const filtered = trainers.filter(trainer => {
    const text = [
      trainer.name,
      trainer.grade,
      trainer.unit,
      trainer.region
    ].join(" ").toLowerCase();

    return text.includes(q);
  });

  render(filtered);
}

searchInput.addEventListener("input", filterAndRender);

resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  render(trainers);
});

render(trainers);