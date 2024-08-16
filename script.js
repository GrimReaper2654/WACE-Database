// Get search Settings
const data = {
    settings: {
        subject: 'spec',
        tags: [],
    },
    allQuestions: [],
}
let savedSettings = localStorage.getItem('WaceDatabaseSearchSettings');
if (savedSettings) data.settings = JSON.parse(savedSettings);

