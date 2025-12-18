import { getUsers, userTypeChanged } from "../Middleware/services.js";

let allUsers = []; // Store all users for filtering
let currentSort = "newest"; // Default sort order

// === Extract query params from URL ===
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id"),
    needChange: params.get("needChange") === "true",
    type: params.get("type"),
  };
}

// === Format date ===
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// === Sort users ===
function sortUsers(users) {
  const sorted = [...users];
  if (currentSort === "newest") {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
  return sorted;
}

// === Filter and render users ===
function renderUsers(usersToRender) {
  const container = document.getElementById("userList");
  container.innerHTML = "";

  // Apply sorting
  const sortedUsers = sortUsers(usersToRender);

  sortedUsers.forEach((user) => {
    const card = document.createElement("div");
    card.className = "user-card";

    card.innerHTML = `
          <div class="user-info">
            <h2>${user.userName}</h2>
            <p>${user.email}</p>
            <p class="date-info">Created: ${formatDate(user.createdAt)}</p>
          </div>
          <div>
            <a href="/typeChange?id=${user._id}&type=${
      user.userType === "guest" ? "host" : "guest"
    }&needChange=true"
               class="action-btn host-btn">
              ${user.userType === "guest" ? "Switch to Host" : "Switch to User"}
            </a>
          </div>
        `;

    container.appendChild(card);
  });

  if (sortedUsers.length === 0) {
    container.innerHTML =
      '<p class="text-center text-gray-500">No users found</p>';
  }
}

// === Handle email search ===
function setupSearchFilter() {
  const searchInput = document.getElementById("emailSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();

      if (searchTerm === "") {
        renderUsers(allUsers);
      } else {
        const filtered = allUsers.filter((user) =>
          user.email.toLowerCase().includes(searchTerm)
        );
        renderUsers(filtered);
      }
    });
  }
}

// === Handle sort filter ===
function setupSortFilter() {
  const sortSelect = document.getElementById("sortFilter");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderUsers(allUsers);
    });
  }
}

// === Main initialization ===
async function init() {
  try {
    const { id, needChange, type } = getQueryParams();

    // ✅ If URL includes a change request, handle type update first
    if (needChange && id && type) {
      try {
        const response = await userTypeChanged({ id, changeType: type });
        if (response.status) {
          alert("User type changed successfully!");
          window.location.href = "/typeChange"; // reload list
        } else {
          alert(response.message || "Failed to change user type");
        }
      } catch (err) {}
      return; // stop here after handling update
    }

    // ✅ Otherwise, show user list
    allUsers = await getUsers();
    renderUsers(allUsers);
    setupSearchFilter();
    setupSortFilter();
  } catch (err) {}
}

init();
