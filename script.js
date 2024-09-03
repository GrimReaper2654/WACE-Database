const data = {
    filters: {
        subject: 'spec',
        year: -1,
        calculator: 'all',
        source: 'all',
        type: 'all',
        mode: 'or',
        tags: [],
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
    unsavedChanges: false,
};

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

function clearFilters() {
    data.filters = {
        subject: data.filters.subject,
        year: -1,
        calculator: 'all',
        source: 'all',
        type: 'all',
        mode: 'or',
        tags: [],
    }

    localStorage.setItem('WACEDB_FILTERS', JSON.stringify(data.filters));

    document.getElementById('yearSelect').value = data.filters.year;
    document.getElementById('calculatorSelect').value = data.filters.calculator;
    document.getElementById('sourceSelect').value = data.filters.source;
    document.getElementById('typeSelect').value = data.filters.type;
    document.getElementById('tagsSelect').value = data.filters.mode;

    document.querySelectorAll('.tagSelect').forEach(checkbox => {
        checkbox.checked = data.filters.tags.includes(checkbox.id);
    });

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
        extraContent.classList.add("isActive");
        button.classList.add("active");
    } else {
        if (isQuestion) {
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

function updateTags(id, state) {
    const tagId = id.replace('Modify', '');
    let tagsList = null;
    for (let question of data.questionsRaw[data.filters.subject]) {
        if (question.id == data.activeQuestion) tagsList = question.tags;
    }
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

                if (x + nextElement.offsetWidth * 2 + margin > window.innerWidth * 0.95) { // This does not actually work, just is pretty close
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

    container.style.width = `${(maxX - minX + 10)}px`;
    container.style.height = `${(maxY - minY + 10)}px`;
    if ((maxX - minX + 10) > document.getElementById('search').offsetWidth) container.classList.add('centred');
    else container.classList.remove('centred');
}

async function setTags() {
    const tagsList = data.tagsV2[data.filters.subject];
    let tagsHtml = ``;
    for (const [tagGroup, subTags] of Object.entries(tagsList)) {
        tagsHtml += `<label class="tag"><input type="checkbox" id="${tagGroup}" class="tagSelect"><span class="tagLabel">${tagGroup}</span>`;
        if (subTags.length > 0) {
            tagsHtml += `<button id="button${tagGroup}" class="toggleButton" onclick="toggleContent('${tagGroup}')"><span class="arrow">▼</span></button><div class="extraContent" id="extraContent${tagGroup}">`;
            for (let subTag of subTags) {
                tagsHtml += `<label class="tag"><input type="checkbox" id="${subTag}" class="tagSelect"><span class="tagLabel">${subTag}</span></label><br>`;
            }
            tagsHtml += `</div>`;
        }
        tagsHtml += `</label>`;
    }
    document.getElementById('tagsContainer').innerHTML = tagsHtml;
    packTags();

    if (document.getElementById('modifyTags')) setModifyTags();
}

async function search() {
    data.filters.year = document.getElementById('yearSelect').value;
    data.filters.calculator = document.getElementById('calculatorSelect').value;
    data.filters.source = document.getElementById('sourceSelect').value;
    data.filters.type = document.getElementById('typeSelect').value;
    data.filters.mode = document.getElementById('tagsSelect').value;
    data.filters.tags = Array.from(document.querySelectorAll('.tagSelect:checked')).map(checkbox => checkbox.id);

    localStorage.setItem('WACEDB_FILTERS', JSON.stringify(data.filters));

    const allQuestions = data.questionsRaw[data.filters.subject];
    
    data.questions = [];
    allQuestions.forEach(function(question, index) {
        if ((data.filters.year == -1 || question.year == data.filters.year) && (data.filters.source == 'all' || question.source == data.filters.source) && (data.filters.type == 'all' || question.type == data.filters.type) && (data.filters.calculator == 'all' || (question.calculator == data.filters.calculator))) {
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
    
    let questionsHtml = ``;
    for (let i in data.questions) {
        let questionTags = `<div class="smallTagsContainer">`;
        for (let j of data.questions[i].tags) {
            questionTags += `<label class="tag"><span class="tagLabel">${j}</span></label>`;
        }
        questionTags += `</div>`;
        questionsHtml += `<div id="result${i}" class="box whiteBackground"><div class="resultTopRow"><button id="button${i}" class="toggleButton" onclick="toggleContent(${i}, true)"><h3 class="alignLeft">${data.questions[i].name}</h3><span class="arrow alignRight">▼</span></button></div><div class="extraContent" id="extraContent${i}">${questionTags}<div id="question${i}" class="questionArea"><img src="questionBank/${data.filters.subject}/${data.questions[i].id}.webp" class="questionImage"></div><div class="verticalSpacer"></div><button class="standardButton" onclick="toggleKey(${i})">Toggle Marking Key</button><div class="horizontalSpacer"></div><a href="pdfDownloads/${data.filters.subject}/${data.questions[i].id}.pdf" download="${data.questions[i].id}.pdf"><button class="standardButton">Download PDF</button></a></div></div>`;
    }
    if (questionsHtml == ``) questionsHtml = `<h3>No Results Found</h3>`;
    document.getElementById('searchResults').innerHTML = questionsHtml;

    if (document.getElementById('activeQuestion')) document.getElementById('activeQuestion').innerHTML = `Select question to modify tags.`;
    data.activeQuestion = null;
    data.activeQuestionNum = null;
    if (document.getElementById('modifyTags')) setModifyTags();;
}

async function toggleKey(id) {
    const imageContainer = document.getElementById(`question${id}`);
    let image = imageContainer.innerHTML;
    image = image.replace('questionBank', '[key]').replace('markingKeys', '[question]');
    image = image.replace('[key]', 'markingKeys').replace('[question]', 'questionBank');
    imageContainer.innerHTML = image;
}

async function load() {
    let path = window.location.pathname;
    path = path.replace(/\/+$/, '');
    if (!(path.endsWith("dev") || path.endsWith("index") || path.endsWith("dev.html") || path.endsWith("index.html") || path === "/" || path === "")) {
        return;
    } 
    console.info('Loading Search...');

    // load json data
    data.questionsRaw = await loadJson('questions');
    data.tagsV2 = await loadJson('tagsV2');

    // set filters if the page was duplicated
    data.filters.subject = document.getElementById('subjectSelect').value;
    data.filters.year = document.getElementById('yearSelect').value;
    data.filters.calculator = document.getElementById('calculatorSelect').value;
    data.filters.source = document.getElementById('sourceSelect').value;
    data.filters.type = document.getElementById('typeSelect').value;
    data.filters.mode = document.getElementById('tagsSelect').value;
    data.filters.tags = Array.from(document.querySelectorAll('.tagSelect:checked')).map(checkbox => checkbox.id);

    // create the tags for the search
    setTags();

    // load settings from localhost
    let savedSettings = localStorage.getItem('WACEDB_FILTERS');
    if (savedSettings) {
        data.filters = JSON.parse(savedSettings);
        document.getElementById('subjectSelect').value = data.filters.subject;
        document.getElementById('yearSelect').value = data.filters.year;
        document.getElementById('calculatorSelect').value = data.filters.calculator;
        document.getElementById('sourceSelect').value = data.filters.source;
        document.getElementById('typeSelect').value = data.filters.type;
        document.getElementById('tagsSelect').value = data.filters.mode;

        document.querySelectorAll('.tagSelect').forEach(checkbox => {
            checkbox.checked = data.filters.tags.includes(checkbox.id);
        });
    }
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

window.addEventListener("load", function() {
    console.log('loading...');
    load();
});
