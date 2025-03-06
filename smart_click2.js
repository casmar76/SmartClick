document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const urlParams = new URLSearchParams(window.location.search);
        const scriptTag = document.querySelector('script[data-origin-url]');
        const originUrl = scriptTag ? scriptTag.getAttribute('data-origin-url') : null;

        // Function to replace spaces with '_s_', dashes with '_d_', and remove slashes
        const replaceSpacesAndDashes = (inputString) =>
            inputString.replace(/ /g, '_s_').replace(/-/g, '_d_').replace(/\//g, '');

        // Store click IDs in local storage if present in the URL
        const clickParams = ['gclid', 'wbraid', 'msclkid', 'fbclid', 'tbclid'];
        clickParams.forEach(param => {
            if (urlParams.has(param)) {
                localStorage.setItem(param, urlParams.get(param));
            }
        });

        // Retrieve the first available click ID from URL or local storage
        const adCampaignId = clickParams
            .map(param => urlParams.get(param) || localStorage.getItem(param))
            .find(value => value) || null;

        let modifiedCampaignId = adCampaignId;

        // If 'tid' parameter exists, replace its value
        if (urlParams.has('tid')) {
            const originalTid = urlParams.get('tid');
            const replacedTid = replaceSpacesAndDashes(originalTid);
            urlParams.set('tid', replacedTid);
        }

        if (adCampaignId && urlParams.has('tid')) {
            modifiedCampaignId = replaceSpacesAndDashes(adCampaignId);
        }

        // Create the updated URL parameters string once
        const updatedUrlParamsString = urlParams.toString();

        if (updatedUrlParamsString) {
            const pageLinks = document.querySelectorAll('a');

            pageLinks.forEach((link) => {
                const anchorHash = link.hash;
                let linkHref = link.href.split('#')[0];

                // Replace placeholders with the value of 'modifiedCampaignId' in the link
                if (modifiedCampaignId) {
                    linkHref = linkHref.replace('[sclid]', modifiedCampaignId).replace('%5Bsclid%5D', modifiedCampaignId);
                }

                // Append or update URL parameters in the link
                if (!linkHref.includes('?')) {
                    linkHref += '?' + updatedUrlParamsString;
                } else {
                    linkHref += '&' + updatedUrlParamsString;
                }

                // Update the href attribute of the link
                link.href = linkHref + anchorHash;
            });

            // Send the click ID to the server
            if (adCampaignId && originUrl) {
                const ajaxUrl = `${originUrl}/wp-admin/admin-ajax.php?action=track_click2`;
                fetch(ajaxUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ clickId: adCampaignId }),
                })
                .catch(error => {
                    console.error('Error sending click ID to server:', error);
                });
            }
        }
    })();
});

