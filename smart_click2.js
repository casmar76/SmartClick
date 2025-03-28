document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const urlParams = new URLSearchParams(window.location.search);
		const scriptTag = document.querySelector('script[data-origin-url]');
		const originUrl = scriptTag ? scriptTag.getAttribute('data-origin-url') : null;
        
        // Store the gclid in local storage if present in the URL
        if (urlParams.has('gclid')) {
            const gclid = urlParams.get('gclid');
            localStorage.setItem('gclid', gclid);
        }

        // Retrieve gclid from local storage if not in the URL
        const gclid = urlParams.get('gclid') || localStorage.getItem('gclid');

        // Get values of 'gclid', 'wbraid', 'msclkid', or 'fbclid' from the url parameters
        const adCampaignId = gclid || urlParams.get('wbraid') || urlParams.get('msclkid') || urlParams.get('fbclid');
        let modifiedCampaignId = adCampaignId;

        // If 'tid' parameter exists, replace its value and set it back
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
			
            // Enviar clique SEMPRE, mesmo sem GCLID
            if (originUrl) {
                const ajaxUrl = ⁠ ${originUrl}/wp-admin/admin-ajax.php?action=track_click ⁠;

                const requestBody = adCampaignId ? { clickId: adCampaignId } : {}; // Enviar objeto vazio se não houver clickId

                fetch(ajaxUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                })
                .catch(error => {
                    console.error('Erro ao enviar clique para o servidor:', error);
                });
            }
        }
    })();
});
