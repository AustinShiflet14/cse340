const pswdBtn = document.querySelector("#pswdBtn");

if (pswdBtn) {
  pswdBtn.addEventListener("click", function () {
    const pswdInput = document.getElementById("account_password");

    if (!pswdInput) return;

    const type = pswdInput.getAttribute("type");

    if (type === "password") {
      pswdInput.setAttribute("type", "text");
      pswdBtn.textContent = "Hide Password";
    } else {
      pswdInput.setAttribute("type", "password");
      pswdBtn.textContent = "Show Password";
    }
  });
}
