function createFallbackImage(label) {
  const themes = [
    ["#e6e0d7", "#3b332d"],
    ["#cab089", "#2f2720"],
    ["#bdb8aa", "#2f2a24"],
    ["#8eb0b5", "#1a2123"],
    ["#7ca2b0", "#171f24"],
    ["#686868", "#f5f5f5"],
    ["#826f62", "#faf7f1"],
    ["#4d5660", "#f6f3ed"]
  ];
  let hash = 0;
  for (const character of label) {
    hash = (hash + character.charCodeAt(0)) % themes.length;
  }

  const [background, foreground] = themes[hash];
  const escapedLabel = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 560" role="img" aria-label="${escapedLabel}">
      <rect width="420" height="560" fill="${background}" />
      <rect x="28" y="28" width="364" height="504" rx="16" fill="none" stroke="${foreground}" stroke-opacity="0.22" stroke-width="3" />
      <text x="50%" y="46%" text-anchor="middle" fill="${foreground}" font-family="Georgia, serif" font-size="30" font-weight="700">${escapedLabel}</text>
      <text x="50%" y="57%" text-anchor="middle" fill="${foreground}" font-family="Arial, sans-serif" font-size="15" letter-spacing="2">Image unavailable</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function formatPrice(value) {
  if (typeof value !== "number") {
    return "Price upon request";
  }

  return usdFormatter.format(value);
}

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
      .map((item, index) => {
        const fallbackImage = createFallbackImage(`${item.title} by ${item.artist}`);
        const formattedPrice = formatPrice(item.price);
        return `
          <article class="card" data-artwork-index="${filtered.indexOf(item)}" role="button" tabindex="0" style="cursor: pointer;">
            <div class="card-frame">
              <img src="${item.image}" alt="${item.title} by ${item.artist}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage}'" />
            </div>
            <h3>${item.title} By ${item.artist} - ${formattedPrice}</h3>
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

  function attachArtworkCardListeners() {
    const cards = grid.querySelectorAll("[data-artwork-index]");
    cards.forEach((card) => {
      const clickHandler = () => {
        const index = parseInt(card.getAttribute("data-artwork-index"), 10);
        const artwork = window.galleryData.artwork[index];
        if (artwork) {
          showArtworkModal(artwork);
        }
      };
      card.addEventListener("click", clickHandler);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          clickHandler();
        }
      });
    });
  }

  filterSelect?.addEventListener("change", () => {
    expanded = false;
    drawArtwork();
    attachArtworkCardListeners();
  });

  toggleButton?.addEventListener("click", () => {
    expanded = !expanded;
    drawArtwork();
    attachArtworkCardListeners();
  });

  drawArtwork();
  attachArtworkCardListeners();
  attachArtworkCardListeners();
}

function showArtworkModal(artwork) {
  const modal = document.getElementById("artworkModal");
  if (!modal) return;

  document.getElementById("modalTitle").textContent = artwork.title;
  document.getElementById("modalArtist").textContent = `by ${artwork.artist}`;
  document.getElementById("modalYear").textContent = artwork.year || "Unknown";
  document.getElementById("modalMedium").textContent = artwork.detailedMedium || artwork.medium || "Unknown";
  document.getElementById("modalPrice").textContent = formatPrice(artwork.price);

  const statusElement = document.getElementById("modalStatus");
  if (artwork.sold) {
    statusElement.textContent = "Sold";
    statusElement.className = "detail-value sold";
  } else {
    statusElement.textContent = "Available";
    statusElement.className = "detail-value available";
  }

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

function hideArtworkModal() {
  const modal = document.getElementById("artworkModal");
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}

function setupArtworkModal() {
  const modal = document.getElementById("artworkModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");

  if (!modal || !modalOverlay || !modalClose) return;

  modalOverlay.addEventListener("click", hideArtworkModal);
  modalClose.addEventListener("click", hideArtworkModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      hideArtworkModal();
    }
  });
}

setupArtworkModal();

(function initSite() {
  setYear();
  setActiveNav();
  setupArtworkPage();
  setupArtistsPage();
  setupApplicationForm();
})();

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
        const fallbackImage = createFallbackImage(artist.name);
        return `
          <article class="card">
            <div class="card-frame">
              <img src="${artist.image}" alt="Portrait of ${artist.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage}'" />
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