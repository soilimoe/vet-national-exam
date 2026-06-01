const csvUrl =
"https://docs.google.com/spreadsheets/d/1pcYtP8XjDBDOrn5T90sLkeIQGJSOHEAisLU7m0QnPHg/gviz/tq?tqx=out:csv&sheet=生理・生化";

Papa.parse(csvUrl, {
    download: true,
    header: true,

    complete: function(results) {

        window.questions = results.data;
        window.currentQuestion = 0;
        
        const q = results.data[0];
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
    }
});

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

function nextQuestion() {
    alert("次へ");
}
