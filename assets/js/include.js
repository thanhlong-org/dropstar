async function loadIncludes() {
  const includeNodes = document.querySelectorAll('[data-include]');

  for (const node of includeNodes) {
    const includePath = node.getAttribute('data-include');
    if (!includePath) {
      continue;
    }

    try {
      const base = document.querySelector('base')?.href || window.location.href;
      const resolvedPath = new URL(includePath, base).href;
      const response = await fetch(resolvedPath);
      if (!response.ok) {
        throw new Error(`Cannot load include: ${includePath}`);
      }

      node.innerHTML = await response.text();
    } catch (error) {
      console.error(error);
    }
  }

  document.dispatchEvent(new CustomEvent('includes:ready'));
}

window.__includesReadyPromise = loadIncludes();
