/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Modality } from '@google/genai';

// --- DOM Element Selection ---
const colorizeButton = document.getElementById('colorize-button') as HTMLButtonElement;
const removeButton = document.getElementById('remove-button') as HTMLButtonElement;
const removePeopleButton = document.getElementById('remove-people-button') as HTMLButtonElement;
const removeBackgroundButton = document.getElementById('remove-background-button') as HTMLButtonElement;
const changeBackgroundButton = document.getElementById('change-background-button') as HTMLButtonElement;
const editClothingButton = document.getElementById('edit-clothing-button') as HTMLButtonElement;
const styleTransferButton = document.getElementById('style-transfer-button') as HTMLButtonElement;
const timeTravelButton = document.getElementById('time-travel-button') as HTMLButtonElement;
const generateImageButton = document.getElementById('generate-image-button') as HTMLButtonElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const resetButton = document.getElementById('reset-button') as HTMLButtonElement;
const downloadButton = document.getElementById('download-button') as HTMLButtonElement;
const slider = document.getElementById('slider') as HTMLInputElement;

const uploadScreen = document.getElementById('upload-screen') as HTMLDivElement;
const loadingScreen = document.getElementById('loading-screen') as HTMLDivElement;
const resultScreen = document.getElementById('result-screen') as HTMLDivElement;
const maskingScreen = document.getElementById('masking-screen') as HTMLDivElement;
const clothingScreen = document.getElementById('clothing-screen') as HTMLDivElement;
const backgroundScreen = document.getElementById('background-screen') as HTMLDivElement;
const styleTransferScreen = document.getElementById('style-transfer-screen') as HTMLDivElement;
const timeTravelScreen = document.getElementById('time-travel-screen') as HTMLDivElement;
const generationScreen = document.getElementById('generation-screen') as HTMLDivElement;
const toolPageScreen = document.getElementById('tool-page-screen') as HTMLDivElement;
const featureGrid = document.querySelector('.feature-grid') as HTMLDivElement;

const toolPageTitle = document.getElementById('tool-page-title') as HTMLHeadingElement;
const toolPageDescription = document.getElementById('tool-page-description') as HTMLParagraphElement;
const toolPageUploadButton = document.getElementById('tool-page-upload-button') as HTMLButtonElement;
const toolPageBackButton = document.getElementById('tool-page-back-button') as HTMLButtonElement;

const originalImage = document.getElementById('original-image') as HTMLImageElement;
const resultImage = document.getElementById('result-image') as HTMLImageElement;
const comparisonImageContainer = document.querySelector('.comparison-image') as HTMLDivElement;

// Masking UI
const maskingImage = document.getElementById('masking-image') as HTMLImageElement;
const maskingCanvas = document.getElementById('masking-canvas') as HTMLCanvasElement;
const brushSizeSlider = document.getElementById('brush-size') as HTMLInputElement;
const undoButton = document.getElementById('undo-button') as HTMLButtonElement;
const clearButton = document.getElementById('clear-button') as HTMLButtonElement;
const processRemoveButton = document.getElementById('process-remove-button') as HTMLButtonElement;
const cancelMaskingButton = document.getElementById('cancel-masking-button') as HTMLButtonElement;

// Clothing UI
const clothingImage = document.getElementById('clothing-image') as HTMLImageElement;
const clothingPrompt = document.getElementById('clothing-prompt') as HTMLInputElement;
const processClothingButton = document.getElementById('process-clothing-button') as HTMLButtonElement;
const cancelClothingButton = document.getElementById('cancel-clothing-button') as HTMLButtonElement;

// Background UI
const backgroundImage = document.getElementById('background-image') as HTMLImageElement;
const backgroundPrompt = document.getElementById('background-prompt') as HTMLInputElement;
const processBackgroundButton = document.getElementById('process-background-button') as HTMLButtonElement;
const cancelBackgroundButton = document.getElementById('cancel-background-button') as HTMLButtonElement;

// Style Transfer UI
const styleTransferImage = document.getElementById('style-transfer-image') as HTMLImageElement;
const styleGallery = document.querySelector('.style-gallery') as HTMLDivElement;
const processStyleTransferButton = document.getElementById('process-style-transfer-button') as HTMLButtonElement;
const cancelStyleTransferButton = document.getElementById('cancel-style-transfer-button') as HTMLButtonElement;

// Generation UI
const generationPrompt = document.getElementById('generation-prompt') as HTMLInputElement;
const aspectRatioSelect = document.getElementById('aspect-ratio-select') as HTMLDivElement;
const selectedAspectRatioText = document.getElementById('selected-aspect-ratio-text') as HTMLSpanElement;
const optionsList = aspectRatioSelect.querySelector('.options-list') as HTMLDivElement;
const selectedOption = aspectRatioSelect.querySelector('.selected-option') as HTMLDivElement;
const qualitySelect = document.getElementById('quality-select') as HTMLDivElement;
const selectedQualityText = document.getElementById('selected-quality-text') as HTMLSpanElement;
const qualityOptionsList = qualitySelect.querySelector('.options-list') as HTMLDivElement;
const qualitySelectedOption = qualitySelect.querySelector('.selected-option') as HTMLDivElement;
const processGenerationButton = document.getElementById('process-generation-button') as HTMLButtonElement;
const cancelGenerationButton = document.getElementById('cancel-generation-button') as HTMLButtonElement;

// Time Travel UI
const image1920s = document.getElementById('image-1920s') as HTMLImageElement;
const image1980s = document.getElementById('image-1980s') as HTMLImageElement;
const imageModern = document.getElementById('image-modern') as HTMLImageElement;
const resetTimeTravelButton = document.getElementById('reset-time-travel-button') as HTMLButtonElement;
const timeTravelDownloadButtons = document.querySelectorAll('.download-time-travel');

// Tooltip
const tooltip = document.getElementById('tooltip') as HTMLDivElement;

// --- State Management ---
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  showError('API_KEY is not set in environment variables.');
} else {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

let currentMode: 'colorize' | 'remove' | 'remove-people' | 'edit-clothing' | 'time-travel' | 'remove-background' | 'change-background' | 'generate-image' | 'style-transfer' | null = null;
let originalFile: File | null = null;
let animationEndHandler: (() => void) | null = null;
let selectedStyle: string | null = null;


// Canvas state
const ctx = maskingCanvas.getContext('2d', { willReadFrequently: true })!;
let isDrawing = false;
let drawingHistory: ImageData[] = [];

// --- UI Logic ---
function showScreen(screen: 'upload' | 'loading' | 'result' | 'masking' | 'clothing' | 'time-travel' | 'background' | 'generation' | 'tool-page' | 'style-transfer') {
  uploadScreen.hidden = screen !== 'upload';
  loadingScreen.hidden = screen !== 'loading';
  resultScreen.hidden = screen !== 'result';
  maskingScreen.hidden = screen !== 'masking';
  clothingScreen.hidden = screen !== 'clothing';
  backgroundScreen.hidden = screen !== 'background';
  styleTransferScreen.hidden = screen !== 'style-transfer';
  timeTravelScreen.hidden = screen !== 'time-travel';
  generationScreen.hidden = screen !== 'generation';
  toolPageScreen.hidden = screen !== 'tool-page';
}

function showToolPage(title: string, description: string, mode: typeof currentMode) {
    currentMode = mode;
    toolPageTitle.textContent = title;
    toolPageDescription.textContent = description;
    showScreen('tool-page');
}

function showError(message: string) {
  console.error(message);
  alert(`Error: ${message}`);
  showScreen('upload');
}

// --- Event Listeners ---
colorizeButton.addEventListener('click', () => {
    showToolPage(
        'Colorize Photo',
        'Breathe new life into your black and white memories. Our AI will intelligently add realistic and vibrant colors to your images. Upload a photo to begin.',
        'colorize'
    );
});
removeButton.addEventListener('click', () => {
    showToolPage(
        'Remove Object',
        'Erase unwanted objects, people, or blemishes from any picture. Simply upload your image to start masking the area you want to remove.',
        'remove'
    );
});
removePeopleButton.addEventListener('click', () => {
    showToolPage(
        'Remove People',
        'Automatically detect and remove all people from an image, leaving a clean, empty scene. Upload a photo with people to see the magic.',
        'remove-people'
    );
});
removeBackgroundButton.addEventListener('click', () => {
    showToolPage(
        'Remove Background',
        'Instantly isolate the main subject of your photo by making the background transparent. Perfect for creating profile pictures, product shots, and more.',
        'remove-background'
    );
});
changeBackgroundButton.addEventListener('click', () => {
    showToolPage(
        'Change Background',
        'Transport your subject to a completely new environment. Upload a photo and then describe the new background you want to generate.',
        'change-background'
    );
});
editClothingButton.addEventListener('click', () => {
    showToolPage(
        'Edit Clothing',
        'Digitally alter or completely change outfits in your photos. Upload an image and describe the clothing modifications you want to make.',
        'edit-clothing'
    );
});
styleTransferButton.addEventListener('click', () => {
    showToolPage(
        'Artistic Style',
        'Redraw your photo in a different artistic style. Choose from styles like Pixar, Anime, Cyberpunk, and more. Upload a photo to begin.',
        'style-transfer'
    );
});
timeTravelButton.addEventListener('click', () => {
    showToolPage(
        'Time Travel Filter',
        'See your photos in a new light by applying iconic styles from different eras. The AI will generate versions of your image in 1920s, 1980s, and modern HDR styles.',
        'time-travel'
    );
});
generateImageButton.addEventListener('click', () => {
    currentMode = 'generate-image';
    showScreen('generation');
});
fileInput.addEventListener('change', handleFileSelect);
resetButton.addEventListener('click', resetApp);
downloadButton.addEventListener('click', handleDownload);
slider.addEventListener('input', handleSliderChange);

// Tool Page Listeners
toolPageUploadButton.addEventListener('click', () => fileInput.click());
toolPageBackButton.addEventListener('click', () => showScreen('upload'));


// Masking Listeners
processRemoveButton.addEventListener('click', handleObjectRemoval);
cancelMaskingButton.addEventListener('click', resetApp);
clearButton.addEventListener('click', clearMask);
undoButton.addEventListener('click', undoLastStroke);
maskingCanvas.addEventListener('mousedown', startDrawing);
maskingCanvas.addEventListener('mousemove', draw);
maskingCanvas.addEventListener('mouseup', stopDrawing);
maskingCanvas.addEventListener('mouseleave', stopDrawing);
maskingCanvas.addEventListener('touchstart', startDrawing, { passive: false });
maskingCanvas.addEventListener('touchmove', draw, { passive: false });
maskingCanvas.addEventListener('touchend', stopDrawing);

// Clothing Listeners
processClothingButton.addEventListener('click', handleClothingEdit);
cancelClothingButton.addEventListener('click', resetApp);

// Background Listeners
processBackgroundButton.addEventListener('click', handleBackgroundChange);
cancelBackgroundButton.addEventListener('click', resetApp);

// Style Transfer Listeners
cancelStyleTransferButton.addEventListener('click', resetApp);
processStyleTransferButton.addEventListener('click', handleStyleTransfer);
styleGallery.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const styleCard = target.closest('.style-card');

    if (!styleCard) return;

    // Remove selected class from all cards
    styleGallery.querySelectorAll('.style-card').forEach(card => card.classList.remove('selected'));
    
    // Add selected class to the clicked card
    styleCard.classList.add('selected');
    
    // Store the selected style
    selectedStyle = (styleCard as HTMLDivElement).dataset.style || null;

    // Enable the generate button
    processStyleTransferButton.disabled = false;
});


// Generation Listeners
processGenerationButton.addEventListener('click', handleImageGeneration);
cancelGenerationButton.addEventListener('click', resetApp);

// Time Travel Listeners
resetTimeTravelButton.addEventListener('click', resetApp);
timeTravelDownloadButtons.forEach(button => {
    button.addEventListener('click', handleTimeTravelDownload);
});

// --- Custom Aspect Ratio Select Logic ---
// Set initial state for custom select
aspectRatioSelect.dataset.value = '1:1';
optionsList.querySelector('.option[data-value="1:1"]')?.classList.add('selected');

selectedOption.addEventListener('click', () => {
    aspectRatioSelect.classList.toggle('open');
    const isExpanded = selectedOption.getAttribute('aria-expanded') === 'true';
    selectedOption.setAttribute('aria-expanded', String(!isExpanded));
    optionsList.hidden = isExpanded;
});

optionsList.addEventListener('click', (e) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains('option')) {
        const value = target.dataset.value!;
        selectedAspectRatioText.textContent = value;
        aspectRatioSelect.dataset.value = value;

        // Update selected class
        optionsList.querySelector('.option.selected')?.classList.remove('selected');
        target.classList.add('selected');

        aspectRatioSelect.classList.remove('open');
        selectedOption.setAttribute('aria-expanded', 'false');
        optionsList.hidden = true;
    }
});

document.addEventListener('click', (e) => {
    if (!aspectRatioSelect.contains(e.target as Node)) {
        aspectRatioSelect.classList.remove('open');
        selectedOption.setAttribute('aria-expanded', 'false');
        optionsList.hidden = true;
    }
});

// Add keyboard support
// Fix: Specify the event type as KeyboardEvent to access the 'key' property.
selectedOption.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectedOption.click();
    } else if (e.key === 'Escape' && aspectRatioSelect.classList.contains('open')) {
        aspectRatioSelect.classList.remove('open');
        selectedOption.setAttribute('aria-expanded', 'false');
        optionsList.hidden = true;
    }
});

optionsList.querySelectorAll('.option').forEach(option => {
    // Fix: Specify the event type as KeyboardEvent to access the 'key' property.
    option.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (e.target as HTMLDivElement).click();
            selectedOption.focus();
        }
    });
});

// --- Custom Quality Select Logic ---
qualitySelect.dataset.value = 'standard';
qualityOptionsList.querySelector('.option[data-value="standard"]')?.classList.add('selected');

qualitySelectedOption.addEventListener('click', () => {
    qualitySelect.classList.toggle('open');
    const isExpanded = qualitySelectedOption.getAttribute('aria-expanded') === 'true';
    qualitySelectedOption.setAttribute('aria-expanded', String(!isExpanded));
    qualityOptionsList.hidden = isExpanded;
});

qualityOptionsList.addEventListener('click', (e) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains('option')) {
        const value = target.dataset.value!;
        selectedQualityText.textContent = target.textContent || 'Standard';
        qualitySelect.dataset.value = value;

        qualityOptionsList.querySelector('.option.selected')?.classList.remove('selected');
        target.classList.add('selected');

        qualitySelect.classList.remove('open');
        qualitySelectedOption.setAttribute('aria-expanded', 'false');
        qualityOptionsList.hidden = true;
    }
});

document.addEventListener('click', (e) => {
    if (!qualitySelect.contains(e.target as Node)) {
        qualitySelect.classList.remove('open');
        qualitySelectedOption.setAttribute('aria-expanded', 'false');
        qualityOptionsList.hidden = true;
    }
});

qualitySelectedOption.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        qualitySelectedOption.click();
    } else if (e.key === 'Escape' && qualitySelect.classList.contains('open')) {
        qualitySelect.classList.remove('open');
        qualitySelectedOption.setAttribute('aria-expanded', 'false');
        qualityOptionsList.hidden = true;
    }
});

qualityOptionsList.querySelectorAll('.option').forEach(option => {
    option.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (e.target as HTMLDivElement).click();
            qualitySelectedOption.focus();
        }
    });
});


// --- Core Functions ---
async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file || !ai) {
    return;
  }

  if (currentMode === 'colorize') {
      await colorizePhoto(file);
  } else if (currentMode === 'remove') {
      setupMasking(file);
  } else if (currentMode === 'remove-people') {
      await removePeople(file);
  } else if (currentMode === 'remove-background') {
      await removeBackground(file);
  } else if (currentMode === 'change-background') {
    setupBackgroundChange(file);
  } else if (currentMode === 'edit-clothing') {
      setupClothingEdit(file);
  } else if (currentMode === 'style-transfer') {
      setupStyleTransfer(file);
  } else if (currentMode === 'time-travel') {
    await applyTimeTravelFilter(file);
  }
}

async function colorizePhoto(file: File) {
    showScreen('loading');
    try {
        const { base64Data, mimeType } = await resizeImage(file);

        originalImage.src = `data:${mimeType};base64,${base64Data}`;

        const imagePart = {
            inlineData: { data: base64Data, mimeType },
        };
        const textPart = {
            text: 'Colorize this black and white photo. Make the colors vibrant and realistic. Do not alter the content of the image, only add color.',
        };
        
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        
        if (imagePartResponse && imagePartResponse.inlineData) {
            const colorizedBase64 = imagePartResponse.inlineData.data;
            const colorizedMimeType = imagePartResponse.inlineData.mimeType;
            
            // Preload the result image to ensure the animation is smooth
            const img = new Image();
            img.onload = () => {
                resultImage.src = img.src;
                
                // Hide the slider for the animation
                slider.hidden = true;
                
                // Switch to the result screen
                showScreen('result');

                // Add the animation class to trigger the effect
                comparisonImageContainer.classList.add('animate-reveal');
                
                // Define the cleanup logic for when the animation finishes
                animationEndHandler = () => {
                    slider.hidden = false;
                    resetSlider(); // Set slider to 50% and apply the correct clip-path
                    comparisonImageContainer.classList.remove('animate-reveal');
                    animationEndHandler = null; // Clear the handler reference
                };
                
                // Listen for the animation to end
                comparisonImageContainer.addEventListener('animationend', animationEndHandler, { once: true });
            };
            img.src = `data:${colorizedMimeType};base64,${colorizedBase64}`;

        } else {
            throw new Error(getErrorMessageFromCandidate(response.candidates?.[0]));
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        showError(message);
    } finally {
        fileInput.value = '';
    }
}

async function removePeople(file: File) {
    showScreen('loading');
    try {
        const { base64Data, mimeType } = await resizeImage(file);

        originalImage.src = `data:${mimeType};base64,${base64Data}`;

        const imagePart = {
            inlineData: { data: base64Data, mimeType },
        };
        const textPart = {
            text: 'Your task is to expertly remove every person from this image. It is critical that you analyze the surrounding environment—including textures, lighting, shadows, and patterns—and then meticulously reconstruct the background where the people were. The filled-in areas must blend seamlessly and be indistinguishable from the original background. Do not leave any ghosts, blurs, smudges, or artifacts. The final image must be completely free of people and appear as if they were never there.',
        };
        
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        
        if (imagePartResponse && imagePartResponse.inlineData) {
            const resultBase64 = imagePartResponse.inlineData.data;
            const resultMimeType = imagePartResponse.inlineData.mimeType;
            resultImage.src = `data:${resultMimeType};base64,${resultBase64}`;
            showScreen('result');
            resetSlider();
        } else {
            throw new Error(getErrorMessageFromCandidate(response.candidates?.[0]));
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        showError(message);
    } finally {
        fileInput.value = '';
    }
}

async function removeBackground(file: File) {
    showScreen('loading');
    try {
        const { base64Data, mimeType } = await resizeImage(file);

        originalImage.src = `data:${mimeType};base64,${base64Data}`;

        const imagePart = {
            inlineData: { data: base64Data, mimeType },
        };
        const textPart = {
            text: 'Segment the main subject from the background. Make the background fully transparent. The output must be a PNG file with an alpha channel.',
        };
        
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        
        if (imagePartResponse && imagePartResponse.inlineData) {
            const resultBase64 = imagePartResponse.inlineData.data;
            const resultMimeType = imagePartResponse.inlineData.mimeType;
            resultImage.src = `data:${resultMimeType};base64,${resultBase64}`;
            showScreen('result');
            resetSlider();
        } else {
            throw new Error(getErrorMessageFromCandidate(response.candidates?.[0]));
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        showError(message);
    } finally {
        fileInput.value = '';
    }
}

function setupMasking(file: File) {
    originalFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      maskingImage.src = e.target?.result as string;
      maskingImage.onload = () => {
        // Set canvas resolution to match the image's actual size
        maskingCanvas.width = maskingImage.naturalWidth;
        maskingCanvas.height = maskingImage.naturalHeight;
        clearMask();
        showScreen('masking');
      };
    };
    reader.readAsDataURL(file);
}

function setupClothingEdit(file: File) {
    originalFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      clothingImage.src = e.target?.result as string;
      clothingImage.onload = () => {
        showScreen('clothing');
      };
    };
    reader.readAsDataURL(file);
}

function setupBackgroundChange(file: File) {
    originalFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      backgroundImage.src = e.target?.result as string;
      backgroundImage.onload = () => {
        showScreen('background');
      };
    };
    reader.readAsDataURL(file);
}

function setupStyleTransfer(file: File) {
    originalFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      styleTransferImage.src = e.target?.result as string;
      styleTransferImage.onload = () => {
        showScreen('style-transfer');
      };
    };
    reader.readAsDataURL(file);
}

async function handleObjectRemoval() {
    if (!originalFile || !ai) return;

    showScreen('loading');

    try {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        
        const originalWidth = maskingImage.naturalWidth;
        const originalHeight = maskingImage.naturalHeight;

        // Resize the image if it's too large to prevent exceeding API payload limits,
        // which is a common cause for empty API responses.
        const MAX_DIMENSION = 2048;
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
            if (originalWidth > originalHeight) {
                targetWidth = MAX_DIMENSION;
                targetHeight = Math.round((originalHeight * MAX_DIMENSION) / originalWidth);
            } else {
                targetHeight = MAX_DIMENSION;
                targetWidth = Math.round((originalWidth * MAX_DIMENSION) / originalHeight);
            }
        }

        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        
        // Draw the scaled-down image and mask to the temporary canvas.
        tempCtx.drawImage(maskingImage, 0, 0, targetWidth, targetHeight);
        tempCtx.drawImage(maskingCanvas, 0, 0, targetWidth, targetHeight);
        
        // Always use PNG to preserve mask transparency, especially over JPEGs.
        const base64Data = tempCanvas.toDataURL('image/png').split(',')[1];
        
        originalImage.src = await fileToDataURL(originalFile);

        const imagePart = {
            inlineData: { data: base64Data, mimeType: 'image/png' },
        };
        const textPart = {
            text: "Remove the object that has been scribbled on with a red brush and realistically fill in the background. The red scribble itself should not be in the final image, and the filled area should blend seamlessly.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    
        if (imagePartResponse && imagePartResponse.inlineData) {
            const resultBase64 = imagePartResponse.inlineData.data;
            const resultMimeType = imagePartResponse.inlineData.mimeType;
            resultImage.src = `data:${resultMimeType};base64,${resultBase64}`;
            showScreen('result');
            resetSlider();
        } else {
            throw new Error(getErrorMessageFromCandidate(response.candidates?.[0]));
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        showError(message);
    } finally {
        fileInput.value = '';
    }
}


async function handleClothingEdit() {
    if (!originalFile || !ai) return;

    const promptText = clothingPrompt.value.trim();
    if (!promptText) {
        showError('Please describe the clothing change you want to make.');
        return;
    }

    showScreen('loading');

    try {
        const { base64Data, mimeType } = await resizeImage(originalFile);

        originalImage.src = `data:${mimeType};base64,${base64Data}`;

        const imagePart = {
            inlineData: { data: base64Data, mimeType },
        };
        const textPart = {
            text: `Your task is to edit the clothing on the subject in this image based on the following description: "${promptText}". It is absolutely critical that you do not alter the subject's pose, body shape, camera angle, perspective, or the background. Only change the specified clothing. The new clothing should realistically match the existing lighting, shadows, and style of the image to create a seamless and believable result.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    
        if (imagePartResponse && imagePartResponse.inlineData) {
            const resultBase64 = imagePartResponse.inlineData.data;
            const resultMimeType = imagePartResponse.inlineData.mimeType;
            resultImage.src = `data:${resultMimeType};base64,${resultBase64}`;
            showScreen('result');
            resetSlider();
        } else {
            throw new Error(getErrorMessageFromCandidate(response.candidates?.[0]));
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        showError(message);
    } finally {
        fileInput.value = '';
    }
}

async function handleBackgroundChange() {
    if (!originalFile || !ai) return;

    const promptText = backgroundPrompt.value.trim();
    if (!promptText) {
        showError('Please describe the new background you want.');
        return;
    }

    showScreen('loading');

    try {
        const { base64Data, mimeType } = await resizeImage(originalFile);

        originalImage.src = `data:${mimeType};base64,${base64Data}`;

        const imagePart = {
            inlineData: { data: base64Data, mimeType },
        };
        const textPart = {
            text: `Analyze the main subject of this image, paying close attention to the existing camera angle, perspective, and lighting. Replace the entire background with a new one described as: "${promptText}". It is critical that you **do not change the original camera angle or perspective of the subject**. The new background must be photorealistic and high-quality. Seamlessly blend the original subject into this new background by matching the lighting, shadows, and perspective of the subject to the new environment to create a completely natural and believable final image. The original subject's form and angle must not be altered.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    
        if (imagePartResponse && imagePartResponse.inlineData) {
            const resultBase64 = imagePartResponse.inlineData.data;
            const resultMimeType = imagePartResponse.inlineData.mimeType;
            resultImage.src = `data:${resultMimeType};base64,${resultBase64}`;
            showScreen('result');
            resetSlider();
        } else {
            throw new Error(getErrorMessageFromCandidate(response.candidates?.[0]));
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        showError(message);
    } finally {
        fileInput.value = '';
    }
}

const stylePrompts = {
    'pixar': 'Recreate this image in the playful, stylized 3D animation aesthetic of a Pixar movie. Emphasize rounded shapes, vibrant colors, and soft, friendly lighting. The subjects should look like charming animated characters while preserving their original identities and composition.',
    'anime': 'Transform this image into a vibrant, high-quality Japanese anime style. Feature clean lines, expressive, large eyes, and dynamic, cel-shaded coloring. The background should be painterly and detailed, complementing the character art. Maintain the original pose and composition.',
    'cyberpunk': 'Convert this image into a gritty, futuristic cyberpunk scene. Incorporate neon lights, a dark, rainy atmosphere, and high-tech, cybernetic elements. The overall mood should be dystopian and moody, with a strong emphasis on glowing blues, pinks, and purples.',
    'painting': 'Reinterpret this image as a classical oil painting. The style should mimic the brushstrokes, color palette, and texture of an old master. Focus on realistic lighting and shadow (chiaroscuro) to create a dramatic, timeless piece of art. Preserve the original subject and composition.',
    'disney': 'Redraw this image in the style of a modern 3D Disney animated film. Focus on creating expressive characters with large, emotive eyes, smooth features, and a touch of magical realism. The lighting and colors should be enchanting and vibrant, creating a heartwarming scene.',
    'portrait': 'Enhance this image into a hyper-realistic, professional studio portrait. Refine the details, balance the lighting to be flattering and dramatic, and ensure the skin texture is natural yet perfected. The background should be simple and non-distracting, focusing all attention on the subject.',
};
  
async function handleStyleTransfer() {
    if (!originalFile || !selectedStyle || !ai) return;

    const promptText = stylePrompts[selectedStyle as keyof typeof stylePrompts];
    if (!promptText) {
        showError('Invalid style selected.');
        return;
    }

    showScreen('loading');

    try {
        const { base64Data, mimeType } = await resizeImage(originalFile);

        originalImage.src = `data:${mimeType};base64,${base64Data}`;

        const imagePart = {
            inlineData: { data: base64Data, mimeType },
        };
        const textPart = {
            text: promptText,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    
        if (imagePartResponse && imagePartResponse.inlineData) {
            const resultBase64 = imagePartResponse.inlineData.data;
            const resultMimeType = imagePartResponse.inlineData.mimeType;
            resultImage.src = `data:${resultMimeType};base64,${resultBase64}`;
            showScreen('result');
            resetSlider();
        } else {
            throw new Error(getErrorMessageFromCandidate(response.candidates?.[0]));
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        showError(message);
    } finally {
        fileInput.value = '';
    }
}

async function handleImageGeneration() {
    if (!ai) return;

    let promptText = generationPrompt.value.trim();
    if (!promptText) {
        showError('Please describe the image you want to create.');
        return;
    }

    const selectedQuality = qualitySelect.dataset.value || 'standard';
    if (selectedQuality === 'high') {
        promptText += ', 4k, highly detailed, photorealistic';
    }

    showScreen('loading');
    
    originalImage.src = '';
    resultImage.src = '';

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: promptText,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: (aspectRatioSelect.dataset.value || '1:1') as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            
            resultImage.src = imageUrl;
            originalImage.src = imageUrl; 
            
            showScreen('result');
            
            slider.hidden = true;
            comparisonImageContainer.style.clipPath = 'inset(0 0 0 0)';

        } else {
            throw new Error('Could not find image data in the API response. The operation may have been blocked or the prompt might be too complex.');
        }

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        showError(message);
    }
}

async function applyTimeTravelFilter(file: File) {
    showScreen('loading');
    try {
        const { base64Data, mimeType } = await resizeImage(file);

        const imagePart = {
            inlineData: { data: base64Data, mimeType },
        };
        
        const prompts = {
            '1920s': 'Recreate this image as an authentic 1920s retro photograph. Apply a distinct sepia tone for a vintage feel. Introduce soft contrast and the characteristic imperfections of early photography, such as subtle film grain and light scratches. The overall mood should be nostalgic and period-accurate, preserving the original subject and composition.',
            '1980s': 'Transform this photo with an 80s neon and synthwave aesthetic. Overhaul the lighting to include bright, vibrant neon glows, focusing on purple and blue hues. Introduce classic VHS effects, such as faint scan lines and subtle color bleeding, to give it an authentic retro-futuristic, VCR-era look. The subject and composition should remain recognizable but fully immersed in this neon-drenched style.',
            'modern': 'Render this image as an ultra-realistic, high-definition modern photograph. Enhance it with a prominent and well-balanced HDR effect, bringing out sharp details in both the shadows and highlights. The colors should be vivid and true-to-life, and the final image must be crystal clear and high-resolution, as if captured with a top-tier professional camera. Maintain the original subject and composition.',
        };

        const generateImage = async (prompt: string) => {
            const response = await ai!.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, { text: prompt }] },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            if (imagePartResponse && imagePartResponse.inlineData) {
                return `data:${imagePartResponse.inlineData.mimeType};base64,${imagePartResponse.inlineData.data}`;
            }
            throw new Error(getErrorMessageFromCandidate(response.candidates?.[0]));
        };
        
        const [url1920s, url1980s, urlModern] = await Promise.all([
            generateImage(prompts['1920s']),
            generateImage(prompts['1980s']),
            generateImage(prompts['modern']),
        ]);

        image1920s.src = url1920s;
        image1980s.src = url1980s;
        imageModern.src = urlModern;

        showScreen('time-travel');

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred while applying time travel filters.';
        showError(message);
    } finally {
        fileInput.value = '';
    }
}

// --- Utility & Helper Functions ---

function getErrorMessageFromCandidate(candidate: any): string {
    if (!candidate) {
        return 'The API did not return an image. This could be due to a network issue or an invalid request.';
    }

    const { finishReason, finishMessage } = candidate;

    // If there's no specific reason but also no image, it's a generic failure.
    if (!finishReason || ['STOP', 'UNSPECIFIED'].includes(finishReason)) {
        return 'Could not find image data in the API response. The operation may have been blocked or the image could not be processed.';
    }

    switch (finishReason) {
        case 'SAFETY':
            return 'The request was blocked due to safety concerns. Your prompt or image may have violated the safety policy. Please try a different image or a more neutral prompt.';
        case 'RECITATION':
            return 'The request was blocked because the response may have contained copyrighted material. Please try a different prompt.';
        case 'MAX_TOKENS':
            return 'The request failed because the maximum number of tokens was reached. Please try with a smaller image or a shorter prompt.';
        default:
            let userMessage = `Image generation failed. Reason: ${finishReason}.`;
            if (finishMessage) {
                userMessage += ` Details: ${finishMessage}`;
            }
            return userMessage;
    }
}

function handleSliderChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  comparisonImageContainer.style.clipPath = `inset(0 ${100 - Number(value)}% 0 0)`;
}

function resetSlider() {
    slider.value = '50';
    slider.hidden = false;
    comparisonImageContainer.style.clipPath = 'inset(0 50% 0 0)';
}

function resetApp() {
    // Stop any ongoing animations
    if (animationEndHandler) {
        comparisonImageContainer.removeEventListener('animationend', animationEndHandler);
        animationEndHandler = null;
    }
    comparisonImageContainer.classList.remove('animate-reveal');

    originalFile = null;
    currentMode = null;
    originalImage.src = '';
    resultImage.src = '';
    fileInput.value = ''; // Reset file input
    clothingPrompt.value = '';
    backgroundPrompt.value = '';
    generationPrompt.value = '';
    
    // Reset style transfer
    styleGallery.querySelector('.style-card.selected')?.classList.remove('selected');
    processStyleTransferButton.disabled = true;
    selectedStyle = null;

    // Reset custom aspect ratio select
    selectedAspectRatioText.textContent = '1:1';
    aspectRatioSelect.dataset.value = '1:1';
    optionsList.querySelector('.option.selected')?.classList.remove('selected');
    optionsList.querySelector('.option[data-value="1:1"]')?.classList.add('selected');

    // Reset custom quality select
    selectedQualityText.textContent = 'Standard';
    qualitySelect.dataset.value = 'standard';
    qualityOptionsList.querySelector('.option.selected')?.classList.remove('selected');
    qualityOptionsList.querySelector('.option[data-value="standard"]')?.classList.add('selected');

    resetSlider();
    showScreen('upload');
}

async function handleDownload() {
  if (!resultImage.src) return;
  const link = document.createElement('a');
  link.href = resultImage.src;
  
  let baseName = 'image';
  if (currentMode === 'generate-image') {
      const promptPart = generationPrompt.value.trim().slice(0, 30).replace(/\s+/g, '_') || 'generated';
      baseName = promptPart;
  } else if (originalFile) {
      baseName = originalFile.name.split('.').slice(0, -1).join('.');
  }
  
  const suffix = currentMode === 'generate-image' ? 'generated' : 'edited';
  const extension = resultImage.src.startsWith('data:image/png') ? 'png' : 'jpg';
  link.download = `${baseName}_${suffix}.${extension}`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleTimeTravelDownload(event: Event) {
    const target = event.currentTarget as HTMLButtonElement;
    const imageId = target.dataset.target;
    if (!imageId) return;

    const imageElement = document.getElementById(imageId) as HTMLImageElement;
    if (!imageElement || !imageElement.src) return;

    const link = document.createElement('a');
    link.href = imageElement.src;
    
    const originalName = originalFile?.name.split('.').slice(0, -1).join('.') || 'image';
    const extension = imageElement.src.startsWith('data:image/png') ? 'png' : 'jpg';
    link.download = `${originalName}_${imageId.replace('image-', '')}.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function resizeImage(file: File, maxDimension: number = 2048): Promise<{ base64Data: string; mimeType: string }> {
    const dataUrl = await fileToDataURL(file);
    const img = new Image();
    
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
    });

    const { naturalWidth: originalWidth, naturalHeight: originalHeight } = img;

    if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
        return {
            base64Data: dataUrl.split(',')[1],
            mimeType: file.type,
        };
    }

    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (originalWidth > originalHeight) {
        targetWidth = maxDimension;
        targetHeight = Math.round((originalHeight * maxDimension) / originalWidth);
    } else {
        targetHeight = maxDimension;
        targetWidth = Math.round((originalWidth * maxDimension) / originalHeight);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    
    const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const quality = mimeType === 'image/jpeg' ? 0.9 : undefined;
    const resizedDataUrl = canvas.toDataURL(mimeType, quality);

    return {
        base64Data: resizedDataUrl.split(',')[1],
        mimeType: mimeType,
    };
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


// --- Masking Canvas Drawing Logic ---
function saveHistory() {
    drawingHistory.push(ctx.getImageData(0, 0, maskingCanvas.width, maskingCanvas.height));
    if (drawingHistory.length > 20) { // Limit history size
        drawingHistory.shift();
    }
}

function startDrawing(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    isDrawing = true;
    saveHistory();
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getMousePos(e);
    ctx.lineWidth = Number(brushSizeSlider.value);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function stopDrawing() {
    if (!isDrawing) return;
    ctx.beginPath(); // a new path for next drawing
    isDrawing = false;
}

function getMousePos(e: MouseEvent | TouchEvent) {
    const rect = maskingCanvas.getBoundingClientRect();
    const scaleX = maskingCanvas.width / rect.width;
    const scaleY = maskingCanvas.height / rect.height;

    let clientX, clientY;
    if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
    } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
    };
}


function clearMask() {
    saveHistory();
    ctx.clearRect(0, 0, maskingCanvas.width, maskingCanvas.height);
}

function undoLastStroke() {
    if (drawingHistory.length > 0) {
        ctx.putImageData(drawingHistory.pop()!, 0, 0);
    } else {
        // If history is empty, clear the canvas
        ctx.clearRect(0, 0, maskingCanvas.width, maskingCanvas.height);
    }
}


// --- Tooltip Logic ---
document.querySelectorAll('.help-icon').forEach(icon => {
  icon.addEventListener('mouseenter', (e) => {
    const target = e.target as HTMLElement;
    const tipText = target.getAttribute('data-tip');
    if (tipText) {
      tooltip.textContent = tipText;
      tooltip.hidden = false;
      
      const rect = target.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${rect.bottom + 8}px`; // Position below the icon
    }
  });

  icon.addEventListener('mouseleave', () => {
    tooltip.hidden = true;
  });
});