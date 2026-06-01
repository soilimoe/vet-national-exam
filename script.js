function loadSheet(sheetName){
    console.log("読み込み:", sheetName);
    const csvUrl =
    `https://docs.google.com/spreadsheets/d/1pcYtP8XjDBDOrn5T90sLkeIQGJSOHEAisLU7m0QnPHg/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    Papa.parse(csvUrl, {

        download: true,
        header: true,

        complete: function(results){
            console.log(results.data);

            window.questions = results.data;
            window.currentQuestion = 0;

            showQuestion();
        }
    });
}

function showQuestion(){

    const q =
    window.questions[window.currentQuestion];

    window.correctAnswer = q.answer;
    window.comment = q.comment;

    document.getElementById("question").innerHTML =
        `<h2>${q.question.replaceAll("\n","<br>")}</h2>`;

    let html = "";

    for(let i=1;i<=5;i++){

        const choice = q[`choice${i}`];

        if(choice){

            html += `
            <button onclick="checkAnswer('${choice}')">
            ${choice}
            </button>
            <br><br>
            `;
        }
    }

    document.getElementById("choices").innerHTML = html;

    document.getElementById("result").innerHTML = "";
}

function checkAnswer(selected){
    const result =
    document.getElementById("result");

    if(selected === window.correctAnswer){

        result.innerHTML =
        `
        <h2>⭕ 正解！</h2>
        <p><b>解説：</b><br>${window.comment.replaceAll("\n","<br>")}</p>
        `;

    } else {

        result.innerHTML =
        `
        <h2>❌ 不正解</h2>
        <p>正解：${window.correctAnswer}</p>
        <p><b>解説：</b><br>${window.comment.replaceAll("\n","<br>")}</p>
        `;

    }
}

function nextQuestion(){

    if(window.currentQuestion <
       window.questions.length - 1){

        window.currentQuestion++;

        showQuestion();
    }
}

const params =
new URLSearchParams(window.location.search);

const sheetName =
params.get("sheet") || "生理・生化";

console.log("sheetName =", sheetName);

loadSheet(sheetName);
