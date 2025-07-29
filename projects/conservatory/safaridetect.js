(function(){
  const ua = navigator.userAgent;

  // iOS ?
  const isIOS = /iP(ad|hone|od)/.test(ua);

  // Safari iOS : doit contenir “Safari” et “Version/xx” mais pas CriOS, FxiOS, EdgiOS, OPiOS
  const isSafariIOS = isIOS
    && /Safari/.test(ua)
    && /Version\/\d+\.\d+/.test(ua)
    && !/CriOS/.test(ua)
    && !/FxiOS/.test(ua)
    && !/EdgiOS/.test(ua)
    && !/OPiOS/.test(ua);

  console.log('UA:', ua);
  console.log('→ isSafariIOS?', isSafariIOS);

  if (isSafariIOS) {
    document.documentElement.classList.add('safari-ios');
    console.log('✅ Safari iOS détecté');
  } else {
    console.log('❌ Pas Safari iOS');
  }
})();