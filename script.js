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
    window.categoryStats = {};
    showQuestion();
}

async function loadStatistics(){

    const url =
    "https://docs.google.com/spreadsheets/d/あなたのID/gviz/tq?tqx=out:csv&sheet=Statistics";

    Papa.parse(url,{
        download:true,
        header:false,

        complete:function(results){

            const data = results.data;

            document.getElementById(
                "questionCount"
            ).innerHTML =
            data[0][1] + "問";
        }
    });
}

// =========================
// ■ 問題表示
// =========================
function showQuestion(){
  
    window.answered = false;
    const q = window.questions[window.currentQuestion];
    let img = "";
    if(q.image){
        img =`https://drive.google.com/thumbnail?id=${q.image}&sz=w300`;
    }

    const category = q.category || window.currentCategory || "";

    const percent =
        Math.round(100 * (window.currentQuestion + 1) / window.questions.length);
    const rate =
      window.answerCount === 0
      ? 0
      : Math.round(
        100 * window.correctCount /
        window.answerCount
      );

    document.getElementById("progressCircle").innerHTML =
      `
      <div class="circle-box">
        <p>進捗</p>
        <div class="circle"
        style="
        background:
        conic-gradient(
        #4CAF50 ${percent}%,
        #ddd ${percent}%
        );
        ">
        ${percent}%
        </div>
    </div>
    `;

    document.getElementById("score").innerHTML =
      `
      <div class="circle-box">
        <p>正答率</p>
        <div class="circle"
        style="
        background:
        conic-gradient(
            #2196F3 ${rate}%,
            #ddd ${rate}%
        );
        ">
        ${rate}%
        </div>
    </div>
    `;

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
            <button class="choice-btn" onclick="checkAnswer('${choice}')">${choice}</button>
            `;
        }
    }

    document.getElementById("choices").innerHTML = html;
    document.getElementById("result").innerHTML = "";
    document.getElementById("nextButton").innerHTML = "";
}


// =========================
// ■ 解答チェック
// =========================
function checkAnswer(selected){

  document.getElementById("result")
  .scrollIntoView({
      behavior:"smooth",
      block:"start"
  });
  
    if(window.answered){
      return;
    }
    window.answered = true;

    const buttons =
      document.querySelectorAll("#choices button");
      buttons.forEach(btn => {
        btn.disabled = true;
    });

    buttons.forEach(btn => {
      btn.disabled = true;
      if(btn.textContent.trim() === window.correctAnswer){
        btn.classList.add("correct-choice");
      }
      if(selected !== window.correctAnswer){
        buttons.forEach(btn => {
          if(btn.textContent.trim() === selected){
            btn.classList.add("wrong-choice");
          }
        });
      }
    });

    const result = document.getElementById("result");
    const q = window.questions[window.currentQuestion];
    const category = q.category || window.currentCategory;
    if(!window.categoryStats){
      window.categoryStats = {};
    }
    if(!window.categoryStats[category]){
      window.categoryStats[category] = {
        total: 0,
        correct: 0
    };
    }
    window.categoryStats[category].total++;

    if(selected === window.correctAnswer){

        result.innerHTML =
        `
        <h2>⭕ 正解！</h2>
        <p><b>解説：</b><br>${window.comment.replaceAll("\n","<br>")}</p>
        `;
        window.correctCount++;
        window.answerCount++;
        window.categoryStats[category].correct++;
    } else {

        result.innerHTML =
        `
        <h2>❌ 不正解</h2>
        <p>正解：${window.correctAnswer}</p>
        <p><b>解説：</b><br>${window.comment.replaceAll("\n","<br>")}</p>
        `;
        window.answerCount++;
    }
    document.getElementById("nextButton").innerHTML =
      `
      <button onclick="nextQuestion()">
      次の問題へ
      </button>
      `;
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
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if(window.answered){
        return;
    }
}

function finishQuiz(){

    const totalRate =
    Math.round(
        100 *
        window.correctCount /
        window.answerCount
    );

    let categoryHtml = "";

    for(const category in window.categoryStats){

        const stat =
        window.categoryStats[category];

        const rate =
        Math.round(
            100 *
            stat.correct /
            stat.total
        );

        categoryHtml += `
        <p>
        <b>${category}</b><br>
        ${stat.correct}/${stat.total}
        （${rate}%）
        </p>
        `;
    }

    document.body.innerHTML = `
        <h1>20問チャレンジ終了！</h1>

        <h2>
        総合
        ${window.correctCount}
        /
        ${window.answerCount}
        （${totalRate}%）
        </h2>

        <hr>

        <h2>分野別成績</h2>

        ${categoryHtml}

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

if(document.getElementById("questionCount")){
    loadStatistics();
}
