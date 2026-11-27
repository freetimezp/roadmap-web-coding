import { roadmapData } from "./data.js";

const state = {
    category: "All",
    status: "All",
    search: "",
    sort: "asc",
    page: 1,
    perPage: 6,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const grid = $("#lessonGrid");
const emptyState = $("#emptyState");
const pagination = $("#pagination");
const searchInput = $("#searchInput");
const sortSelect = $("#sortSelect");
const filterPanel = $("#filterPanel");
const filterToggle = $("#filterToggle");

import { videoTutorials } from "./tutorials.js";

const publishedLessons = roadmapData.filter(
    (lesson) => lesson.status === "published",
);
const categories = [
    "All",
    ...new Set(roadmapData.map((lesson) => lesson.category)),
];
const statuses = ["All", "published", "in-progress", "planned"];

const pad = (value) => String(value).padStart(2, "0");
const escapeHTML = (value) =>
    String(value ?? "").replace(
        /[&<>"']/g,
        (char) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[char],
    );

/* =========================================
   LATEST PROJECT SPOTLIGHT
========================================= */

function renderLatestProject() {
    const spotlight = $("#latestProject");

    if (!spotlight) return;

    // Find the newest published lesson independently
    // of the current catalog sorting and pagination.
    const latestProject = roadmapData
        .filter((lesson) => lesson.status === "published")
        .sort((a, b) => Number(b.id) - Number(a.id))[0];

    if (!latestProject) {
        spotlight.hidden = true;
        return;
    }

    const image = $("#latestProjectImage");
    const number = $("#latestProjectNumber");
    const category = $("#latestProjectCategory");
    const title = $("#latestProjectTitle");
    const description = $("#latestProjectDescription");
    const link = $("#latestProjectLink");

    if (image) {
        if (latestProject.preview) {
            image.src = latestProject.preview;
            image.alt = `${latestProject.title} preview`;
            image.hidden = false;
        } else {
            image.removeAttribute("src");
            image.alt = "";
            image.hidden = true;
        }
    }

    if (number) {
        number.textContent = latestProject.number;
    }

    if (category) {
        category.textContent = `${latestProject.category} / ${latestProject.topic || "LESSON"}`;
    }

    if (title) {
        title.textContent = latestProject.title;
    }

    if (description) {
        description.textContent = latestProject.description;
    }

    if (link) {
        link.href =
            latestProject.learningDemo || latestProject.learningUrl || "#";

        link.hidden = !latestProject.learningDemo && !latestProject.learningUrl;
    }

    spotlight.hidden = false;
}

// Run once when the application starts.
renderLatestProject();

/* =========================================
   LEARNING HUB — TABS
========================================= */

const hubTabs = $$(".hub-tab");
const hubPanels = $$(".hub-panel");

function activateHubTab(tab, moveFocus = false) {
    if (!tab) return;

    const target = tab.dataset.tab;

    hubTabs.forEach((item) => {
        const isActive = item === tab;

        item.classList.toggle("active", isActive);
        item.setAttribute("aria-selected", String(isActive));
        item.tabIndex = isActive ? 0 : -1;
    });

    hubPanels.forEach((panel) => {
        const isActive = panel.dataset.panel === target;

        panel.hidden = !isActive;
    });

    if (moveFocus) tab.focus();
}

hubTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
        activateHubTab(tab);
    });

    tab.addEventListener("keydown", (event) => {
        let nextIndex = index;

        if (event.key === "ArrowRight") {
            nextIndex = (index + 1) % hubTabs.length;
        } else if (event.key === "ArrowLeft") {
            nextIndex = (index - 1 + hubTabs.length) % hubTabs.length;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = hubTabs.length - 1;
        } else {
            return;
        }

        event.preventDefault();
        activateHubTab(hubTabs[nextIndex], true);
    });
});

/* =========================================
   VIDEO LIBRARY
========================================= */

const videoGrid = $("#videoGrid");
const videoSearch = $("#videoSearch");
const videoFilters = $("#videoFilters");
const videoEmptyState = $("#videoEmptyState");
const videoCounter = $(".videos-counter strong");

const videoState = {
    search: "",
    category: "All",
};

function getFilteredVideos() {
    return videoTutorials.filter((video) => {
        const matchesCategory =
            videoState.category === "All" ||
            video.category === videoState.category;

        const searchableText = [
            video.title,
            video.description,
            video.category,
            video.level,
            ...(video.tags || []),
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchableText.includes(
            videoState.search.toLowerCase(),
        );

        return matchesCategory && matchesSearch;
    });
}

function createVideoCard(video) {
    const videoId = String(video.youtubeId || "").trim();

    const validVideoId = /^[a-zA-Z0-9_-]{11}$/.test(videoId);

    const thumbnail = validVideoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : "";

    const videoUrl = validVideoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : "";

    const title = escapeHTML(video.title || "Untitled tutorial");
    const description = escapeHTML(video.description || "");
    const category = escapeHTML(video.category || "GENERAL");
    const level = escapeHTML(video.level || "All levels");
    const duration = escapeHTML(video.duration || "VIDEO");

    const thumbnailContent = validVideoId
        ? `
            <img
                src="${thumbnail}"
                alt="${title}"
                loading="lazy"
            />
            <span class="video-card-play" aria-hidden="true">▶</span>
            <span class="video-card-duration">${duration}</span>
        `
        : `
            <div class="video-placeholder">
                <span>CODEPATH</span>
                <strong>${category}</strong>
                <small>VIDEO COMING SOON</small>
            </div>
        `;

    return `
        <article class="video-card">

            ${
                validVideoId
                    ? `
                        <a
                            class="video-card-thumbnail"
                            href="${videoUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Watch ${title} on YouTube"
                        >
                            ${thumbnailContent}
                        </a>
                    `
                    : `
                        <div class="video-card-thumbnail">
                            ${thumbnailContent}
                        </div>
                    `
            }

            <div class="video-card-body">

                <div class="video-card-meta">
                    <span class="video-card-category">${category}</span>
                    <span class="video-card-level">${level}</span>
                </div>

                <h3 class="video-card-title">${title}</h3>

                <p class="video-card-description">
                    ${description}
                </p>

                ${
                    validVideoId
                        ? `
                            <a
                                class="video-card-link"
                                href="${videoUrl}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                WATCH TUTORIAL <span>↗</span>
                            </a>
                        `
                        : `
                            <div class="video-card-link">
                                COMING SOON <span>◷</span>
                            </div>
                        `
                }

            </div>
        </article>
    `;
}

function renderVideoLibrary() {
    if (!videoGrid) return;

    console.log(videoTutorials);

    const filteredVideos = getFilteredVideos();

    const cards = filteredVideos.map(createVideoCard).filter(Boolean);

    videoGrid.innerHTML = cards.join("");

    if (videoEmptyState) {
        videoEmptyState.hidden = cards.length > 0;
    }

    if (videoCounter) {
        videoCounter.textContent = String(videoTutorials.length).padStart(
            2,
            "0",
        );
    }
}

/* SEARCH */

videoSearch?.addEventListener("input", (event) => {
    videoState.search = event.target.value.trim();
    renderVideoLibrary();
});

/* CATEGORY FILTERS */

videoFilters?.addEventListener("click", (event) => {
    const button = event.target.closest(".video-filter");

    if (!button) return;

    videoState.category = button.dataset.category || "All";

    $$(".video-filter", videoFilters).forEach((filter) => {
        const isActive = filter === button;

        filter.classList.toggle("active", isActive);
        filter.setAttribute("aria-pressed", String(isActive));
    });

    renderVideoLibrary();
});

/* INITIAL RENDER */

renderVideoLibrary();

/* =========================================
   WORKSPACE DRAWER
========================================= */

const workspaceToggle = $("#workspaceToggle");
const workspacePanel = $("#workspacePanel");
const workspaceClose = $("#workspaceClose");
const workspaceOverlay = $("#workspaceOverlay");

let workspaceIsOpen = false;
let workspaceReturnFocus = null;
let workspaceCloseTimer = null;

function openWorkspacePanel() {
    if (!workspacePanel || !workspaceToggle || workspaceIsOpen) return;

    // Close the mobile navigation if it is currently open.
    if (typeof closeMobileMenu === "function") {
        closeMobileMenu();
    }

    clearTimeout(workspaceCloseTimer);

    workspaceReturnFocus = document.activeElement;
    workspaceIsOpen = true;

    // Remove hidden before starting the opening animation.
    workspacePanel.hidden = false;

    // Force the browser to register the initial hidden state.
    workspacePanel.offsetHeight;

    workspacePanel.classList.add("is-open");
    workspaceOverlay?.classList.add("is-visible");

    workspaceToggle.setAttribute("aria-expanded", "true");
    workspaceToggle.setAttribute("aria-label", "Close workspace panel");

    document.body.classList.add("workspace-open");

    // Move keyboard focus into the drawer.
    workspaceClose?.focus();
}

function closeWorkspacePanel({ restoreFocus = true } = {}) {
    if (!workspacePanel || !workspaceIsOpen) return;

    workspaceIsOpen = false;

    workspacePanel.classList.remove("is-open");
    workspaceOverlay?.classList.remove("is-visible");

    workspaceToggle?.setAttribute("aria-expanded", "false");
    workspaceToggle?.setAttribute("aria-label", "Open workspace panel");

    document.body.classList.remove("workspace-open");

    // Restore focus after the closing animation.
    if (restoreFocus && workspaceReturnFocus instanceof HTMLElement) {
        workspaceReturnFocus.focus();
    }

    workspaceCloseTimer = window.setTimeout(() => {
        if (!workspaceIsOpen) {
            workspacePanel.hidden = true;
        }
    }, 360);
}

// Open / close button
workspaceToggle?.addEventListener("click", () => {
    if (workspaceIsOpen) {
        closeWorkspacePanel();
    } else {
        openWorkspacePanel();
    }
});

// Close button inside the drawer
workspaceClose?.addEventListener("click", () => {
    closeWorkspacePanel();
});

// Close when clicking outside the drawer
workspaceOverlay?.addEventListener("click", () => {
    closeWorkspacePanel();
});

// Close with Escape and keep keyboard focus inside the drawer.
document.addEventListener("keydown", (event) => {
    if (!workspaceIsOpen || !workspacePanel) return;

    if (event.key === "Escape") {
        event.preventDefault();
        closeWorkspacePanel();
        return;
    }

    if (event.key === "Tab") {
        const focusableElements = [
            ...workspacePanel.querySelectorAll(
                "a[href], button:not([disabled]), input:not([disabled]), " +
                    "select:not([disabled]), textarea:not([disabled]), " +
                    '[tabindex]:not([tabindex="-1"])',
            ),
        ].filter((element) => !element.hidden);

        if (!focusableElements.length) {
            event.preventDefault();
            workspacePanel.focus();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
});

/* =========================================
   SHARED SKILL-CHECK PROGRESS
========================================= */

const SKILL_RESULTS_KEY = "freetimezp:roadmap:skill-check-results:v1";

const trackedSkillChecks = roadmapData
    .filter((lesson) => lesson.skillCheck?.enabled && lesson.testUrl)
    .map((lesson) => ({
        id: String(lesson.skillCheck.id ?? lesson.number).padStart(3, "0"),
        title: lesson.skillCheck.title ?? lesson.title,
        url: lesson.testDemo,
    }));

function readSkillResults() {
    try {
        const stored = localStorage.getItem(SKILL_RESULTS_KEY);

        if (!stored) {
            return { schemaVersion: 1, tests: {} };
        }

        const data = JSON.parse(stored);

        if (!data || typeof data.tests !== "object" || !data.tests) {
            return { schemaVersion: 1, tests: {} };
        }

        return data;
    } catch (error) {
        console.warn("Could not read skill-check results:", error);
        return { schemaVersion: 1, tests: {} };
    }
}

let skillResults = readSkillResults();

function getSkillCheckResult(testId) {
    const id = String(testId).padStart(3, "0");
    return skillResults.tests?.[id] || null;
}

function renderProgressDashboard() {
    const completed = trackedSkillChecks
        .map((test) => ({
            test,
            result: getSkillCheckResult(test.id),
        }))
        .filter(({ result }) => result?.best);

    const average = completed.length
        ? Math.round(
              completed.reduce(
                  (sum, item) => sum + item.result.best.percentage,
                  0,
              ) / completed.length,
          )
        : null;

    const attempts = trackedSkillChecks.reduce((sum, test) => {
        const result = getSkillCheckResult(test.id);
        return sum + (Number(result?.attempts) || 0);
    }, 0);

    document.querySelector("#progressChecksCompleted").textContent =
        `${completed.length} / ${trackedSkillChecks.length}`;

    document.querySelector("#progressAverageScore").textContent =
        average === null ? "—" : `${average}%`;

    document.querySelector("#progressTotalAttempts").textContent =
        String(attempts);

    document.querySelector("#progressTestList").innerHTML = trackedSkillChecks
        .map((test) => {
            const result = getSkillCheckResult(test.id);
            const best = result?.best;

            return `
                    <a class="progress-test-item ${best ? "is-complete" : ""}"
                        href="${escapeHTML(test.url)}"
                        target="_blank"
                        rel="noopener noreferrer">
                        <span class="progress-test-info">
                            <span class="progress-test-number">
                                ${test.id}
                            </span>
                            <span class="progress-test-name">
                                ${escapeHTML(test.title)}
                                <small>
                                    ${
                                        result
                                            ? `${result.attempts} attempt${
                                                  result.attempts === 1
                                                      ? ""
                                                      : "s"
                                              }`
                                            : "Not attempted yet"
                                    }
                                </small>
                            </span>
                        </span>
                        <span class="progress-test-score">
                            ${best ? `BEST ${best.percentage}%` : "START ↗"}
                        </span>
                    </a>
                `;
        })
        .join("");
}

// Refresh when the learner returns from a skill-check tab.
window.addEventListener("focus", () => {
    skillResults = readSkillResults();
    renderProgressDashboard();
});

// Refresh automatically when another tab saves a result.
window.addEventListener("storage", (event) => {
    if (event.key === SKILL_RESULTS_KEY || event.key === null) {
        skillResults = readSkillResults();
        render();
    }
});

// sidebar

const navLinks = [...document.querySelectorAll(".side-nav .nav-link")];

function setActiveLink(linkToActivate) {
    navLinks.forEach((link) => {
        const isActive = link === linkToActivate;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

// Handle clicks on sidebar links
navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        setActiveLink(link);
    });
});

// Category

function categoryIcon(category) {
    return { HTML: "&lt;/&gt;", CSS: "✳", JavaScript: "JS" }[category] || "⌘";
}

function getFilteredLessons() {
    const query = state.search.trim().toLowerCase();
    return publishedLessons
        .filter(
            (lesson) =>
                state.category === "All" || lesson.category === state.category,
        )
        .filter(
            (lesson) =>
                state.status === "All" || lesson.status === state.status,
        )
        .filter((lesson) => {
            const searchable = [
                lesson.number,
                lesson.title,
                lesson.description,
                lesson.category,
                lesson.topic,
                lesson.difficulty,
                ...(lesson.tags || []),
            ]
                .join(" ")
                .toLowerCase();
            return searchable.includes(query);
        })
        .sort((a, b) => {
            if (state.sort === "desc") return b.id - a.id;
            if (state.sort === "az") return a.title.localeCompare(b.title);
            return a.id - b.id;
        });
}

function lessonCard(lesson, index) {
    const number = escapeHTML(lesson.number);
    const category = escapeHTML(lesson.category);
    const title = escapeHTML(lesson.title);
    const description = escapeHTML(lesson.description);

    const testResult = getSkillCheckResult(number);
    const bestScore = testResult?.best;

    const tags = (lesson.tags || [])
        .slice(0, 3)
        .map((tag) => `<span class="lesson-tag">${escapeHTML(tag)}</span>`)
        .join("");

    const preview = lesson.preview
        ? `<img class="preview-image" 
            src="${escapeHTML(lesson.preview)}" alt="" loading="lazy">`
        : `<div class="preview-art preview-${category.toLowerCase()}">

        <span class="preview-watermark">${categoryIcon(lesson.category)}</span>
        <span class="preview-kicker">LESSON / ${number}</span>
        <span class="preview-code">${
            lesson.category === "HTML"
                ? "&lt;h1&gt;"
                : lesson.category === "CSS"
                  ? "{ style }"
                  : "const skill"
        }</span>

        <span class="preview-title">${title.replace(/&amp;/g, "&")}</span>
        <span class="preview-caption">FOUNDATIONS <i>↗</i></span>
      </div>`;

    return `
        <article class="lesson-card" style="--card-index:${index}">
            <div class="lesson-preview">
                ${preview}<span class="lesson-number">${number}</span>
            </div>

            <div class="lesson-card-content">
                <div class="lesson-card-meta">
                    <span class="category-pill category-${category.toLowerCase()}">${categoryIcon(lesson.category)} 
                        <span>${category}</span>
                    </span>
                    <span class="difficulty">${escapeHTML(lesson.difficulty)}</span>
                </div>

                <h3>${title}</h3>
                <p class="lesson-description">${description}</p>
                <div class="lesson-tags">${tags}</div>

                <div class="skill-result-badge ${
                    bestScore ? "is-complete" : ""
                }">
                    ${
                        bestScore
                            ? `✓ BEST SCORE ${bestScore.percentage}%`
                            : "○ SKILL CHECK NOT ATTEMPTED"
                    }
                </div>

                <div class="lesson-card-footer">
                    <a class="resource-link resource-learn" target="_blank" rel="noopener noreferrer"
                        href="${escapeHTML(lesson.learningDemo || lesson.learningUrl)}">
                            <span class="resource-icon">↗</span>
                            <span>Open lesson</span>
                    </a>

                    <a class="resource-link resource-test" target="_blank" rel="noopener noreferrer"
                        href="${escapeHTML(lesson.testDemo || lesson.testUrl)}">
                            <span class="resource-icon">✓</span>
                            <span>Skill check</span>
                    </a>
                </div>
            </div>
        </article>
    `;
}

function renderCategoryTabs() {
    const counts = Object.fromEntries(
        categories.map((category) => [
            category,
            publishedLessons.filter(
                (lesson) => category === "All" || lesson.category === category,
            ).length,
        ]),
    );

    //tabs count projects
    $$("#categoryTabs [data-category]").forEach((tab) => {
        const category = tab.dataset.category;

        tab.classList.toggle("active", state.category === category);
        tab.setAttribute("aria-selected", String(state.category === category));

        const count = tab.querySelector("span");

        if (count)
            count.textContent = counts[category] ? pad(counts[category]) : "—";
    });

    $("#allCount").textContent = pad(publishedLessons.length);

    // Keep sidebar counts synchronized with category tabs
    $$(".side-nav [data-category-link]").forEach((link) => {
        const category = link.dataset.categoryLink;
        const count = link.querySelector(".nav-count");

        if (count) {
            count.textContent = counts[category] ? pad(counts[category]) : "—";
        }
    });
}

function renderFilterChips() {
    $("#categoryFilters").innerHTML = categories
        .map(
            (category) => `
                <button class="filter-chip ${state.category === category ? "selected" : ""}" 
                    data-filter-category="${escapeHTML(category)}">${escapeHTML(category)}
                </button>
            `,
        )
        .join("");

    $("#statusFilters").innerHTML = statuses
        .map(
            (status) => `
                <button class="filter-chip ${state.status === status ? "selected" : ""}" 
                    data-filter-status="${escapeHTML(status)}">
                        ${status === "All" ? "All statuses" : status.replace("-", " ")}
                </button>
            `,
        )
        .join("");

    const count =
        Number(state.category !== "All") + Number(state.status !== "All");

    $("#filterCount").textContent = count;

    filterToggle.classList.toggle("has-filters", count > 0);
}

function renderPagination(total) {
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    state.page = Math.min(state.page, pages);

    if (total <= state.perPage) {
        pagination.innerHTML = `
            <span class="pagination-summary">
                ${total ? `Showing ${total} ${total === 1 ? "lesson" : "lessons"}` : "No results to show"}
            </span>`;
        return;
    }

    const pageButtons = Array.from({ length: pages }, (_, i) => {
        const page = i + 1;

        return `
            <button class="page-number 
                ${page === state.page ? "active" : ""}" 
                data-page="${page}" aria-label="Page ${page}" 
                ${page === state.page ? 'aria-current="page"' : ""}
            >
                    ${pad(page)}
            </button>`;
    }).join("");

    pagination.innerHTML = `
        <span class="pagination-summary">
            Showing <strong>
                ${(state.page - 1) * state.perPage + 1}–${Math.min(state.page * state.perPage, total)}
            </strong> of <strong>${total}</strong>
        </span>

        <div class="pagination-controls">
            <button class="page-arrow" aria-label="Previous page"
                data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>
                ←
            </button>
            ${pageButtons}
            <button class="page-arrow" aria-label="Next page"
                data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""}>
                →
            </button>
        </div>
    `;
}

function render() {
    const lessons = getFilteredLessons();

    const pages = Math.max(1, Math.ceil(lessons.length / state.perPage));

    if (state.page > pages) state.page = 1;
    const start = (state.page - 1) * state.perPage;
    const pageLessons = lessons.slice(start, start + state.perPage);

    grid.innerHTML = pageLessons.map(lessonCard).join("");
    grid.hidden = pageLessons.length === 0;

    emptyState.hidden = pageLessons.length !== 0;

    const total = lessons.length;

    $("#resultsLabel").textContent = total
        ? `Showing ${start + 1}–${Math.min(start + state.perPage, total)} of ${total} 
            ${total === 1 ? "lesson" : "lessons"}`
        : "No matching lessons";

    $("#lessonTotal").textContent = pad(publishedLessons.length);
    $("#statLessonTotal").textContent = pad(publishedLessons.length);

    renderCategoryTabs();
    renderFilterChips();
    renderPagination(total);
    renderProgressDashboard();
}

$("#categoryTabs").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-category]");
    if (!tab) return;

    state.category = tab.dataset.category;
    state.page = 1;

    // change active sidebar when we click on tab
    navLinks.forEach((link) => {
        link.classList.remove("active");

        if (link.dataset.categoryLink === state.category) {
            link.classList.add("active");
        }
    });

    render();
});

document.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("[data-filter-category]");
    const statusButton = event.target.closest("[data-filter-status]");
    const pageButton = event.target.closest("[data-page]");
    const sidebarCategory = event.target.closest("[data-category-link]");

    if (categoryButton) {
        state.category = categoryButton.dataset.filterCategory;
        state.page = 1;
        render();
    }
    if (statusButton) {
        state.status = statusButton.dataset.filterStatus;
        state.page = 1;
        render();
    }
    if (pageButton && !pageButton.disabled) {
        state.page = Number(pageButton.dataset.page);
        render();
        $("#roadmap").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (sidebarCategory) {
        state.category = sidebarCategory.dataset.categoryLink;
        state.page = 1;
        render();
    }
});

searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    state.page = 1;
    render();
});

sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    state.page = 1;
    render();
});

filterToggle.addEventListener("click", () => {
    const opening = filterPanel.hidden;
    filterPanel.hidden = !opening;
    filterToggle.setAttribute("aria-expanded", String(opening));
});

$("#clearFilters").addEventListener("click", resetFilters);
$("#emptyReset").addEventListener("click", resetFilters);

function resetFilters() {
    state.category = "All";
    state.status = "All";
    state.search = "";
    state.page = 1;
    searchInput.value = "";

    render();
}

document.addEventListener("keydown", (event) => {
    if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
            document.activeElement.tagName,
        )
    ) {
        event.preventDefault();
        searchInput.focus();
    }

    if (event.key === "Escape") {
        searchInput.blur();
        closeMobileMenu();
        closeWorkspacePanel();
    }
});

const sidebar = $("#sidebar");
const mobileMenu = $("#mobileMenu");
const mobileOverlay = $("#mobileOverlay");

function openMobileMenu() {
    sidebar.classList.add("is-open");
    mobileOverlay.classList.add("is-visible");
    mobileMenu.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
}

function closeMobileMenu() {
    sidebar.classList.remove("is-open");
    mobileOverlay.classList.remove("is-visible");
    mobileMenu.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
}

mobileMenu.addEventListener("click", () => {
    sidebar.classList.contains("is-open")
        ? closeMobileMenu()
        : openMobileMenu();
});

mobileOverlay.addEventListener("click", closeMobileMenu);
$$(".side-nav a").forEach((link) =>
    link.addEventListener("click", closeMobileMenu),
);

$("#year").textContent = new Date().getFullYear();
render();
