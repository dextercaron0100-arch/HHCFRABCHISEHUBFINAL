(() => {
  if (document.getElementById('hhf-live-chat-launcher')) return;
  if (window.HHF_DISABLE_LIVE_CHAT) return;

  const metaUrl = document.querySelector('meta[name="hhf-live-chat-url"]')?.content?.trim();
  const hostname = window.location.hostname || '';
  const fallbackLocalChatUrl = `${window.location.protocol}//${hostname || 'localhost'}:3000`;
  const isLocalDevHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
  const chatBase = (window.HHF_LIVE_CHAT_URL || metaUrl || (isLocalDevHost ? fallbackLocalChatUrl : '')).trim();

  if (!chatBase) return;

  let chatOrigin;
  let widgetSrc;

  try {
    const baseUrl = new URL(chatBase, window.location.origin);
    chatOrigin = baseUrl.origin;
    widgetSrc = new URL('/widget', baseUrl);
    widgetSrc.searchParams.set('server', baseUrl.origin);
  } catch (error) {
    console.warn('Live chat disabled: invalid HHF_LIVE_CHAT_URL.', error);
    return;
  }

  const launcher = document.createElement('button');
  launcher.id = 'hhf-live-chat-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Open live chat');
  launcher.style.position = 'fixed';
  launcher.style.right = '12px';
  launcher.style.bottom = '12px';
  launcher.style.width = '64px';
  launcher.style.height = '64px';
  launcher.style.border = '0';
  launcher.style.borderRadius = '999px';
  launcher.style.background = 'linear-gradient(135deg, #d9bd63, #d4b356)';
  launcher.style.boxShadow = '0 18px 36px rgba(212, 179, 86, 0.35)';
  launcher.style.cursor = 'pointer';
  launcher.style.display = 'grid';
  launcher.style.placeItems = 'center';
  launcher.style.padding = '0';
  launcher.style.zIndex = '2147483001';
  launcher.style.transition = 'transform 160ms ease, bottom 180ms ease, right 180ms ease';
  launcher.innerHTML = `
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 12.5z" fill="#fff7dc"/>
    </svg>`;

  const panel = document.createElement('div');
  panel.id = 'hhf-live-chat-panel';
  panel.style.position = 'fixed';
  panel.style.right = '12px';
  panel.style.bottom = '12px';
  panel.style.width = '0';
  panel.style.height = '0';
  panel.style.border = '0';
  panel.style.background = 'transparent';
  panel.style.overflow = 'hidden';
  panel.style.opacity = '0';
  panel.style.pointerEvents = 'none';
  panel.style.zIndex = '2147483000';
  panel.style.transition = 'width 180ms ease, height 180ms ease, opacity 140ms ease, bottom 180ms ease, right 180ms ease';

  let frame = null;
  let isOpen = false;

  const getBottomOffset = (mobile, panelWidth) => {
    const baseBottom = mobile ? 8 : 12;
    const cookieBanner = document.querySelector('.cookie-consent-wrap');

    if (!cookieBanner) return baseBottom;

    const style = window.getComputedStyle(cookieBanner);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return baseBottom;
    }

    const rect = cookieBanner.getBoundingClientRect();
    const clearance = 12;
    const rightEdgeAllowance = mobile ? 8 : 12;
    const widgetZoneLeft = window.innerWidth - panelWidth - rightEdgeAllowance;
    const overlapsWidgetLane = rect.right > widgetZoneLeft;
    const anchoredToBottom = rect.bottom >= window.innerHeight - 32;

    if (!overlapsWidgetLane || !anchoredToBottom) {
      return baseBottom;
    }

    return baseBottom + rect.height + clearance;
  };

  const getPanelMetrics = () => {
    const mobile = window.innerWidth < 640;
    const openWidth = mobile ? Math.min(window.innerWidth - 16, 390) : 410;
    const openHeight = mobile ? Math.min(window.innerHeight - 16, 688) : 688;
    const launcherSize = 64;
    return { mobile, openWidth, openHeight, launcherSize };
  };

  const positionElements = () => {
    const { mobile, openWidth, openHeight, launcherSize } = getPanelMetrics();
    const launcherBottom = getBottomOffset(mobile, launcherSize);
    const panelBottom = getBottomOffset(mobile, openWidth);

    launcher.style.left = mobile ? '12px' : 'auto';
    launcher.style.right = mobile ? 'auto' : '12px';
    launcher.style.bottom = `${launcherBottom}px`;
    panel.style.left = mobile ? '8px' : 'auto';
    panel.style.right = mobile ? 'auto' : '12px';
    panel.style.bottom = `${panelBottom}px`;

    if (isOpen) {
      panel.style.width = `${openWidth}px`;
      panel.style.height = `${openHeight}px`;
    }
  };

  const ensureFrame = () => {
    if (frame) return frame;

    const embeddedSrc = new URL(widgetSrc.toString());
    embeddedSrc.searchParams.set('embed', 'panel');

    frame = document.createElement('iframe');
    frame.id = 'hhf-live-chat-frame';
    frame.title = 'HHC Franchise Hub live chat';
    frame.src = embeddedSrc.toString();
    frame.loading = 'lazy';
    frame.allow = 'clipboard-write';
    frame.setAttribute('aria-label', 'Live chat');
    frame.style.width = '100%';
    frame.style.height = '100%';
    frame.style.border = '0';
    frame.style.background = 'transparent';
    frame.style.display = 'block';
    panel.replaceChildren(frame);
    return frame;
  };

  const openPanel = () => {
    isOpen = true;
    ensureFrame();
    positionElements();
    launcher.style.opacity = '0';
    launcher.style.pointerEvents = 'none';
    launcher.style.transform = 'scale(0.92)';
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
  };

  const closePanel = () => {
    isOpen = false;
    panel.style.opacity = '0';
    panel.style.pointerEvents = 'none';
    panel.style.width = '0';
    panel.style.height = '0';
    launcher.style.opacity = '1';
    launcher.style.pointerEvents = 'auto';
    launcher.style.transform = 'scale(1)';
    if (frame) {
      frame.remove();
      frame = null;
    }
  };

  const handleMessage = (event) => {
    if (event.origin !== chatOrigin) return;
    if (!event.data || event.data.type !== 'hhf-live-chat:state') return;
    if (event.data.mode === 'panel' && event.data.open === false) {
      closePanel();
    }
  };

  window.addEventListener('message', handleMessage);
  window.addEventListener('resize', () => {
    positionElements();
  });

  const observer = new MutationObserver(() => {
    positionElements();
  });

  launcher.addEventListener('click', openPanel);

  document.body.appendChild(panel);
  document.body.appendChild(launcher);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
  });
  positionElements();
})();
