// =====================================================
// GITHUB PROFILE ANALYZER
// =====================================================


// =====================================================
// 1. GET HTML ELEMENTS
// =====================================================

const profileForm = document.getElementById("profileForm");

const usernameInput = document.getElementById("username");

const emailInput = document.getElementById("email");

const generateBtn = document.getElementById("generateBtn");

const inputPage = document.getElementById("inputPage");

const profilePage = document.getElementById("profilePage");

const loadingMessage = document.getElementById("loadingMessage");

const errorMessage = document.getElementById("errorMessage");

const backBtn = document.getElementById("backBtn");

const downloadBtn = document.getElementById("downloadBtn");
const reviewBtn = document.getElementById("reviewBtn");

const aiLoading = document.getElementById("aiLoading");
const aiResult = document.getElementById("aiResult");

const aiSummary = document.getElementById("aiSummary");
const aiStrengths = document.getElementById("aiStrengths");
const aiImprovements = document.getElementById("aiImprovements");
const aiRecommendations = document.getElementById("aiRecommendations");


// Profile elements

const avatar = document.getElementById("avatar");

const nameElement = document.getElementById("name");

const usernameLink = document.getElementById("usernameLink");

const bio = document.getElementById("bio");

const locationElement = document.getElementById("location");

const companyElement = document.getElementById("company");

const repoCount = document.getElementById("repoCount");

const followers = document.getElementById("followers");

const following = document.getElementById("following");

const languagesContainer =
    document.getElementById("languages");

const repositoriesContainer =
    document.getElementById("repositories");


// =====================================================
// 2. STORE PROFILE DATA
// =====================================================

let currentProfile = null;

let currentRepositories = [];


// =====================================================
// 3. FORM SUBMISSION
// =====================================================

profileForm.addEventListener("submit", async function (event) {

    // Prevent page refresh
    event.preventDefault();

    // Get username
    const username = usernameInput.value.trim();

    // Clear previous error
    errorMessage.textContent = "";

    // Validate username
    if (username === "") {

        showError("Please enter a GitHub username.");

        return;
    }

    // Start loading
    setLoading(true);

    try {

        // Fetch GitHub profile
        const profile = await fetchGitHubProfile(username);

        // Fetch repositories
        const repositories =
            await fetchGitHubRepositories(username);

        // Store data
        currentProfile = profile;

        currentRepositories = repositories;

        // Display profile
        displayProfile(profile, repositories);

        // Show page 2
        showProfilePage();

    } catch (error) {

        console.error(error);

        showError(error.message);

    } finally {

        // Stop loading
        setLoading(false);

    }

});


// =====================================================
// 4. FETCH GITHUB PROFILE
// =====================================================

async function fetchGitHubProfile(username) {

    const url =
        `https://api.github.com/users/${encodeURIComponent(username)}`;

    const response = await fetch(url);

    // User doesn't exist
    if (response.status === 404) {

        throw new Error(
            "GitHub user not found. Please check the username."
        );

    }

    // Rate limit / forbidden
    if (response.status === 403) {

        throw new Error(
            "GitHub API rate limit reached. Please try again later."
        );

    }

    // Other server errors
    if (!response.ok) {

        throw new Error(
            "Unable to fetch GitHub profile."
        );

    }

    const data = await response.json();

    return data;
}


// =====================================================
// 5. FETCH GITHUB REPOSITORIES
// =====================================================

async function fetchGitHubRepositories(username) {

    const url =
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`;

    const response = await fetch(url);

    if (response.status === 404) {

        throw new Error(
            "Unable to find the user's repositories."
        );

    }

    if (response.status === 403) {

        throw new Error(
            "GitHub API rate limit reached."
        );

    }

    if (!response.ok) {

        throw new Error(
            "Unable to fetch repositories."
        );

    }

    const data = await response.json();

    return data;
}


// =====================================================
// 6. DISPLAY PROFILE
// =====================================================

function displayProfile(profile, repositories) {

    // Profile image
    avatar.src = profile.avatar_url;

    // Name
    nameElement.textContent =
        profile.name || profile.login;

    // Username
    usernameLink.textContent =
        `@${profile.login}`;

    usernameLink.href =
        profile.html_url;

    // Bio
    bio.textContent =
        profile.bio || "No bio available.";

    // Location
    locationElement.textContent =
        profile.location
            ? `📍 ${profile.location}`
            : "📍 Location not provided";

    // Company
    companyElement.textContent =
        profile.company
            ? `💼 ${profile.company}`
            : "💼 No company listed";

    // Statistics
    repoCount.textContent =
        profile.public_repos;

    followers.textContent =
        profile.followers;

    following.textContent =
        profile.following;


    // Display languages
    displayLanguages(repositories);

    // Display repositories
    displayRepositories(repositories);
}


// =====================================================
// 7. CALCULATE LANGUAGES
// =====================================================

function calculateLanguages(repositories) {

    const languageCount = {};

    // Go through every repository
    repositories.forEach(function (repo) {

        const language = repo.language;

        // Ignore repositories without language
        if (!language) {
            return;
        }

        if (languageCount[language]) {

            languageCount[language]++;

        } else {

            languageCount[language] = 1;

        }

    });

    return languageCount;
}


// =====================================================
// 8. DISPLAY LANGUAGES
// =====================================================

function displayLanguages(repositories) {

    languagesContainer.innerHTML = "";

    const languageCount =
        calculateLanguages(repositories);

    const languages =
        Object.entries(languageCount);

    // No languages
    if (languages.length === 0) {

        languagesContainer.innerHTML =
            `<p class="repo-meta">
                No language data available.
            </p>`;

        return;
    }

    // Sort languages
    languages.sort(function (a, b) {

        return b[1] - a[1];

    });

    // Only show top 5
    const topLanguages =
        languages.slice(0, 5);

    const total =
        topLanguages.reduce(
            function (sum, item) {
                return sum + item[1];
            },
            0
        );


    topLanguages.forEach(function (item) {

        const language = item[0];

        const count = item[1];

        const percentage =
            Math.round((count / total) * 100);


        const languageElement =
            document.createElement("div");

        languageElement.className =
            "language";


        languageElement.innerHTML = `

            <div class="language-info">

                <span>${escapeHTML(language)}</span>

                <span>${percentage}%</span>

            </div>

            <div class="progress">

                <div
                    class="progress-bar"
                    style="width: ${percentage}%"
                ></div>

            </div>

        `;


        languagesContainer.appendChild(
            languageElement
        );

    });

}


// =====================================================
// 9. DISPLAY REPOSITORIES
// =====================================================

function displayRepositories(repositories) {

    repositoriesContainer.innerHTML = "";

    if (repositories.length === 0) {

        repositoriesContainer.innerHTML =
            `<p class="repo-meta">
                No public repositories found.
            </p>`;

        return;
    }


    // Sort by stars
    const sortedRepositories =
        [...repositories].sort(
            function (a, b) {

                return b.stargazers_count -
                       a.stargazers_count;

            }
        );


    // Show top 6
    const topRepositories =
        sortedRepositories.slice(0, 6);


    topRepositories.forEach(function (repo) {

        const repoElement =
            document.createElement("div");

        repoElement.className =
            "repo";


        const description =
            repo.description ||
            "No description available.";


        repoElement.innerHTML = `

            <a
                href="${repo.html_url}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ${escapeHTML(repo.name)}
            </a>

            <p>
                ${escapeHTML(description)}
            </p>

            <div class="repo-meta">

                <span>
                    ● ${repo.language || "Unknown"}
                </span>

                <span>
                    ★ ${repo.stargazers_count}
                </span>

                <span>
                    Forks ${repo.forks_count}
                </span>

            </div>

        `;


        repositoriesContainer.appendChild(
            repoElement
        );

    });

}


// =====================================================
// 10. SHOW PROFILE PAGE
// =====================================================

    function showProfilePage() {

    inputPage.style.display = "none";
    profilePage.style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =====================================================
// 11. BACK BUTTON
// =====================================================

   backBtn.addEventListener("click", function () {

    profilePage.style.display = "none";
    inputPage.style.display = "block";

    errorMessage.textContent = "";

    usernameInput.focus();
});
// =====================================================
// 12. LOADING STATE
// =====================================================

     function setLoading(isLoading) {

    if (isLoading) {

        loadingMessage.style.display = "block";

        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.6";
        generateBtn.style.cursor = "not-allowed";

    } else {

        loadingMessage.style.display = "none";

        generateBtn.disabled = false;
        generateBtn.style.opacity = "1";
        generateBtn.style.cursor = "pointer";
    }
}

// =====================================================
// 13. ERROR MESSAGE
// =====================================================

function showError(message) {

    errorMessage.textContent =
        message;

}


// =====================================================
// 14. DOWNLOAD PROFILE CARD
// =====================================================

downloadBtn.addEventListener(
    "click",
    async function () {

        const card =
            document.getElementById("profileCard");

        try {

            const canvas =
                await html2canvas(card, {

                    backgroundColor: "#0b1019",

                    scale: 2

                });


            const image =
                canvas.toDataURL("image/png");


            const link =
                document.createElement("a");


            const username =
                currentProfile
                    ? currentProfile.login
                    : "github-profile";


            link.download =
                `${username}-github-profile.png`;

            link.href = image;

            link.click();

        } catch (error) {

            console.error(
                "Download failed:",
                error
            );

            alert(
                "Unable to download the profile card."
            );

        }

    }
);


// =====================================================
// 15. SECURITY HELPER
// =====================================================
//
// When inserting API data into innerHTML,
// escape HTML characters first.
// This prevents profile/repository text
// from being interpreted as HTML.
//
// =====================================================

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


// =====================================================
// 16. HANDLE NETWORK ERRORS
// =====================================================

window.addEventListener(
    "offline",
    function () {

        showError(
            "You appear to be offline. Please check your internet connection."
        );

    }
);
async function sendProfileToN8n() {
    try {
        aiLoading.style.display = "block";
        aiResult.style.display = "none";

        const response = await fetch(
            "https://vijas1.app.n8n.cloud/webhook-test/github-profile-review",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    profile: currentProfile,
                    repositories: currentRepositories
                })
            }
        );

        if (!response.ok) {
            throw new Error(`n8n request failed: ${response.status}`);
        }

        const result = await response.json();

        if (!result.review) {
            throw new Error("AI review was not returned");
        }

        const review = result.review;

        // Summary
        aiSummary.textContent = review.summary;

        // Strengths
        aiStrengths.innerHTML = "";

        review.strengths.forEach(strength => {
            const li = document.createElement("li");
            li.textContent = strength;
            aiStrengths.appendChild(li);
        });

        // Improvements
        aiImprovements.innerHTML = "";

        review.improvements.forEach(improvement => {
            const li = document.createElement("li");
            li.textContent = improvement;
            aiImprovements.appendChild(li);
        });

        // Recommendations
        aiRecommendations.innerHTML = "";

        review.recommendations.forEach(recommendation => {
            const li = document.createElement("li");
            li.textContent = recommendation;
            aiRecommendations.appendChild(li);
        });

        aiLoading.style.display = "none";
        aiResult.style.display = "block";

    } catch (error) {
        console.error("AI Review Error:", error);

        aiLoading.style.display = "none";

        alert(
            "Unable to generate AI review.\n\n" +
            error.message
        );
    }
}

reviewBtn.addEventListener("click", sendProfileToN8n);