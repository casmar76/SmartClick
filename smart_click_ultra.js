document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const urlParams = new URLSearchParams(window.location.search);
        const scriptTag = document.querySelector('script[data-origin-url]');
        const originUrl = scriptTag ? scriptTag.getAttribute('data-origin-url') : null;

        // Função para substituir espaços, hífens e remover barras
        const replaceSpacesAndDashes = (inputString) =>
            inputString.replace(/ /g, '_s_').replace(/-/g, '_d_').replace(/\//g, '');

        // Recuperar gclid da URL ou do localStorage
        const gclid = urlParams.get('gclid') || localStorage.getItem('gclid');
        if (gclid) {
            // Se o gclid estiver na URL, armazená-lo no localStorage
            localStorage.setItem('gclid', gclid);
        } else {
            // Caso contrário, remover do localStorage
            localStorage.removeItem('gclid');
        }

        // Obter valores do 'gclid', 'wbraid', 'msclkid' ou 'fbclid' dos parâmetros da URL
        const adCampaignId = gclid || urlParams.get('wbraid') || urlParams.get('msclkid') || urlParams.get('fbclid');
        let modifiedCampaignId = adCampaignId;

        // Se o parâmetro 'tid' existir, substituir seu valor e configurá-lo novamente
        if (urlParams.has('tid')) {
            const originalTid = urlParams.get('tid');
            const replacedTid = replaceSpacesAndDashes(originalTid);
            urlParams.set('tid', replacedTid);
        }

        // Se houver 'adCampaignId' e 'tid', modificar o 'adCampaignId'
        if (adCampaignId && urlParams.has('tid')) {
            modifiedCampaignId = replaceSpacesAndDashes(adCampaignId);
        }

        // Criar a string dos parâmetros de URL atualizada
        const updatedUrlParamsString = urlParams.toString();

        if (updatedUrlParamsString) {
            const pageLinks = document.querySelectorAll('a');

            pageLinks.forEach((link) => {
                const anchorHash = link.hash;
                let linkHref = link.href.split('#')[0];

                // Substituir os placeholders com o valor de 'modifiedCampaignId'
                if (modifiedCampaignId) {
                    linkHref = linkHref.replace('[sclid]', modifiedCampaignId).replace('%5Bsclid%5D', modifiedCampaignId);
                }

                // Atualizar ou adicionar parâmetros na URL do link
                if (!linkHref.includes('?')) {
                    linkHref += '?' + updatedUrlParamsString;
                } else {
                    linkHref += '&' + updatedUrlParamsString;
                }

                // Atualizar o atributo href do link
                link.href = linkHref + anchorHash;
            });

            // Enviar o clickId para o servidor se houver um gclid
            if (gclid && originUrl) {
                const ajaxUrl = `${originUrl}/wp-admin/admin-ajax.php?action=track_click`;
                const data = { clickId: gclid };

                console.log("📦 Dados enviados:", data); // Debug

                fetch(ajaxUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Ignorar a resposta do servidor
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                })
                /* .then(response => response.json())
                .then(responseData => {
                    console.log("✅ Resposta do servidor:", responseData);
                }) */
                .catch(error => {
                    console.error('❌ Erro ao enviar requisição:', error);
                });
            } else {
                console.log("❌ Nenhum gclid disponível para enviar.");
            }
        }
    })();
});
