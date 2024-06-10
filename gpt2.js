document.addEventListener('DOMContentLoaded', () => {
    (function () {
        // Function to log messages
        const log = (message) => console.log(`[Debug]: ${message}`);

        const urlParams = new URLSearchParams(window.location.search);
        const scriptTag = document.currentScript || document.querySelector('script[data-origin-url]');
        if (!scriptTag) {
            console.error('Script tag with data-origin-url attribute not found');
            return; // Exit if script tag is not found
        }

        const originUrl = scriptTag.getAttribute('data-origin-url');

        log(`Origin URL: ${originUrl}`);

        // Function to replace spaces with '_s_', dashes with '_d_', and remove slashes
        const replaceSpacesAndDashes = (inputString) =>
            inputString.replace(/ /g, '_s_').replace(/-/g, '_d_').replace(/\//g, '');

        // Store the gclid in local storage if present in the URL
        if (urlParams.has('gclid')) {
            const gclid = urlParams.get('gclid');
            localStorage.setItem('gclid', gclid);
            log(`Stored gclid in localStorage: ${gclid}`);
        }

        // Retrieve gclid from local storage if not in the URL
        const gclid = urlParams.get('gclid') || localStorage.getItem('gclid');
        log(`gclid: ${gclid}`);

        // Get values of 'gclid', 'wbraid', 'msclkid', or 'fbclid' from the url parameters
        const adCampaignId = gclid || urlParams.get('wbraid') || urlParams.get('msclkid') || urlParams.get('fbclid');
        let modifiedCampaignId = adCampaignId;
        log(`adCampaignId: ${adCampaignId}`);

        // If 'tid' parameter exists, replace its value and set it back
        if (urlParams.has('tid')) {
            const originalTid = urlParams.get('tid');
            const replacedTid = replaceSpacesAndDashes(originalTid);
            urlParams.set('tid', replacedTid);
            log(`Updated tid: ${replacedTid}`);
        }

        if (adCampaignId && urlParams.has('tid')) {
            modifiedCampaignId = replaceSpacesAndDashes(adCampaignId);
            log(`Modified Campaign ID: ${modifiedCampaignId}`);
        }

        // Create the updated URL parameters string once
        const updatedUrlParamsString = urlParams.toString();
        log(`Updated URL Parameters String: ${updatedUrlParamsString}`);

        if (updatedUrlParamsString) {
            const pageLinks = document.querySelectorAll('a');

            pageLinks.forEach((link) => {
                const anchorHash = link.hash;
                let linkHref = link.href.split('#')[0];

                // Replace placeholders with the value of 'modifiedCampaignId' in the link
                if (modifiedCampaignId) {
                    linkHref = linkHref.replace('[sclid]', modifiedCampaignId).replace('%5Bsclid%5D', modifiedCampaignId);
                    log(`Replaced placeholders in link: ${linkHref}`);
                }

                // Append or update URL parameters in the link
                if (!linkHref.includes('?')) {
                    linkHref += '?' + updatedUrlParamsString;
                } else {
                    const [baseUrl, existingParams] = linkHref.split('?');
                    const mergedParams = new URLSearchParams(existingParams);
                    urlParams.forEach((value, key) => mergedParams.set(key, value));
                    linkHref = `${baseUrl}?${mergedParams.toString()}`;
                }

                // Update the href attribute of the link
                link.href = linkHref + anchorHash;
                log(`Updated link href: ${link.href}`);
            });

            // Send the click ID to the server
            if (adCampaignId && originUrl) {
                const ajaxUrl = `${originUrl}/wp-admin/admin-ajax.php?action=track_click`;
                log(`Sending click ID to server: ${ajaxUrl}`);
                fetch(ajaxUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Adjust this based on your server configuration
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
