// Get search Settings
const data = {
    filters: {
        subject: 'spec',
        year: -1,
        calculator: 'all',
        source: 'all',
        mode: 'and',
        tags: [],
    },
    questions: []
}
let savedSettings = localStorage.getItem('WaceDatabaseSearchSettings');
if (savedSettings) data.filters = JSON.parse(savedSettings);

function toggleContent(id) {
    const extraContent = document.getElementById(`extraContent${id}`);
    const button = document.getElementById(`button${id}`);
    if (extraContent.style.display === "none" || !extraContent.style.display) {
        extraContent.style.display = "block";
        button.classList.add("active");
    } else {
        extraContent.style.display = "none";
        button.classList.remove("active");
    }
}

async function loadJson(path) {
    let fetched = null;
    await fetch(`./${path}.json`).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        fetched = data;
    }).catch(error => {
        console.error('Error fetching the JSON file:', error);
    });
    return fetched;
}

async function setTags() {
    const allTags = await loadJson('tags');
    const tagsList = allTags[data.filters.subject];
    let tagsHtml = ``;
    for (let tag of tagsList) {
        tagsHtml += `<label class="tag"><input type="checkbox" id="${tag}" class="tagSelect"><span class="tagLabel">${tag}</span></label>`
    }
    document.getElementById('tagsContainer').innerHTML = tagsHtml;
}

async function search() {
    data.filters.subject = document.getElementById('subjectSelect').value;
    data.filters.year = document.getElementById('yearSelect').value;
    data.filters.calculator = document.getElementById('calculatorSelect').value;
    data.filters.source = document.getElementById('sourceSelect').value;
    data.filters.mode = document.getElementById('tagsSelect').value;
    data.filters.tags = Array.from(document.querySelectorAll('.tagSelect:checked')).map(checkbox => checkbox.id);

    const questionsRaw = await loadJson('questions');
    const allQuestions = questionsRaw[data.filters.subject];
    
    data.questions = [];
    allQuestions.forEach(function(question, index) {
        if ((data.filters.year == -1 || question.year == data.filters.year) && (data.filters.source == 'all' || question.source == data.filters.source) && (data.filters.calculator == 'all' || (data.filters.calculator == 'assumed' && data.filters.calculator != "free") || (question.calculator == data.filters.calculator))) {
            if (data.filters.mode == 'and') {
                if (data.filters.tags.every(tag => question.tags.includes(tag))) {
                    data.questions.push(allQuestions[index]);
                }
            } else {
                if (data.filters.tags.some(tag => question.tags.includes(tag))) {
                    data.questions.push(allQuestions[index]);
                }
            }
        }
    });
    
    console.log(data.questions);
    let questionsHtml = ``;
    for (let i in data.questions) {
        questionsHtml += `<div id="result${i}" class="box whiteBackground"><div class="resultTopRow"><h3 class="alignLeft">${data.questions[i].name}</h3><span class="alignRight"><button id="button${i}" class="toggleButton" onclick="toggleContent(${i})">▼</button></span></div><div class="extraContent" id="extraContent${i}"><div id="question${i}" class="questionArea"><img src="questionBank/spec/${data.questions[i].id}.webp" class="questionImage"></div><button class="standardButton" onclick="toggleKey(${i})">Show Marking Key</button><a href="pdfDownloads/spec/${data.questions[i].id}.pdf" download="${data.questions[i].id}.pdf"><button class="standardButton">Download PDF</button></a></div></div>`;
    }
    console.log(questionsHtml);
    if (questionsHtml == ``) questionsHtml = `<h3>No Results Found</h3>`;
    console.log(questionsHtml);
    document.getElementById('searchResults').innerHTML = questionsHtml;
}

async function toggleKey(id) {
    const imageContainer = document.getElementById(`question${id}`);
    let image = imageContainer.innerHTML;
    image = image.replace('questionBank', '[key]').replace('markingKeys', '[question]');
    image = image.replace('[key]', 'markingKeys').replace('[question]', 'questionBank');
    imageContainer.innerHTML = image;
}

setTags();