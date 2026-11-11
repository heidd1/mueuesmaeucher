// ===================== Schnee =====================
// Der Zustand wird sofort gesetzt (nicht erst bei DOMContentLoaded),
// damit der Schnee beim Laden nicht kurz aufblitzt und dann verschwindet.
const SNOW_STORAGE_KEY = 'snow';

function readSnowPreference() {
    try {
        const saved = localStorage.getItem(SNOW_STORAGE_KEY);
        if (saved === 'on') return true;
        if (saved === 'off') return false;
    } catch (error) {
        // localStorage kann blockiert sein (z. B. privater Modus) – dann gilt der Standard.
    }
    // Ohne gespeicherte Wahl: Systemeinstellung "Bewegung reduzieren" respektieren.
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function applySnow(on) {
    document.documentElement.classList.toggle('snow-on', on);
    document.documentElement.classList.toggle('no-snow', !on);
}

applySnow(readSnowPreference());

document.addEventListener('DOMContentLoaded', () => {
    initSnowToggle();
    const lightbox = createLightbox();
    initGalleries(lightbox);
    initGalerieTabs();
    initAktuellesTabs();
    initGonnerDonation();
});

function initSnowToggle() {
    const header = document.querySelector('header');
    if (!header) {
        return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'snow-toggle';
    button.setAttribute('aria-label', 'Schneefall');
    button.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>' +
        '<path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/>' +
        '<path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>';

    const update = (on) => {
        applySnow(on);
        button.setAttribute('aria-pressed', String(on));
        button.title = on ? 'Schnee ausschalten' : 'Schnee einschalten';
    };

    update(document.documentElement.classList.contains('snow-on'));

    button.addEventListener('click', () => {
        const on = button.getAttribute('aria-pressed') !== 'true';
        update(on);
        try {
            localStorage.setItem(SNOW_STORAGE_KEY, on ? 'on' : 'off');
        } catch (error) {
            // Speichern nicht möglich – die Wahl gilt dann nur für diese Seite.
        }
    });

    header.appendChild(button);
}

// ===================== Lightbox =====================
function createLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (!lightbox || !lightboxImg) {
        return null;
    }

    const closeButton = lightbox.querySelector('.lightbox-close');
    const prevButton = lightbox.querySelector('.prev');
    const nextButton = lightbox.querySelector('.next');

    let images = [];
    let index = 0;
    let returnFocusTo = null;

    const show = () => {
        lightboxImg.src = images[index].src;
        lightboxImg.alt = images[index].alt;
    };

    const step = (direction) => {
        index = (index + direction + images.length) % images.length;
        show();
    };

    const open = (imageList, startIndex, trigger) => {
        images = imageList;
        index = startIndex;
        returnFocusTo = trigger;
        show();

        const single = images.length < 2;
        prevButton.hidden = single;
        nextButton.hidden = single;

        lightbox.classList.add('open');
        closeButton.focus();
    };

    const close = () => {
        lightbox.classList.remove('open');
        lightboxImg.removeAttribute('src');
        returnFocusTo?.focus();
    };

    // Fokus in der Lightbox halten: Tab springt vom letzten zum ersten Knopf und umgekehrt.
    const trapFocus = (event) => {
        const focusable = [...lightbox.querySelectorAll('button:not([hidden])')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    closeButton.addEventListener('click', close);
    prevButton.addEventListener('click', () => step(-1));
    nextButton.addEventListener('click', () => step(1));

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            close();
        }
    });

    lightbox.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            close();
        } else if (event.key === 'ArrowLeft' && images.length > 1) {
            step(-1);
        } else if (event.key === 'ArrowRight' && images.length > 1) {
            step(1);
        } else if (event.key === 'Tab') {
            trapFocus(event);
        }
    });

    return { open };
}

// Jede .gallery (Startseite und alle Anlässe der Galerie) blättert nur durch ihre eigenen Bilder.
function initGalleries(lightbox) {
    if (!lightbox) {
        return;
    }

    document.querySelectorAll('.gallery').forEach((gallery) => {
        const images = [...gallery.querySelectorAll('img')];

        images.forEach((img, index) => {
            // Bilder per Tastatur erreichbar und auslösbar machen.
            img.tabIndex = 0;
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', `Bild vergrössern: ${img.alt}`);

            const open = () => lightbox.open(images, index, img);

            img.addEventListener('click', open);
            img.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open();
                }
            });
        });
    });
}

// ===================== Tabs =====================
// Markiert einen Knopf optisch (.active) und für Screenreader (aria-pressed).
function setPressed(button, pressed) {
    button.classList.toggle('active', pressed);
    button.setAttribute('aria-pressed', String(pressed));
}

function initGalerieTabs() {
    const yearButtons = [...document.querySelectorAll('.years button')];
    const yearContents = [...document.querySelectorAll('.year-content')];

    if (!yearButtons.length || !yearContents.length) {
        return;
    }

    const openEvent = (year, eventIndex) => {
        year.querySelectorAll('.events button').forEach((button) => {
            setPressed(button, Number(button.dataset.eventIndex) === eventIndex);
        });
        year.querySelectorAll('.event-content').forEach((event, index) => {
            event.classList.toggle('active', index === eventIndex);
        });
    };

    const openYear = (yearIndex) => {
        yearButtons.forEach((button) => {
            setPressed(button, Number(button.dataset.yearIndex) === yearIndex);
        });
        yearContents.forEach((year, index) => {
            year.classList.toggle('active', index === yearIndex);
        });
        openEvent(yearContents[yearIndex], 0);
    };

    yearButtons.forEach((button) => {
        button.addEventListener('click', () => openYear(Number(button.dataset.yearIndex)));
    });

    yearContents.forEach((year) => {
        year.querySelectorAll('.events button').forEach((button) => {
            button.addEventListener('click', () => openEvent(year, Number(button.dataset.eventIndex)));
        });
    });

    const initiallyActive = yearButtons.find((button) => button.classList.contains('active')) ?? yearButtons[0];
    openYear(Number(initiallyActive.dataset.yearIndex));
}

function initAktuellesTabs() {
    const contents = [...document.querySelectorAll('.tab-content')];
    const buttons = [...document.querySelectorAll('.tabs button')];

    if (!buttons.length || !contents.length) {
        return;
    }

    const openTab = (index) => {
        buttons.forEach((button, buttonIndex) => setPressed(button, buttonIndex === index));
        contents.forEach((content, contentIndex) => {
            content.classList.toggle('active', contentIndex === index);
        });
    };

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => openTab(index));
    });

    openTab(Math.max(0, buttons.findIndex((button) => button.classList.contains('active'))));
}

// ===================== Gönner (TWINT) =====================
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
