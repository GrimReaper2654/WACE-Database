// Get search Settings
const data = {
    filters: {
        subject: 'spec',
        year: -1,
        calculator: 'all',
        source: 'all',
        type: 'all',
        mode: 'and',
        tags: [],
    },
    questions: [],
    questionsRaw: null,
    tagsRaw: null,
    tagsV2: null,
};
let savedSettings = localStorage.getItem('WaceDatabaseSearchSettings');
if (savedSettings) data.filters = JSON.parse(savedSettings);

if (document.getElementById('subjectSelect')) {
    document.getElementById('subjectSelect').addEventListener('input', function() {
        console.log('subject changed!');
        data.filters.subject = document.getElementById('subjectSelect').value;
        setTags();
    });
}

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
    const tagsList = data.tagsV2[data.filters.subject];
    console.log(tagsList);
    let tagsHtml = ``;
    for (const [tag, subTags] of Object.entries(tagsList)) {
        tagsHtml += `<label class="tag"><input type="checkbox" id="${tag}" class="tagSelect"><span class="tagLabel">${tag}</span>`;
        if (subTags.length > 0) {
            tagsHtml += `<button id="button${tag}" class="toggleButton" onclick="toggleContent('${tag}')"><span class="arrow">▼</span></button><div class="extraContent" id="extraContent${tag}">`;
            for (let subTag of subTags) {
                tagsHtml += `<label class="tag"><input type="checkbox" id="${subTag}" class="tagSelect"><span class="tagLabel">${subTag}</span></label><br>`;
            }
            tagsHtml += `</div>`;
        }
        tagsHtml += `</label>`;
    }
    document.getElementById('tagsContainer').innerHTML = tagsHtml;
}

async function search() {
    data.filters.year = document.getElementById('yearSelect').value;
    data.filters.calculator = document.getElementById('calculatorSelect').value;
    data.filters.source = document.getElementById('sourceSelect').value;
    data.filters.type = document.getElementById('typeSelect').value;
    data.filters.mode = document.getElementById('tagsSelect').value;
    data.filters.tags = Array.from(document.querySelectorAll('.tagSelect:checked')).map(checkbox => checkbox.id);

    const allQuestions = data.questionsRaw[data.filters.subject];
    
    data.questions = [];
    allQuestions.forEach(function(question, index) {
        if ((data.filters.year == -1 || question.year == data.filters.year) && (data.filters.source == 'all' || question.source == data.filters.source) && (data.filters.type == 'all' || question.type == data.filters.type) && (data.filters.calculator == 'all' || (question.calculator == data.filters.calculator))) {
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
        let questionTags = `<div class="smallTagsContainer">`;
        for (let j of data.questions[i].tags) {
            questionTags += `<label class="tag"><span class="tagLabel">${j}</span></label>`;
        }
        questionTags += `</div>`;
        questionsHtml += `<div id="result${i}" class="box whiteBackground"><div class="resultTopRow"><button id="button${i}" class="toggleButton" onclick="toggleContent(${i})"><h3 class="alignLeft">${data.questions[i].name}</h3><span class="arrow alignRight">▼</span></button></div><div class="extraContent" id="extraContent${i}">${questionTags}<div id="question${i}" class="questionArea"><img src="questionBank/${data.filters.subject}/${data.questions[i].id}.webp" class="questionImage"></div><button class="standardButton" onclick="toggleKey(${i})">Toggle Marking Key</button><a href="pdfDownloads/${data.filters.subject}/${data.questions[i].id}.pdf" download="${data.questions[i].id}.pdf"><button class="standardButton">Download PDF</button></a></div></div>`;
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

async function load() {
    data.questionsRaw = await loadJson('questions');
    data.tagsRaw = await loadJson('tags');
    data.tagsV2 = await loadJson('tagsV2');
    setTags();
}

load();

