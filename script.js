// Get search Settings
const data = {
    filters: {
        subject: 'spec',
        year: -1,
        source: 'all',
        mode: 'and',
        tags: [],
    },
    settingsChanged: true,
    questions: []
}
let savedSettings = localStorage.getItem('WaceDatabaseSearchSettings');
if (savedSettings) data.filters = JSON.parse(savedSettings);


// Get Data
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

async function search() {
    if (data.settingsChanged) { // spamming the search button with same settings does not require recalculating
        const questionsRaw = await loadJson('questions');
        const allQuestions = questionsRaw[data.filters.subject];
        
        data.questions = [];
        allQuestions.forEach(function(question, index) {
            if ((data.filters.year == -1 || question.year == data.filters.year) && (data.filters.source == 'all' || question.source == data.filters.source)) {
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


    }
    settingsChanged = false;
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

setTags();