(() => {
  const section = document.querySelector('#avaliacoes');
  const apiKey = section.dataset.googleKey.trim();
  const placeId = section.dataset.placeId.trim();
  if (!apiKey || !placeId) return;

  const button = document.querySelector('#carregar-avaliacoes');
  const status = document.querySelector('#avaliacoes-status');
  const panel = document.querySelector('#avaliacoes-google');
  const list = document.querySelector('#avaliacoes-lista');
  const providers = document.querySelector('#avaliacoes-provedores');
  const number = new Intl.NumberFormat('pt-BR');

  function loadPlaces() {
    if (window.google?.maps?.importLibrary) return window.google.maps.importLibrary('places');

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const callback = 'minasClimaMapsReady';
      const fail = () => {
        clearTimeout(timeout);
        script.remove();
        delete window[callback];
        reject(new Error('Google Maps indisponível'));
      };
      const timeout = setTimeout(fail, 12000);
      window[callback] = () => {
        clearTimeout(timeout);
        delete window[callback];
        Promise.resolve().then(() => window.google.maps.importLibrary('places')).then(resolve, reject);
      };
      const url = new URL('https://maps.googleapis.com/maps/api/js');
      url.search = new URLSearchParams({ key: apiKey, callback, loading: 'async', language: 'pt-BR', region: 'BR', v: 'quarterly' });
      script.src = url.href;
      script.async = true;
      script.onerror = fail;
      document.head.append(script);
    });
  }

  function attribution(name, uri) {
    const item = document.createElement(/^https:\/\//i.test(uri ?? '') ? 'a' : 'span');
    item.textContent = name;
    if (item.tagName === 'A') {
      item.href = uri;
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
    }
    return item;
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Carregando avaliações do Google Maps…';

    try {
      const { Place } = await loadPlaces();
      const place = new Place({ id: placeId, requestedLanguage: 'pt-BR', requestedRegion: 'BR' });
      await place.fetchFields({ fields: ['reviews'] });

      const reviews = (place.reviews ?? []).filter(review => review.authorAttribution?.displayName);
      if (!reviews.length) {
        status.textContent = 'As avaliações podem ser consultadas diretamente no Google Maps.';
        return;
      }

      for (const review of reviews) {
        const author = review.authorAttribution;
        const item = document.createElement('li');
        const byline = document.createElement('div');
        byline.className = 'avaliacao-autor';
        if (/^https:\/\//i.test(author.photoURI ?? '')) {
          const photo = document.createElement('img');
          photo.src = author.photoURI;
          photo.alt = '';
          photo.width = 32;
          photo.height = 32;
          photo.loading = 'lazy';
          byline.append(photo);
        }
        byline.append(attribution(author.displayName, author.uri));
        item.append(byline);

        if (Number.isFinite(review.rating)) {
          const rating = document.createElement('p');
          rating.className = 'avaliacao-nota';
          rating.textContent = number.format(review.rating) + ' de 5';
          item.append(rating);
        }
        if (review.text) {
          const quote = document.createElement('blockquote');
          quote.textContent = review.text;
          item.append(quote);
        }
        list.append(item);
      }

      for (const provider of place.attributions ?? []) {
        if (!provider.provider) continue;
        providers.append(attribution(provider.provider, provider.providerURI));
        providers.hidden = false;
      }
      panel.hidden = false;
      status.textContent = 'Avaliações do Google Maps carregadas.';
    } catch {
      status.textContent = 'Não foi possível carregar as avaliações aqui. Consulte o Google Maps.';
    }
  }, { once: true });

  button.hidden = false;
})();
