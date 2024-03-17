document.addEventListener("DOMContentLoaded", function() {
  const templateID = "tlHome";
  const destinationElementID = "divContent";

 
  const destinationElement = document.getElementById(destinationElementID);

  if (destinationElement) {
      loadTemplate(templateID, destinationElement, true);
  } else {
      console.error(`Destination element not found: ${destinationElementID}`);
  }
});


function loadTemplate(templateId) {
    const template = document.getElementById(templateId).content.cloneNode(true);
    const appDiv = document.getElementById("app");
    appDiv.innerHTML = ''; 
    appDiv.appendChild(template);

   
    if (templateId === "tlRegister") {
        const createUserButton = document.getElementById("createUserButton");
        createUserButton.onclick = async function(e) {
            const username = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const user = { username, email, password };
            const response = await postTo("/user", user);
        }
    }
}


function emptyContainerElement(aElement) {
  if (aElement) {
      while (aElement.firstChild) {
          aElement.removeChild(aElement.firstChild);
      }
  } else {
      console.error(`Attempted to empty a non-existing element: ${aElement}`);
  }
}
