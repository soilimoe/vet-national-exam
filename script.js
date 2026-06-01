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
        "概論","法規","倫理","解剖","生理","生化",
        "薬理","毒性","放射線","実験動物","行動",
        "野生動物","病理","微生物","伝染病",
        "免疫","家禽疾病","魚病","寄生虫",
        "家畜衛生","公衆衛生","疫学","人獣",
        "食品衛生","内科","外科","牛","馬","豚","繁殖"
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


// =========================
// ■ 問題表示
// =========================
function showQuestion(){

    const q = window.questions[window.currentQuestion];

    const percent =
        Math.round(100 * (window.currentQuestion + 1) / window.questions.length);

    document.getElementById("progress").innerHTML =
        `<h3>問題 ${window.currentQuestion + 1} / ${window.questions.length}（${percent}%）</h3>`;

    window.correctAnswer = q.answer;
    window.comment = q.comment;

    const category = q.category || window.currentCategory || "";

    document.getElementById("question").innerHTML =
        `<h4>[${category}]</h4>
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

    } else {

        result.innerHTML =
        `
        <h2>❌ 不正解</h2>
        <p>正解：${window.correctAnswer}</p>
        <p><b>解説：</b><br>${window.comment.replaceAll("\n","<br>")}</p>
        `;
    }
}


// =========================
// ■ 次の問題
// =========================
function nextQuestion(){

    if(window.currentQuestion < window.questions.length - 1){

        window.currentQuestion++;
        showQuestion();
    }
}


// =========================
// ■ 起動処理
// =========================
const params = new URLSearchParams(window.location.search);

const mode = params.get("mode");
const sheetName = params.get("sheet") || "生理・生化";

console.log("mode =", mode);
console.log("sheetName =", sheetName);

if(mode === "mixed"){
    loadMixedMode();
} else {
    loadSheet(sheetName);
}
