const data = {
    filters: {
        subject: 'spec',
        year: 'all',
        calculator: 'all',
        source: 'all',
        type: 'all',
        mode: 'or',
        tags: [],
        nTags: [],
        resultsPerPage: 10,
        currentPage: 0,
        disclaimerRemoved: false
    },
    questions: [],
    allTags: [],
    questionsRaw: null,
    tagsRaw: null,
    tagsV2: null,
    activeQuestion: null,
    activeQuestionNum: null,
    resetting: false,
    listeners: new Map(),
    unsavedChanges: false
};

window.onkeydown = function(e) {
    const keyBinds = ['q', 'w', 'e']; // munti choice, short answer, extended
    console.log(e.key);
    if (data.activeQuestion && keyBinds.includes(e.key)) {
        const tag = e.key == keyBinds[0]? 'Multiple-choice': e.key == keyBinds[1]? 'Short Answer' : 'Extended Response';
        if (document.getElementById(`${tag}Modify`)) {
            document.getElementById(`${tag}Modify`).checked = !document.getElementById(`${tag}Modify`).checked;
            updateTags(tag, document.getElementById(`${tag}Modify`).checked);
        }
        
    }
}
window.addEventListener('resize', packTags);
window.addEventListener('beforeunload', function (event) {
    if (data.unsavedChanges) {
        event.preventDefault();
    }
});

if (document.getElementById('subjectSelect')) {
    document.getElementById('subjectSelect').addEventListener('input', function() {
        console.log('subject changed!');
        data.filters.subject = document.getElementById('subjectSelect').value;
        setTags();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearFilters() {
    data.filters = {
        subject: data.filters.subject,
        year: 'all',
        calculator: 'all',
        source: 'all',
        type: 'all',
        mode: 'or',
        tags: [],
        nTags: [],
        resultsPerPage: 10,
        currentPage: 0,
        disclaimerRemoved: document.getElementById('disclaimer')? false : true
    }

    document.getElementById('yearSelect').value = data.filters.year;
    document.getElementById('calculatorSelect').value = data.filters.calculator;
    document.getElementById('sourceSelect').value = data.filters.source;
    document.getElementById('typeSelect').value = data.filters.type;
    document.getElementById('tagsSelect').value = data.filters.mode;
    document.getElementById('lengthSelect').value = 10;
    document.getElementById('pageInputTop').value = 0;
    document.getElementById('pageInputBottom').value = 0;

    document.querySelectorAll('.checkbox').forEach(checkbox => {
        checkbox.classList.remove('positive');
        checkbox.classList.remove('negative');
        checkbox.innerHTML = '';
    });

    localStorage.removeItem('WACEDB_FILTERS');

    document.getElementById('searchResults').innerHTML = `<h3>Press 'Search' to get started.</h3>`;
}

function removeAllEventListeners() {
    console.log('listeners cleared');
    data.listeners.forEach((handler, checkbox) => {
        checkbox.removeEventListener('change', handler);
    });
    data.listeners.clear();
}

function toggleContent(id, isQuestion=false) {
    const extraContent = document.getElementById(`extraContent${id}`);
    const button = document.getElementById(`button${id}`);
    if (!extraContent.classList.contains('isActive')) {
        if (isQuestion) {
            ['extraContent', 'button'].forEach(prefix => { 
                document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
                    if (/^\d+$/.test(el.id.slice(prefix.length))) {
                        el.classList.remove(prefix === 'extraContent' ? 'isActive' : 'active');
                    }
                });
            });
            if (Number(id) >= 0) {
                data.activeQuestion = data.questions[id].id;
                data.activeQuestionNum = id;
                if (document.getElementById('activeQuestion')) document.getElementById('activeQuestion').innerHTML = `Modify tags for: ${data.filters.subject} ${data.questions[id].id}`;
                if (document.getElementById('modifyTags')) {
                    data.resetting = true;
                    for (let tag of data.allTags) {
                        if(document.getElementById(`${tag}Modify`)) document.getElementById(`${tag}Modify`).checked = false;
                    }
                    for (let tag of data.questions[id].tags) {
                        if(document.getElementById(`${tag}Modify`)) document.getElementById(`${tag}Modify`).checked = true;
                    }
                    data.resetting = false;
                }
            }
        }
        extraContent.classList.add("isActive");
        button.classList.add("active");
    } else {
        if (isQuestion && Number(id) >= 0) {
            if (document.getElementById('activeQuestion')) {
                document.getElementById('activeQuestion').innerHTML = `Select question to modify tags.`;
                if (document.getElementById('modifyTags')) setModifyTags();
            }
            data.activeQuestion = null;
            data.activeQuestionNum = null;
        }
        extraContent.classList.remove("isActive");
        button.classList.remove("active");
    }
    if (!isQuestion) {
        packTags();
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

function add(array, string) {
    if (!array.includes(string)) {
        array.push(string);
    }
}

function remove(array, string) {
    const index = array.indexOf(string);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

function updateTags(id, state=null) {
    const tagId = id.replace('Modify', '');
    let tagsList = null;
    for (let question of data.questionsRaw[data.filters.subject]) {
        if (question.id == data.activeQuestion) tagsList = question.tags;
    }
    if (state === null) state = !tagsList.includes(tagId);
    if (state) {
        add(tagsList, tagId);
    } else {
        remove(tagsList, tagId);
    }
    console.log(`editing: ${data.activeQuestion}`);
    console.log(tagsList);
    let target = document.querySelector(`#result${data.activeQuestionNum} .smallTagsContainer`);
    let tagsHtml = ``;
    for (let tag of tagsList) {
        tagsHtml += `<label class="tag"><span class="tagLabel">${tag}</span></label>`;
    }
    target.innerHTML = tagsHtml;
    data.unsavedChanges = true;
}

function setModifyTags() {
    const tagsList = data.tagsV2[data.filters.subject];
    const tags = [];
    const colours = [];

    let i = 0;
    for (const [tagGroup, subTags] of Object.entries(tagsList)) {
        tags.push(tagGroup);
        colours.push(i);
        for (const tag of subTags) {
            tags.push(tag);
            colours.push(i);
        }
        i++;
    }

    data.allTags = tags;

    let modifyTagsHtml = ``;

    for (let i in tags) {
        modifyTagsHtml += `<label class="tag compactTag colour${colours[i]}"><input type="checkbox" id="${tags[i]}Modify" class="compactCheckbox"><span class="tagLabel compactLabel">${tags[i]}</span></label>`;
    }
    document.getElementById('modifyTags').innerHTML = modifyTagsHtml;
    removeAllEventListeners();
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.id.endsWith('Modify')) {
            const handler = function() {
                if (!data.resetting) {
                    if (!data.activeQuestion) {
                        this.checked = false;
                        return;
                    }
                    updateTags(this.id, this.checked);
                }
            };
            checkbox.addEventListener('change', handler);
            data.listeners.set(checkbox, handler);
        }
    });
}

function packTags() {
    const container = document.getElementById('tagsContainer');
    const elements = Array.from(container.children);

    // Sort elements by height in descending order
    elements.sort((a, b) => b.offsetHeight - a.offsetHeight);

    const margin = 10; // 10px margin around each element
    let x = 0;
    let y = 0;
    let rowHeight = 0;

    // Set the container position to relative
    container.style.position = 'relative';

    // Position the elements
    while (elements.length > 0) { // per row
        let tallestElement = elements.shift(); // Get the tallest element

        tallestElement.style.position = 'absolute';
        tallestElement.style.left = `${x + margin}px`;
        tallestElement.style.top = `${y + margin}px`;

        rowHeight = tallestElement.offsetHeight + margin;
        x += tallestElement.offsetWidth + margin;

        while (elements.length > 0) {
            let columnHeight = 0;
            let columnWidth = -1;
            let maxWidth = -1;
            let canCreateColumn = true;

            for (let i = 0; i < elements.length; i++) {
                let nextElement = elements[i];

                if (x + nextElement.offsetWidth * 2 + margin > window.innerWidth / document.body.style.zoom * 0.95) { // This does not actually work, just is pretty close
                    canCreateColumn = false;
                    continue;
                }

                if (columnHeight + nextElement.offsetHeight <= rowHeight + 20 && (columnWidth == -1 || nextElement.offsetWidth + margin < columnWidth + 20)) {
                    canCreateColumn = true;

                    nextElement.style.position = 'absolute';
                    nextElement.style.left = `${x + margin}px`;
                    nextElement.style.top = `${y + columnHeight + margin}px`;
    
                    columnHeight += nextElement.offsetHeight + margin;
                    if (columnWidth == -1) columnWidth = nextElement.offsetWidth;
                    maxWidth = Math.max(nextElement.offsetWidth + margin, maxWidth);
    
                    elements.splice(i, 1);
                    i--; 
                }
            }
    
            x += maxWidth;
            rowHeight = Math.max(rowHeight, columnHeight);
    
            if (x > document.getElementById('search').offsetWidth || !canCreateColumn) {
                x = 0;
                y += rowHeight;
                rowHeight = 0;
                break;
            }
        }
    }

    const tags = Array.from(container.children);
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    tags.forEach(child => {
        const rect = child.getBoundingClientRect();
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.right);
        maxY = Math.max(maxY, rect.bottom);
    });
    console.log(document.body.style.zoom);
    container.style.width = `${(maxX - minX + 10)/document.body.style.zoom}px`;
    container.style.height = `${(maxY - minY + 10)/document.body.style.zoom}px`;
    if ((maxX - minX + 10) > document.getElementById('search').offsetWidth) container.classList.add('centred');
    else container.classList.remove('centred');
}

async function setTags() {
    const tagsList = data.tagsV2[data.filters.subject];
    let tagsHtml = ``;
    for (const [tagGroup, subTags] of Object.entries(tagsList)) {
        tagsHtml += `<span class="tag"><span type="checkbox" id="${tagGroup}" class="checkbox"></span><span class="tagLabel noClick">${tagGroup}</span>`;
        if (subTags.length > 0) {
            tagsHtml += `<button id="button${tagGroup}" class="toggleButton" onclick="toggleContent('${tagGroup}')"><span class="arrow">▼</span></button><div class="extraContent" id="extraContent${tagGroup}">`;
            for (let subTag of subTags) {
                tagsHtml += `<span class="tag"><span type="checkbox" id="${subTag}" class="checkbox"></span><span class="tagLabel">${subTag}</span></span><br>`;
            }
            tagsHtml += `</div>`;
        }
        tagsHtml += `</span>`;
    }
    document.getElementById('tagsContainer').innerHTML = tagsHtml;
    if (document.getElementById('modifyTags')) setModifyTags();
    packTags();
}

async function search() {
    data.filters.year = document.getElementById('yearSelect').value;
    data.filters.calculator = document.getElementById('calculatorSelect').value;
    data.filters.source = document.getElementById('sourceSelect').value;
    data.filters.type = document.getElementById('typeSelect').value;
    data.filters.mode = document.getElementById('tagsSelect').value;
    data.filters.tags = Array.from(document.querySelectorAll('.positive')).map(checkbox => checkbox.id);
    data.filters.nTags = Array.from(document.querySelectorAll('.negative')).map(checkbox => checkbox.id);

    localStorage.setItem('WACEDB_FILTERS', JSON.stringify(data.filters));

    const allQuestions = data.questionsRaw[data.filters.subject];
    
    data.questions = [];
    allQuestions.forEach(function(question, index) {
        if (data.filters.mode == 'untagged') {
            if (question.tags.length == 0) data.questions.push(allQuestions[index]);
        } else if ((data.filters.year == "all" || JSON.stringify(question.year) == data.filters.year) && (data.filters.source == 'all' || question.source == data.filters.source) && (data.filters.type == 'all' || question.type == data.filters.type || question.soruce == data.filters.type) && (data.filters.calculator == 'all' || (question.calculator == data.filters.calculator)) && !data.filters.nTags.some(tag => question.tags.includes(tag))) {
            if (data.filters.mode == 'and') {
                if (data.filters.tags.every(tag => question.tags.includes(tag))) {
                    data.questions.push(allQuestions[index]);
                }
            } else {
                if (data.filters.tags.length == 0 || data.filters.tags.some(tag => question.tags.includes(tag))) {
                    data.questions.push(allQuestions[index]);
                }
            }
        }
    });

    data.filters.currentPage = 0;
    renderPageResults();
}

function renderPageResults() {
    data.filters.resultsPerPage = parseInt(document.getElementById('lengthSelect').value);
    const start = data.filters.currentPage * data.filters.resultsPerPage;
    const end = Math.min(start + data.filters.resultsPerPage, data.questions.length);

    console.log(start, end);

    localStorage.setItem('WACEDB_FILTERS', JSON.stringify(data.filters));

    let questionsHtml = ``;
    for (let i = start; i < end; i++) {
        let questionTags = `<div class="smallTagsContainer">`;
        for (let j of data.questions[i].tags) {
            questionTags += `<label class="tag"><span class="tagLabel">${j}</span></label>`;
        }
        questionTags += `</div>`;
        questionsHtml += `<div id="result${i}" class="box whiteBackground"><div class="resultTopRow"><button id="button${i}" class="toggleButton" onclick="toggleContent(${i}, true)"><h3 class="alignLeft">${data.questions[i].name}</h3><span class="arrow alignRight">▼</span></button></div><div class="extraContent" id="extraContent${i}">${questionTags}<div id="question${i}" class="questionArea"><img src="questionBank/${data.filters.subject}/${data.questions[i].id}.webp" class="questionImage"></div><div class="verticalSpacer"></div><button class="standardButton" onclick="toggleKey(${i})">Toggle Marking Key</button><div class="horizontalSpacer"></div><a href="pdfDownloads/${data.filters.subject}/${data.questions[i].id}.pdf" download="${data.questions[i].id}.pdf"><button class="standardButton">Download PDF</button></a></div></div>`;
    }
    if (questionsHtml == ``) {
        questionsHtml = `<h3>No Results Found</h3>`;
    }
    document.getElementById('searchResults').innerHTML = questionsHtml;

    if (document.getElementById('activeQuestion')) document.getElementById('activeQuestion').innerHTML = `Select question to modify tags.`;
    data.activeQuestion = null;
    data.activeQuestionNum = null;
    if (document.getElementById('modifyTags')) setModifyTags();

    document.getElementById('totalPagesTop').innerHTML = Math.ceil(data.questions.length / data.filters.resultsPerPage);
    document.getElementById('totalPagesBottom').innerHTML = Math.ceil(data.questions.length / data.filters.resultsPerPage);

    document.getElementById('pageInputTop').value = Math.min(data.filters.currentPage+1, Math.ceil(data.questions.length / data.filters.resultsPerPage)); // if no results, don't say page 1
    document.getElementById('pageInputBottom').value = Math.min(data.filters.currentPage+1, Math.ceil(data.questions.length / data.filters.resultsPerPage));

    document.getElementById('prevPageButtonTop').disabled = data.filters.currentPage <= 0;
    document.getElementById('nextPageButtonTop').disabled = data.filters.currentPage+1 >= Math.ceil(data.questions.length / data.filters.resultsPerPage);
    document.getElementById('prevPageButtonBottom').disabled = data.filters.currentPage <= 0;
    document.getElementById('nextPageButtonBottom').disabled = data.filters.currentPage+1 >= Math.ceil(data.questions.length / data.filters.resultsPerPage);
}

function nextPage() {
    data.filters.currentPage++;
    renderPageResults();
}

function prevPage() {
    data.filters.currentPage--;
    renderPageResults();
}

function goToPage(n) {
    n = Math.min(Math.max(0, n), Math.ceil(data.questions.length / data.filters.resultsPerPage)-1);
    data.filters.currentPage = n;
    renderPageResults();
}

async function toggleKey(id) {
    const imageContainer = document.getElementById(`question${id}`);
    let image = imageContainer.innerHTML;
    image = image.replace('questionBank', '[key]').replace('markingKeys', '[question]');
    image = image.replace('[key]', 'markingKeys').replace('[question]', 'questionBank');
    imageContainer.innerHTML = image;
}

async function load() {
    // check if the page should have a search function
    let path = window.location.pathname;
    path = path.replace(/\/+$/, '');
    if (!(path.endsWith("dev") || path.endsWith("index") || path.endsWith("dev.html") || path.endsWith("index.html") || path === "/" || path === "")) {
        return false;
    } 
    console.info('Loading Search...');

    // load json data
    data.questionsRaw = await loadJson('questions');
    data.tagsV2 = await loadJson('tagsV2');

    console.log('tab duplicated?', document.getElementById('isDuplicated').value);
    let shouldSearch = false;
    let savedSettings = JSON.parse(localStorage.getItem('WACEDB_FILTERS'));

    if (savedSettings) data.filters.disclaimerRemoved = savedSettings.disclaimerRemoved;
    if (document.getElementById('isDuplicated').value == 'yes') {
        // set filters if the page was duplicated
        data.filters.subject = document.getElementById('subjectSelect').value;
        data.filters.year = document.getElementById('yearSelect').value;
        data.filters.calculator = document.getElementById('calculatorSelect').value;
        data.filters.source = document.getElementById('sourceSelect').value;
        data.filters.type = document.getElementById('typeSelect').value;
        data.filters.mode = document.getElementById('tagsSelect').value;
        data.filters.resultsPerPage = document.getElementById('lengthSelect').value;
        data.filters.currentPage = document.getElementById('pageInputTop').value;
        shouldSearch = true;
    } else {
        // load settings from localhost
        if (savedSettings) {
            data.filters = savedSettings;
            document.getElementById('subjectSelect').value = data.filters.subject;
            document.getElementById('yearSelect').value = data.filters.year;
            document.getElementById('calculatorSelect').value = data.filters.calculator;
            document.getElementById('sourceSelect').value = data.filters.source;
            document.getElementById('typeSelect').value = data.filters.type;
            document.getElementById('tagsSelect').value = data.filters.mode;
            document.getElementById('lengthSelect').value = data.filters.resultsPerPage;
            document.getElementById('pageInputTop').value = data.filters.currentPage;
            document.getElementById('pageInputBottom').value = data.filters.currentPage;
            shouldSearch = true;
        }
        document.getElementById('isDuplicated').value = 'yes';
    }
    

    // create the tags for the search
    setTags();
    document.querySelectorAll('.checkbox').forEach(checkbox => {
        if (data.filters.tags.includes(checkbox.id)) {
            checkbox.classList.add('positive');
            checkbox.innerHTML = '<svg id="i-checkmark" viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10.9375%"><path d="M2 20 L12 28 30 4" /></svg>';
        }
        if (data.filters.nTags.includes(checkbox.id)) {
            checkbox.classList.add('negative');
            checkbox.innerHTML = '<svg id="i-close" viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10.9375%"><path d="M2 30 L30 2 M30 30 L2 2" /></svg>';
        }
    });
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('checkbox')) {
            if (event.target.classList.contains('positive')) {
                event.target.classList.remove('positive');
                event.target.classList.add('negative');
                event.target.innerHTML = '<svg id="i-close" viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10.9375%"><path d="M2 30 L30 2 M30 30 L2 2" /></svg>';
            } else if (event.target.classList.contains('negative')) {
                event.target.classList.remove('negative');
                event.target.innerHTML = '';
            } else {
                event.target.classList.add('positive');
                event.target.innerHTML = '<svg id="i-checkmark" viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10.9375%"><path d="M2 20 L12 28 30 4" /></svg>';
            }
        }
    });
    
    for (let tag of data.filters.tags) {
        console.log(tag);
        if (document.getElementById(tag)) {
            document.getElementById(tag).classList.add('.positive');
            document.getElementById(tag).innerHTML = '<svg id="i-checkmark" viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10.9375%"><path d="M2 20 L12 28 30 4" /></svg>';
        }
    }
    for (let tag of data.filters.nTags) {
        console.log(tag);
        if (document.getElementById(tag)) {
            document.getElementById(tag).classList.add('.negative');
            document.getElementById(tag).innerHTML = '<svg id="i-close" viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10.9375%"><path d="M2 30 L30 2 M30 30 L2 2" /></svg>';
        }
    }

    // Check if should search
    const { subject, year, questionNum } = getSearchParameters();
    if (subject) {
        console.log(subject, year, questionNum);
        data.filters.subject = subject;
        if (year) data.filters.year = year;
        else data.filters.year = 'all';
        document.getElementById('subjectSelect').value = subject;
        if (year) document.getElementById('yearSelect').value = year;
        else document.getElementById('yearSelect').value = 'all';

        const allQuestions = data.questionsRaw[subject];
        data.questions = [];
        allQuestions.forEach(function(question, index) {
            if ((!year || question.year == year) && (!questionNum || parseInt((question.id.match(/\d+$/) || [null])[0], 10) == questionNum)) data.questions.push(allQuestions[index]);
        });

        data.filters.currentPage = 0;
        renderPageResults();
        try {
            toggleContent(0, true);
        } catch (error) {
            console.error("Question does not exist!");
        }
    } else if (shouldSearch) {
        let page = data.filters.currentPage;
        search();
        goToPage(page);
        return false;
    } else return true;
    
}

async function createPullRequest() {
    let jsonData = data.questionsRaw;

    // Get the GitHub token from the input
    const token = document.getElementById('githubToken').value;

    if (!token) {
        alert('Please enter your GitHub token.');
        return;
    }

    if (!data.unsavedChanges) {
        alert('You have not made any changes.');
        return;
    }

    // Your GitHub repository details
    const repoOwner = 'GrimReaper2654';
    const repoName = 'WACE-Database';
    const filePath = 'questions.json';
    const branchName = `update-json-${Date.now()}`;

    const baseBranchUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/branches/main`;
    const refUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`;
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    try {
        // Get base branch SHA
        const baseBranchResponse = await fetch(baseBranchUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const baseBranchData = await baseBranchResponse.json();
        const baseBranchSha = baseBranchData.commit.sha;

        // Check if branch already exists
        const branchesResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/branches`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const branchesData = await branchesResponse.json();
        const branchExists = branchesData.some(branch => branch.name === branchName);

        if (branchExists) {
            alert('Branch already exists');
            return;
        }

        // Create new branch
        const branchResponse = await fetch(refUrl, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ref: `refs/heads/${branchName}`,
                sha: baseBranchSha
            })
        });

        if (!branchResponse.ok) {
            throw new Error('Failed to create a new branch: ' + await branchResponse.text());
        }

        // Fetch the latest file SHA
        const fileResponse = await fetch(getFileUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const fileData = await fileResponse.json();
        const fileSha = fileData.sha;

        // Update file content
        const jsonString = JSON.stringify(jsonData, null, 4);
        const base64Content = btoa(jsonString);

        const updateFileUrl = getFileUrl;
        const updateResponse = await fetch(updateFileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Tagged Questions from Site',
                content: base64Content,
                sha: fileSha,
                branch: branchName
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update the file: ' + await updateResponse.text());
        }

        // Create pull request
        const prUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`;
        const prResponse = await fetch(prUrl, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Tagged Questions from Site',
                head: branchName,
                base: 'main',
                body: 'This pull request adds more tags to questions or fixes existing tags. This message is automatically generated.'
            })
        });

        if (prResponse.ok) {
            alert('Pull request created successfully');
        } else {
            alert('Failed to create pull request: ' + await prResponse.text());
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing the request: ' + error.message);
    }

    data.unsavedChanges = false;
}

function getSearchParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        subject: urlParams.get('subject'),
        year: urlParams.get('year'),
        questionNum: urlParams.get('question')
    };
}

function textSearch() {
    let search = document.getElementById('textSearchBox').value;
    console.log(search);

    const result = {
        subject: null,
        year: null,
        questionNum: null
    };

    const subjects = {
        "meth": ["methods", "meth"],
        "spec": ["specialist", "spec"],
        "apps": ["applications", "apps"],
        "phys": ["physics", "phys"],
        "chem": ["chemistry", "chem"],
        "econs": ["economics", "econs"]
    };

    const maxDistance = 2; 

    function levenshteinDistance(a, b) {
        const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
            }
        }
        return matrix[a.length][b.length];
    }

    function findClosestSubject(word) {
        for (const [subject, variations] of Object.entries(subjects)) {
            for (const variation of variations) {
                if (levenshteinDistance(word, variation) <= maxDistance) {
                    return subject;
                }
            }
        }
        return null;
    }

    // Normalize input and split into words
    const normalizedSearch = search.replace(/([a-zA-Z])(?=\d)|(\d)(?=[a-zA-Z])/g, "$1 $2");
    const words = normalizedSearch.toLowerCase().split(/\s+/);

    words.forEach(word => {
        // Check for year
        if (/^\d{4}$/.test(word)) {
            result.year = parseInt(word);
        }
        // Check for question number
        else if (/^\d+$/.test(word) && parseInt(word) < 100) {
            result.questionNum = parseInt(word);
        }
        // Attempt to match subject with fuzzy matching
        else if (!result.subject) {
            const closestSubject = findClosestSubject(word);
            if (closestSubject) {
                result.subject = closestSubject;
            }
        }
    });

    if (result.subject) {
        const newUrl = `${window.location.origin}?subject=${encodeURIComponent(result.subject)}${result.year? `&year=${encodeURIComponent(result.year)}` : ``}${result.questionNum? `&question=${encodeURIComponent(result.questionNum)}`: ``}`;
        window.location.href = newUrl;
    } else {
        alert("No results found");
    }
}

async function loading() {
    const button = document.getElementById('downloadAllButton');
    let i = 0;
    while (button.innerHTML != 'Download All') {
        i++;
        let loadingBar = '.'.repeat(i % 3 + 1) + ' '.repeat(3 - i % 3);
        button.innerHTML = button.innerHTML.replace('... ', loadingBar).replace('..  ', loadingBar).replace('.   ', loadingBar);
        await sleep(500);
    }
}

async function downloadAll() {
    if (data.questions > 100) alert('This may take a while. Please be patient. A PDF download of the entire database may take several minutes.');
    const button = document.getElementById('downloadAllButton');
    button.innerHTML = 'Downloading... ()';
    button.disabled = true;
    const mergedPdf = await PDFLib.PDFDocument.create();
    let i = 0;
    loading();

    for (const question of data.questions) {
        const path = `./pdfDownloads/${data.filters.subject}/${question.id}.pdf`;

        console.log(`Fetching PDF from: ${path}`);

        const response = await fetch(path);

        if (!response.ok) {
            console.error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
            continue; // Skip this PDF and move to the next one
        }

        const contentType = response.headers.get("content-type");
        console.log(`Content-Type: ${contentType}`);

        if (!contentType || !contentType.includes("pdf")) {
            console.error(`Skipping ${path}, invalid content type: ${contentType}`);
            continue;
        }

        const pdfBytes = await response.arrayBuffer();
        
        if (pdfBytes.byteLength === 0) {
            console.error(`Skipping ${path}, empty PDF file.`);
            continue;
        }

        try {
            const pdf = await PDFLib.PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));

            i++;
            button.innerHTML = button.innerHTML.replace(/\(.*?\)/g, `(${i}/${data.questions.length})`);
        } catch (err) {
            console.error(`Error parsing ${path}:`, err);
            continue;
        }
    }
    
    const mergedPdfBytes = await mergedPdf.save();

    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.filters.subject} practice questions - WACE Database.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    button.innerHTML = 'Download All';
    button.disabled = false;
}

function removeDisclaimer(a) {
    if (!a) alert('This website is not affiliated with the School Curriculum and Standards Authority (SCSA) or the Government of Western Australia. The questions in the database are all owned SCSA.');
    const disclaimerElement = document.getElementById('footer');
    if (disclaimerElement) {
        disclaimerElement.remove();
    }
    data.filters.disclaimerRemoved = true;
    localStorage.setItem('WACEDB_FILTERS', JSON.stringify(data.filters));
}

// Infinite Revision Scripts
function rand(p) {
    return Math.random() < p;
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randchoice(arr) {
    const i = Math.floor(Math.random() * arr.length);
    return arr[i];
}

function hasFactor(a, b) {
    function gcd(x, y) {
        while (y !== 0) {
            [x, y] = [y, x % y];
        }
        return x;
    }
    return gcd(a, b) > 1;
}

async function newQuestion(category) {
    const question = document.getElementById(`Question${category}`);
    let questionContent = ``;
    let answerContent = ``;
    switch (category) {
        case "CombustionAnalysis": {
            // formula order CHNOS
            const chemData = await loadJson('chemistryData');
            let questionIntro = 'A scientist wishes to determine the emperical and molecular formula of a ';
            let formula = null;
            if (rand(0.33)) {
                formula = randchoice(chemData.homologusSeries);
                n = randint(2, 8);
                for (let element in formula) {
                    formula[element] = eval(formula[element].replace('n', n));
                }
                if (formula.O) questionIntro += 'functionalized ';
                questionIntro += 'hydrocarbon. ';
            } else {
                questionIntro += 'organic compound containing ';
                formula = randchoice(chemData.combustionAnalysisCompounds)
                Object.keys(formula).forEach(key => {
                    switch (key) {
                        case "C":
                            questionIntro += 'carbon';
                            break;
                        case 'H':
                            questionIntro += 'hydrogen';
                            break;
                        case 'N':
                            questionIntro += 'nitrogen';
                            break;
                        case 'O':
                            questionIntro += 'oxygen';
                            break;
                        case 'S':
                            questionIntro += 'sulfur';
                            break;
                        default:
                            console.warn('Unknown element');
                    }
                    questionIntro += ', ';
                });
                questionIntro = questionIntro.replace(/(.*), (.*)/, '$1.$2').replace(/(.*),(.*)/, '$1 and$2');
            }
            
            let steps = 1;

            questionContent = `<p>${questionIntro}</p>`;


            break;
        }
        case "CompletingSquare": {
            let primes = [2, 3, 5, 7, 11, 13];
            let ans = [randchoice(['-', '']), randint(1, 13), randchoice([0,0,1,1,2,3]), randchoice(primes), randchoice([1,1,1,1,2,3])]; 

            if (!ans[2]) ans[3] = randint(1, 13);
            else if (ans[3] > 5) ans[2] = 1; // Don't make numbers too big
            while (ans[1] == ans[3]) ans[1] = randint(1, 13);

            let displayQuestion = `${ans[4] > 1? ans[4] : ``}<span class="var">x</span><sup>2</sup> + ${ans[2]? (2 * ans[1] * ans[4] * (ans[0]? -1 : 1)) : (2 * ans[1] * ans[4] * (ans[0]? -1 : 1))}<span class="var">x</span> + ${ans[2]? ((ans[1]**2 - ans[3] * ans[2]**2) * ans[4]) : ((ans[1]**2 - ans[3]**2) * ans[4])} = 0`.replace(/\+ -/g, "– ").replace(/-/g, "– ");
            let displayAns = `${ans[4] > 1? ans[4] : ``}(<span class="var">x</span> ${ans[0] == ''? '+' : '–'} ${ans[2]? `${ans[1]} + ${ans[2] > 1? ans[2] : ``}<span class="sqrt">√</span><span class="root">${ans[3]}</span>` : ans[1] + ans[3]})(<span class="var">x</span> ${ans[0] == ''? '+' : '–'} ${ans[2]? `${ans[1]} – ${ans[2] > 1? ans[2] : ``}<span class="sqrt">√</span><span class="root">${ans[3]}</span>`: ans[1] - ans[3]}) = 0`.replace(/\+ -/g, "– ").replace(/-/g, "– ").replace(/– –/g, "+ ").replace(/  /g, " ");
            questionContent = `<p>Factorise and solve for x: <span class="math">${displayQuestion}</span></p>`;
            answerContent = `<p><span class="math">`;
            if (ans[4] > 1) {
                answerContent += `${ans[4]}(<span class="var">x</span><sup>2</sup> + ${ans[2]? (2 * ans[1] * (ans[0]? -1 : 1)) : (2 * ans[1] * (ans[0]? -1 : 1))}<span class="var">x</span> + ${ans[2]? ((ans[1]**2 - ans[3] * ans[2]**2)) : ((ans[1]**2 - ans[3]**2))}) = 0<br>`.replace(/\+ -/g, "– ");
                answerContent += `<span class="var">x</span><sup>2</sup> + ${ans[2]? (2 * ans[1] * (ans[0]? -1 : 1)) : (2 * ans[1] * (ans[0]? -1 : 1))}<span class="var">x</span> + ${ans[2]? ((ans[1]**2 - ans[3] * ans[2]**2)) : ((ans[1]**2 - ans[3]**2))} = 0<br>`.replace(/\+ -/g, "– ");
            }
            answerContent += `(<span class="var">x</span> + ${(ans[2]? (2 * ans[1] * (ans[0]? -1 : 1)) : (2 * ans[1] * (ans[0]? -1 : 1))) / 2})<sup>2</sup> - ${((ans[2]? (2 * ans[1] * (ans[0]? -1 : 1)) : (2 * ans[1] * (ans[0]? -1 : 1))) / 2)**2} + ${ans[2]? ((ans[1]**2 - ans[3] * ans[2]**2)) : ((ans[1]**2 - ans[3]**2))} = 0<br>`.replace(/\+ -/g, "– ").replace(/-/g, "– ");
            answerContent += `(<span class="var">x</span> + ${(ans[2]? (2 * ans[1] * (ans[0]? -1 : 1)) : (2 * ans[1] * (ans[0]? -1 : 1))) / 2})<sup>2</sup> = ${((ans[2]? (2 * ans[1] * (ans[0]? -1 : 1)) : (2 * ans[1] * (ans[0]? -1 : 1))) / 2)**2 - (ans[2]? ((ans[1]**2 - ans[3] * ans[2]**2)) : ((ans[1]**2 - ans[3]**2)))}<br>`.replace(/\+ -/g, "– ").replace(/-/g, "– ");
            answerContent += `<span class="var">x</span> + ${(ans[2]? (2 * ans[1] * (ans[0]? -1 : 1)) : (2 * ans[1] * (ans[0]? -1 : 1))) / 2} = ± <span class="sqrt">√</span><span class="root">${((ans[2]? (2 * ans[1] * (ans[0]? -1 : 1)) : (2 * ans[1] * (ans[0]? -1 : 1))) / 2)**2 - (ans[2]? ((ans[1]**2 - ans[3] * ans[2]**2)) : ((ans[1]**2 - ans[3]**2)))}</span><br>`.replace(/\+ -/g, "– ").replace(/-/g, "– ");
            answerContent += `<span class="var">x</span> = ${ans[0] == ''? `–`: ``} ${ans[1]} ± ${ans[2] > 1? ans[2] : ``}${ans[2]? `<span class="sqrt">√</span><span class="root">` : ``}${ans[3]}${ans[2]? `</span>` : ``}<br>`.replace(/\+ -/g, "– ").replace(/-/g, "– ");
            answerContent += `${displayAns}</span></p>`;
            break;
        }
        case "Factorise": {
            let ans = [randchoice([1,1,1,2,3,4]), randchoice(['-', '+']), randint(1, 13), randchoice([1,1,1,2,3,4]), randchoice(['-', '+']), randint(1, 13)]; 

            while (ans[2] == ans[5] || hasFactor(ans[0], ans[2]) || hasFactor(ans[3], ans[5])) {
                ans[2] = randint(1, 13);
                ans[5] = randint(1, 13);
            }
            let displayQuestion = `${ans[0]*ans[3] > 1? ans[0]*ans[3] : ``}<span class="var">x</span><sup>2</sup> + ${ans[0] * ans[5] * (ans[4] == '-'? -1 : 1) + ans[3] * ans[2] * (ans[1] == '-'? -1 : 1)}<span class="var">x</span> + ${ans[5] * ans[2] * (ans[4] == '-'? -1 : 1) * (ans[1] == '-'? -1 : 1)}`.replace(/\+ -/g, "– ");
            let displayAns = `(${ans[0] > 1? ans[0] : ``}<span class="var">x</span> ${ans[1]} ${ans[2]})(${ans[3] > 1? ans[3] : ``}<span class="var">x</span> ${ans[4]} ${ans[5]})`.replace(/-/g, "– ");

            questionContent = `<p>Factorise: <span class="math">${displayQuestion}</span></p>`;
            answerContent += `<p><span class="math">${displayAns}</span></p>`;
            break;
        }
        case "SolveCubic": {
            let primes = [2, 3, 5, 7, 11, 13];
            let firstTerm = [randchoice(['–', '+']), randchoice([1,1,1,2,2,3]), rand(0.5)]; 
            let ans = firstTerm[2]? [randchoice(['-', '']), randint(1, 13), randchoice([0,0,1,1,2,3]), randchoice(primes), randchoice([1,1,1,1,2,3])] : [randchoice([1,1,1,2,3,4]), randchoice(['-', '+']), randint(1, 13), randchoice([1,1,1,2,3,4]), randchoice(['-', '+']), randint(1, 13)];
            
            if (firstTerm[2]) {
                if (!ans[2]) ans[3] = randint(1, 13);
                else if (ans[3] > 5) ans[2] = 1; // Don't make numbers too big
                while (ans[1] == ans[3]) ans[1] = randint(1, 13);
            } else {
                while (ans[2] == ans[5] || hasFactor(ans[0], ans[2]) || hasFactor(ans[3], ans[5])) {
                    ans[2] = randint(1, 13);
                    ans[5] = randint(1, 13);
                }
            }

            // (x + [0])([1]x^2 + [2]x + [3])
            let intermediates = [
                (firstTerm[0] == '–'? -1 : 1) * firstTerm[1],
                firstTerm[2]? ans[4] : ans[0]*ans[3],
                firstTerm[2]? ans[2]? (2 * ans[1] * ans[4] * (ans[0]? -1 : 1)) : (2 * ans[1] * ans[4] * (ans[0]? -1 : 1)) : ans[0] * ans[5] * (ans[4] == '-'? -1 : 1) + ans[3] * ans[2] * (ans[1] == '-'? -1 : 1),
                firstTerm[2]? ans[2]? ((ans[1]**2 - ans[3] * ans[2]**2) * ans[4]) : ((ans[1]**2 - ans[3]**2) * ans[4]) : ans[5] * ans[2] * (ans[4] == '-'? -1 : 1) * (ans[1] == '-'? -1 : 1)
            ];

            // [0]x^3 + [1]x^2 + [2]x + [3]
            let cubic = [
                intermediates[1],
                intermediates[2] + intermediates[0] * intermediates[1],
                intermediates[3] + intermediates[0] * intermediates[2],
                intermediates[0] * intermediates[3]
            ];

            let displayQuestion = `${cubic[0] != 1? cubic[0] : ``}<span class="var">x</span><sup>3</sup>`;
            if (cubic[1]) displayQuestion += ` + ${cubic[1] != 1? cubic[1] : ``}<span class="var">x</span><sup>2</sup>`;
            if (cubic[2]) displayQuestion += ` + ${cubic[2] != 1? cubic[2] : ``}<span class="var">x</span>`;
            if (cubic[3]) displayQuestion += ` + ${cubic[3]}`;
            displayQuestion = displayQuestion.replace(/\+ -/g, "– ");
            let displayAns = `${firstTerm[2] && ans[4] > 1? ans[4] : ``}(<span class="var">x</span> ${firstTerm[0]} ${firstTerm[1]})`
                + (firstTerm[2]? `(<span class="var">x</span> ${ans[0] == ''? '+' : '–'} ${ans[2]? `${ans[1]} + ${ans[2] > 1? ans[2] : ``}<span class="sqrt">√</span><span class="root">${ans[3]}</span>` : ans[1] + ans[3]})(<span class="var">x</span> ${ans[0] == ''? '+' : '–'} ${ans[2]? `${ans[1]} – ${ans[2] > 1? ans[2] : ``}<span class="sqrt">√</span><span class="root">${ans[3]}</span>`: ans[1] - ans[3]})`.replace(/\+ -/g, "– ").replace(/-/g, "– ").replace(/– –/g, "+ ").replace(/  /g, " ")
                : `(${ans[0] > 1? ans[0] : ``}<span class="var">x</span> ${ans[1]} ${ans[2]})(${ans[3] > 1? ans[3] : ``}<span class="var">x</span> ${ans[4]} ${ans[5]})`.replace(/-/g, "– "));

            questionContent = `<p>Factorise: <span class="math"><span class="var">f</span>(<span class="var">x</span>) = ${displayQuestion}</span></p>`;
            answerContent = `<p><span class="math">`;

            let guesses = [1, -1, 2, -2, 3, -3];
            for (let guess of guesses) {
                answerContent += `<span class="var">f</span>(${guess}) = ${cubic[0] * guess**3 + cubic[1] * guess**2 + cubic[2] * guess + cubic[3]}<br>`.replace('-', '–');
                if (cubic[0] * guess**3 + cubic[1] * guess**2 + cubic[2] * guess + cubic[3] == 0) {
                    answerContent += `(<span class="var">x</span> + ${-guess}) is a factor of <span class="var">f</span>(<span class="var">x</span>)<br><br>`.replace('+ -', '– ');
                    break;
                }
            }
            answerContent += `<span class="var">f</span>(<span class="var">x</span>) = (<span class="var">x</span> + ${intermediates[0]})(${intermediates[1] != 1? intermediates[1] : ``}<span class="var">x</span><sup>2</sup> + ${intermediates[2] != 1? intermediates[2] : ``}<span class="var">x</span> + ${intermediates[3] != 1? intermediates[3] : ``})<br><br>`.replace(/\+ -/g, "– ");
            answerContent += `<span class="var">f</span>(<span class="var">x</span>) = ${displayAns}</span></p>`;
            break;
        }
        default:
            console.warn("Not a valid question category!")
            break;
    }
    document.getElementById(`answer${category}`).classList.add('hidden');
    document.getElementById(`question${category}`).innerHTML = questionContent;
    document.getElementById(`answer${category}`).innerHTML = answerContent;
}

function toggleAns(category) {
    let ansElement = document.getElementById(`answer${category}`);
    if (ansElement.classList.contains('hidden')) ansElement.classList.remove('hidden');
    else ansElement.classList.add('hidden');
}

function adjustZoomForOverflow() {
    const body = document.body;
    const html = document.documentElement;

    // Reset zoom to 100% before any calculation
    body.style.zoom = 1;

    // Calculate the maximum width of the body and html elements
    const bodyScrollWidth = body.scrollWidth;
    const htmlScrollWidth = html.scrollWidth;

    // Get the viewport width
    const viewportWidth = window.innerWidth;

    // Find the widest dimension
    const maxWidth = Math.max(bodyScrollWidth, htmlScrollWidth) + 50;

    if (maxWidth > viewportWidth) {
        // Content is wider than viewport, calculate the zoom level
        const zoomLevel = viewportWidth / maxWidth;
        body.style.zoom = zoomLevel;
    }
}

if (window.self !== window.top) {
    window.top.location = window.self.location;
}

window.addEventListener("load", async function() {
    console.log('loading...');
    await load();
    document.getElementById('textSearchBox').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            textSearch();
        }
    });
    if (data.filters.disclaimerRemoved) {
        removeDisclaimer(1);
    }
    for (let i = 0; i < 50; i++) {
        // can't figure out how to wait for load
        await sleep(10);
        adjustZoomForOverflow();
        packTags();
    }
});

window.addEventListener("resize", adjustZoomForOverflow);
