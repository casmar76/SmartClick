document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const urlParams = new URLSearchParams(window.location.search);
        const scriptTag = document.querySelector('script[data-origin-url]');
        const originUrl = scriptTag ? scriptTag.getAttribute('data-origin-url') : null;

        // Pegar o valor de gclid diretamente da URL
        const gclid = urlParams.get('gclid');

        // Se gclid estiver presente na URL, enviar os dados para o servidor
        if (gclid && originUrl) {
            const ajaxUrl = `${originUrl}/wp-admin/admin-ajax.php?action=track_click`;
            const data = { clickId: gclid };

            console.log("📦 Dados enviados:", data); // Debug

            fetch(ajaxUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            .catch(error => {
                console.error('❌ Erro ao enviar requisição:', error);
            });
        } else {
            console.log("❌ Nenhum gclid disponível para enviar.");
        }
    })();
});
