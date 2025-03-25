document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const urlParams = new URLSearchParams(window.location.search);
        const scriptTag = document.querySelector('script[data-origin-url]');
        const originUrl = scriptTag ? scriptTag.getAttribute('data-origin-url') : null;

        // Guardar gclid no localStorage se estiver presente na URL
        if (urlParams.has('gclid')) {
            const gclid = urlParams.get('gclid');
            localStorage.setItem('gclid', gclid);
        }

        // Recuperar gclid do localStorage caso não esteja na URL
        const gclid = urlParams.get('gclid') || localStorage.getItem('gclid');

        // Definir o clickId como gclid, wbraid, msclkid ou fbclid (caso existam)
        const adCampaignId = gclid || urlParams.get('wbraid') || urlParams.get('msclkid') || urlParams.get('fbclid');

        // Enviar dados do clickId para o servidor
        if (originUrl) {
            const ajaxUrl = `${originUrl}/wp-admin/admin-ajax.php?action=track_click`;
            const requestBody = adCampaignId ? { clickId: adCampaignId } : {}; // Se não houver gclid, enviar um objeto vazio

            console.log("📡 Enviando requisição AJAX para:", ajaxUrl);
            console.log("📦 Dados enviados:", requestBody);

            fetch(ajaxUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            })
            .then(response => response.json())
            .then(data => console.log("✅ Resposta do servidor:", data))
            .catch(error => console.error("❌ Erro ao enviar requisição:", error));
        }

        // Criar a string dos parâmetros de URL atualizada
        const updatedUrlParamsString = urlParams.toString();

        // Atualizar os links na página com os parâmetros da URL
        if (updatedUrlParamsString) {
            const pageLinks = document.querySelectorAll('a');

            pageLinks.forEach((link) => {
                const anchorHash = link.hash;
                let linkHref = link.href.split('#')[0];

                // Adicionar ou atualizar os parâmetros na URL do link
                if (!linkHref.includes('?')) {
                    linkHref += '?' + updatedUrlParamsString;
                } else {
                    linkHref += '&' + updatedUrlParamsString;
                }

                // Atualizar o href do link
                link.href = linkHref + anchorHash;
            });
        }

    })();
});
