document.addEventListener("DOMContentLoaded", () => {
  // Favorite Button (Detail Page)
  const favoriteBtn = document.querySelector(".favorite-btn");

  if (favoriteBtn) {
    const invId = favoriteBtn.dataset.invId;

    // Check if already favorited
    fetch(`/favorites/check/${invId}`)
      .then(res => res.json())
      .then(data => {
        if (data.isFavorite) favoriteBtn.classList.add("favorited");
      });

    // Toggle favorite
    favoriteBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const isFavorited = favoriteBtn.classList.contains("favorited");
      const route = isFavorited ? "/favorites/remove" : "/favorites/add";

      try {
        const res = await fetch(route, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inv_id: invId })
        });

        const result = await res.json();

        if (result.status === "added") {
          favoriteBtn.classList.add("favorited");
        } else if (result.status === "removed") {
          favoriteBtn.classList.remove("favorited");
        }
      } catch (err) {
        console.error("Error toggling favorite:", err);
      }
    });
  }

  // Remove Buttons (Favorites Page)
  const removeBtns = document.querySelectorAll(".remove-btn");

  removeBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const invId = btn.dataset.invId;

      try {
        const res = await fetch("/favorites/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inv_id: invId })
        });

        const result = await res.json();

        if (result.status === "removed") {
          
          const li = btn.closest("li");
          if (li) li.remove();

          // If list is empty, show notice
          const list = document.getElementById("inv-display");
          if (list && list.children.length === 0) {
            const section = document.querySelector(".favorites-list");
            const msg = document.createElement("p");
            msg.className = "notice";
            msg.textContent = "You haven't added any favorites yet.";
            section.appendChild(msg);
          }
        }
      } catch (err) {
        console.error("Error removing favorite:", err);
      }
    });
  });
});
