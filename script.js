document.addEventListener('DOMContentLoaded', () => {
    initHomepageLightbox();
    initGalerie();
    initAktuellesTabs();
    initGonnerDonation();
});

function initHomepageLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const homepageGallery = document.querySelector('.homepage-gallery');

    if (!lightbox || !lightboxImg || !homepageGallery) {
        return;
    }

    const galleryImages = [...homepageGallery.querySelectorAll('img')];
    if (!galleryImages.length) {
        return;
    }

    let galleryIndex = 0;

    const openLightbox = (img) => {
        galleryIndex = galleryImages.indexOf(img);
        lightboxImg.src = img.src;
        lightbox.style.display = 'flex';
    };

    const updateImage = (step) => {
        galleryIndex = (galleryIndex + step + galleryImages.length) % galleryImages.length;
        lightboxImg.src = galleryImages[galleryIndex].src;
    };

    galleryImages.forEach((img) => {
        img.addEventListener('click', () => openLightbox(img));
    });

    const prevButton = lightbox.querySelector('.prev');
    const nextButton = lightbox.querySelector('.next');

    prevButton?.addEventListener('click', () => updateImage(-1));
    nextButton?.addEventListener('click', () => updateImage(1));

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
}

function initGalerie() {
    const yearContents = [...document.querySelectorAll('.year-content')];
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (!yearContents.length || !lightbox || !lightboxImg) {
        return;
    }

    const state = {
        currentYear: 1,
        currentEvent: 0,
        currentIndex: 0,
        eventImages: []
    };

    yearContents.forEach((year, yearIndex) => {
        state.eventImages[yearIndex] = [...year.querySelectorAll('.event-content')].map((event) =>
            [...event.querySelectorAll('img')].map((img) => img.src)
        );
    });

    const openYearTab = (yearIndex) => {
        document.querySelectorAll('.years button').forEach((button) => {
            button.classList.toggle('active', Number(button.dataset.yearIndex) === yearIndex);
        });

        yearContents.forEach((year, index) => {
            year.classList.toggle('active', index === yearIndex);
        });

        state.currentYear = yearIndex;
        openEventTab(yearIndex, 0);
    };

    const openEventTab = (yearIndex, eventIndex) => {
        const year = yearContents[yearIndex];
        if (!year) {
            return;
        }

        state.currentYear = yearIndex;
        state.currentEvent = eventIndex;

        const buttons = year.querySelectorAll('.events button');
        buttons.forEach((button, index) => {
            button.classList.toggle('active', index === eventIndex);
        });

        const events = year.querySelectorAll('.event-content');
        events.forEach((event, index) => {
            event.classList.toggle('active', index === eventIndex);
        });
    };

    const openEventImage = (yearIndex, eventIndex, img) => {
        const images = state.eventImages[yearIndex]?.[eventIndex] ?? [];
        state.currentYear = yearIndex;
        state.currentEvent = eventIndex;
        state.currentIndex = images.indexOf(img.src);
        lightboxImg.src = img.src;
        lightbox.style.display = 'flex';
    };

    const updateImage = (step) => {
        const images = state.eventImages[state.currentYear]?.[state.currentEvent] ?? [];
        if (!images.length) {
            return;
        }

        state.currentIndex = (state.currentIndex + step + images.length) % images.length;
        lightboxImg.src = images[state.currentIndex];
    };

    document.querySelectorAll('.years button').forEach((button) => {
        button.addEventListener('click', () => openYearTab(Number(button.dataset.yearIndex)));
    });

    yearContents.forEach((year, yearIndex) => {
        const eventButtons = year.querySelectorAll('.events button');
        eventButtons.forEach((button) => {
            button.addEventListener('click', () => openEventTab(yearIndex, Number(button.dataset.eventIndex)));
        });

        const eventContents = year.querySelectorAll('.event-content');
        eventContents.forEach((event, eventIndex) => {
            const images = event.querySelectorAll('img');
            images.forEach((img) => {
                img.addEventListener('click', () => openEventImage(yearIndex, eventIndex, img));
            });
        });
    });

    const prevButton = lightbox.querySelector('.prev');
    const nextButton = lightbox.querySelector('.next');

    prevButton?.addEventListener('click', () => updateImage(-1));
    nextButton?.addEventListener('click', () => updateImage(1));

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    openYearTab(state.currentYear);
    openEventTab(state.currentYear, state.currentEvent);
}

function initAktuellesTabs() {
    const buttons = document.querySelectorAll('.tabs button');
    const contents = document.querySelectorAll('.tab-content');

    if (!buttons.length || !contents.length) {
        return;
    }

    const openTab = (index) => {
        buttons.forEach((button, buttonIndex) => {
            button.classList.toggle('active', buttonIndex === index);
        });

        contents.forEach((content, contentIndex) => {
            content.classList.toggle('active', contentIndex === index);
        });
    };

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => openTab(index));
    });
}

function initGonnerDonation() {
    const container = document.getElementById('rnw-paylink-button-kfpgs');
    if (!container) {
        return;
    }

    (async () => {
        const { TwintButton } = await import('https://unpkg.com/@raisenow/paylink-button@2/dist/TwintButton.js');

        TwintButton.render('#rnw-paylink-button-kfpgs', {
            'solution-id': 'kfpgs',
            'solution-type': 'donate',
            language: 'de',
            size: 'large',
            width: 'fixed',
            'color-scheme': 'dark'
        });
    })();
}
