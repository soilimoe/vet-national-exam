const csvUrl = "https://docs.google.com/spreadsheets/d/1pcYtP8XjDBDOrn5T90sLkeIQGJSOHEAisLU7m0QnPHg/gviz/tq?tqx=out:csv&sheet=生理・生化";

fetch(csvUrl)
  .then(response => response.text())
  .then(data => {
    const rows = data.trim().split("\n");

    const firstQuestion = rows[1];

    const cols = firstQuestion.split(",");

    const question = cols[2].replaceAll('"', '');
    document.getElementById("question").innerHTML =
  `<h2>${question.replaceAll("\n", "<br>")}</h2>`;

    let html = "";

    for(let i=3; i<=7; i++){

      if(cols[i]){

        html += `
          <button>${cols[i]}</button>
          <br><br>
        `;
      }

    }

    document.getElementById("choices").innerHTML =
      html;
  });
