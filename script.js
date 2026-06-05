window.correctCount = 0;
window.answerCount = 0;

function doPost(e) {

  const sheet =
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName("AccessLog");

  const data =
  JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.studentID
  ]);

  return ContentService
    .createTextOutput("OK");
}

function logout(){

    localStorage.removeItem("loggedIn");

    location.href = "login.html";
}

// =========================
// ■ シャッフル関数
// =========================
function shuffle(array){
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// =========================
// ■ 単一シート読み込み
// =========================
function loadSheet(sheetName){

    console.log("読み込み:", sheetName);

    const csvUrl =
    `https://docs.google.com/spreadsheets/d/1pcYtP8XjDBDOrn5T90sLkeIQGJSOHEAisLU7m0QnPHg/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    Papa.parse(csvUrl, {
        download: true,
        header: true,

        complete: function(results){

            window.questions = results.data;
            window.currentQuestion = 0;

            // シートモードではカテゴリ固定
            window.currentCategory = sheetName;

            showQuestion();
        }
    });
}


// =========================
// ■ Promise版シート読み込み（ミックス用）
// =========================
function loadSheetPromise(sheetName){

    return new Promise((resolve) => {

        const csvUrl =
        `https://docs.google.com/spreadsheets/d/1pcYtP8XjDBDOrn5T90sLkeIQGJSOHEAisLU7m0QnPHg/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

        Papa.parse(csvUrl, {
            download: true,
            header: true,

            complete: function(results){
                resolve(results.data);
            }
        });
    });
}


// =========================
// ■ ミックスモード
// =========================
async function loadMixedMode(){

    const sheetNames = [
        "倫理・法規・概論","生理・生化学","薬理","毒性","解剖・放射線","免疫・微生物・感染症","病理","実験動物・行動学",
        "野生動物・人獣","公衆衛生・家畜衛生・食品衛生","内科・外科","牛・馬・豚・繁殖","家禽疾病・魚病"
    ];

    let all = [];

    for(const name of sheetNames){

        const data = await loadSheetPromise(name);

        // 分野情報を付与（重要）
        data.forEach(d => {
            d.category = name;
        });

        all = all.concat(data);
    }

    shuffle(all);

    window.questions = all;
    window.currentQuestion = 0;

    showQuestion();
}

async function loadChallenge20(){

    await loadMixedMode();

    window.questions =
        window.questions.slice(0,20);

    window.challengeMode = true;

    showQuestion();
    window.categoryStats = {};
}


// =========================
// ■ 問題表示
// =========================
function showQuestion(){
    const q = window.questions[window.currentQuestion];
    let img = "";
    if(q.image){
        img =`https://drive.google.com/thumbnail?id=${q.image}&sz=w300`;
    }

    const category = q.category || window.currentCategory || "";

    const percent =
        Math.round(100 * (window.currentQuestion + 1) / window.questions.length);

    document.getElementById("progress").innerHTML =
        `<h3>問題 ${window.currentQuestion + 1} / ${window.questions.length}（${percent}%）</h3>`;

    window.correctAnswer = q.answer;
    window.comment = q.comment;

    document.getElementById("question").innerHTML =
        `<h4>[${category}]</h4>
        ${img ? `<img src="${img}" style="max-width:100%; margin:10px 0;">` : ""}
        <h2>${q.question.replaceAll("\n","<br>")}</h2>`;

    let html = "";

    for(let i = 1; i <= 5; i++){

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

    const rate =
    window.answerCount === 0
    ? 0
    : Math.round(
      100 * window.correctCount /
      window.answerCount
    );

    document.getElementById("score").innerHTML =
      `
      正答率：
      ${window.correctCount}/${window.answerCount}
      （${rate}%）
      `;
}


// =========================
// ■ 解答チェック
// =========================
function checkAnswer(selected){

    const result = document.getElementById("result");

    if(selected === window.correctAnswer){

        result.innerHTML =
        `
        <h2>⭕ 正解！</h2>
        <p><b>解説：</b><br>${window.comment.replaceAll("\n","<br>")}</p>
        `;
        window.correctCount++;
        window.answerCount++;

    } else {

        result.innerHTML =
        `
        <h2>❌ 不正解</h2>
        <p>正解：${window.correctAnswer}</p>
        <p><b>解説：</b><br>${window.comment.replaceAll("\n","<br>")}</p>
        `;
        window.answerCount++;
    }
}


// =========================
// ■ 次の問題
// =========================
function nextQuestion(){

    if(
        window.currentQuestion
        <
        window.questions.length - 1
    ){

        window.currentQuestion++;

        showQuestion();

    }else{

        finishQuiz();

    }
}

function finishQuiz(){

    const rate =
    Math.round(
        100 *
        window.correctCount /
        window.answerCount
    );

    document.body.innerHTML = `
        <h1>チャレンジ終了！</h1>

        <h2>
        ${window.correctCount}
        /
        ${window.answerCount}
        </h2>

        <h2>
        正答率 ${rate}%
        </h2>

        <button onclick="
            location.href='index.html'
        ">
        トップへ戻る
        </button>
    `;
}


// =========================
// ■ 起動処理
// =========================
const params = new URLSearchParams(window.location.search);

const mode = params.get("mode");
const sheetName = params.get("sheet") || "生理・生化";

console.log("mode =", mode);
console.log("sheetName =", sheetName);

if(mode === "challenge20"){
    loadChallenge20();
}
else if(mode === "mixed"){
    loadMixedMode();
}
else{
    loadSheet(sheetName);
}
