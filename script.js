let currentTry;
let currentLetter;
let boardArray = [];
let correctWord;
let wordsArr = [];
let allowed = [];
let rows = [];
let map;
let lettersCount = new Map();
let reconfirmList = new Map();
let colorPriority = new Map();
let scoreSystem = new Map();


var submitDelay = 200;
var lastSubmit = 0;


document.addEventListener("keydown", function(){
    keyPressed(event.keyCode);
});

function keyPressed(keyID) {
    if (keyID === 8) {
        keyID = "BACKSPACE";
    } else if(keyID === 13){
        keyID = "ENTER";
    } else if(keyID >= 65 && keyID <= 90){
        keyID = String.fromCharCode(keyID);
    } else if (typeof keyID !== "string") {
        return;
    }



    if (currentLetter > 5) {
        if (keyID === "ENTER") {
            submitTry(boardArray[currentTry - 1]);
        }
    } else if (keyID != "BACKSPACE" && keyID != "ENTER") {
        boardArray[currentTry - 1] += keyID;
        currentLetter++;
        updateBoard(false);
    }

    if (keyID === "BACKSPACE" && currentLetter > 1) {
        boardArray[currentTry - 1] = boardArray[currentTry - 1].slice(0, -1);
        currentLetter--;
        updateBoard(false);
    }
}

function startGame() {

    let keyboardKeys = document.getElementsByClassName("k-button");
    for(let i = 0; i < keyboardKeys.length; i++) {
        keyboardKeys[i].id = keyboardKeys[i].innerText;
    }


    scoreSystem.set("1", 6);
    scoreSystem.set("2", 5);
    scoreSystem.set("3", 4);
    scoreSystem.set("4", 3);
    scoreSystem.set("5", 2);
    scoreSystem.set("6", 1);

    colorPriority.set("rgb(83, 141, 78)", 3);
    colorPriority.set("#538d4e", 3);
    colorPriority.set("rgb(181, 159, 59)", 2);
    colorPriority.set("#b59f3b", 2);
    colorPriority.set("rgb(58, 58, 60)", 1);
    colorPriority.set("#3a3a3c", 1);
    colorPriority.set("#707070", 0);
    colorPriority.set("", 0);
    currentTry = 1;
    currentLetter = 1;
    rows = document.getElementsByClassName("wordle-row");
    boardArray = ["", "", "", "", "", ""];
    correctWord = "";

    fetch("allowed.txt").then(response => response.text()).then(text => {
        allowed = text.split("\n");
        allowed = allowed.map(str => str.trim());
    });

    fetch('library.txt').then(response => response.text()).then(data => {
        wordsArr = data.split('\n');
        correctWord = wordsArr[Math.floor(Math.random() * wordsArr.length)];
        wordsArr = wordsArr.map(str => str.trim());
        lettersCount = new Map();
        console.log(correctWord);
        for (let i = 0; i < 5; i++) {
            if (lettersCount.has(correctWord.charAt(i))) {
                lettersCount.set(correctWord.charAt(i), lettersCount.get(correctWord.charAt(i)) + 1);
            } else {
                lettersCount.set(correctWord.charAt(i), 1);
            }
        }
    });


}

function submitTry(word) {

    if(lastSubmit + submitDelay > Date.now()) {
        return;
    }
    lastSubmit = Date.now();


    if (!allowed.includes(word.toLowerCase()) && !wordsArr.includes(word.toLowerCase())) {
        alert("Word does not exist!");
        return false;
    }

    updateBoard(true);
    setTimeout(function () {
        //console.log(word + " , " + correctWord);
        if (word.toLowerCase().trim() === correctWord.toLowerCase().trim()) {
            if(localStorage.getItem("wordle_streak") === null){
                localStorage.setItem("wordle_streak", 1);
                localStorage.setItem("wordle_score", scoreSystem.get(JSON.stringify(currentTry)));
            } else{
                localStorage.setItem("wordle_streak", parseInt(localStorage.getItem("wordle_streak")) + 1);
                localStorage.setItem("wordle_score", parseInt(localStorage.getItem("wordle_score")) + (scoreSystem.get(JSON.stringify(currentTry)) * parseInt(localStorage.getItem("wordle_streak"))));
            }
            alert("Wordle Complete! \nScore: " + localStorage.getItem("wordle_score") + "\nStreak: " + localStorage.getItem("wordle_streak"));
            if (confirm("Play again?")) {
                location.reload();
            }
            return true;
        }

        if (currentTry === 6) {
            alert("Wordle lost! Correct answer: " + correctWord);
            localStorage.setItem("wordle_streak", 0);
            if (confirm("Play again?")) {
                location.reload();
            }
        }


        currentLetter = 1;
        currentTry++;
        return false;
    }, 250);



}

function updateBoard(trySubmitted) {
    let currentBoxes = rows[currentTry - 1].children;
    for (let i = 0; i < currentBoxes.length; i++) {
        if (i < currentLetter - 1) {
            currentBoxes[i].innerText = boardArray[currentTry - 1].charAt(i);
            currentBoxes[i].style.border = "2px solid rgb(140, 140, 140)";
        } else {
            currentBoxes[i].innerText = "";
            currentBoxes[i].style.border = "2px solid rgb(90, 90, 90)";
        }

    }

    if (trySubmitted) {
        reconfirmList = new Map();
        map = new Map();
        for (let i = 0; i < currentBoxes.length; i++) {
            let boxColor = getColorForBox(i);
            currentBoxes[i].style.border = "2px solid " + boxColor;
            currentBoxes[i].style.backgroundColor = boxColor;
            let key = document.getElementById(boardArray[currentTry - 1].charAt(i));
            if(colorPriority.get(boxColor) > colorPriority.get(key.style.backgroundColor)){
                key.style.backgroundColor = boxColor;
            }

    
        }

        if (reconfirmList.size > 0) {
            for (let i = 0; i < currentBoxes.length; i++) {
                let character = boardArray[currentTry - 1].charAt(i).toLowerCase();
                if (reconfirmList.has(character)) {
                    if (reconfirmList.get(character) > 0 && correctWord.charAt(i) !== character) {
                        reconfirmList.set(character, reconfirmList.get(character) - 1);
                        currentBoxes[i].style.backgroundColor = "#3a3a3c";
                        currentBoxes[i].style.border = "2px solid #3a3a3c";
                        let key = document.getElementById(boardArray[currentTry - 1].charAt(i));
                        if(colorPriority.get("#3a3a3c") > colorPriority.get(key.style.backgroundColor)){
                            key.style.backgroundColor = "#3a3a3c";
                        }
                    }
                }
            }
        }

    }
    return;

}

function getColorForBox(characterIndex) {
    let character = boardArray[currentTry - 1].charAt(characterIndex).toLowerCase();
    if (character === correctWord.charAt(characterIndex)) {
        if (map.has(character)) {
            map.set(character, map.get(character) + 1);
        } else {
            map.set(character, 1);
        }
        
        if (map.get(character) > lettersCount.get(character)) {
            reconfirmList.set(character, map.get(character) - lettersCount.get(character));
        }
        return "#538d4e";
    } else if (correctWord.includes(character)) {
        if (map.has(character)) {
            if (map.get(character) < lettersCount.get(character)) {
                map.set(character, map.get(character) + 1);
                return "#b59f3b";
            } else {
                return "#3a3a3c";
            }

        } else {
            map.set(character, 1);
            return "#b59f3b";
        }
    } else {
        return "#3a3a3c";
    }
}