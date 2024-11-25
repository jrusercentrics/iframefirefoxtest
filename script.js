window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

function startMutationObserver(tNode, c) {
    const targetNode = tNode ? tNode : document;
    const config = c ? c : {
        attributes: true,
        childList: true,
        subtree: true
    };
    const callback = function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                targetNode.dispatchEvent(new CustomEvent('newChild', {
                    detail: mutation
                }))
            } else if (mutation.type === 'attributes') {
                targetNode.dispatchEvent(new CustomEvent('attributeChange', {
                    detail: mutation
                }))
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config)
}
startMutationObserver(document);
window.addEventListener('CookiebotOnAccept', function(e) {
    document.querySelectorAll("iframe").forEach(ele => {
        if (ele.dataset.cookieconsent) {
            const consents = ele.dataset.cookieconsent.split(',');
            const hasConsent = !consents.some(v => Cookiebot.consent[v] === false);
            const container = ele.closest(".bg-video");
            if (container !== null && hasConsent) {
                container.classList.remove("cc-placeholder-container")
            } else if (container !== null) {
                addOptoutContainerToIframe(ele)
            }
        }
    })
});
window.addEventListener('CookiebotOnDecline', function() {
    document.querySelectorAll("iframe").forEach(ele => {
        addOptoutContainerToIframe(ele)
    })
});
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll("iframe").forEach(ele => {
        addOptoutContainerToIframe(ele)
    })
});
document.addEventListener('attributeChange', function(e) {
    if (e.detail.attributeName == "data-cookieconsent") {
        if (e.detail.target.localName == "iframe") {
            addOptoutContainerToIframe(e.detail.target)
        }
    }
});

function addOptoutContainerToIframe(target) {
    const optoutScriptTag = document.getElementById("cookie-optout-script");
    const prefix = "cookieconsent-optout-";
    const addClasses = (elm, classesToAdd, prefix) => {
        for (var i = 0; i < classesToAdd.length; i++) {
            let newClass = (prefix + classesToAdd[i]).replace(" ", "");
            if (newClass != prefix && !elm.classList.contains(newClass)) {
                elm.classList.add(newClass)
            }
        }
    };
    const decodeHtml = function(input) {
        let html = document.createElement("div");
        html.innerHTML = input;
        return typeof html.innerText !== 'undefined' ? html.innerText : html.textContent
    };
    const getLocalizedCategoryTitles = categories => {
        if (optoutScriptTag.dataset.optoutCatpreferences.length > 0) {
            categories = categories.replace("preferences", optoutScriptTag.dataset.optoutCatpreferences)
        }
        if (optoutScriptTag.dataset.optoutCatstatistics.length > 0) {
            categories = categories.replace("statistics", optoutScriptTag.dataset.optoutCatstatistics)
        }
        if (optoutScriptTag.dataset.optoutCatmarketing.length > 0) {
            categories = categories.replace("marketing", optoutScriptTag.dataset.optoutCatmarketing)
        }
        return categories
    };
    document.querySelectorAll("*[data-cookieconsent]").forEach((ele, i) => {
        if (ele.outerHTML == target.outerHTML) {
            let placeholder = ele.parentNode.querySelector('div[class*="' + prefix + '"]');
            const hasPlaceholder = placeholder !== null;
            const consents = ele.dataset.cookieconsent.split(',');
            const hasConsent = !consents.some(value => Cookiebot.consent[value] === false);
            var bgVideo = ele.closest(".bg-video");
            if (bgVideo !== null && !hasConsent) {
                bgVideo.classList.add("cc-placeholder-container")
            }
            if (hasPlaceholder) {
                addClasses(placeholder, consents, prefix)
            } else {
                placeholder = document.createElement("div");
                placeholder.classList.add("cc-placeholder");
                placeholder.dataset.ccIndex = i;
                addClasses(placeholder, consents, prefix);
                const wrapper = document.createElement("div");
                wrapper.classList.add("cc-wrapper");
                wrapper.innerHTML = decodeHtml(optoutScriptTag.dataset.optoutText).replace("{{CATEGORIES}}", getLocalizedCategoryTitles(ele.dataset.cookieconsent));
                const a = document.createElement("a");
                a.classList.add("btn");
                a.innerHTML = optoutScriptTag.dataset.optoutBtntext;
                a.tabIndex = 0;
                a.addEventListener("click", e => Cookiebot.renew());
                wrapper.appendChild(a);
                const ratioPct = (parseInt(target.height) / parseInt(target.width) * 100) + '%';
                wrapper.style.marginTop = '-' + ratioPct;
                placeholder.appendChild(wrapper);
                placeholder.style.paddingTop = ratioPct;
                ele.parentNode.appendChild(placeholder)
            }
        }
    })
