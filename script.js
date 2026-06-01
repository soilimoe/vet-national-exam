const csvUrl = "https://docs.google.com/spreadsheets/d/1pcYtP8XjDBDOrn5T90sLkeIQGJSOHEAisLU7m0QnPHg/gviz/tq?tqx=out:csv&sheet=生理・生化";

fetch(csvUrl)
  .then(response => response.text())
  .then(data => {
    console.log(data);

    document.getElementById("quiz").innerHTML =
      "<pre>" + data + "</pre>";
  });
