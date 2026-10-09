const sourceLanguage = document.querySelector('#source-language');
const targetLanguage = document.querySelector('#target-language');
const inputText = document.querySelector('#input-text');
const resultText = document.querySelector('#result-text');
const translatorForm = document.querySelector('#translator-form');
const translateButton = document.querySelector('#translate-button');
const copyButton = document.querySelector('#copy-button');
const copyLabel = document.querySelector('#copy-label');
const clearButton = document.querySelector('#clear-button');
const swapButton = document.querySelector('#swap-languages');
const loading = document.querySelector('#loading');
const message = document.querySelector('#message');

const populateLanguageSelects = () => {
    const options = Object.entries(countries).map(([code, name]) => `<option value="${code}">${name}</option>`);

    sourceLanguage.innerHTML = options.join('');
    targetLanguage.innerHTML = options.join('');

    sourceLanguage.value = 'en-GB';
    targetLanguage.value = 'ar-SA';
};

const showMessage = (text, type) => {
    message.textContent = text;
    message.className = `alert alert-${type}`;
};

const hideMessage = () => {
    message.textContent = '';
    message.className = 'alert d-none';
};

const showLoading = () => {
    loading.classList.remove('d-none');
    loading.classList.add('d-flex');
    translateButton.disabled = true;
};

const hideLoading = () => {
    loading.classList.add('d-none');
    loading.classList.remove('d-flex');
    translateButton.disabled = false;
};

const validateInput = (text, source, target) => {
    if (!text) {
        return 'Please enter text to translate.';
    }

    if (source === target) {
        return 'Please select two different languages.';
    }

    return '';
};

const translateText = async (event) => {
    event.preventDefault();

    const text = inputText.value.trim();
    const source = sourceLanguage.value;
    const target = targetLanguage.value;

    const validationMessage = validateInput(text, source, target);

    if (validationMessage) {
        resultText.value = '';
        showMessage(validationMessage, 'warning');
        return;
    }

    hideMessage();
    showLoading();

    const params = new URLSearchParams({
        q: text,
        langpair: `${source}|${target}`
    });

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
        const data = await response.json();
        const translation = data?.responseData?.translatedText;

        if (!response.ok || !translation) {
            throw new Error('No translation in the response');
        }

        resultText.value = translation;
    } catch {
        resultText.value = '';
        showMessage('Unable to translate the text. Please try again.', 'danger');
    } finally {
        hideLoading();
    }
};

const swapLanguages = () => {
    const source = sourceLanguage.value;
    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = source;

    if (resultText.value.trim() !== '') {
        const text = inputText.value;
        inputText.value = resultText.value;
        resultText.value = text;
    }

    hideMessage();
};

const copyTranslation = async () => {
    if (!resultText.value.trim()) {
        showMessage('There is no translation to copy.', 'warning');
        return;
    }

    try {
        await navigator.clipboard.writeText(resultText.value);

        copyLabel.textContent = 'Copied!';
        setTimeout(() => {
            copyLabel.textContent = 'Copy';
        }, 1500);
    } catch {
        showMessage('Unable to copy the translation. Please copy it manually.', 'danger');
    }
};

const clearTranslator = () => {
    inputText.value = '';
    resultText.value = '';
    hideMessage();
    inputText.focus();
};

populateLanguageSelects();

translatorForm.addEventListener('submit', translateText);
swapButton.addEventListener('click', swapLanguages);
copyButton.addEventListener('click', copyTranslation);
clearButton.addEventListener('click', clearTranslator);
