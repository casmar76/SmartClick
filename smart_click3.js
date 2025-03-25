document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const urlParams = new URLSearchParams(window.location.search);
        const scriptTag = document.querySelector('script[data-origin-url]');
        const originUrl = scriptTag ? scriptTag.getAttribute('data-origin-url') : null;

        // Se a URL não tiver gclid, limpar do localStorage
        if (!urlParams.has('gclid')) {
            localStorage.removeItem('gclid');
        } else {
            // Se tiver, armazenar no localStorage
            localStorage.setItem('gclid', urlParams.get('gclid'));
        }

        // Recuperar gclid atualizado
        const gclid = localStorage.getItem('gclid') || null;

        // Verifica se há um clickId válido antes de enviar
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
        }
    })();
});
