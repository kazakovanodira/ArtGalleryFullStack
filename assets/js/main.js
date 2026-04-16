(function initSite() {
  setYear();
  setActiveNav();
  setupArtworkPage();
  setupArtistsPage();
  setupApplicationForm();
})();

function setYear() {
  const yearTargets = document.querySelectorAll("#year");
  const year = new Date().getFullYear();
  yearTargets.forEach((target) => {
    target.textContent = String(year);
  });
}

function setActiveNav() {
  const path = window.location.pathname.toLowerCase();
  const navMap = {
    "index.html": "home",
    "": "home",
    "artwork.html": "artwork",
    "artists.html": "artists",
    "application.html": "application",
    "contact.html": "contact"
  };

  let activeKey = "home";
  Object.keys(navMap).forEach((route) => {
    if (path.endsWith(route)) {
      activeKey = navMap[route];
    }
  });

  const activeLink = document.querySelector(`[data-nav="${activeKey}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

function setupArtworkPage() {
  const grid = document.getElementById("artworkGrid");
  if (!grid || !window.galleryData) {
    return;
  }

  const filterSelect = document.getElementById("artFilter");
  const toggleButton = document.getElementById("artworkToggle");
  let expanded = false;
  const limit = 9;

  function drawArtwork() {
    const filterValue = filterSelect?.value || "all";
    const filtered = window.galleryData.artwork.filter((item) => {
      return filterValue === "all" || item.medium === filterValue;
    });
    const visible = expanded ? filtered : filtered.slice(0, limit);

    grid.innerHTML = visible
      .map((item) => {
        return `
          <article class="card">
            <div class="card-frame">
              <img src="${item.image}" alt="${item.title} by ${item.artist}" loading="lazy" />
            </div>
            <h3>${item.title} By ${item.artist}</h3>
          </article>
        `;
      })
      .join("");

    if (toggleButton) {
      const shouldShow = filtered.length > limit;
      toggleButton.style.display = shouldShow ? "inline-block" : "none";
      toggleButton.textContent = expanded ? "View Less" : "View More";
    }
  }

  filterSelect?.addEventListener("change", () => {
    expanded = false;
    drawArtwork();
  });

  toggleButton?.addEventListener("click", () => {
    expanded = !expanded;
    drawArtwork();
  });

  drawArtwork();
}

function setupArtistsPage() {
  const grid = document.getElementById("artistsGrid");
  if (!grid || !window.galleryData) {
    return;
  }

  const filterSelect = document.getElementById("artistFilter");
  const featuredButton = document.getElementById("featuredArtistsBtn");
  const toggleButton = document.getElementById("artistsToggle");
  let featuredOnly = false;
  let expanded = false;
  const limit = 9;

  function drawArtists() {
    const styleFilter = filterSelect?.value || "all";

    const filtered = window.galleryData.artists.filter((artist) => {
      const styleMatch = styleFilter === "all" || artist.style === styleFilter;
      const featuredMatch = !featuredOnly || artist.featured;
      return styleMatch && featuredMatch;
    });

    const visible = expanded ? filtered : filtered.slice(0, limit);

    grid.innerHTML = visible
      .map((artist) => {
        return `
          <article class="card">
            <div class="card-frame">
              <img src="${artist.image}" alt="Portrait of ${artist.name}" loading="lazy" />
            </div>
            <h3>${artist.name}</h3>
          </article>
        `;
      })
      .join("");

    if (featuredButton) {
      featuredButton.textContent = featuredOnly ? "All Artists" : "Featured Artists";
    }

    if (toggleButton) {
      const shouldShow = filtered.length > limit;
      toggleButton.style.display = shouldShow ? "inline-block" : "none";
      toggleButton.textContent = expanded ? "View Less" : "View More";
    }
  }

  filterSelect?.addEventListener("change", () => {
    expanded = false;
    drawArtists();
  });

  featuredButton?.addEventListener("click", () => {
    featuredOnly = !featuredOnly;
    expanded = false;
    drawArtists();
  });

  toggleButton?.addEventListener("click", () => {
    expanded = !expanded;
    drawArtists();
  });

  drawArtists();
}

function setupApplicationForm() {
  const form = document.getElementById("artistApplication");
  const feedback = document.getElementById("formFeedback");
  if (!form || !feedback) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const files = formData.getAll("portfolio");
    const checkedArtTypes = formData.getAll("artType");

    if (!firstName || !lastName || !email) {
      feedback.textContent = "Please complete first name, last name, and email before submitting.";
      feedback.style.color = "#a23f1d";
      return;
    }

    if (checkedArtTypes.length === 0) {
      feedback.textContent = "Please select at least one art category.";
      feedback.style.color = "#a23f1d";
      return;
    }

    const uploadList = files.filter((file) => file instanceof File && file.size > 0);
    if (uploadList.length > 3) {
      feedback.textContent = "Please upload a maximum of 3 portfolio images.";
      feedback.style.color = "#a23f1d";
      return;
    }

    feedback.textContent = `Thanks ${firstName}! Your artist application has been received.`;
    feedback.style.color = "#225f2a";
    form.reset();
  });
}