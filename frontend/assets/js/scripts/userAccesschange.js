
      import { getUsers, userTypeChanged } from "../Middleware/services";

      // === Extract query params from URL ===
      function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
          id: params.get("id"),
          needChange: params.get("needChange") === "true",
          type: params.get("type"),
        };
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
          const users = await getUsers();
          const container = document.getElementById("userList");
          container.innerHTML = "";

          users.forEach((user) => {
            const card = document.createElement("div");
            card.className = "user-card";

            card.innerHTML = `
          <div class="user-info">
            <h2>${user.userName}</h2>
            <p>${user.email}</p>
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
        } catch (err) {}
      }

      init();
